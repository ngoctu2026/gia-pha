interface BackupLike {
  persons: Array<{
    id: string;
    full_name: string;
    gender?: "male" | "female" | "other";
    birth_year?: number | null;
    birth_month?: number | null;
    birth_day?: number | null;
    death_year?: number | null;
    death_month?: number | null;
    death_day?: number | null;
  }>;
  relationships: Array<{
    type: string;
    person_a: string;
    person_b: string;
  }>;
}

const toGedDate = (y?: number | null, m?: number | null, d?: number | null) => {
  if (!y) return "";
  if (!m || !d) return String(y);
  const months = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];
  return `${d} ${months[m - 1]} ${y}`;
};

export function exportToGedcom(data: BackupLike): string {
  const lines: string[] = ["0 HEAD", "1 GEDC", "2 VERS 5.5.1", "1 CHAR UTF-8"];

  for (const p of data.persons) {
    lines.push(`0 @${p.id}@ INDI`);
    lines.push(`1 NAME ${p.full_name}`);
    if (p.gender === "male") lines.push("1 SEX M");
    else if (p.gender === "female") lines.push("1 SEX F");
    const b = toGedDate(p.birth_year, p.birth_month, p.birth_day);
    if (b) {
      lines.push("1 BIRT");
      lines.push(`2 DATE ${b}`);
    }
    const d = toGedDate(p.death_year, p.death_month, p.death_day);
    if (d) {
      lines.push("1 DEAT");
      lines.push(`2 DATE ${d}`);
    }
  }

  const famMap = new Map<string, { husband?: string; wife?: string; children: string[] }>();
  for (const rel of data.relationships) {
    if (rel.type === "marriage") {
      const key = [rel.person_a, rel.person_b].sort().join("::");
      famMap.set(key, { husband: rel.person_a, wife: rel.person_b, children: [] });
    }
  }

  for (const rel of data.relationships) {
    if (!rel.type.includes("child")) continue;
    for (const family of famMap.values()) {
      if (family.husband === rel.person_a || family.wife === rel.person_a) {
        family.children.push(rel.person_b);
        break;
      }
    }
  }

  let idx = 1;
  for (const family of famMap.values()) {
    lines.push(`0 @F${idx}@ FAM`);
    if (family.husband) lines.push(`1 HUSB @${family.husband}@`);
    if (family.wife) lines.push(`1 WIFE @${family.wife}@`);
    for (const c of family.children) lines.push(`1 CHIL @${c}@`);
    idx += 1;
  }

  lines.push("0 TRLR");
  return lines.join("\n");
}

export function parseGedcom(content: string): BackupLike {
  const persons: BackupLike["persons"] = [];
  const relationships: BackupLike["relationships"] = [];
  const byId = new Map<string, (typeof persons)[number]>();
  const lines = content.split(/\r?\n/);
  let current: (typeof persons)[number] | null = null;

  for (const line of lines) {
    const indi = line.match(/^0\s+@([^@]+)@\s+INDI/);
    if (indi) {
      current = { id: indi[1], full_name: "Không rõ", gender: "other" };
      persons.push(current);
      byId.set(current.id, current);
      continue;
    }
    if (!current) continue;

    if (line.startsWith("1 NAME ")) current.full_name = line.replace("1 NAME ", "").trim();
    if (line.startsWith("1 SEX M")) current.gender = "male";
    if (line.startsWith("1 SEX F")) current.gender = "female";
  }

  let fam: { husband?: string; wife?: string; children: string[] } | null = null;
  for (const line of lines) {
    if (/^0\s+@F\d+@\s+FAM/.test(line)) {
      if (fam?.husband && fam?.wife) relationships.push({ type: "marriage", person_a: fam.husband, person_b: fam.wife });
      if (fam?.children.length) {
        for (const c of fam.children) {
          if (fam.husband) relationships.push({ type: "biological_child", person_a: fam.husband, person_b: c });
          if (fam.wife) relationships.push({ type: "biological_child", person_a: fam.wife, person_b: c });
        }
      }
      fam = { children: [] };
      continue;
    }
    if (!fam) continue;
    const husband = line.match(/^1\s+HUSB\s+@([^@]+)@/);
    if (husband) fam.husband = husband[1];
    const wife = line.match(/^1\s+WIFE\s+@([^@]+)@/);
    if (wife) fam.wife = wife[1];
    const child = line.match(/^1\s+CHIL\s+@([^@]+)@/);
    if (child) fam.children.push(child[1]);
  }
  if (fam?.husband && fam?.wife) relationships.push({ type: "marriage", person_a: fam.husband, person_b: fam.wife });

  return { persons, relationships };
}

interface PersonLite { id: string; full_name: string }
interface RelLite { type: string; person_a: string; person_b: string }

export interface KinshipResult {
  description: string;
  aCallsB: string;
  bCallsA: string;
  pathLabels: string[];
}

export function computeKinship(
  personA: PersonLite,
  personB: PersonLite,
  persons: PersonLite[],
  relationships: RelLite[],
): KinshipResult {
  const direct = relationships.find((r) =>
    (r.person_a === personA.id && r.person_b === personB.id) ||
    (r.person_a === personB.id && r.person_b === personA.id),
  );

  if (direct?.type === "marriage") {
    return {
      description: `${personA.full_name} và ${personB.full_name} là vợ chồng.`,
      aCallsB: "vợ/chồng",
      bCallsA: "vợ/chồng",
      pathLabels: ["Hai người liên kết trực tiếp bằng quan hệ hôn nhân."],
    };
  }

  if (direct?.type?.includes("child")) {
    const aParent = direct.person_a === personA.id;
    return {
      description: aParent
        ? `${personA.full_name} là cha/mẹ của ${personB.full_name}.`
        : `${personA.full_name} là con của ${personB.full_name}.`,
      aCallsB: aParent ? "con" : "cha/mẹ",
      bCallsA: aParent ? "cha/mẹ" : "con",
      pathLabels: ["Hai người có liên kết cha/mẹ - con trực tiếp trong dữ liệu."],
    };
  }

  const peopleById = new Map(persons.map((p) => [p.id, p]));
  const graph = new Map<string, string[]>();
  for (const p of persons) graph.set(p.id, []);
  for (const r of relationships) {
    graph.set(r.person_a, [...(graph.get(r.person_a) ?? []), r.person_b]);
    graph.set(r.person_b, [...(graph.get(r.person_b) ?? []), r.person_a]);
  }

  const prev = new Map<string, string | null>();
  const q = [personA.id];
  prev.set(personA.id, null);

  while (q.length) {
    const cur = q.shift()!;
    if (cur === personB.id) break;
    for (const nxt of graph.get(cur) ?? []) {
      if (prev.has(nxt)) continue;
      prev.set(nxt, cur);
      q.push(nxt);
    }
  }

  if (!prev.has(personB.id)) {
    return {
      description: "Chưa tìm thấy mối liên hệ trực tiếp trong dữ liệu hiện có.",
      aCallsB: "họ hàng xa",
      bCallsA: "họ hàng xa",
      pathLabels: [],
    };
  }

  const path: string[] = [];
  let cur: string | null = personB.id;
  while (cur) {
    path.push(cur);
    cur = prev.get(cur) ?? null;
  }
  path.reverse();

  const pathLabels = path.map((id, idx) => {
    const name = peopleById.get(id)?.full_name ?? id;
    if (idx === 0) return `Bắt đầu từ ${name}`;
    if (idx === path.length - 1) return `Đến ${name}`;
    return `Qua ${name}`;
  });

  return {
    description: `Tìm thấy chuỗi quan hệ gồm ${Math.max(0, path.length - 1)} bước giữa hai thành viên.`,
    aCallsB: "họ hàng",
    bCallsA: "họ hàng",
    pathLabels,
  };
}

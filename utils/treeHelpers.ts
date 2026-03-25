import { Person, Relationship } from "@/types";

export interface AdjacencyLists {
  childrenByParent: Map<string, Person[]>;
  spousesByPerson: Map<string, { person: Person; note?: string | null }[]>;
}

interface FilterOptions {
  hideDaughtersInLaw: boolean;
  hideSonsInLaw: boolean;
  hideDaughters: boolean;
  hideSons: boolean;
  hideMales: boolean;
  hideFemales: boolean;
}

export function buildAdjacencyLists(relationships: Relationship[], personsMap: Map<string, Person>): AdjacencyLists {
  const childrenByParent = new Map<string, Person[]>();
  const spousesByPerson = new Map<string, { person: Person; note?: string | null }[]>();

  for (const r of relationships) {
    if (r.type === "marriage") {
      const a = personsMap.get(r.person_a);
      const b = personsMap.get(r.person_b);
      if (!a || !b) continue;
      spousesByPerson.set(a.id, [...(spousesByPerson.get(a.id) ?? []), { person: b, note: r.note }]);
      spousesByPerson.set(b.id, [...(spousesByPerson.get(b.id) ?? []), { person: a, note: r.note }]);
    }
    if (r.type === "biological_child" || r.type === "adopted_child") {
      const child = personsMap.get(r.person_b);
      if (!child) continue;
      childrenByParent.set(r.person_a, [...(childrenByParent.get(r.person_a) ?? []), child]);
    }
  }

  return { childrenByParent, spousesByPerson };
}

export function getFilteredTreeData(personId: string, personsMap: Map<string, Person>, adj: AdjacencyLists, opts: FilterOptions) {
  const person = personsMap.get(personId) ?? null;
  if (!person) return { person: null, spouses: [], children: [] };

  const spouses = (adj.spousesByPerson.get(personId) ?? []).filter((s) => {
    if (opts.hideMales && s.person.gender === "male") return false;
    if (opts.hideFemales && s.person.gender === "female") return false;
    if (opts.hideDaughtersInLaw && s.person.is_in_law && s.person.gender === "female") return false;
    if (opts.hideSonsInLaw && s.person.is_in_law && s.person.gender === "male") return false;
    return true;
  });

  const children = (adj.childrenByParent.get(personId) ?? []).filter((c) => {
    if (opts.hideMales && c.gender === "male") return false;
    if (opts.hideFemales && c.gender === "female") return false;
    if (opts.hideDaughters && c.gender === "female" && !c.is_in_law) return false;
    if (opts.hideSons && c.gender === "male" && !c.is_in_law) return false;
    return true;
  });

  children.sort((a, b) => {
    const ga = a.generation ?? Number.MAX_SAFE_INTEGER;
    const gb = b.generation ?? Number.MAX_SAFE_INTEGER;
    if (ga !== gb) return ga - gb;
    const oa = a.birth_order ?? Number.MAX_SAFE_INTEGER;
    const ob = b.birth_order ?? Number.MAX_SAFE_INTEGER;
    return oa - ob;
  });

  return { person, spouses, children };
}

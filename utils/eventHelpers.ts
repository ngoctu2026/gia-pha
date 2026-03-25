diff --git a/utils/eventHelpers.ts b/utils/eventHelpers.ts
index 932c7dbc40d20530b97628626dadf80018cf7fee..48846ad9e0f7f40e90ddf5824bdaf68a5efbc68a 100644
--- a/utils/eventHelpers.ts
+++ b/utils/eventHelpers.ts
@@ -1,60 +1,78 @@
 export interface CustomEventRecord {
   id: string;
   name: string;
   content: string | null;
   event_date: string;
   location: string | null;
   created_by?: string | null;
 }
 
+interface PersonEventSource {
+  id: string;
+  full_name: string;
+  birth_year: number | null;
+  birth_month: number | null;
+  birth_day: number | null;
+  death_year: number | null;
+  death_month: number | null;
+  death_day: number | null;
+  death_lunar_year: number | null;
+  death_lunar_month: number | null;
+  death_lunar_day: number | null;
+  is_deceased: boolean;
+}
+
 export interface FamilyEvent {
   id: string;
   type: "birthday" | "death_anniversary" | "custom_event";
   personId?: string;
   personName: string;
   eventDateLabel: string;
   daysUntil: number;
   originYear?: number | null;
   originDay?: number | null;
   originMonth?: number | null;
   location?: string | null;
   content?: string | null;
   event_date?: string;
   isDeceased?: boolean;
 }
 
 const toDateOnly = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate());
 const daysDiff = (a: Date, b: Date) => Math.round((toDateOnly(a).getTime() - toDateOnly(b).getTime()) / 86400000);
 
 const nextGregorian = (month: number, day: number, now: Date) => {
   const thisYear = new Date(now.getFullYear(), month - 1, day);
   if (thisYear >= toDateOnly(now)) return thisYear;
   return new Date(now.getFullYear() + 1, month - 1, day);
 };
 
-export function computeEvents(persons: any[], customEvents: CustomEventRecord[]): FamilyEvent[] {
+export function computeEvents(
+  persons: PersonEventSource[],
+  customEvents: CustomEventRecord[],
+): FamilyEvent[] {
   const now = new Date();
   const events: FamilyEvent[] = [];
 
   for (const p of persons ?? []) {
     if (p.birth_month && p.birth_day) {
       const next = nextGregorian(p.birth_month, p.birth_day, now);
       events.push({
         id: `birthday-${p.id}`,
         type: "birthday",
         personId: p.id,
         personName: p.full_name,
         eventDateLabel: `${String(p.birth_day).padStart(2, "0")}/${String(p.birth_month).padStart(2, "0")}`,
         daysUntil: daysDiff(next, now),
         originYear: p.birth_year,
         originDay: p.birth_day,
         originMonth: p.birth_month,
       });
     }
 
     if (p.is_deceased) {
       if (p.death_lunar_month && p.death_lunar_day) {
         const next = nextGregorian(p.death_lunar_month, p.death_lunar_day, now);
         events.push({
           id: `death-${p.id}`,
           type: "death_anniversary",

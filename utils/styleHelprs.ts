import { Gender } from "@/types";

export function getAvatarBg(gender?: Gender | string): string {
  if (gender === "male") return "bg-sky-500";
  if (gender === "female") return "bg-rose-500";
  return "bg-stone-500";
}

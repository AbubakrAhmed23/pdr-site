import { revalidatePath } from "next/cache";
import { routing } from "@/i18n/routing";

/** Verilen public yolları her iki dil için yeniden doğrular (admin düzenlemeleri sonrası). */
export function revalidatePublic(paths: string[]) {
  for (const locale of routing.locales) {
    for (const path of paths) {
      revalidatePath(`/${locale}${path === "/" ? "" : path}`);
    }
  }
}

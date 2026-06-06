import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";

// Next.js 16: middleware.ts -> proxy.ts. next-intl yönlendirme katmanı.
export default createMiddleware(routing);

export const config = {
  // /api, /trpc, /_next, /_vercel ve nokta içeren dosyalar hariç tüm yollar
  matcher: "/((?!api|trpc|_next|_vercel|.*\\..*).*)",
};

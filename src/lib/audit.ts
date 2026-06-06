import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";

/** KVKK: hassas/önemli işlemleri denetim kaydına yazar. Hata olursa sessizce yutulur. */
export async function logAudit(opts: {
  userId?: string | null;
  action: string;
  entity: string;
  entityId?: string | null;
  metadata?: Record<string, unknown>;
}) {
  try {
    await prisma.auditLog.create({
      data: {
        userId: opts.userId ?? null,
        action: opts.action,
        entity: opts.entity,
        entityId: opts.entityId ?? null,
        metadata: opts.metadata as never,
      },
    });
  } catch {
    // denetim kaydı başarısız olsa bile akışı bozma
  }
}

/** İstekten istemci IP'sini çıkarır (KVKK onam kaydı için). */
export async function getClientIp(): Promise<string | null> {
  try {
    const h = await headers();
    const fwd = h.get("x-forwarded-for");
    if (fwd) return fwd.split(",")[0].trim();
    return h.get("x-real-ip");
  } catch {
    return null;
  }
}

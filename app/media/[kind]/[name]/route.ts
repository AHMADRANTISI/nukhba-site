import { readFile } from "fs/promises";
import path from "path";
import { getUser } from "@/lib/auth";
import { db } from "@/lib/core";

const TYPES: Record<string, string> = { jpg: "image/jpeg", png: "image/png", webp: "image/webp" };

// Avatars are public; payment proofs only for the booking owner or an admin.
export async function GET(_: Request, { params }: { params: Promise<{ kind: string; name: string }> }) {
  const { kind, name } = await params;
  if (!["avatars", "proofs"].includes(kind) || !/^[\w-]+\.(jpg|png|webp)$/.test(name)) return new Response(null, { status: 404 });
  if (kind === "proofs") {
    const user = await getUser();
    const b = await db.booking.findFirst({ where: { proofFile: name }, select: { userId: true } });
    if (!user || !b || (user.role !== "ADMIN" && user.id !== b.userId)) return new Response(null, { status: 404 });
  }
  try {
    const buf = await readFile(path.join(process.cwd(), "storage", kind, name));
    return new Response(buf, {
      headers: {
        "Content-Type": TYPES[name.split(".").pop()!],
        "Cache-Control": kind === "avatars" ? "public, max-age=86400" : "private, no-store",
      },
    });
  } catch {
    return new Response(null, { status: 404 });
  }
}

import { randomBytes } from "crypto";
import { mkdir, writeFile } from "fs/promises";
import path from "path";

// Kept out of the "use server" files so it is never exposed as a callable action.
const IMG = { "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp" } as Record<string, string>;
export async function saveImage(file: File, dir: string, base: string) {
  if (!file || !file.size) return null;
  const ext = IMG[file.type];
  if (!ext) throw new Error("صيغة الصورة يجب أن تكون JPG أو PNG أو WEBP");
  if (file.size > 5 * 1024 * 1024) throw new Error("الحد الأقصى 5MB");
  const folder = path.join(process.cwd(), "storage", dir);
  await mkdir(folder, { recursive: true });
  const name = `${base}-${randomBytes(4).toString("hex")}.${ext}`;
  await writeFile(path.join(folder, name), Buffer.from(await file.arrayBuffer()));
  return name;
}

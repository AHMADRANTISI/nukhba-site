// Switches the Prisma datasource from SQLite (local dev) to Postgres (Render).
// Runs only in the Render build; the committed schema stays on SQLite.
import { readFileSync, writeFileSync } from "fs";

const file = new URL("../prisma/schema.prisma", import.meta.url);
const schema = readFileSync(file, "utf8");
const next = schema.replace('provider = "sqlite"', 'provider = "postgresql"');
if (next === schema && !schema.includes('provider = "postgresql"')) throw new Error("datasource provider not found");
writeFileSync(file, next);
console.log("Prisma datasource → postgresql");

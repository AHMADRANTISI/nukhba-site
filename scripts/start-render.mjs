// Render start: sync the schema, seed (idempotent), optionally load demo data, then serve.
import { execSync, spawn } from "child_process";

const run = (cmd) => execSync(cmd, { stdio: "inherit" });

run("npx prisma db push --skip-generate");
run("node prisma/seed.mjs");
if (process.env.SEED_DEMO === "true") run("node prisma/demo.mjs");

const next = spawn("npx", ["next", "start", "-p", process.env.PORT || "3000"], { stdio: "inherit", shell: true });
next.on("exit", (code) => process.exit(code ?? 0));

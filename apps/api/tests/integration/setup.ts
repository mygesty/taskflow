import { PostgreSqlContainer, type StartedPostgreSqlContainer } from "@testcontainers/postgresql";
import { execSync } from "node:child_process";
import path from "node:path";
import { beforeAll, afterAll } from "vitest";

let container: StartedPostgreSqlContainer;
let databaseUrl: string;

beforeAll(async () => {
  container = await new PostgreSqlContainer("postgres:16")
    .withUsername("taskflow")
    .withPassword("taskflow")
    .withDatabase("taskflow_test")
    .start();

  databaseUrl = container.getConnectionUri();

  process.env.DATABASE_URL = databaseUrl;

  const dbPath = path.resolve(__dirname, "../../../../packages/db");
  execSync("npx prisma migrate deploy", {
    cwd: dbPath,
    env: { ...process.env, DATABASE_URL: databaseUrl },
    stdio: "pipe",
  });
}, 60_000);

afterAll(async () => {
  if (container) {
    await container.stop();
  }
});

export function getDatabaseUrl() {
  return databaseUrl;
}

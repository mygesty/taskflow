import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database...");

  const passwordHash = await bcrypt.hash("password123", 12);

  const user1 = await prisma.user.upsert({
    where: { email: "alice@example.com" },
    update: {},
    create: {
      email: "alice@example.com",
      name: "Alice",
      passwordHash,
    },
  });

  const user2 = await prisma.user.upsert({
    where: { email: "bob@example.com" },
    update: {},
    create: {
      email: "bob@example.com",
      name: "Bob",
      passwordHash,
    },
  });

  const workspace = await prisma.workspace.create({
    data: {
      name: "TaskFlow Team",
      description: "The default workspace",
      members: {
        create: [
          { userId: user1.id, role: "OWNER" },
          { userId: user2.id, role: "MEMBER" },
        ],
      },
    },
  });

  const board = await prisma.board.create({
    data: {
      workspaceId: workspace.id,
      title: "Sprint 1",
      columns: {
        create: [
          { title: "Todo", position: 0 },
          { title: "In Progress", position: 1 },
          { title: "Review", position: 2 },
          { title: "Done", position: 3 },
        ],
      },
    },
  });

  console.log("Seed data created:", { user1, user2, workspace, board });
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());

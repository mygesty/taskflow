import { prisma } from "@/providers/prisma";
import type { User } from "@prisma/client";

export const userRepository = {
  async findByEmail(email: string): Promise<User | null> {
    return prisma.user.findUnique({ where: { email } });
  },

  async findById(id: string): Promise<User | null> {
    return prisma.user.findUnique({ where: { id } });
  },

  async create(data: { email: string; name: string; passwordHash: string }): Promise<User> {
    return prisma.user.create({ data });
  },
};

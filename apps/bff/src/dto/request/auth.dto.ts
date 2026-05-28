import { z } from "zod";

export const registerDTO = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  name: z.string().min(1).max(100),
});

export const loginDTO = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export type RegisterInput = z.infer<typeof registerDTO>;
export type LoginInput = z.infer<typeof loginDTO>;

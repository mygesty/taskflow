import bcrypt from "bcryptjs";
import { registerSchema, loginSchema } from "@/validators/auth";
import { userRepository } from "@/repositories/user";
import { signAccessToken, signRefreshToken, verifyRefreshToken } from "@/providers/jwt";
import { unauthorizedError, conflictError } from "@/utils/errors";

export const authService = {
  async register(input: { email: string; password: string; name: string }) {
    const data = registerSchema.parse(input);

    const existing = await userRepository.findByEmail(data.email);
    if (existing) {
      throw conflictError("Email already registered");
    }

    const passwordHash = await bcrypt.hash(data.password, 12);
    const user = await userRepository.create({
      email: data.email,
      name: data.name,
      passwordHash,
    });

    const accessToken = await signAccessToken(user.id);
    const refreshToken = await signRefreshToken(user.id);

    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        avatarUrl: user.avatarUrl,
        createdAt: user.createdAt,
      },
      accessToken,
      refreshToken,
    };
  },

  async login(input: { email: string; password: string }) {
    const data = loginSchema.parse(input);

    const user = await userRepository.findByEmail(data.email);
    if (!user) {
      throw unauthorizedError("Invalid email or password");
    }

    const valid = await bcrypt.compare(data.password, user.passwordHash);
    if (!valid) {
      throw unauthorizedError("Invalid email or password");
    }

    const accessToken = await signAccessToken(user.id);
    const refreshToken = await signRefreshToken(user.id);

    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        avatarUrl: user.avatarUrl,
        createdAt: user.createdAt,
      },
      accessToken,
      refreshToken,
    };
  },

  async refreshToken(token: string) {
    const { userId } = await verifyRefreshToken(token).catch(() => {
      throw unauthorizedError("Invalid or expired refresh token");
    });

    const user = await userRepository.findById(userId);
    if (!user) {
      throw unauthorizedError("User not found");
    }

    const accessToken = await signAccessToken(user.id);
    const newRefreshToken = await signRefreshToken(user.id);

    return { accessToken, refreshToken: newRefreshToken };
  },

  async logout(_userId: string) {
    // Stateless JWT — nothing to invalidate server-side.
    // Client is responsible for clearing cookies.
  },
};

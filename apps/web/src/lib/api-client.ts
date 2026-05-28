import ky from "ky";

const BFF_URL =
  process.env.NEXT_PUBLIC_BFF_URL || "http://localhost:3002/api/bff";

export const apiClient = ky.create({
  prefixUrl: BFF_URL,
  timeout: 10_000,
  credentials: "include",
  retry: {
    limit: 3,
    methods: ["get"],
    statusCodes: [408, 429, 500, 502, 503],
    backoffLimit: 5_000,
  },
  hooks: {
    afterResponse: [
      async (request, _options, response) => {
        // Don't try to refresh for auth/me or auth/refresh — they ARE auth checks
        const url = new URL(request.url);
        if (response.status === 401 && !url.pathname.includes("/auth/me") && !url.pathname.includes("/auth/refresh")) {
          try {
            const refreshResponse = await ky.post(`${BFF_URL}/auth/refresh`, {
              credentials: "include",
            });
            if (refreshResponse.ok) {
              return ky(request, { credentials: "include" });
            }
          } catch {
            // Refresh failed — caller should handle the redirect
          }
        }
        return response;
      },
    ],
  },
});

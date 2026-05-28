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
      async (_request, _options, response) => {
        if (response.status === 401) {
          try {
            const refreshResponse = await ky.post(`${BFF_URL}/auth/refresh`, {
              credentials: "include",
            });
            if (refreshResponse.ok) {
              return ky(_request, { credentials: "include" });
            }
          } catch {
            if (typeof window !== "undefined") {
              window.location.href = "/login";
            }
          }
        }
        return response;
      },
    ],
  },
});

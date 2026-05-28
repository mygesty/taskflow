import ky from "ky";

const API_BASE_URL = process.env.BFF_API_URL || "http://localhost:3001/api/v1";

export const apiClient = ky.create({
  prefixUrl: API_BASE_URL,
  timeout: 10_000,
  retry: {
    limit: 3,
    methods: ["get"],
    statusCodes: [408, 429, 500, 502, 503],
    backoffLimit: 5_000,
  },
  hooks: {
    beforeRequest: [
      (request) => {
        // Forward authorization header from BFF request context
        // This will be set per-request in route handlers
      },
    ],
  },
});

export function createAuthenticatedClient(token: string) {
  return apiClient.extend({
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}

export const queryKeys = {
  auth: {
    me: ["auth", "me"] as const,
  },
  workspaces: {
    all: ["workspaces"] as const,
    detail: (id: string) => ["workspaces", id] as const,
    overview: (id: string) => ["workspaces", id, "overview"] as const,
    members: (id: string) => ["workspaces", id, "members"] as const,
  },
  boards: {
    all: (workspaceId: string) => ["boards", workspaceId] as const,
    detail: (id: string) => ["boards", id, "detail"] as const,
    columns: (id: string) => ["boards", id, "columns"] as const,
  },
  tasks: {
    all: (boardId?: string) => ["tasks", boardId ?? "all"] as const,
    detail: (id: string) => ["tasks", id] as const,
    comments: (id: string) => ["tasks", id, "comments"] as const,
    subtasks: (id: string) => ["tasks", id, "subtasks"] as const,
  },
  notifications: {
    all: ["notifications"] as const,
    unreadCount: ["notifications", "unread-count"] as const,
  },
  dashboard: {
    stats: (workspaceId: string, range?: string) =>
      ["dashboard", "stats", workspaceId, range ?? "7d"] as const,
  },
};

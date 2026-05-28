export const DEFAULT_BOARD_COLUMNS = ["Todo", "In Progress", "Review", "Done"] as const;

export const MAX_WORKSPACE_MEMBERS = 50;

export const TASK_PRIORITIES = ["LOW", "MEDIUM", "HIGH", "URGENT"] as const;

export const USER_ROLES = ["OWNER", "ADMIN", "MEMBER"] as const;

export const PAGINATION_DEFAULTS = {
  page: 1,
  pageSize: 20,
  maxPageSize: 100,
} as const;

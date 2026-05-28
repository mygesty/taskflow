export type UserRole = "OWNER" | "ADMIN" | "MEMBER";

export type TaskPriority = "LOW" | "MEDIUM" | "HIGH" | "URGENT";

export type NotificationType =
  | "TASK_ASSIGNED"
  | "TASK_MOVED"
  | "TASK_DUE_SOON"
  | "COMMENT_MENTION"
  | "MEMBER_INVITED";

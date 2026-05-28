export interface User {
  id: string;
  email: string;
  name: string;
  avatarUrl: string | null;
  createdAt: Date;
}

export interface Workspace {
  id: string;
  name: string;
  description: string | null;
  createdAt: Date;
}

export interface Board {
  id: string;
  workspaceId: string;
  title: string;
  description: string | null;
  createdAt: Date;
}

export interface BoardColumn {
  id: string;
  boardId: string;
  title: string;
  position: number;
}

export interface Task {
  id: string;
  columnId: string;
  title: string;
  description: string | null;
  priority: import("./enums").TaskPriority;
  position: number;
  dueDate: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface Notification {
  id: string;
  userId: string;
  type: import("./enums").NotificationType;
  title: string;
  read: boolean;
  createdAt: Date;
}

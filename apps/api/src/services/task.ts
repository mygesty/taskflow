import {
  createTaskSchema, updateTaskSchema, assignMemberSchema, moveTaskSchema,
  createSubTaskSchema, updateSubTaskSchema, createLabelSchema,
} from "@/validators/task";
import { taskRepository } from "@/repositories/task";
import { assigneeRepository } from "@/repositories/assignee";
import { subTaskRepository } from "@/repositories/subtask";
import { labelRepository } from "@/repositories/label";
import { boardRepository } from "@/repositories/board";
import { columnRepository } from "@/repositories/column";
import { workspaceRepository } from "@/repositories/workspace";
import { forbiddenError, notFoundError, conflictError } from "@/utils/errors";

async function checkBoardAccess(boardId: string, userId: string) {
  const board = await boardRepository.findById(boardId);
  if (!board) throw notFoundError("Board not found");
  const membership = await workspaceRepository.findMembership(board.workspaceId, userId);
  if (!membership) throw forbiddenError("Not a workspace member");
  return board;
}

async function checkTaskAccess(taskId: string, userId: string) {
  const task = await taskRepository.findById(taskId);
  if (!task) throw notFoundError("Task not found");
  const col = await columnRepository.findById(task.columnId);
  if (!col) throw notFoundError("Column not found");
  await checkBoardAccess(col.boardId, userId);
  return task;
}

export const taskService = {
  async createTask(userId: string, input: any) {
    const data = createTaskSchema.parse(input);
    const col = await columnRepository.findById(data.columnId);
    if (!col) throw notFoundError("Column not found");
    await checkBoardAccess(col.boardId, userId);
    const position = await taskRepository.getMaxPosition(data.columnId);
    return taskRepository.create({
      title: data.title, description: data.description,
      priority: data.priority, columnId: data.columnId, position,
      dueDate: data.dueDate ? new Date(data.dueDate) : undefined,
    });
  },

  async getTask(taskId: string, userId: string) {
    await checkTaskAccess(taskId, userId);
    return taskRepository.findById(taskId);
  },

  async updateTask(taskId: string, userId: string, input: any) {
    await checkTaskAccess(taskId, userId);
    const data = updateTaskSchema.parse(input);
    const update: any = { ...data };
    if (data.dueDate !== undefined) {
      update.dueDate = data.dueDate ? new Date(data.dueDate) : null;
    }
    return taskRepository.update(taskId, update);
  },

  async deleteTask(taskId: string, userId: string) {
    await checkTaskAccess(taskId, userId);
    await taskRepository.delete(taskId);
  },

  async moveTask(taskId: string, userId: string, input: { targetColumnId: string; position: number }) {
    const data = moveTaskSchema.parse(input);
    const task = await taskRepository.findById(taskId);
    if (!task) throw notFoundError("Task not found");

    const sourceCol = await columnRepository.findById(task.columnId);
    const targetCol = await columnRepository.findById(data.targetColumnId);
    if (!sourceCol || !targetCol) throw notFoundError("Column not found");
    if (sourceCol.boardId !== targetCol.boardId) {
      throw forbiddenError("Cannot move task to a different board");
    }

    await checkBoardAccess(sourceCol.boardId, userId);

    // Move the task to new column and position
    await taskRepository.update(taskId, {
      columnId: data.targetColumnId,
      position: data.position,
    });
  },

  async assignMember(taskId: string, operatorId: string, input: { userId: string }) {
    await checkTaskAccess(taskId, operatorId);
    const data = assignMemberSchema.parse(input);
    try {
      await assigneeRepository.add(taskId, data.userId);
    } catch {
      throw conflictError("User is already assigned to this task");
    }
    return assigneeRepository.findByTask(taskId);
  },

  async removeAssignee(taskId: string, operatorId: string, targetUserId: string) {
    await checkTaskAccess(taskId, operatorId);
    await assigneeRepository.remove(taskId, targetUserId);
  },

  async addSubTask(taskId: string, userId: string, input: { title: string }) {
    await checkTaskAccess(taskId, userId);
    const data = createSubTaskSchema.parse(input);
    return subTaskRepository.create({ taskId, title: data.title });
  },

  async updateSubTask(subTaskId: string, userId: string, input: { title?: string; completed?: boolean }) {
    const data = updateSubTaskSchema.parse(input);
    return subTaskRepository.update(subTaskId, data);
  },

  async deleteSubTask(subTaskId: string, _userId: string) {
    await subTaskRepository.delete(subTaskId);
  },

  async addLabel(taskId: string, userId: string, input: { name: string; color?: string }) {
    await checkTaskAccess(taskId, userId);
    const data = createLabelSchema.parse(input);
    // get workspaceId from the board chain
    const task = await taskRepository.findById(taskId);
    if (!task) throw notFoundError("Task not found");
    const col = await columnRepository.findById(task.columnId);
    if (!col) throw notFoundError("Column not found");
    const board = await boardRepository.findById(col.boardId);
    if (!board) throw notFoundError("Board not found");

    // Find existing label or create new
    const existingLabels = await labelRepository.findByWorkspace(board.workspaceId);
    let label = existingLabels.find((l: (typeof existingLabels)[number]) => l.name === data.name);
    if (!label) {
      label = await labelRepository.create({ workspaceId: board.workspaceId, name: data.name, color: data.color });
    }
    await labelRepository.addToTask(taskId, label.id);
    return labelRepository.findByTask(taskId);
  },

  async removeLabel(taskId: string, labelId: string, userId: string) {
    await checkTaskAccess(taskId, userId);
    await labelRepository.removeFromTask(taskId, labelId);
  },
};

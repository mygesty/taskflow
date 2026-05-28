import {
  createBoardSchema, updateBoardSchema,
  createColumnSchema, updateColumnSchema, reorderColumnsSchema,
} from "@/validators/board";
import { boardRepository } from "@/repositories/board";
import { columnRepository } from "@/repositories/column";
import { workspaceRepository } from "@/repositories/workspace";
import { forbiddenError, notFoundError } from "@/utils/errors";

export const boardService = {
  async createBoard(userId: string, input: { title: string; description?: string; workspaceId: string }) {
    const data = createBoardSchema.parse(input);
    const membership = await workspaceRepository.findMembership(data.workspaceId, userId);
    if (!membership) throw forbiddenError("Not a workspace member");
    return boardRepository.create(data);
  },

  async listBoards(workspaceId: string, userId: string) {
    const membership = await workspaceRepository.findMembership(workspaceId, userId);
    if (!membership) throw forbiddenError("Not a workspace member");
    return boardRepository.findByWorkspace(workspaceId);
  },

  async getBoard(boardId: string, userId: string) {
    const board = await boardRepository.findById(boardId);
    if (!board) throw notFoundError("Board not found");
    const membership = await workspaceRepository.findMembership(board.workspaceId, userId);
    if (!membership) throw forbiddenError("Not a workspace member");
    return board;
  },

  async updateBoard(boardId: string, userId: string, input: { title?: string; description?: string }) {
    const board = await boardRepository.findById(boardId);
    if (!board) throw notFoundError("Board not found");
    const membership = await workspaceRepository.findMembership(board.workspaceId, userId);
    if (!membership) throw forbiddenError("Not a workspace member");
    const data = updateBoardSchema.parse(input);
    return boardRepository.update(boardId, data);
  },

  async deleteBoard(boardId: string, userId: string) {
    const board = await boardRepository.findById(boardId);
    if (!board) throw notFoundError("Board not found");
    const membership = await workspaceRepository.findMembership(board.workspaceId, userId);
    if (!membership || membership.role !== "OWNER") {
      throw forbiddenError("Only workspace Owner can delete boards");
    }
    await boardRepository.delete(boardId);
  },

  async addColumn(boardId: string, userId: string, input: { title: string }) {
    const board = await boardRepository.findById(boardId);
    if (!board) throw notFoundError("Board not found");
    const membership = await workspaceRepository.findMembership(board.workspaceId, userId);
    if (!membership) throw forbiddenError("Not a workspace member");
    const data = createColumnSchema.parse(input);
    const position = await columnRepository.getMaxPosition(boardId);
    return columnRepository.create({ boardId, title: data.title, position });
  },

  async updateColumn(columnId: string, userId: string, input: { title?: string }) {
    const column = await columnRepository.findById(columnId);
    if (!column) throw notFoundError("Column not found");
    const board = await boardRepository.findById(column.boardId);
    if (!board) throw notFoundError("Board not found");
    const membership = await workspaceRepository.findMembership(board.workspaceId, userId);
    if (!membership) throw forbiddenError("Not a workspace member");
    const data = updateColumnSchema.parse(input);
    return columnRepository.update(columnId, data);
  },

  async deleteColumn(columnId: string, userId: string) {
    const column = await columnRepository.findById(columnId);
    if (!column) throw notFoundError("Column not found");
    const board = await boardRepository.findById(column.boardId);
    if (!board) throw notFoundError("Board not found");
    const membership = await workspaceRepository.findMembership(board.workspaceId, userId);
    if (!membership) throw forbiddenError("Not a workspace member");

    const count = await columnRepository.countByBoard(column.boardId);
    if (count <= 1) throw forbiddenError("Board must have at least 1 column");

    await columnRepository.delete(columnId);
  },

  async reorderColumns(boardId: string, userId: string, input: { items: { id: string; position: number }[] }) {
    const board = await boardRepository.findById(boardId);
    if (!board) throw notFoundError("Board not found");
    const membership = await workspaceRepository.findMembership(board.workspaceId, userId);
    if (!membership) throw forbiddenError("Not a workspace member");
    const data = reorderColumnsSchema.parse(input);
    await columnRepository.reorder(data.items);
  },
};

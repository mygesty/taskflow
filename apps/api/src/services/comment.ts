import { createCommentSchema } from "@/validators/comment";
import { commentRepository } from "@/repositories/comment";
import { workspaceRepository } from "@/repositories/workspace";
import { columnRepository } from "@/repositories/column";
import { boardRepository } from "@/repositories/board";
import { taskRepository } from "@/repositories/task";
import { prisma } from "@/providers/prisma";
import { forbiddenError, notFoundError } from "@/utils/errors";

async function checkTaskAccess(taskId: string, userId: string) {
  const task = await taskRepository.findById(taskId);
  if (!task) throw notFoundError("Task not found");
  const col = await columnRepository.findById(task.columnId);
  if (!col) throw notFoundError("Column not found");
  const board = await boardRepository.findById(col.boardId);
  if (!board) throw notFoundError("Board not found");
  const membership = await workspaceRepository.findMembership(board.workspaceId, userId);
  if (!membership) throw forbiddenError("Not a workspace member");
  return { task, board };
}

function parseMentions(content: string): string[] {
  const matches = content.match(/@(\S+)/g) || [];
  return matches.map((m) => m.slice(1)); // remove @ prefix
}

export const commentService = {
  async createComment(taskId: string, userId: string, input: { content: string }) {
    const data = createCommentSchema.parse(input);
    const { task, board } = await checkTaskAccess(taskId, userId);

    const comment = await commentRepository.create({
      taskId,
      userId,
      content: data.content,
    });

    // Parse @mentions and create notifications
    const mentionedNames = parseMentions(data.content);
    if (mentionedNames.length > 0) {
      const members = await workspaceRepository.findMembers(board.workspaceId);
      const mentionedUsers = members.filter(
        (m: (typeof members)[number]) => mentionedNames.includes(m.user.name),
      );
      for (const member of mentionedUsers) {
        if (member.userId === userId) continue; // don't notify self
        await prisma.notification.create({
          data: {
            userId: member.userId,
            type: "COMMENT_MENTION",
            title: `${(await prisma.user.findUnique({ where: { id: userId } }))?.name || "Someone"} mentioned you in "${task.title}"`,
            content: data.content.slice(0, 200),
            taskId,
          },
        });
      }
    }

    return commentRepository.findById(comment.id);
  },

  async listComments(taskId: string, userId: string) {
    await checkTaskAccess(taskId, userId);
    return commentRepository.findByTask(taskId);
  },

  async deleteComment(commentId: string, userId: string) {
    const comment = await commentRepository.findById(commentId);
    if (!comment) throw notFoundError("Comment not found");
    if (comment.userId !== userId) {
      throw forbiddenError("Only the comment author can delete it");
    }
    await commentRepository.delete(commentId);
  },
};

"use client";

import { useState } from "react";
import { useTranslations, useFormatter } from "next-intl";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { useComments, useDeleteComment } from "@/hooks/useComments";
import { useAuthStore } from "@/stores/auth-store";
import { Trash2 } from "lucide-react";

interface CommentListProps {
  taskId: string;
}

export function CommentList({ taskId }: CommentListProps) {
  const t = useTranslations();
  const format = useFormatter();
  const { data: comments, isLoading } = useComments(taskId);
  const deleteComment = useDeleteComment(taskId);
  const currentUser = useAuthStore((s) => s.user);
  const [deleteCommentId, setDeleteCommentId] = useState<string | null>(null);

  if (isLoading) {
    return <p className="text-xs text-muted-foreground py-2">{t("task.comment_loading")}</p>;
  }

  return (
    <>
      {(!comments || comments.length === 0) ? (
        <p className="text-xs text-muted-foreground py-2">{t("task.no_comments")}</p>
      ) : (
        <div className="space-y-3">
          {comments.map((c: any) => (
            <div key={c.id} className="flex gap-2.5 group">
              <div className="flex size-6 shrink-0 items-center justify-center rounded-full bg-muted text-[10px] font-medium mt-0.5">
                {c.user?.name?.charAt(0)?.toUpperCase() || "?"}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold">{c.user?.name}</span>
                  <span className="text-[10px] text-muted-foreground">
                    {format.dateTime(new Date(c.createdAt), { dateStyle: "short", timeStyle: "short" })}
                  </span>
                </div>
                <p className="text-sm whitespace-pre-wrap break-words">
                  {c.content.split(/(@\S+)/g).map((part: string, i: number) =>
                    part.startsWith("@") ? (
                      <span key={i} className="text-primary font-medium">{part}</span>
                    ) : (
                      <span key={i}>{part}</span>
                    ),
                  )}
                </p>
              </div>
              {currentUser?.id === c.userId && (
                <Button
                  variant="ghost"
                  size="icon-xs"
                  className="shrink-0 opacity-0 group-hover:opacity-100 transition-opacity mt-0.5"
                  onClick={() => setDeleteCommentId(c.id)}
                >
                  <Trash2 className="size-3 text-muted-foreground" />
                </Button>
              )}
            </div>
          ))}
        </div>
      )}

      <ConfirmDialog
        open={!!deleteCommentId}
        onOpenChange={(open) => { if (!open) setDeleteCommentId(null); }}
        title={t("task.delete_comment")}
        description={t("task.delete_comment_desc")}
        confirmLabel={t("common.delete")}
        variant="destructive"
        loading={deleteComment.isPending}
        onConfirm={() => {
          if (deleteCommentId) {
            deleteComment.mutate(deleteCommentId, { onSuccess: () => setDeleteCommentId(null) });
          }
        }}
      />
    </>
  );
}

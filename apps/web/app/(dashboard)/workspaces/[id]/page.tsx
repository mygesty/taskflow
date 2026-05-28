"use client";

import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useTranslations } from "next-intl";
import { AppShell } from "@/components/layout/AppShell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from "@/components/ui/dialog";
import { useWorkspaceOverview, useInviteMember, useRemoveMember, useDeleteWorkspace } from "@/hooks/useWorkspaces";
import { useBoards, useCreateBoard, useDeleteBoard } from "@/hooks/useBoards";
import { useAuthStore } from "@/stores/auth-store";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { UserMinus, Trash2, Plus, LayoutGrid, ArrowRight } from "lucide-react";

const roleColors: Record<string, "default" | "secondary" | "outline"> = { OWNER: "default", ADMIN: "secondary", MEMBER: "outline" };
const inviteSchema = z.object({ email: z.string().email("Invalid email") });
const boardSchema = z.object({ title: z.string().min(1).max(200) });

export default function WorkspacePage() {
  const t = useTranslations();
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const currentUser = useAuthStore((s) => s.user);
  const { data, isLoading } = useWorkspaceOverview(id);
  const { data: boards, isLoading: boardsLoading } = useBoards(id);
  const inviteMutation = useInviteMember(id);
  const removeMutation = useRemoveMember(id);
  const deleteWs = useDeleteWorkspace();
  const createBoard = useCreateBoard();
  const deleteBoard = useDeleteBoard(id);
  const [boardDialogOpen, setBoardDialogOpen] = useState(false);
  const [deleteWsDialogOpen, setDeleteWsDialogOpen] = useState(false);
  const [deleteBoardId, setDeleteBoardId] = useState<string | null>(null);

  const { register: regInvite, handleSubmit: handleInvite, reset: resetInvite, formState: { errors: inviteErrs } } = useForm({ resolver: zodResolver(inviteSchema) });
  const { register: regBoard, handleSubmit: handleBoard, reset: resetBoard, formState: { errors: boardErrs } } = useForm({ resolver: zodResolver(boardSchema) });

  const workspace = data?.workspace;
  const members = data?.members || [];
  const currentMember = members.find((m) => m.userId === currentUser?.id);
  const isOwner = currentMember?.role === "OWNER";
  const isAdmin = currentMember?.role === "OWNER" || currentMember?.role === "ADMIN";

  if (isLoading) {
    return <AppShell><div className="flex items-center justify-center h-full text-muted-foreground text-sm">{t("common.loading")}</div></AppShell>;
  }
  if (!workspace) {
    return <AppShell><div className="flex items-center justify-center h-full text-muted-foreground text-sm">{t("workspace.workspace_not_found")}</div></AppShell>;
  }

  return (
    <AppShell>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">{workspace.name}</h1>
            {workspace.description && <p className="mt-1 text-sm text-muted-foreground">{workspace.description}</p>}
          </div>
          {isOwner && (
            <Button variant="destructive" size="sm" onClick={() => setDeleteWsDialogOpen(true)}>
              <Trash2 className="mr-1.5 size-4" />{t("common.delete")}
            </Button>
          )}
        </div>

        {/* Boards section */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-semibold">{t("board.boards")}</h2>
            <Button size="sm" onClick={() => setBoardDialogOpen(true)}>
              <Plus className="mr-1.5 size-4" />{t("board.new_board")}
            </Button>
          </div>
          {boardsLoading ? (
            <p className="text-sm text-muted-foreground">{t("common.loading")}</p>
          ) : boards && boards.length > 0 ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {boards.map((b) => (
                <Card key={b.id} className="cursor-pointer shadow-sm hover:shadow-md transition-shadow" onClick={() => router.push(`/boards/${b.id}`)}>
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <div className="flex size-8 items-center justify-center rounded-lg bg-primary/10">
                        <LayoutGrid className="size-4 text-primary" />
                      </div>
                      <div className="flex items-center gap-1">
                        {isAdmin && (
                          <Button variant="ghost" size="icon-xs" onClick={(e) => { e.stopPropagation(); setDeleteBoardId(b.id); }}>
                            <Trash2 className="size-3 text-muted-foreground" />
                          </Button>
                        )}
                        <ArrowRight className="size-4 text-muted-foreground" />
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <CardTitle className="text-base">{b.title}</CardTitle>
                    {b.description && <p className="mt-1 text-sm text-muted-foreground line-clamp-2">{b.description}</p>}
                    <p className="mt-2 text-xs text-muted-foreground">{b.columns?.length || 0} {t("workspace.columns")}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="shadow-sm">
              <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                <LayoutGrid className="mb-3 size-10 text-muted-foreground/30" />
                <p className="text-sm text-muted-foreground">{t("board.no_boards")}</p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Members + Invite */}
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <Card>
              <CardHeader><CardTitle className="text-base">{t("workspace.members")} ({members.length})</CardTitle></CardHeader>
              <CardContent>
                <div className="divide-y divide-border">
                  {members.map((m) => (
                    <div key={m.id} className="flex items-center justify-between py-3 first:pt-0 last:pb-0">
                      <div className="flex items-center gap-3">
                        <div className="flex size-8 items-center justify-center rounded-full bg-muted text-xs font-medium">{m.user.name.charAt(0).toUpperCase()}</div>
                        <div><p className="text-sm font-medium">{m.user.name}</p><p className="text-xs text-muted-foreground">{m.user.email}</p></div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={roleColors[m.role] || "outline"}>{m.role}</Badge>
                        {isAdmin && m.role !== "OWNER" && currentUser?.id !== m.userId && (
                          <Button variant="ghost" size="icon-xs" onClick={() => removeMutation.mutate(m.id)} disabled={removeMutation.isPending}>
                            <UserMinus className="size-3 text-muted-foreground" />
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
          {isAdmin && (
            <div>
              <Card>
                <CardHeader><CardTitle className="text-base">{t("workspace.invite_member")}</CardTitle></CardHeader>
                <CardContent>
                  <form onSubmit={handleInvite((d) => inviteMutation.mutate({ email: d.email, role: "MEMBER" }, { onSuccess: () => resetInvite() }))} className="space-y-3">
                    <Input placeholder={t("workspace.email_placeholder")} {...regInvite("email")} />
                    {inviteErrs.email && <p className="mt-1 text-xs text-destructive">{inviteErrs.email.message}</p>}
                    {inviteMutation.isError && <p className="text-xs text-destructive">{(inviteMutation.error as Error)?.message || "Failed"}</p>}
                    <Button type="submit" size="sm" className="w-full" disabled={inviteMutation.isPending}>{inviteMutation.isPending ? t("workspace.inviting") : t("workspace.send_invite")}</Button>
                  </form>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>

      {/* Create Board Dialog */}
      <Dialog open={boardDialogOpen} onOpenChange={setBoardDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("board.create_board")}</DialogTitle>
            <DialogDescription>{t("home.description")}</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleBoard((d) => createBoard.mutate({ ...d, workspaceId: id }, { onSuccess: (res) => { resetBoard(); setBoardDialogOpen(false); if (res.data) router.push(`/boards/${res.data.id}`); } }))} className="space-y-4">
            <div><Input placeholder={t("task.board_title_placeholder")} {...regBoard("title")} />{boardErrs.title && <p className="mt-1 text-xs text-destructive">{boardErrs.title.message}</p>}</div>
            {createBoard.isError && <p className="text-sm text-destructive">{(createBoard.error as Error)?.message}</p>}
            <Button type="submit" className="w-full" disabled={createBoard.isPending}>{createBoard.isPending ? t("board.creating") : t("board.create_board")}</Button>
          </form>
        </DialogContent>
      </Dialog>
      <ConfirmDialog
        open={deleteWsDialogOpen}
        onOpenChange={setDeleteWsDialogOpen}
        title={t("confirm.delete_workspace_title")}
        description={t("confirm.delete_workspace_desc")}
        confirmLabel={t("common.delete")}
        variant="destructive"
        loading={deleteWs.isPending}
        onConfirm={() => deleteWs.mutate(id, { onSuccess: () => router.push("/dashboard") })}
      />
      <ConfirmDialog
        open={!!deleteBoardId}
        onOpenChange={(open) => { if (!open) setDeleteBoardId(null); }}
        title={t("confirm.delete_board_title")}
        description={t("confirm.delete_board_desc")}
        confirmLabel={t("common.delete")}
        variant="destructive"
        loading={deleteBoard.isPending}
        onConfirm={() => {
          if (deleteBoardId) deleteBoard.mutate(deleteBoardId, { onSuccess: () => setDeleteBoardId(null) });
        }}
      />
    </AppShell>
  );
}

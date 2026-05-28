"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { SubTaskList } from "@/components/task/SubTaskList";
import { LabelSelect } from "@/components/task/LabelSelect";
import { CommentList } from "@/components/comment/CommentList";
import { CommentInput } from "@/components/comment/CommentInput";
import { useUpdateTask, useDeleteTask, useAssignMember, useRemoveAssignee } from "@/hooks/useTasks";
import { useWorkspaceOverview } from "@/hooks/useWorkspaces";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { X, Trash2, Plus } from "lucide-react";

interface TaskDetailPanelProps {
  task: {
    id: string; title: string; description: string | null;
    priority: string; dueDate: string | null;
    assignees?: { user: { id: string; name: string; email: string; avatarUrl: string | null } }[];
    labels?: { label: { id: string; name: string; color: string } }[];
    subTasks?: { id: string; title: string; completed: boolean }[];
  };
  workspaceId: string;
  onClose: () => void;
}

export function TaskDetailPanel({ task, workspaceId, onClose }: TaskDetailPanelProps) {
  const t = useTranslations();
  const [title, setTitle] = useState(task.title);
  const [description, setDescription] = useState(task.description || "");
  const [priority, setPriority] = useState(task.priority);
  const [dueDate, setDueDate] = useState(task.dueDate?.split("T")[0] || "");
  const updateTask = useUpdateTask();
  const deleteTask = useDeleteTask();
  const assignMember = useAssignMember(task.id);
  const removeAssignee = useRemoveAssignee(task.id);
  const { data: overview } = useWorkspaceOverview(workspaceId);

  const PRIORITIES = [
    { value: "LOW", label: t("priority.LOW") },
    { value: "MEDIUM", label: t("priority.MEDIUM") },
    { value: "HIGH", label: t("priority.HIGH") },
    { value: "URGENT", label: t("priority.URGENT") },
  ];

  useEffect(() => {
    setTitle(task.title);
    setDescription(task.description || "");
    setPriority(task.priority);
    setDueDate(task.dueDate?.split("T")[0] || "");
  }, [task]);

  const [assignPopoverOpen, setAssignPopoverOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const members = overview?.members || [];
  const assignedIds = new Set((task.assignees || []).map((a) => a.user.id));
  const unassignedMembers = members.filter((m) => !assignedIds.has(m.userId));

  const save = (field: string, value: any) => {
    const payload: any = {};
    if (field === "dueDate") payload.dueDate = value ? new Date(value).toISOString() : null;
    else payload[field] = value;
    updateTask.mutate({ id: task.id, ...payload });
  };

  const handleDelete = () => {
    setDeleteDialogOpen(true);
  };

  return (
    <div className="fixed inset-y-0 right-0 z-40 flex w-96 flex-col border-l border-border bg-card shadow-xl">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border px-4 py-3">
        <h3 className="text-sm font-semibold">{t("task.details")}</h3>
        <Button variant="ghost" size="icon-xs" onClick={onClose}>
          <X className="size-4" />
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-5">
        {/* Title */}
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-muted-foreground">{t("task.title")}</label>
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onBlur={() => { if (title !== task.title) save("title", title); }}
          />
        </div>

        {/* Description */}
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-muted-foreground">{t("task.description")}</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            onBlur={() => { if (description !== (task.description || "")) save("description", description); }}
            rows={4}
            className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm transition-colors placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"
            placeholder={t("task.description_placeholder")}
          />
        </div>

        {/* Priority */}
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-muted-foreground">{t("task.priority")}</label>
          <div className="flex gap-1.5">
            {PRIORITIES.map((p) => (
              <button
                key={p.value}
                type="button"
                onClick={() => { setPriority(p.value); save("priority", p.value); }}
                className={`flex-1 rounded-md border px-2 py-1.5 text-xs font-medium transition-colors ${
                  priority === p.value
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border text-muted-foreground hover:border-muted-foreground"
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        {/* Due Date */}
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-muted-foreground">{t("task.due_date")}</label>
          <Input
            type="date"
            value={dueDate}
            onChange={(e) => { setDueDate(e.target.value); save("dueDate", e.target.value); }}
          />
        </div>

        {/* Assignees */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-medium text-muted-foreground">{t("task.assignees")}</label>
            <div className="relative">
              <button
                type="button"
                onClick={() => setAssignPopoverOpen(!assignPopoverOpen)}
                className="flex size-6 items-center justify-center rounded hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
              >
                <Plus className="size-3.5" />
              </button>
              {assignPopoverOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setAssignPopoverOpen(false)} />
                  <div className="absolute right-0 top-7 z-50 w-44 rounded-md border border-border bg-popover p-1 shadow-md">
                    {unassignedMembers.length === 0 ? (
                      <div className="px-2 py-2 text-xs text-muted-foreground">{t("task.no_members_to_assign")}</div>
                    ) : (
                      unassignedMembers.map((m) => (
                        <button
                          key={m.userId}
                          type="button"
                          className="flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-sm hover:bg-accent transition-colors"
                          onClick={() => { assignMember.mutate(m.userId); setAssignPopoverOpen(false); }}
                        >
                          <div className="flex size-4 items-center justify-center rounded-full bg-muted text-[9px] font-medium">
                            {m.user.name.charAt(0)}
                          </div>
                          {m.user.name}
                        </button>
                      ))
                    )}
                  </div>
                </>
              )}
            </div>
          </div>
          {(!task.assignees || task.assignees.length === 0) && (
            <p className="text-xs text-muted-foreground">{t("task.no_assignees")}</p>
          )}
          {(task.assignees || []).map((a: any) => (
            <div key={a.user.id} className="flex items-center justify-between rounded-md bg-muted/50 px-3 py-1.5">
              <div className="flex items-center gap-2">
                <div className="flex size-5 items-center justify-center rounded-full bg-primary/10 text-[9px] font-medium text-primary">
                  {a.user.name.charAt(0)}
                </div>
                <span className="text-sm">{a.user.name}</span>
              </div>
              <Button variant="ghost" size="icon-xs" onClick={() => removeAssignee.mutate(a.user.id)}>
                <X className="size-3 text-muted-foreground" />
              </Button>
            </div>
          ))}
        </div>

        {/* Labels */}
        <LabelSelect
          taskId={task.id}
          workspaceId={workspaceId}
          currentLabels={(task.labels || []) as { label: { id: string; name: string; color: string } }[]}
        />

        {/* SubTasks */}
        <SubTaskList taskId={task.id} subTasks={task.subTasks || []} />

        {/* Comments */}
        <div className="space-y-3">
          <label className="text-xs font-medium text-muted-foreground">{t("task.comments")}</label>
          <CommentList taskId={task.id} />
          <CommentInput taskId={task.id} workspaceId={workspaceId} />
        </div>
      </div>

      {/* Footer */}
      <div className="border-t border-border p-3">
        <Button variant="destructive" size="sm" className="w-full" onClick={handleDelete}>
          <Trash2 className="mr-1.5 size-4" />{t("task.delete_task")}
        </Button>
      </div>

      <ConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title={t("task.delete_task")}
        description={t("confirm.delete_task_desc")}
        confirmLabel={t("common.delete")}
        variant="destructive"
        loading={deleteTask.isPending}
        onConfirm={() => {
          deleteTask.mutate(task.id, { onSuccess: () => { setDeleteDialogOpen(false); onClose(); } });
        }}
      />
    </div>
  );
}

"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useDeleteTask, useAssignMember, useRemoveAssignee } from "@/hooks/useTasks";
import { useWorkspaceOverview } from "@/hooks/useWorkspaces";
import { MoreHorizontal, Trash2, UserPlus, Check } from "lucide-react";

const priorityColors: Record<string, string> = {
  URGENT: "border-l-red-500", HIGH: "border-l-orange-400",
  MEDIUM: "border-l-muted-foreground", LOW: "border-l-gray-300",
};
const priorityBadgeVariant: Record<string, "default" | "secondary" | "outline"> = {
  URGENT: "default", HIGH: "secondary", MEDIUM: "outline", LOW: "outline",
};

interface TaskCardProps {
  task: {
    id: string; title: string; priority: string; dueDate?: string | null;
    assignees?: { user: { id: string; name: string; email: string; avatarUrl: string | null } }[];
    labels?: { label: { id: string; name: string; color: string } }[];
    subTasks?: { id: string; title: string; completed: boolean }[];
  };
  workspaceId: string;
  onClick?: () => void;
}

export function TaskCard({ task, workspaceId, onClick }: TaskCardProps) {
  const deleteTask = useDeleteTask();
  const assignMember = useAssignMember(task.id);
  const removeAssignee = useRemoveAssignee(task.id);
  const { data: overview } = useWorkspaceOverview(workspaceId);
  const [assignOpen, setAssignOpen] = useState(false);

  const members = overview?.members || [];
  const assignedIds = new Set((task.assignees || []).map((a) => a.user.id));
  const unassignedMembers = members.filter((m) => !assignedIds.has(m.userId));

  return (
    <div
      onClick={onClick}
      className={`rounded-md border border-border bg-card p-2.5 shadow-sm border-l-2 cursor-pointer hover:shadow-md transition-shadow ${priorityColors[task.priority] || ""}`}
    >
      <div className="flex items-start justify-between gap-1">
        <p className="text-sm font-medium leading-snug">{task.title}</p>
        <DropdownMenu>
          <DropdownMenuTrigger className="flex size-6 shrink-0 items-center justify-center rounded hover:bg-muted">
            <MoreHorizontal className="size-3.5" />
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem onClick={() => { if (confirm("Delete this task?")) deleteTask.mutate(task.id); }}>
              <Trash2 className="mr-2 size-3.5" />Delete Task
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="mt-2 flex flex-wrap items-center gap-1.5">
        {task.priority && task.priority !== "MEDIUM" && (
          <Badge variant={priorityBadgeVariant[task.priority]} className="text-[10px]">{task.priority}</Badge>
        )}

        {/* Assignee avatars + assign button */}
        {task.assignees?.map((a: any) => (
          <div
            key={a.user.id}
            className="flex size-5 cursor-pointer items-center justify-center rounded-full bg-primary/10 text-[9px] font-medium text-primary hover:ring-2 hover:ring-destructive/50 transition-all"
            title={`${a.user.name} — click to unassign`}
            onClick={() => removeAssignee.mutate(a.user.id)}
          />
        ))}

        <DropdownMenu>
          <DropdownMenuTrigger className="flex size-5 items-center justify-center rounded-full border border-dashed border-muted-foreground/30 text-muted-foreground hover:border-primary hover:text-primary transition-colors">
            <UserPlus className="size-3" />
          </DropdownMenuTrigger>
          <DropdownMenuContent className="max-h-48 overflow-y-auto">
            {unassignedMembers.length === 0 ? (
              <div className="px-2 py-2 text-xs text-muted-foreground">No members to assign</div>
            ) : (
              unassignedMembers.map((m) => (
                <DropdownMenuItem key={m.userId} onClick={() => assignMember.mutate(m.userId)}>
                  <div className="flex size-4 items-center justify-center rounded-full bg-muted text-[9px] font-medium mr-2">
                    {m.user.name.charAt(0)}
                  </div>
                  <span className="text-sm">{m.user.name}</span>
                </DropdownMenuItem>
              ))
            )}
          </DropdownMenuContent>
        </DropdownMenu>

        {task.labels?.map((l: any) => (
          <span key={l.label.id} className="rounded px-1.5 py-0.5 text-[10px] font-medium" style={{ backgroundColor: l.label.color + "20", color: l.label.color }}>
            {l.label.name}
          </span>
        ))}

        {task.dueDate && (
          <span className="ml-auto text-[10px] text-muted-foreground">
            {new Date(task.dueDate).toLocaleDateString()}
          </span>
        )}

        {task.subTasks && task.subTasks.length > 0 && (
          <span className="text-[10px] text-muted-foreground">
            {task.subTasks.filter((s: any) => s.completed).length}/{task.subTasks.length}
          </span>
        )}
      </div>
    </div>
  );
}

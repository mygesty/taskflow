"use client";

import { memo } from "react";
import { useDraggable } from "@dnd-kit/core";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAssignMember, useRemoveAssignee } from "@/hooks/useTasks";
import { useWorkspaceOverview } from "@/hooks/useWorkspaces";
import { MoreHorizontal, Trash2, UserPlus, GripVertical } from "lucide-react";

const priorityColors: Record<string, string> = {
  URGENT: "border-l-red-500", HIGH: "border-l-orange-400",
  MEDIUM: "border-l-muted-foreground", LOW: "border-l-gray-300",
};

interface DraggableCardProps {
  task: any;
  workspaceId: string;
  onClick?: () => void;
  onDelete?: (id: string) => void;
}

export const DraggableCard = memo(function DraggableCard({ task, workspaceId, onClick, onDelete }: DraggableCardProps) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: task.id,
    data: { task, sourceColumnId: task.columnId },
  });
  const style = transform ? { transform: `translate(${transform.x}px, ${transform.y}px)` } : undefined;

  const assignMember = useAssignMember(task.id);
  const removeAssignee = useRemoveAssignee(task.id);
  const { data: overview } = useWorkspaceOverview(workspaceId);
  const members = overview?.members || [];
  const assignedIds = new Set((task.assignees || []).map((a: any) => a.user.id));
  const unassigned = members.filter((m: any) => !assignedIds.has(m.userId));

  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      style={{ ...style, touchAction: "none" }}
      className={`rounded-md border border-border bg-card p-2.5 shadow-sm border-l-2 cursor-grab active:cursor-grabbing hover:shadow-md transition-shadow ${priorityColors[task.priority] || ""} ${isDragging ? "opacity-50" : ""}`}
      onClick={(e) => { if (!(e.target as HTMLElement).closest('button,[role="menuitem"],a')) onClick?.(); }}
    >
      <div className="flex items-start gap-1">
        <span className="mt-0.5 shrink-0 text-muted-foreground/30">
          <GripVertical className="size-3.5" />
        </span>
        <p className="flex-1 text-sm font-medium leading-snug">{task.title}</p>
        <DropdownMenu>
          <DropdownMenuTrigger className="flex size-5 shrink-0 items-center justify-center rounded hover:bg-muted">
            <MoreHorizontal className="size-3" />
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onDelete?.(task.id); }}>
              <Trash2 className="mr-2 size-3.5" />Delete Task
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <div className="mt-2 flex flex-wrap items-center gap-1.5">
        {task.priority && task.priority !== "MEDIUM" && (
          <Badge variant={task.priority === "URGENT" ? "default" : task.priority === "HIGH" ? "secondary" : "outline"} className="text-[10px]">{task.priority}</Badge>
        )}
        {(task.assignees || []).map((a: any) => (
          <div
            key={a.user.id}
            className="flex size-5 cursor-pointer items-center justify-center rounded-full bg-primary/10 text-[9px] font-medium text-primary hover:ring-2 hover:ring-destructive/50"
            title={`${a.user.name} — unassign`}
            onClick={(e) => { e.stopPropagation(); removeAssignee.mutate(a.user.id); }}
          >
            {a.user.name.charAt(0)}
          </div>
        ))}
        <DropdownMenu>
          <DropdownMenuTrigger className="flex size-5 items-center justify-center rounded-full border border-dashed border-muted-foreground/30 text-muted-foreground hover:border-primary hover:text-primary" onClick={(e) => e.stopPropagation()}>
            <UserPlus className="size-3" />
          </DropdownMenuTrigger>
          <DropdownMenuContent className="max-h-40 overflow-y-auto">
            {unassigned.map((m: any) => (
              <DropdownMenuItem key={m.userId} onClick={(e) => { e.stopPropagation(); assignMember.mutate(m.userId); }}>
                <div className="flex size-4 items-center justify-center rounded-full bg-muted text-[9px] font-medium mr-2">{m.user.name.charAt(0)}</div>
                {m.user.name}
              </DropdownMenuItem>
            ))}
            {unassigned.length === 0 && <div className="px-2 py-2 text-xs text-muted-foreground">No members</div>}
          </DropdownMenuContent>
        </DropdownMenu>
        {(task.labels || []).map((l: any) => (
          <span key={l.label.id} className="rounded px-1.5 py-0.5 text-[10px] font-medium" style={{ backgroundColor: l.label.color + "20", color: l.label.color }}>{l.label.name}</span>
        ))}
        {(task.subTasks || []).length > 0 && (
          <span className="text-[10px] text-muted-foreground">{task.subTasks.filter((s: any) => s.completed).length}/{task.subTasks.length}</span>
        )}
      </div>
    </div>
  );
});

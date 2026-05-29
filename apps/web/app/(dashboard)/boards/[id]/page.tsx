"use client";

import { useParams } from "next/navigation";
import { useState, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useTranslations } from "next-intl";
import { DndContext, useDroppable, PointerSensor, KeyboardSensor, useSensor, useSensors, type DragEndEvent, type DragStartEvent } from "@dnd-kit/core";
import { AppShell } from "@/components/layout/AppShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useBoardDetail, useAddColumn, useDeleteColumn } from "@/hooks/useBoards";
import { useCreateTask, useDeleteTask, useMoveTask } from "@/hooks/useTasks";
import { TaskDetailPanel } from "@/components/task/TaskDetailPanel";
import { DraggableCard } from "@/components/task/DraggableCard";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Plus, MoreHorizontal, Trash2, X } from "lucide-react";

const colSchema = z.object({ title: z.string().min(1).max(100) });
const taskSchema = z.object({
  title: z.string().min(1).max(300),
  description: z.string().max(5000).optional().or(z.literal("")),
  priority: z.enum(["LOW", "MEDIUM", "HIGH", "URGENT"]),
  dueDate: z.string().optional().or(z.literal("")),
});

const PRIORITY_KEYS = ["LOW", "MEDIUM", "HIGH", "URGENT"] as const;

function DroppableColumn({ col, boardWorkspaceId, selectedTaskId, onTaskClick, onAddTask, onDeleteTask, t }: {
  col: any; boardWorkspaceId: string; selectedTaskId: string | null; onTaskClick: (id: string) => void; onAddTask: (colId: string) => void; onDeleteTask?: (id: string) => void; t: any;
}) {
  const { isOver, setNodeRef } = useDroppable({ id: col.id });
  const deleteCol = useDeleteColumn(col.boardId);
  return (
    <div ref={setNodeRef} className={`flex w-72 shrink-0 flex-col rounded-lg border transition-colors ${isOver ? "border-primary bg-primary/5" : "border-border bg-muted/20"}`}>
      <div className="flex items-center justify-between px-3 py-2.5">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-semibold">{col.title}</h3>
          <span className="rounded-full bg-muted px-1.5 text-xs text-muted-foreground">{col.tasks?.length ?? 0}</span>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger className="flex size-6 items-center justify-center rounded hover:bg-muted"><MoreHorizontal className="size-3.5" /></DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem onClick={(e) => { e.stopPropagation(); deleteCol.mutate({ boardId: col.boardId, columnId: col.id }); }}><Trash2 className="mr-2 size-3.5" />{t("board.delete_column")}</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <div className="flex-1 space-y-2 px-2 pb-2 min-h-[100px]">
        {(col.tasks || []).map((task: any) => (
          <DraggableCard key={task.id} task={task} workspaceId={boardWorkspaceId} onClick={() => onTaskClick(task.id)} onDelete={onDeleteTask} />
        ))}
      </div>
      <div className="px-2 pb-2">
        <Button variant="ghost" className="w-full justify-start text-xs text-muted-foreground" size="xs" onClick={() => onAddTask(col.id)}>
          <Plus className="mr-1 size-3" />{t("board.add_task")}
        </Button>
      </div>
    </div>
  );
}

export default function BoardPage() {
  const t = useTranslations();
  const { id } = useParams<{ id: string }>();
  const { data, isLoading } = useBoardDetail(id);
  const addCol = useAddColumn(id);
  const createTask = useCreateTask();
  const deleteTask = useDeleteTask();
  const moveTask = useMoveTask();

  const [colDialogOpen, setColDialogOpen] = useState(false);
  const [taskDialogOpen, setTaskDialogOpen] = useState(false);
  const [selectedColumn, setSelectedColumn] = useState("");
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [activeDragId, setActiveDragId] = useState<string | null>(null);
  const [columnsState, setColumnsState] = useState<any[]>([]);
  const [deleteTaskId, setDeleteTaskId] = useState<string | null>(null);

  const { register: regCol, handleSubmit: handleCol, reset: resetCol, formState: { errors: colErrs } } = useForm({ resolver: zodResolver(colSchema) });
  const { register, handleSubmit, reset, control, formState: { errors } } = useForm<any>({
    resolver: zodResolver(taskSchema),
    defaultValues: { priority: "MEDIUM", dueDate: "", description: "" },
  });

  const board = data?.board;
  const serverColumns = data?.columns;
  const displayColumns = (columnsState.length > 0 ? columnsState : serverColumns) || [];

  // Sync local state with server data — use JSON compare to avoid infinite loop
  const serverKey = serverColumns ? JSON.stringify(serverColumns) : "";
  useEffect(() => {
    if (serverColumns) setColumnsState(serverColumns);
  // eslint-disable-next-line
  }, [serverKey]);

  const selectedTask = selectedTaskId
    ? displayColumns.flatMap((c: any) => c.tasks || []).find((t: any) => t.id === selectedTaskId) || null
    : null;

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor),
  );

  const onDragStart = (event: DragStartEvent) => {
    setActiveDragId(event.active.id as string);
  };

  // Use ref to always have latest columns for drag handler
  const columnsRef = { current: displayColumns };
  columnsRef.current = displayColumns;

  const onDragEnd = (event: DragEndEvent) => {
    setActiveDragId(null);
    const { active, over } = event;
    if (!over) return;

    const taskId = active.id as string;
    const taskData = active.data.current as any;
    const targetColumnId = over.id as string;
    const sourceColumnId = taskData?.sourceColumnId;

    if (!sourceColumnId || sourceColumnId === targetColumnId) {
      return;
    }

    // Optimistic update: move task from source to target column
    const currentCols = columnsRef.current;
    const newCols = currentCols.map((col: any) => ({
      ...col,
      tasks: [...(col.tasks || [])],
    }));
    const sourceCol = newCols.find((c: any) => c.id === sourceColumnId);
    const targetCol = newCols.find((c: any) => c.id === targetColumnId);
    if (!sourceCol || !targetCol) return;

    const taskIdx = sourceCol.tasks.findIndex((t: any) => t.id === taskId);
    if (taskIdx === -1) return;
    const [movedTask] = sourceCol.tasks.splice(taskIdx, 1);
    const newPosition = targetCol.tasks.length;
    targetCol.tasks.push({ ...movedTask, columnId: targetColumnId, position: newPosition });
    setColumnsState(newCols);

    // API call — keep optimistic state, let refetch replace it naturally
    moveTask.mutate(
      { taskId, targetColumnId, position: newPosition },
      {
        onError: () => setColumnsState([]), // revert on error only
      },
    );
  };

  if (isLoading) return <AppShell><div className="flex items-center justify-center h-full text-muted-foreground text-sm">{t("common.loading")}</div></AppShell>;
  if (!board) return <AppShell><div className="flex items-center justify-center h-full text-muted-foreground text-sm">{t("board.board_not_found")}</div></AppShell>;

  return (
    <AppShell>
      <div className="flex h-full flex-col">
        <div className="mb-4">
          <h1 className="text-xl font-bold tracking-tight">{board.title}</h1>
          {board.description && <p className="text-sm text-muted-foreground">{board.description}</p>}
        </div>

        <DndContext sensors={sensors} onDragStart={onDragStart} onDragEnd={onDragEnd}>
          <div className="flex flex-1 gap-4 overflow-x-auto pb-4">
            {displayColumns.map((col: any) => (
              <DroppableColumn
                key={col.id}
                col={col}
                boardWorkspaceId={board.workspaceId}
                selectedTaskId={selectedTaskId}
                onTaskClick={setSelectedTaskId}
                onDeleteTask={(taskId: string) => setDeleteTaskId(taskId)}
                onAddTask={(colId) => { setSelectedColumn(colId); reset({ title: "", description: "", priority: "MEDIUM", dueDate: "" }); setTaskDialogOpen(true); }}
                t={t}
              />
            ))}
            <div className="flex w-72 shrink-0 items-start">
              <Button variant="ghost" className="w-full justify-start text-muted-foreground" onClick={() => setColDialogOpen(true)}>
                <Plus className="mr-2 size-4" />{t("board.add_column")}
              </Button>
            </div>
          </div>
        </DndContext>
      </div>

      {selectedTask && (
        <TaskDetailPanel task={selectedTask} workspaceId={board.workspaceId} onClose={() => setSelectedTaskId(null)} />
      )}

      <ConfirmDialog
        open={!!deleteTaskId}
        onOpenChange={(open) => { if (!open) setDeleteTaskId(null); }}
        title={t("board.delete_task")}
        description={t("board.delete_task_desc")}
        confirmLabel={t("common.delete")}
        variant="destructive"
        loading={deleteTask.isPending}
        onConfirm={() => {
          if (deleteTaskId) {
            deleteTask.mutate(deleteTaskId, { onSuccess: () => setDeleteTaskId(null) });
          }
        }}
      />

      <Dialog open={colDialogOpen} onOpenChange={setColDialogOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>{t("board.add_column")}</DialogTitle></DialogHeader>
          <form onSubmit={handleCol((d) => addCol.mutate(d, { onSuccess: () => { resetCol(); setColDialogOpen(false); } }))} className="space-y-4">
            <Input placeholder={t("task.column_title_placeholder")} {...regCol("title")} />
            <Button type="submit" className="w-full" disabled={addCol.isPending}>{addCol.isPending ? t("board.creating") : t("board.add_column")}</Button>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={taskDialogOpen} onOpenChange={setTaskDialogOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>{t("task.create_task")}</DialogTitle></DialogHeader>
          <form onSubmit={handleSubmit((d) => createTask.mutate({ ...d, columnId: selectedColumn, priority: d.priority || "MEDIUM" }, { onSuccess: () => { reset(); setTaskDialogOpen(false); } }))} className="space-y-4">
            <Input placeholder={t("task.title")} {...register("title")} />
            <textarea placeholder="Description" rows={2} className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm" {...register("description")} />
            <Controller name="priority" control={control} render={({ field }) => (
              <div className="flex gap-2">{PRIORITY_KEYS.map((value) => (
                <button key={value} type="button" onClick={() => field.onChange(value)}
                  className={`flex-1 rounded-md border px-3 py-1.5 text-xs font-medium ${field.value === value ? "border-primary bg-primary/10 text-primary" : "border-border"}`}>
                  {t(`priority.${value}`)}
                </button>
              ))}</div>
            )} />
            <Input type="date" {...register("dueDate")} />
            <Button type="submit" className="w-full" disabled={createTask.isPending}>{createTask.isPending ? t("task.creating") : t("task.create_task")}</Button>
          </form>
        </DialogContent>
      </Dialog>
    </AppShell>
  );
}

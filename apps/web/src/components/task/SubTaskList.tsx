"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Check, X } from "lucide-react";
import { useAddSubTask, useUpdateSubTask, useDeleteSubTask } from "@/hooks/useTasks";

interface SubTask {
  id: string; title: string; completed: boolean;
}

interface SubTaskListProps {
  taskId: string;
  subTasks: SubTask[];
}

export function SubTaskList({ taskId, subTasks }: SubTaskListProps) {
  const [title, setTitle] = useState("");
  const addSubTask = useAddSubTask(taskId);
  const updateSubTask = useUpdateSubTask(taskId);
  const deleteSubTask = useDeleteSubTask(taskId);

  const completed = subTasks.filter((s) => s.completed).length;
  const total = subTasks.length;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    addSubTask.mutate({ title }, { onSuccess: () => setTitle("") });
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-xs font-medium text-muted-foreground">
          Sub-Tasks ({completed}/{total})
        </label>
      </div>

      {/* Progress bar */}
      {total > 0 && (
        <div className="h-1 w-full rounded-full bg-muted">
          <div
            className="h-1 rounded-full bg-primary transition-all"
            style={{ width: `${(completed / total) * 100}%` }}
          />
        </div>
      )}

      {/* Sub-task items */}
      {subTasks.map((st) => (
        <div key={st.id} className="flex items-center gap-2 group">
          <button
            onClick={() => updateSubTask.mutate({ subId: st.id, completed: !st.completed })}
            className={`flex size-4 shrink-0 items-center justify-center rounded border transition-colors ${
              st.completed
                ? "border-primary bg-primary text-primary-foreground"
                : "border-muted-foreground hover:border-primary"
            }`}
          >
            {st.completed && <Check className="size-3" />}
          </button>
          <span
            className={`flex-1 text-sm ${
              st.completed ? "line-through text-muted-foreground" : ""
            }`}
          >
            {st.title}
          </span>
          <Button
            variant="ghost"
            size="icon-xs"
            className="opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={() => deleteSubTask.mutate(st.id)}
          >
            <X className="size-3 text-muted-foreground" />
          </Button>
        </div>
      ))}

      {/* Add sub-task form */}
      <form onSubmit={handleSubmit} className="flex gap-2">
        <Input
          placeholder="Add sub-task..."
          className="h-7 text-xs"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <Button type="submit" size="xs" disabled={!title.trim() || addSubTask.isPending}>
          {addSubTask.isPending ? "..." : "Add"}
        </Button>
      </form>
    </div>
  );
}

"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useLabels, useAddLabel, useRemoveLabel } from "@/hooks/useTasks";
import { Plus, X } from "lucide-react";

interface LabelSelectProps {
  taskId: string;
  workspaceId: string;
  currentLabels: { label: { id: string; name: string; color: string } }[];
}

const PRESET_COLORS = ["#ef4444", "#f97316", "#eab308", "#22c55e", "#3b82f6", "#6366f1", "#a855f7", "#ec4899"];

export function LabelSelect({ taskId, workspaceId, currentLabels }: LabelSelectProps) {
  const t = useTranslations();
  const [open, setOpen] = useState(false);
  const [newName, setNewName] = useState("");
  const { data: labels } = useLabels(workspaceId);
  const addLabel = useAddLabel(taskId);
  const removeLabel = useRemoveLabel(taskId);

  const currentLabelIds = new Set(currentLabels.map((l) => l.label.id));

  const handleAdd = (name: string) => {
    const existing = labels?.find((l) => l.name === name);
    if (existing) {
      addLabel.mutate({ name: existing.name, color: existing.color }, { onSuccess: () => setOpen(false) });
    } else {
      const color = PRESET_COLORS[Math.floor(Math.random() * PRESET_COLORS.length)];
      addLabel.mutate({ name, color }, { onSuccess: () => { setNewName(""); setOpen(false); } });
    }
  };

  const handleCreateNew = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;
    handleAdd(newName.trim());
  };

  const availableLabels = labels?.filter((l) => !currentLabelIds.has(l.id)) || [];

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-xs font-medium text-muted-foreground">{t("task.labels")}</label>
        <div className="relative">
          <button
            type="button"
            onClick={() => setOpen(!open)}
            className="flex size-6 items-center justify-center rounded hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
          >
            <Plus className="size-3.5" />
          </button>
          {open && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
              <div className="absolute right-0 top-7 z-50 w-52 rounded-md border border-border bg-popover p-1 shadow-md">
                {/* Create new label */}
                <form onSubmit={handleCreateNew} className="flex gap-1 px-1 py-1.5">
                  <Input
                    className="h-6 text-xs"
                    placeholder={t("task.new_label")}
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    autoFocus
                  />
                  <Button type="submit" size="xs" disabled={!newName.trim()}>+</Button>
                </form>
                {availableLabels.length > 0 && <div className="-mx-1 my-1 h-px bg-border" />}
                {/* Existing workspace labels */}
                {availableLabels.map((l) => (
                  <button
                    key={l.id}
                    type="button"
                    className="flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-sm hover:bg-accent transition-colors"
                    onClick={() => handleAdd(l.name)}
                  >
                    <div className="size-2.5 rounded-full" style={{ backgroundColor: l.color }} />
                    <span>{l.name}</span>
                  </button>
                ))}
                {availableLabels.length === 0 && !newName.trim() && (
                  <div className="px-2 py-2 text-xs text-muted-foreground">{t("task.no_labels_available")}</div>
                )}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Current labels */}
      <div className="flex flex-wrap gap-1.5">
        {currentLabels.length === 0 && (
          <span className="text-xs text-muted-foreground">{t("task.no_labels")}</span>
        )}
        {currentLabels.map(({ label }) => (
          <button
            key={label.id}
            type="button"
            onClick={() => removeLabel.mutate(label.id)}
            className="inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-xs font-medium transition-colors hover:ring-2 hover:ring-destructive/30"
            style={{ backgroundColor: label.color + "20", color: label.color }}
            title="Click to remove"
          >
            {label.name}
            <X className="size-3" />
          </button>
        ))}
      </div>
    </div>
  );
}

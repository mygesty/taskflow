"use client";

import { useState, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { useCreateComment } from "@/hooks/useComments";
import { useWorkspaceOverview } from "@/hooks/useWorkspaces";
import { Send } from "lucide-react";

interface CommentInputProps {
  taskId: string;
  workspaceId: string;
}

export function CommentInput({ taskId, workspaceId }: CommentInputProps) {
  const [content, setContent] = useState("");
  const [showMentions, setShowMentions] = useState(false);
  const [mentionFilter, setMentionFilter] = useState("");
  const [mentionIndex, setMentionIndex] = useState(0);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const createComment = useCreateComment(taskId);
  const { data: overview } = useWorkspaceOverview(workspaceId);

  const members = (overview?.members || []).map((m: any) => m.user);

  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    setContent(val);

    // Check for @ trigger
    const cursorPos = e.target.selectionStart || 0;
    const textBeforeCursor = val.slice(0, cursorPos);
    const atMatch = textBeforeCursor.match(/@(\S*)$/);

    if (atMatch) {
      setShowMentions(true);
      setMentionFilter(atMatch[1].toLowerCase());
      setMentionIndex(0);
    } else {
      setShowMentions(false);
    }
  };

  const insertMention = (name: string) => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    const cursorPos = textarea.selectionStart || 0;
    const textBeforeCursor = content.slice(0, cursorPos);
    const textAfterCursor = content.slice(cursorPos);
    const atIndex = textBeforeCursor.lastIndexOf("@");
    const newContent = textBeforeCursor.slice(0, atIndex) + `@${name} ` + textAfterCursor;
    setContent(newContent);
    setShowMentions(false);
    textarea.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showMentions) return;

    const filtered = members.filter((m: any) =>
      m.name.toLowerCase().includes(mentionFilter),
    );

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setMentionIndex((i) => Math.min(i + 1, filtered.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setMentionIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter" && filtered.length > 0) {
      e.preventDefault();
      insertMention(filtered[mentionIndex].name);
    } else if (e.key === "Escape") {
      setShowMentions(false);
    }
  };

  const submit = () => {
    if (!content.trim()) return;
    createComment.mutate({ content }, { onSuccess: () => setContent("") });
  };

  const handleSubmitKey = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey && !showMentions) {
      e.preventDefault();
      submit();
    }
  };

  const filteredMembers = showMentions
    ? members.filter((m: any) => m.name.toLowerCase().includes(mentionFilter))
    : [];

  return (
    <div className="space-y-2">
      <div className="relative">
        <textarea
          ref={textareaRef}
          value={content}
          onChange={handleInput}
          onKeyDown={(e) => { handleKeyDown(e); handleSubmitKey(e); }}
          placeholder="Write a comment... Use @ to mention someone"
          rows={2}
          className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm transition-colors placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none resize-none"
        />
        {showMentions && filteredMembers.length > 0 && (
          <div className="absolute bottom-full left-0 mb-1 w-52 rounded-md border border-border bg-popover p-1 shadow-md z-50">
            {filteredMembers.map((m: any, i: number) => (
              <button
                key={m.id}
                type="button"
                className={`flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-sm hover:bg-accent transition-colors ${i === mentionIndex ? "bg-accent" : ""}`}
                onMouseDown={(e) => { e.preventDefault(); insertMention(m.name); }}
              >
                <div className="flex size-4 items-center justify-center rounded-full bg-muted text-[9px] font-medium">
                  {m.name.charAt(0)}
                </div>
                {m.name}
              </button>
            ))}
          </div>
        )}
      </div>
      <div className="flex justify-end">
        <Button size="sm" onClick={submit} disabled={!content.trim() || createComment.isPending}>
          <Send className="mr-1.5 size-3.5" />
          {createComment.isPending ? "Sending..." : "Comment"}
        </Button>
      </div>
    </div>
  );
}

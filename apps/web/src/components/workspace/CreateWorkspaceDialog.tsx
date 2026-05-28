"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { useCreateWorkspace } from "@/hooks/useWorkspaces";
import { translateFieldError } from "@/lib/i18n-zod";

const schema = z.object({
  name: z.string().min(1, "Name is required").max(100, "Name is too long"),
  description: z.string().max(500).optional(),
});

type FormData = z.infer<typeof schema>;

export function CreateWorkspaceDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const t = useTranslations();
  const router = useRouter();
  const createMutation = useCreateWorkspace();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  const onSubmit = (data: FormData) => {
    createMutation.mutate(data, {
      onSuccess: (res) => {
        reset();
        onOpenChange(false);
        if (res.data) {
          router.push(`/workspaces/${res.data.id}`);
        }
      },
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("workspace.create_workspace")}</DialogTitle>
          <DialogDescription>{t("home.description")}</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-sm font-medium">{t("auth.name")}</label>
            <Input placeholder={t("workspace.workspace_name_placeholder")} {...register("name")} />
            {errors.name && <p className="text-xs text-destructive">{translateFieldError(errors.name.message, t)}</p>}
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium">{t("workspace.description_optional")}</label>
            <Input placeholder={t("workspace.description_placeholder")} {...register("description")} />
            {errors.description && <p className="text-xs text-destructive">{translateFieldError(errors.description.message, t)}</p>}
          </div>
          {createMutation.isError && (
            <p className="text-sm text-destructive">{(createMutation.error as Error)?.message || t("validation.failed")}</p>
          )}
          <Button type="submit" className="w-full" disabled={createMutation.isPending}>
            {createMutation.isPending ? t("workspace.creating") : t("workspace.create_workspace")}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

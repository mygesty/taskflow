import { RegisterForm } from "@/components/auth/RegisterForm";
import { LayoutGrid } from "lucide-react";

export default function RegisterPage() {
  return (
    <div className="flex min-h-full">
      <div className="hidden w-1/2 bg-primary/5 lg:flex lg:flex-col lg:items-center lg:justify-center lg:px-12">
        <div className="max-w-sm text-center">
          <div className="mb-6 inline-flex size-14 items-center justify-center rounded-2xl bg-primary/10">
            <LayoutGrid className="size-7 text-primary" />
          </div>
          <h2 className="text-2xl font-bold tracking-tight">Join TaskFlow</h2>
          <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
            Create your account and start collaborating with your team in minutes.
          </p>
        </div>
      </div>
      <div className="flex flex-1 items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
        <RegisterForm />
      </div>
    </div>
  );
}

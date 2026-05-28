import { AppShell } from "@/components/layout/AppShell";

export default function Home() {
  return (
    <AppShell>
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <h1 className="text-4xl font-bold">TaskFlow</h1>
          <p className="mt-2 text-muted-foreground">
            Lightweight team task collaboration platform
          </p>
        </div>
      </div>
    </AppShell>
  );
}

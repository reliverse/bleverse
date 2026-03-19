import { Button } from "@repo/ui/button";
import { createFileRoute, Link, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/_auth/projects")({
  component: ProjectsLayout,
});

function ProjectsLayout() {
  return (
    <div className="mx-auto flex min-h-svh w-full max-w-5xl flex-col gap-6 p-4 md:p-6">
      <header className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Projects</h1>
        <Button render={<Link to="/" />} variant="outline" nativeButton={false}>
          Back home
        </Button>
      </header>

      <Outlet />
    </div>
  );
}

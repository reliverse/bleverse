import { SignOutButton } from "@repo/blocks/sign-out-button";
import { Button } from "@repo/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@repo/ui/card";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";

import { projectsListQueryOptions } from "~/lib/projects/queries";

export const Route = createFileRoute("/_auth/projects/")({
  component: ProjectsIndex,
});

function ProjectsIndex() {
  const { data: projects, isLoading } = useQuery(projectsListQueryOptions());

  return (
    <div className="w-full max-w-3xl space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Projects</h2>
        <Button render={<Link to="/projects/new" />} nativeButton={false}>
          New project
        </Button>
      </div>

      {isLoading ? (
        <Card>
          <CardContent className="p-4 text-sm text-muted-foreground">Loading projects…</CardContent>
        </Card>
      ) : projects && projects.length > 0 ? (
        <div className="space-y-3">
          {projects.map((p) => (
            <Card key={p.id}>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">{p.name}</CardTitle>
                <CardDescription>/{p.slug}</CardDescription>
              </CardHeader>
              <CardContent className="flex items-center justify-between gap-2 pt-0">
                <p className="line-clamp-2 text-sm text-muted-foreground">
                  {p.description || "No description"}
                </p>
                <Button
                  size="sm"
                  variant="outline"
                  render={<Link to="/projects/$projectId" params={{ projectId: p.id }} />}
                  nativeButton={false}
                >
                  Open
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="p-4 text-sm text-muted-foreground">
            No projects yet. Create your first one.
          </CardContent>
        </Card>
      )}

      <SignOutButton />
    </div>
  );
}

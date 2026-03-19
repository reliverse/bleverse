import { $updateProject } from "~/lib/projects/functions";
import { projectByIdQueryOptions, projectsListQueryOptions } from "~/lib/projects/queries";
import { Button } from "@repo/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@repo/ui/card";
import { Input } from "@repo/ui/input";
import { Label } from "@repo/ui/label";
import { Switch } from "@repo/ui/switch";
import { Textarea } from "@repo/ui/textarea";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState, type FormEvent } from "react";

export const Route = createFileRoute("/_auth/projects/$projectId/edit")({
  component: EditProjectPage,
});

function slugify(input: string): string {
  return input
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function EditProjectPage() {
  const { projectId } = Route.useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { data: project, isLoading } = useQuery(projectByIdQueryOptions(projectId));

  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [isArchived, setIsArchived] = useState(false);

  const effectiveSlug = useMemo(() => slugify(slug || name), [slug, name]);

  useEffect(() => {
    if (!project) return;
    setName(project.name);
    setSlug(project.slug);
    setDescription(project.description || "");
    setIsArchived(project.isArchived);
  }, [project?.id]);

  const mutation = useMutation({
    mutationFn: async () =>
      await $updateProject({
        data: {
          projectId,
          name,
          slug: effectiveSlug,
          description,
          isArchived,
        },
      }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: projectsListQueryOptions().queryKey });
      await queryClient.invalidateQueries({ queryKey: projectByIdQueryOptions(projectId).queryKey });
      await navigate({ to: "/projects/$projectId", params: { projectId } });
    },
  });

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !effectiveSlug) return;
    mutation.mutate();
  };

  if (isLoading) {
    return (
      <Card className="w-full max-w-2xl">
        <CardContent className="p-4 text-sm text-muted-foreground">Loading project…</CardContent>
      </Card>
    );
  }

  if (!project) {
    return (
      <Card className="w-full max-w-2xl">
        <CardContent className="p-4 text-sm text-muted-foreground">Project not found.</CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle>Edit project</CardTitle>
      </CardHeader>
      <CardContent>
        <form className="space-y-4" onSubmit={onSubmit}>
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input id="name" value={name} onChange={(e) => setName(e.target.value)} required />
          </div>

          <div className="space-y-2">
            <Label htmlFor="slug">Slug</Label>
            <Input id="slug" value={slug} onChange={(e) => setSlug(e.target.value)} />
            <p className="text-xs text-muted-foreground">Final slug: {effectiveSlug || "—"}</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
            />
          </div>

          <div className="flex items-center gap-3">
            <Switch id="archived" checked={isArchived} onCheckedChange={setIsArchived} />
            <Label htmlFor="archived">Archived</Label>
          </div>

          <div className="flex items-center gap-2">
            <Button type="submit" disabled={mutation.isPending || !name.trim() || !effectiveSlug}>
              {mutation.isPending ? "Saving..." : "Save changes"}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate({ to: "/projects/$projectId", params: { projectId } })}
            >
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

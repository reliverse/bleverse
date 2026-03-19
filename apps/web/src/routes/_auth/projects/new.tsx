import { $createProject } from "~/lib/projects/functions";
import { projectsListQueryOptions } from "~/lib/projects/queries";
import { Button } from "@repo/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@repo/ui/card";
import { Input } from "@repo/ui/input";
import { Label } from "@repo/ui/label";
import { Textarea } from "@repo/ui/textarea";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMemo, useState, type FormEvent } from "react";

export const Route = createFileRoute("/_auth/projects/new")({
  component: NewProjectPage,
});

function slugify(input: string): string {
  return input
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function NewProjectPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");

  const effectiveSlug = useMemo(() => slugify(slug || name), [slug, name]);

  const mutation = useMutation({
    mutationFn: async () =>
      await $createProject({
        data: {
          name,
          slug: effectiveSlug,
          description,
        },
      }),
    onSuccess: async (created) => {
      await queryClient.invalidateQueries({ queryKey: projectsListQueryOptions().queryKey });
      await navigate({ to: "/projects/$projectId", params: { projectId: created.id } });
    },
  });

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !effectiveSlug) return;
    mutation.mutate();
  };

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle>Create project</CardTitle>
      </CardHeader>
      <CardContent>
        <form className="space-y-4" onSubmit={onSubmit}>
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input id="name" value={name} onChange={(e) => setName(e.target.value)} required />
          </div>

          <div className="space-y-2">
            <Label htmlFor="slug">Slug</Label>
            <Input
              id="slug"
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              placeholder={slugify(name) || "my-project"}
            />
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

          <Button type="submit" disabled={mutation.isPending || !name.trim() || !effectiveSlug}>
            {mutation.isPending ? "Creating..." : "Create project"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

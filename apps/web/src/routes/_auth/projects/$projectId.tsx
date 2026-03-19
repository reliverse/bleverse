import {
  $connectGithubOwner,
  $createAndLinkRepo,
  $deleteProject,
  $linkExistingRepo,
} from "~/lib/projects/functions";
import {
  githubConnectionsQueryOptions,
  githubReposByOwnerQueryOptions,
  projectByIdQueryOptions,
  projectsListQueryOptions,
} from "~/lib/projects/queries";
import authClient from "@repo/auth/auth-client";
import { Badge } from "@repo/ui/badge";
import { Button } from "@repo/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@repo/ui/card";
import { Input } from "@repo/ui/input";
import { Label } from "@repo/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@repo/ui/select";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { useEffect, useMemo, useState, type FormEvent } from "react";

export const Route = createFileRoute("/_auth/projects/$projectId")({
  validateSearch: (search: Record<string, unknown>) => ({
    connectGithub: typeof search.connectGithub === "string" ? search.connectGithub : undefined,
  }),
  component: ProjectDetailsPage,
});

function ProjectDetailsPage() {
  const { projectId } = Route.useParams();
  const search = Route.useSearch();
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const { data: project, isLoading } = useQuery(projectByIdQueryOptions(projectId));
  const { data: githubConnections = [] } = useQuery(githubConnectionsQueryOptions());

  const [repoName, setRepoName] = useState("");
  const [ownerLogin, setOwnerLogin] = useState("");

  const [connectType, setConnectType] = useState<"user" | "org">("user");
  const [connectOrgLogin, setConnectOrgLogin] = useState("");

  const hasLinkedOwners = githubConnections.length > 0;

  useEffect(() => {
    if (!hasLinkedOwners) return;
    if (!ownerLogin) setOwnerLogin(githubConnections[0]?.ownerLogin ?? "");
  }, [hasLinkedOwners, githubConnections, ownerLogin]);

  const reposQuery = useQuery({
    ...githubReposByOwnerQueryOptions(ownerLogin || "_"),
    enabled: Boolean(ownerLogin),
  });

  const refresh = async () => {
    await queryClient.invalidateQueries({ queryKey: projectsListQueryOptions().queryKey });
    await queryClient.invalidateQueries({ queryKey: projectByIdQueryOptions(projectId).queryKey });
    await queryClient.invalidateQueries({ queryKey: githubConnectionsQueryOptions().queryKey });
    if (ownerLogin) {
      await queryClient.invalidateQueries({ queryKey: githubReposByOwnerQueryOptions(ownerLogin).queryKey });
    }
  };

  const deleteMutation = useMutation({
    mutationFn: async () => await $deleteProject({ data: { projectId } }),
    onSuccess: async () => {
      await refresh();
      await navigate({ to: "/projects" });
    },
  });

  const connectGithubMutation = useMutation({
    mutationFn: async (data: { ownerType: "user" | "org"; ownerLogin?: string }) =>
      await $connectGithubOwner({ data }),
    onSuccess: async () => {
      setConnectOrgLogin("");
      await refresh();
      toast.success("GitHub user/org connected.");
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : "Failed to connect GitHub user/org.");
    },
  });

  const linkExistingMutation = useMutation({
    mutationFn: async (repoUrl: string) => await $linkExistingRepo({ data: { projectId, repoUrl } }),
    onSuccess: async () => {
      await refresh();
      toast.success("Repository linked successfully.");
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : "Failed to link repository.");
    },
  });

  const createAndLinkMutation = useMutation({
    mutationFn: async () =>
      await $createAndLinkRepo({
        data: {
          projectId,
          repoName: repoName || project?.slug,
          ownerLogin: ownerLogin || githubConnections[0]?.ownerLogin,
          private: true,
        },
      }),
    onSuccess: async () => {
      await refresh();
      toast.success("GitHub repository created and linked.");
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : "Failed to create/link GitHub repository.");
    },
  });

  const linkedRepoHref = useMemo(() => project?.repoUrl || null, [project?.repoUrl]);

  useEffect(() => {
    if (search.connectGithub !== "user") return;
    if (connectGithubMutation.isPending) return;

    connectGithubMutation.mutate(
      { ownerType: "user" },
      {
        onSuccess: async () => {
          await navigate({ to: "/projects/$projectId", params: { projectId }, replace: true });
        },
      },
    );
  }, [search.connectGithub]);

  const onConnectGithub = async (e: FormEvent) => {
    e.preventDefault();

    if (connectType === "user") {
      await authClient.signIn.social(
        {
          provider: "github",
          callbackURL: `/projects/${projectId}?connectGithub=user`,
        },
        {
          onError: ({ error }) => {
            toast.error(error.message || "Failed to start GitHub connection flow.");
          },
        },
      );
      return;
    }

    if (!connectOrgLogin.trim()) return;
    connectGithubMutation.mutate({ ownerType: "org", ownerLogin: connectOrgLogin });
  };

  if (isLoading) {
    return (
      <Card className="w-full max-w-3xl">
        <CardContent className="p-4 text-sm text-muted-foreground">Loading project…</CardContent>
      </Card>
    );
  }

  if (!project) {
    return (
      <Card className="w-full max-w-3xl">
        <CardHeader>
          <CardTitle>Project not found</CardTitle>
          <CardDescription>This project does not exist or you do not have access.</CardDescription>
        </CardHeader>
        <CardContent>
          <Link to="/projects" className="text-sm underline">
            Back to projects
          </Link>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-3xl">
      <CardHeader>
        <div className="flex items-center justify-between gap-3">
          <CardTitle>{project.name}</CardTitle>
          <Badge variant={project.isArchived ? "outline" : "default"}>
            {project.isArchived ? "Archived" : "Active"}
          </Badge>
        </div>
        <CardDescription>/{project.slug}</CardDescription>
      </CardHeader>

      <CardContent className="space-y-5">
        <p className="text-sm text-muted-foreground">{project.description || "No description"}</p>
        <p className="text-xs text-muted-foreground">Project ID: {project.id}</p>

        <div className="space-y-2 rounded-md border p-3">
          <p className="text-sm font-medium">Repository</p>
          {linkedRepoHref ? (
            <p className="text-sm">
              Linked:{" "}
              <a className="underline" href={linkedRepoHref} target="_blank" rel="noreferrer">
                {linkedRepoHref}
              </a>
            </p>
          ) : (
            <p className="text-sm text-muted-foreground">No linked repository yet.</p>
          )}

          {hasLinkedOwners ? (
            <>
              <div className="space-y-2">
                <Label>Connected GitHub owner (active)</Label>
                <Select value={ownerLogin} onValueChange={setOwnerLogin}>
                  <SelectTrigger>
                    <SelectValue placeholder={githubConnections[0]?.ownerLogin || "Owner"} />
                  </SelectTrigger>
                  <SelectContent>
                    {githubConnections.map((c) => (
                      <SelectItem key={c.id} value={c.ownerLogin}>
                        {c.ownerType}:{c.ownerLogin}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2 rounded-md border p-3">
                <p className="text-sm font-medium">Link to existing repo</p>
                {reposQuery.isLoading ? (
                  <p className="text-sm text-muted-foreground">Loading repositories…</p>
                ) : reposQuery.data && reposQuery.data.length > 0 ? (
                  <div className="max-h-64 space-y-2 overflow-y-auto pr-1">
                    {reposQuery.data.map((repo) => (
                      <button
                        key={repo.id}
                        type="button"
                        onClick={() => linkExistingMutation.mutate(repo.htmlUrl)}
                        className="w-full rounded-md border p-2 text-left hover:bg-muted"
                        disabled={linkExistingMutation.isPending}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <p className="text-sm font-medium">{repo.fullName}</p>
                          <Badge variant={repo.private ? "secondary" : "outline"}>
                            {repo.private ? "private" : "public"}
                          </Badge>
                        </div>
                        <p className="line-clamp-1 text-xs text-muted-foreground">{repo.description || repo.htmlUrl}</p>
                      </button>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">No repositories found for this owner.</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="repo-name">Create and link repo</Label>
                <div className="flex gap-2">
                  <Input
                    id="repo-name"
                    value={repoName}
                    onChange={(e) => setRepoName(e.target.value)}
                    placeholder={project.slug}
                  />
                  <Button type="button" disabled={createAndLinkMutation.isPending} onClick={() => createAndLinkMutation.mutate()}>
                    {createAndLinkMutation.isPending ? "Creating..." : "Create and link repo"}
                  </Button>
                </div>
              </div>
            </>
          ) : (
            <p className="text-sm text-muted-foreground">
              Connect GitHub user/org first to enable repository linking and creation.
            </p>
          )}

          <form className="space-y-2" onSubmit={onConnectGithub}>
            <Label>Connect GitHub User/Org</Label>
            <div className="grid gap-2 sm:grid-cols-3">
              <Select value={connectType} onValueChange={(v) => setConnectType(v as "user" | "org") }>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="user">GitHub User (me)</SelectItem>
                  <SelectItem value="org">GitHub Org</SelectItem>
                </SelectContent>
              </Select>

              <Input
                value={connectOrgLogin}
                onChange={(e) => setConnectOrgLogin(e.target.value)}
                placeholder={connectType === "org" ? "org-login" : "Not needed for user"}
                disabled={connectType !== "org"}
                className="sm:col-span-2"
              />
            </div>
            <Button
              type="submit"
              variant="outline"
              disabled={connectGithubMutation.isPending || (connectType === "org" && !connectOrgLogin.trim())}
            >
              {connectGithubMutation.isPending ? "Connecting..." : "Connect GitHub User/Org"}
            </Button>
          </form>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            render={<Link to="/projects/$projectId/edit" params={{ projectId: project.id }} />}
            nativeButton={false}
          >
            Edit project
          </Button>

          <Button
            size="sm"
            variant="destructive"
            disabled={deleteMutation.isPending}
            onClick={() => {
              if (!confirm("Delete this project? This action cannot be undone.")) return;
              deleteMutation.mutate();
            }}
          >
            {deleteMutation.isPending ? "Deleting..." : "Delete project"}
          </Button>

          <Button size="sm" variant="ghost" render={<Link to="/projects" />} nativeButton={false}>
            Back to projects
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

import { auth } from "@repo/auth/auth";
import { db } from "@repo/db";
import { account, githubConnection, project } from "@repo/db/schema";
import { and, asc, eq } from "drizzle-orm";
import { createServerFn } from "@tanstack/react-start";
import { getRequest } from "@tanstack/react-start/server";

type GithubApiErrorPayload = { message?: string; errors?: Array<{ message?: string }> };

async function requireUserId(): Promise<string> {
  const session = await auth.api.getSession({ headers: getRequest().headers });
  const userId = session?.user?.id;
  if (!userId) throw new Error("Unauthorized");
  return userId;
}

function normalizeSlug(slug: string): string {
  return slug
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function parseGithubRepoUrl(input: string): { owner: string; name: string; htmlUrl: string } {
  let url: URL;
  try {
    url = new URL(input.trim());
  } catch {
    throw new Error("Invalid URL");
  }

  if (url.hostname !== "github.com") {
    throw new Error("Only github.com repository links are supported");
  }

  const parts = url.pathname.split("/").filter(Boolean);
  if (parts.length < 2) {
    throw new Error("GitHub URL must be in format https://github.com/<owner>/<repo>");
  }

  const owner = parts[0];
  const name = parts[1].replace(/\.git$/i, "");
  const htmlUrl = `https://github.com/${owner}/${name}`;

  return { owner, name, htmlUrl };
}

function mapGithubApiError(status: number, payload: GithubApiErrorPayload): string {
  const detail = payload.errors?.[0]?.message || payload.message;

  if (status === 401) return "GitHub authorization expired. Please sign in with GitHub again.";
  if (status === 403)
    return "GitHub request was forbidden (permissions or rate limit). Try again later or reconnect GitHub.";
  if (status === 404)
    return "GitHub resource was not found. Check repository owner/name and try again.";
  if (status === 409) return "Repository already exists on GitHub for this account.";
  if (status === 422)
    return detail
      ? `GitHub validation error: ${detail}`
      : "GitHub rejected the repository request (name/validation issue).";

  return detail ? `GitHub API error (${status}): ${detail}` : `GitHub API error (${status}).`;
}

async function requireGithubAccessToken(userId: string): Promise<string> {
  const rows = await db
    .select({ accessToken: account.accessToken })
    .from(account)
    .where(and(eq(account.userId, userId), eq(account.providerId, "github")))
    .limit(1);

  const token = rows[0]?.accessToken;
  if (!token) {
    throw new Error("GitHub account is not connected or token is missing. Sign in with GitHub first.");
  }
  return token;
}

async function githubRequest<T>(
  path: string,
  token: string,
  init?: { method?: "GET" | "POST"; body?: unknown },
): Promise<T> {
  const response = await fetch(`https://api.github.com${path}`, {
    method: init?.method ?? "GET",
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/vnd.github+json",
      "X-GitHub-Api-Version": "2022-11-28",
      "Content-Type": "application/json",
    },
    body: init?.body !== undefined ? JSON.stringify(init.body) : undefined,
  });

  const payload = (await response.json()) as GithubApiErrorPayload & T;
  if (!response.ok) {
    throw new Error(mapGithubApiError(response.status, payload));
  }
  return payload as T;
}

export const $listProjects = createServerFn({ method: "GET" }).handler(async () => {
  const userId = await requireUserId();
  return await db.select().from(project).where(eq(project.ownerId, userId)).orderBy(project.createdAt);
});

export const $getProject = createServerFn({ method: "GET" }).handler(
  async (ctx: { data?: { projectId?: string } }) => {
    const userId = await requireUserId();
    const projectId = ctx?.data?.projectId;
    if (!projectId) throw new Error("projectId is required");

    const rows = await db
      .select()
      .from(project)
      .where(and(eq(project.ownerId, userId), eq(project.id, projectId)))
      .limit(1);
    return rows[0] ?? null;
  },
);

export const $createProject = createServerFn({ method: "POST" }).handler(
  async (ctx: { data?: { name?: string; slug?: string; description?: string } }) => {
    const userId = await requireUserId();
    const name = ctx?.data?.name?.trim() ?? "";
    const slugRaw = ctx?.data?.slug ?? name;
    const slug = normalizeSlug(slugRaw);
    if (!name) throw new Error("name is required");
    if (!slug) throw new Error("slug is required");

    const inserted = await db
      .insert(project)
      .values({
        id: crypto.randomUUID(),
        ownerId: userId,
        name,
        slug,
        description: ctx?.data?.description?.trim() || null,
      })
      .returning();

    return inserted[0];
  },
);

export const $updateProject = createServerFn({ method: "POST" }).handler(
  async (ctx: {
    data?: {
      projectId?: string;
      name?: string;
      slug?: string;
      description?: string | null;
      isArchived?: boolean;
    };
  }) => {
    const userId = await requireUserId();
    const projectId = ctx?.data?.projectId;
    if (!projectId) throw new Error("projectId is required");

    const patch: Partial<typeof project.$inferInsert> = {};
    if (ctx?.data?.name !== undefined) patch.name = ctx.data.name.trim();
    if (ctx?.data?.slug !== undefined) patch.slug = normalizeSlug(ctx.data.slug);
    if (ctx?.data?.description !== undefined) patch.description = ctx.data.description?.trim() || null;
    if (ctx?.data?.isArchived !== undefined) patch.isArchived = ctx.data.isArchived;

    const updated = await db
      .update(project)
      .set(patch)
      .where(and(eq(project.ownerId, userId), eq(project.id, projectId)))
      .returning();

    return updated[0] ?? null;
  },
);

export const $deleteProject = createServerFn({ method: "POST" }).handler(
  async (ctx: { data?: { projectId?: string } }) => {
    const userId = await requireUserId();
    const projectId = ctx?.data?.projectId;
    if (!projectId) throw new Error("projectId is required");

    const deleted = await db
      .delete(project)
      .where(and(eq(project.ownerId, userId), eq(project.id, projectId)))
      .returning({ id: project.id });

    return { ok: deleted.length > 0 };
  },
);

export const $listGithubConnections = createServerFn({ method: "GET" }).handler(async () => {
  const userId = await requireUserId();
  return await db
    .select()
    .from(githubConnection)
    .where(eq(githubConnection.userId, userId))
    .orderBy(asc(githubConnection.createdAt));
});

export const $connectGithubOwner = createServerFn({ method: "POST" }).handler(
  async (ctx: { data?: { ownerType?: "user" | "org"; ownerLogin?: string } }) => {
    const userId = await requireUserId();
    const token = await requireGithubAccessToken(userId);

    const ownerType = ctx?.data?.ownerType ?? "user";
    if (ownerType !== "user" && ownerType !== "org") {
      throw new Error("ownerType must be user or org");
    }

    let ownerLogin = ctx?.data?.ownerLogin?.trim() || "";
    let ownerId = "";
    let avatarUrl: string | null = null;

    if (ownerType === "user") {
      const me = await githubRequest<{ login: string; id: number; avatar_url?: string }>("/user", token);
      ownerLogin = me.login;
      ownerId = String(me.id);
      avatarUrl = me.avatar_url ?? null;
    } else {
      if (!ownerLogin) throw new Error("ownerLogin is required for org");

      await githubRequest<{ state?: string }>(`/user/memberships/orgs/${ownerLogin}`, token);
      const org = await githubRequest<{ login: string; id: number; avatar_url?: string }>(
        `/orgs/${ownerLogin}`,
        token,
      );

      ownerLogin = org.login;
      ownerId = String(org.id);
      avatarUrl = org.avatar_url ?? null;
    }

    const inserted = await db
      .insert(githubConnection)
      .values({
        id: crypto.randomUUID(),
        userId,
        ownerType,
        ownerLogin,
        ownerId,
        avatarUrl,
      })
      .onConflictDoNothing({
        target: [githubConnection.userId, githubConnection.ownerType, githubConnection.ownerLogin],
      })
      .returning();

    if (inserted[0]) return inserted[0];

    const existing = await db
      .select()
      .from(githubConnection)
      .where(
        and(
          eq(githubConnection.userId, userId),
          eq(githubConnection.ownerType, ownerType),
          eq(githubConnection.ownerLogin, ownerLogin),
        ),
      )
      .limit(1);

    return existing[0] ?? null;
  },
);

export const $listGithubRepos = createServerFn({ method: "GET" }).handler(
  async (ctx: { data?: { ownerLogin?: string } }) => {
    const userId = await requireUserId();
    const ownerLogin = ctx?.data?.ownerLogin?.trim();
    if (!ownerLogin) throw new Error("ownerLogin is required");

    const token = await requireGithubAccessToken(userId);

    const connections = await db
      .select()
      .from(githubConnection)
      .where(eq(githubConnection.userId, userId));

    const connection = connections.find((c) => c.ownerLogin.toLowerCase() === ownerLogin.toLowerCase());
    if (!connection) throw new Error("Selected GitHub owner is not connected for this account.");

    const path =
      connection.ownerType === "org"
        ? `/orgs/${connection.ownerLogin}/repos?type=all&sort=updated&per_page=100`
        : "/user/repos?type=owner&sort=updated&per_page=100";

    const repos = await githubRequest<
      Array<{
        id: number;
        name: string;
        full_name: string;
        html_url: string;
        private: boolean;
        description?: string | null;
      }>
    >(path, token);

    return repos.map((repo) => ({
      id: repo.id,
      name: repo.name,
      fullName: repo.full_name,
      htmlUrl: repo.html_url,
      private: repo.private,
      description: repo.description || null,
    }));
  },
);

export const $linkExistingRepo = createServerFn({ method: "POST" }).handler(
  async (ctx: { data?: { projectId?: string; repoUrl?: string } }) => {
    const userId = await requireUserId();
    const projectId = ctx?.data?.projectId;
    const repoUrl = ctx?.data?.repoUrl;

    if (!projectId) throw new Error("projectId is required");
    if (!repoUrl) throw new Error("repoUrl is required");

    const parsed = parseGithubRepoUrl(repoUrl);

    const connections = await db
      .select()
      .from(githubConnection)
      .where(eq(githubConnection.userId, userId));

    const allowed = connections.some((c) => c.ownerLogin.toLowerCase() === parsed.owner.toLowerCase());
    if (!allowed) {
      throw new Error("Connect this GitHub user/org first, then link repositories under that owner.");
    }

    const updated = await db
      .update(project)
      .set({
        repoProvider: "github",
        repoOwner: parsed.owner,
        repoName: parsed.name,
        repoUrl: parsed.htmlUrl,
        repoLinkedAt: new Date(),
      })
      .where(and(eq(project.ownerId, userId), eq(project.id, projectId)))
      .returning();

    return updated[0] ?? null;
  },
);

export const $createAndLinkRepo = createServerFn({ method: "POST" }).handler(
  async (ctx: { data?: { projectId?: string; repoName?: string; ownerLogin?: string; private?: boolean } }) => {
    const userId = await requireUserId();
    const projectId = ctx?.data?.projectId;
    if (!projectId) throw new Error("projectId is required");

    const token = await requireGithubAccessToken(userId);

    const current = await db
      .select()
      .from(project)
      .where(and(eq(project.ownerId, userId), eq(project.id, projectId)))
      .limit(1);

    const p = current[0];
    if (!p) throw new Error("Project not found");

    const connections = await db
      .select()
      .from(githubConnection)
      .where(eq(githubConnection.userId, userId))
      .orderBy(asc(githubConnection.createdAt));

    if (!connections.length) {
      throw new Error("Connect GitHub user/org first.");
    }

    const selectedOwner =
      ctx?.data?.ownerLogin?.trim().toLowerCase() || connections[0]?.ownerLogin.toLowerCase();
    const connection = connections.find((c) => c.ownerLogin.toLowerCase() === selectedOwner);
    if (!connection) {
      throw new Error("Selected GitHub owner is not connected for this account.");
    }

    const repoName = normalizeSlug(ctx?.data?.repoName || p.slug || p.name);
    if (!repoName) throw new Error("repoName is required");

    const path =
      connection.ownerType === "org" ? `/orgs/${connection.ownerLogin}/repos` : "/user/repos";

    const payload = await githubRequest<{
      html_url?: string;
      name?: string;
      owner?: { login?: string };
    }>(path, token, {
      method: "POST",
      body: {
        name: repoName,
        private: ctx?.data?.private ?? true,
        description: p.description || `Project ${p.name}`,
      },
    });

    const updated = await db
      .update(project)
      .set({
        repoProvider: "github",
        repoOwner: payload.owner?.login || connection.ownerLogin,
        repoName: payload.name || repoName,
        repoUrl: payload.html_url || null,
        repoLinkedAt: new Date(),
      })
      .where(and(eq(project.ownerId, userId), eq(project.id, projectId)))
      .returning();

    return updated[0] ?? null;
  },
);

import { spawn } from "node:child_process";
import { readFile, stat, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";

export type AppRegistryEntry = {
  id: string;
  repoDir: string;
  workspacePath: string;
  service: string;
  smokeUrl: string;
  pm?: "bun" | "pnpm" | "npm";
  installScope?: "auto" | "root" | "app" | "both";
  filter?: string;
};

export type AppRegistry = {
  apps: AppRegistryEntry[];
};

export function resolveRegistryPath(input?: string): string {
  if (input && input.trim()) return input;
  return path.join(os.homedir(), ".config", "deploy.json");
}

export async function readRegistry(registryPath?: string): Promise<AppRegistry> {
  const finalPath = resolveRegistryPath(registryPath);
  const raw = await readFile(finalPath, "utf8");
  const parsed = JSON.parse(raw) as AppRegistry;
  if (!parsed || !Array.isArray(parsed.apps)) {
    throw new Error(`Invalid registry format in ${finalPath}`);
  }
  return parsed;
}

export async function writeRegistry(data: AppRegistry, registryPath?: string): Promise<void> {
  const finalPath = resolveRegistryPath(registryPath);
  const body = JSON.stringify(data, null, 2) + "\n";
  await writeFile(finalPath, body, "utf8");
}

export function listApps(registry: AppRegistry): AppRegistryEntry[] {
  return [...registry.apps].sort((a, b) => a.id.localeCompare(b.id));
}

export function getApp(registry: AppRegistry, appId: string): AppRegistryEntry | undefined {
  return registry.apps.find((a) => a.id === appId);
}

export function upsertApp(registry: AppRegistry, app: AppRegistryEntry): AppRegistry {
  const idx = registry.apps.findIndex((a) => a.id === app.id);
  if (idx === -1) return { apps: [...registry.apps, app] };
  const apps = [...registry.apps];
  apps[idx] = { ...apps[idx], ...app };
  return { apps };
}

export function removeApp(registry: AppRegistry, appId: string): AppRegistry {
  return { apps: registry.apps.filter((a) => a.id !== appId) };
}

async function spawnExitCode(command: string[], inherit = false): Promise<number> {
  return await new Promise((resolve, reject) => {
    const proc = spawn(command[0], command.slice(1), {
      stdio: inherit ? "inherit" : "ignore",
      env: process.env,
    });
    proc.on("error", reject);
    proc.on("close", (code) => resolve(code ?? 1));
  });
}

export async function deployAppById(appId: string, options?: DeployAppOptions): Promise<void> {
  const home = options?.homeDir ?? process.env.HOME ?? "";
  const deployBin = options?.deployBin ?? path.join(home, ".local", "bin", "bleverse-deploy-app");
  const code = await spawnExitCode([deployBin, appId], true);
  if (code !== 0) throw new Error(`deploy failed for app ${appId} (exit=${code})`);
}

export async function getAppStatus(
  appId: string,
  registryPath?: string,
): Promise<AppStatusResult> {
  const registry = await readRegistry(registryPath);
  const app = getApp(registry, appId);
  if (!app) throw new Error(`app not found: ${appId}`);

  const statusCode = await spawnExitCode(["systemctl", "--user", "is-active", app.service]);
  const serviceActive = statusCode === 0;

  let healthOk = false;
  let healthBody: unknown = null;
  let healthError = "";
  try {
    const url = `${app.smokeUrl.replace(/\/$/, "")}/health`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
    healthOk = true;
    const ct = res.headers.get("content-type") ?? "";
    healthBody = ct.includes("application/json") ? await res.json() : await res.text();
  } catch (err) {
    healthError = err instanceof Error ? err.message : String(err);
  }

  return {
    id: app.id,
    service: app.service,
    serviceActive,
    smokeUrl: app.smokeUrl,
    healthOk,
    health: healthBody,
    healthError: healthError || undefined,
  };
}

export type BleverseApiClientOptions = {
  baseUrl?: string;
  token?: string;
};

export type BleverseApiClient = {
  getHealth(): Promise<unknown>;
  get(pathname: string): Promise<unknown>;
  post(pathname: string, body?: unknown): Promise<unknown>;
};

export function createBleverseApiClient(options: BleverseApiClientOptions = {}): BleverseApiClient {
  const baseUrl = (options.baseUrl ?? "https://api.bleverse.com").replace(/\/$/, "");

  async function request(
    method: "GET" | "POST",
    pathname: string,
    body?: unknown,
  ): Promise<unknown> {
    const url = `${baseUrl}${pathname.startsWith("/") ? pathname : `/${pathname}`}`;
    const headers: Record<string, string> = { "content-type": "application/json" };
    if (options.token) headers.authorization = `Bearer ${options.token}`;

    const res = await fetch(url, {
      method,
      headers,
      body: method === "POST" ? JSON.stringify(body ?? {}) : undefined,
    });

    if (!res.ok) {
      const text = await res.text();
      throw new Error(`API ${method} ${url} failed: ${res.status} ${res.statusText} :: ${text}`);
    }

    const contentType = res.headers.get("content-type") ?? "";
    if (contentType.includes("application/json")) return await res.json();
    return await res.text();
  }

  return {
    getHealth() {
      return request("GET", "/health");
    },
    get(pathname: string) {
      return request("GET", pathname);
    },
    post(pathname: string, body?: unknown) {
      return request("POST", pathname, body);
    },
  };
}

export type PreviewRebuildOptions = {
  port: number;
  appDir?: string;
  unitName?: string;
  unitPrefix?: string;
  healthUrl?: string;
  timeoutSeconds?: number;
};

export type PreviewRebuildResult = {
  ok: boolean;
  unit: string;
  port: number;
  healthUrl: string;
};

export type DeployAppOptions = {
  deployBin?: string;
  homeDir?: string;
};

export type AppStatusResult = {
  id: string;
  service: string;
  serviceActive: boolean;
  smokeUrl: string;
  healthOk: boolean;
  health: unknown;
  healthError?: string;
};

function resolvePreviewUnitName(options: PreviewRebuildOptions): string {
  if (options.unitName) return options.unitName;
  const prefix = options.unitPrefix ?? "bleverse-preview-web";
  return `${prefix}-${options.port}`;
}

async function execExitCode(command: string[], opts?: { inherit?: boolean }): Promise<number> {
  return await new Promise((resolve, reject) => {
    const proc = spawn(command[0], command.slice(1), {
      stdio: opts?.inherit ? "inherit" : "ignore",
      env: process.env,
    });
    proc.on("error", reject);
    proc.on("close", (code) => resolve(code ?? 1));
  });
}

async function waitForHealth(url: string, timeoutSeconds: number): Promise<boolean> {
  const attempts = Math.max(1, timeoutSeconds);
  for (let i = 0; i < attempts; i++) {
    try {
      const res = await fetch(url);
      if (res.ok) return true;
    } catch {
      // retry
    }
    await new Promise((r) => setTimeout(r, 1000));
  }
  return false;
}

async function buildPreviewApp(appDir: string): Promise<void> {
  const code = await execExitCode([
    "/usr/bin/env",
    "bash",
    "-lc",
    `set -euo pipefail; cd ${JSON.stringify(appDir)}; bun run build`,
  ], { inherit: true });
  if (code !== 0) {
    throw new Error(`preview build failed in ${appDir}`);
  }
}

/**
 * Rebuilds preview app once and restarts preview unit (single-build flow).
 */
export async function rebuildPreviewRuntime(
  options: PreviewRebuildOptions,
): Promise<PreviewRebuildResult> {
  if (!Number.isInteger(options.port) || options.port < 3000 || options.port > 65535) {
    throw new Error("port must be an integer between 3000 and 65535");
  }

  const unit = resolvePreviewUnitName(options);
  const appDir = options.appDir ?? "/home/blefnk/dev/bleverse/apps/web";
  const healthUrl = options.healthUrl ?? `http://127.0.0.1:${options.port}/health`;
  const timeoutSeconds = options.timeoutSeconds ?? 120;

  await buildPreviewApp(appDir);

  const restartCode = await execExitCode(["systemctl", "--user", "restart", unit], {
    inherit: true,
  });
  if (restartCode !== 0) {
    throw new Error(`failed to restart preview unit ${unit}`);
  }

  const ready = await waitForHealth(healthUrl, timeoutSeconds);
  if (!ready) {
    throw new Error(`preview app did not become ready on ${healthUrl}`);
  }

  return { ok: true, unit, port: options.port, healthUrl };
}

export type RouterNamespace = "preview" | "tenant";

export type RouterRequestOptions = {
  baseUrl?: string;
  token?: string;
  json?: unknown;
  envFile?: string;
};

export type RouterRequestResult = {
  status: number;
  ok: boolean;
  body: unknown;
};

export async function loadRouterTokenFromEnvFile(envFile?: string): Promise<string | undefined> {
  const file = envFile ?? `${process.env.HOME ?? ""}/.config/bleverse/router-4002.env`;
  try {
    await stat(file);
  } catch {
    return undefined;
  }

  const raw = await readFile(file, "utf8");
  for (const line of raw.split(/\r?\n/)) {
    const s = line.trim();
    if (!s || s.startsWith("#")) continue;
    const i = s.indexOf("=");
    if (i <= 0) continue;
    const k = s.slice(0, i).trim();
    if (k !== "BLEVERSE_ROUTER_ADMIN_TOKEN") continue;
    const v = s.slice(i + 1).trim().replace(/^"|"$/g, "");
    return v || undefined;
  }

  return undefined;
}

export async function routerRequest(
  method: "GET" | "POST",
  endpoint: string,
  options?: RouterRequestOptions,
): Promise<RouterRequestResult> {
  const baseUrl = options?.baseUrl ?? "http://127.0.0.1:4002";
  const url = `${baseUrl.replace(/\/$/, "")}${endpoint}`;

  const token =
    options?.token ??
    process.env.BLEVERSE_ROUTER_ADMIN_TOKEN ??
    (await loadRouterTokenFromEnvFile(options?.envFile));

  const headers = new Headers();
  if (token) headers.set("Authorization", `Bearer ${token}`);
  if (options?.json !== undefined) headers.set("Content-Type", "application/json");

  const res = await fetch(url, {
    method,
    headers,
    body: options?.json !== undefined ? JSON.stringify(options.json) : undefined,
  });

  const ct = res.headers.get("content-type") ?? "";
  const body = ct.includes("application/json") ? await res.json() : await res.text();
  return { status: res.status, ok: res.ok, body };
}

export type PreviewRuntimeOptions = {
  appDir?: string;
  port?: number;
  key?: string;
  baseUrl?: string;
  token?: string;
  envFile?: string;
  unitName?: string;
  unitPrefix?: string;
  domain?: string;
  timeoutSeconds?: number;
};

export type PreviewRuntimeStatus = {
  ok: true;
  unit: string;
  active: boolean;
  port: number;
  key: string;
  host: string;
  resolve: unknown;
};

export type PreviewRuntimeUpResult = {
  ok: true;
  unit: string;
  appDir: string;
  port: number;
  key: string;
  host: string;
  previewUrl: string;
};

export type PreviewRuntimeDownResult = {
  ok: boolean;
  unit: string;
  port: number;
  key: string;
  host: string;
  deleted: unknown;
};

function previewDefaults(options?: PreviewRuntimeOptions) {
  const port = options?.port ?? 3105;
  const key = options?.key ?? `pr-${port}`;
  const appDir = options?.appDir ?? "/home/blefnk/dev/bleverse/apps/web";
  const domain = options?.domain ?? "bleverse.com";
  const unit =
    options?.unitName ?? `${options?.unitPrefix ?? "bleverse-preview-web"}-${port}`;
  const host = `${key}.${domain}`;
  return { appDir, port, key, unit, host };
}

async function runCommand(command: string[], inherit = true): Promise<number> {
  return await new Promise((resolve, reject) => {
    const proc = spawn(command[0], command.slice(1), {
      stdio: inherit ? "inherit" : "ignore",
      env: process.env,
    });
    proc.on("error", reject);
    proc.on("close", (code) => resolve(code ?? 1));
  });
}

async function commandExitCode(command: string[]): Promise<number> {
  return await runCommand(command, false);
}

function assertValidPort(port: number): void {
  if (!Number.isInteger(port) || port < 3000 || port > 65535) {
    throw new Error("port must be an integer between 3000 and 65535");
  }
}

export async function upPreviewRuntime(
  options?: PreviewRuntimeOptions,
): Promise<PreviewRuntimeUpResult> {
  const { appDir, port, key, unit, host } = previewDefaults(options);
  assertValidPort(port);

  try {
    await stat(appDir);
  } catch {
    throw new Error(`appDir not found: ${appDir}`);
  }

  await commandExitCode(["systemctl", "--user", "stop", unit]);
  await commandExitCode(["systemctl", "--user", "reset-failed", unit]);

  await buildPreviewApp(appDir);

  const startCode = await runCommand([
    "systemd-run",
    "--user",
    "--unit",
    unit,
    "--working-directory",
    appDir,
    "/usr/bin/env",
    "bash",
    "-lc",
    `set -euo pipefail; PORT=${port} bun run start`,
  ]);

  if (startCode !== 0) {
    throw new Error(`failed to start preview unit ${unit}`);
  }

  const healthUrl = `http://127.0.0.1:${port}/health`;
  const timeoutSeconds = options?.timeoutSeconds ?? 120;
  const ready = await waitForHealth(healthUrl, timeoutSeconds);
  if (!ready) {
    throw new Error(`preview app did not become ready on ${healthUrl}`);
  }

  const upsert = await routerRequest("POST", "/_admin/upsert", {
    baseUrl: options?.baseUrl,
    token: options?.token,
    envFile: options?.envFile,
    json: { namespace: "preview", key, target: `http://127.0.0.1:${port}` },
  });

  if (!upsert.ok) {
    throw new Error(`router upsert failed: ${JSON.stringify(upsert.body)}`);
  }

  return {
    ok: true,
    unit,
    appDir,
    port,
    key,
    host,
    previewUrl: `https://${host}`,
  };
}

export async function downPreviewRuntime(
  options?: PreviewRuntimeOptions,
): Promise<PreviewRuntimeDownResult> {
  const { port, key, unit, host } = previewDefaults(options);
  assertValidPort(port);

  const del = await routerRequest("POST", "/_admin/delete", {
    baseUrl: options?.baseUrl,
    token: options?.token,
    envFile: options?.envFile,
    json: { namespace: "preview", key },
  });

  await commandExitCode(["systemctl", "--user", "stop", unit]);
  await commandExitCode(["systemctl", "--user", "reset-failed", unit]);

  return {
    ok: del.ok,
    unit,
    port,
    key,
    host,
    deleted: del.body,
  };
}

export async function statusPreviewRuntime(
  options?: PreviewRuntimeOptions,
): Promise<PreviewRuntimeStatus> {
  const { port, key, unit, host } = previewDefaults(options);
  assertValidPort(port);

  const statusCode = await commandExitCode(["systemctl", "--user", "is-active", unit]);
  const active = statusCode === 0;

  const resolve = await routerRequest("GET", `/_resolve?host=${encodeURIComponent(host)}`, {
    baseUrl: options?.baseUrl,
    token: options?.token,
    envFile: options?.envFile,
  });

  return {
    ok: true,
    unit,
    active,
    port,
    key,
    host,
    resolve: resolve.body,
  };
}

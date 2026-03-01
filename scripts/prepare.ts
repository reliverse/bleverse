#!/usr/bin/env bun

import { mkdir, writeFile } from "node:fs/promises";

type Cli = {
  deployRuntime: boolean;
  dryRun: boolean;
  force: boolean;
  help: boolean;
};

function printHelp(): void {
  const bin = process.argv[1] ?? "scripts/prepare.ts";
  console.log(`Usage: bun ${bin} [options]

Prepare the current repository folder for a specific environment.
No interactive prompts; behavior is controlled by flags only.

Options:
  --deploy-runtime, --deploy   Generate deploy-runtime guardrails in the current folder
  --dry-run, -d                Print actions without writing files
  --force, -f                  Overwrite files even if they already exist
  --help, -h                   Show this help message

Examples:
  bun scripts/prepare.ts --deploy-runtime
  bun scripts/prepare.ts --deploy --force
`);
}

function parseArgs(argv: string[]): Cli {
  let deployRuntime = false;
  let dryRun = false;
  let force = false;
  let help = false;

  for (const a of argv) {
    if (a === "--deploy-runtime" || a === "--deploy") deployRuntime = true;
    else if (a === "--dry-run" || a === "-d") dryRun = true;
    else if (a === "--force" || a === "-f") force = true;
    else if (a === "--help" || a === "-h") help = true;
    else {
      console.error(`Unknown option: ${a}`);
      console.error("Use --help for usage information");
      process.exit(2);
    }
  }

  return { deployRuntime, dryRun, force, help };
}

async function writeFileSafe(path: string, content: string, opts: { dryRun: boolean; force: boolean }): Promise<void> {
  if (opts.dryRun) {
    console.log(`[dry-run] write ${path}`);
    return;
  }

  const mode = opts.force ? undefined : "wx";
  await writeFile(path, content, mode ? ({ flag: mode } as const) : undefined);
  console.log(`wrote ${path}`);
}

async function prepareDeployRuntime(opts: { dryRun: boolean; force: boolean }): Promise<void> {
  const marker = `# Deploy checkout (runtime)\n\nThis repo is used as a deploy/runtime checkout.\n\nDo not commit/push from here.\nUse: \`~/B/R/bleverse\` for development work.\n`;

  const preCommit = `#!/usr/bin/env bash\necho "❌ Commit blocked: this is a deploy/runtime checkout."\necho "Use dev repo instead: ~/B/R/bleverse"\nexit 1\n`;

  const prePush = `#!/usr/bin/env bash\necho "❌ Push blocked from deploy/runtime checkout."\necho "Use dev repo instead: ~/B/R/bleverse"\nexit 1\n`;

  if (!opts.dryRun) {
    await mkdir(".githooks", { recursive: true });
  }

  await writeFileSafe("DO_NOT_COMMIT_HERE.md", marker, opts);
  await writeFileSafe(".githooks/pre-commit", preCommit, opts);
  await writeFileSafe(".githooks/pre-push", prePush, opts);

  if (!opts.dryRun) {
    await Bun.$`chmod +x .githooks/pre-commit .githooks/pre-push`;
    await Bun.$`git config core.hooksPath .githooks`;
    await Bun.$`git config pull.ff only`;
    await Bun.$`git config fetch.prune true`;
  }

  console.log("deploy-runtime guardrails prepared");
}

async function main(): Promise<void> {
  const cli = parseArgs(process.argv.slice(2));

  if (cli.help) {
    printHelp();
    process.exit(0);
  }

  if (!cli.deployRuntime) {
    console.error("No environment selected. Use --deploy-runtime (or --deploy).");
    process.exit(2);
  }

  try {
    await prepareDeployRuntime({ dryRun: cli.dryRun, force: cli.force });
  } catch (error) {
    if (error instanceof Error && (error as NodeJS.ErrnoException).code === "EEXIST") {
      console.error("Some files already exist. Re-run with --force to overwrite.");
      process.exit(1);
    }
    console.error(error);
    process.exit(1);
  }
}

await main();

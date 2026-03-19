import { queryOptions } from "@tanstack/react-query";

import { $getProject, $listGithubConnections, $listGithubRepos, $listProjects } from "./functions";

export const projectsListQueryOptions = () =>
  queryOptions({
    queryKey: ["projects"],
    queryFn: ({ signal }) => $listProjects({ signal }),
  });

export const projectByIdQueryOptions = (projectId: string) =>
  queryOptions({
    queryKey: ["projects", projectId],
    queryFn: ({ signal }) => $getProject({ data: { projectId }, signal }),
  });

export const githubConnectionsQueryOptions = () =>
  queryOptions({
    queryKey: ["github-connections"],
    queryFn: ({ signal }) => $listGithubConnections({ signal }),
  });

export const githubReposByOwnerQueryOptions = (ownerLogin: string) =>
  queryOptions({
    queryKey: ["github-repos", ownerLogin],
    queryFn: ({ signal }) => $listGithubRepos({ data: { ownerLogin }, signal }),
  });

// Fetch a curated view of the owner's GitHub via the GraphQL API (one call → profile +
// repos + pinned). Excludes forks & archived repos. Cached in memory (TTL) to stay well
// under rate limits and keep responses fast.
import { env } from '../config/env.js';

const GITHUB_GRAPHQL = 'https://api.github.com/graphql';
const CACHE_TTL_MS = 30 * 60 * 1000; // 30 min

const QUERY = `
query GithubPortfolio($login: String!) {
  user(login: $login) {
    login
    name
    bio
    avatarUrl
    location
    company
    websiteUrl
    url
    followers { totalCount }
    following { totalCount }
    repositories(first: 100, isFork: false, ownerAffiliations: OWNER, orderBy: { field: STARGAZERS, direction: DESC }) {
      totalCount
      nodes {
        name
        description
        url
        homepageUrl
        stargazerCount
        forkCount
        isArchived
        updatedAt
        primaryLanguage { name color }
        repositoryTopics(first: 8) { nodes { topic { name } } }
      }
    }
    pinnedItems(first: 6, types: REPOSITORY) {
      nodes {
        ... on Repository {
          name
          description
          url
          stargazerCount
          forkCount
          primaryLanguage { name color }
        }
      }
    }
  }
}`;

type Lang = { name: string; color: string | null } | null;
interface RepoNode {
  name: string;
  description: string | null;
  url: string;
  homepageUrl: string | null;
  stargazerCount: number;
  forkCount: number;
  isArchived: boolean;
  updatedAt: string;
  primaryLanguage: Lang;
  repositoryTopics: { nodes: { topic: { name: string } }[] };
}

export interface GithubData {
  profile: {
    login: string;
    name: string | null;
    bio: string | null;
    avatarUrl: string;
    location: string | null;
    company: string | null;
    websiteUrl: string | null;
    url: string;
    followers: number;
    following: number;
    publicRepos: number;
  };
  pinned: Array<{
    name: string;
    description: string | null;
    url: string;
    stars: number;
    forks: number;
    language: string | null;
  }>;
  topRepos: Array<{
    name: string;
    description: string | null;
    url: string;
    homepage: string | null;
    stars: number;
    forks: number;
    language: string | null;
    topics: string[];
    updatedAt: string;
  }>;
  languages: Record<string, number>; // language -> repo count
  totals: { repos: number; stars: number };
}

let cache: { data: GithubData; at: number } | null = null;

export function isGithubConfigured(): boolean {
  return Boolean(env.GITHUB_TOKEN && env.GITHUB_USERNAME);
}

export async function getGithubData(force = false): Promise<GithubData> {
  if (!force && cache && Date.now() - cache.at < CACHE_TTL_MS) return cache.data;
  if (!env.GITHUB_TOKEN || !env.GITHUB_USERNAME) {
    throw new Error('GitHub integration not configured');
  }

  const res = await fetch(GITHUB_GRAPHQL, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${env.GITHUB_TOKEN}`,
      'Content-Type': 'application/json',
      'User-Agent': 'prajwalraj-portfolio',
    },
    body: JSON.stringify({ query: QUERY, variables: { login: env.GITHUB_USERNAME } }),
  });

  const json = (await res.json()) as {
    data?: { user: GithubUser | null };
    errors?: unknown;
  };

  if (json.errors || !json.data?.user) {
    throw new Error(`GitHub GraphQL error: ${JSON.stringify(json.errors ?? 'no user')}`);
  }

  const u = json.data.user;
  const repos = u.repositories.nodes.filter((r) => !r.isArchived);

  const languages: Record<string, number> = {};
  for (const r of repos) {
    if (r.primaryLanguage) {
      languages[r.primaryLanguage.name] = (languages[r.primaryLanguage.name] ?? 0) + 1;
    }
  }

  const data: GithubData = {
    profile: {
      login: u.login,
      name: u.name,
      bio: u.bio,
      avatarUrl: u.avatarUrl,
      location: u.location,
      company: u.company,
      websiteUrl: u.websiteUrl,
      url: u.url,
      followers: u.followers.totalCount,
      following: u.following.totalCount,
      publicRepos: u.repositories.totalCount,
    },
    pinned: u.pinnedItems.nodes.map((r) => ({
      name: r.name,
      description: r.description,
      url: r.url,
      stars: r.stargazerCount,
      forks: r.forkCount,
      language: r.primaryLanguage?.name ?? null,
    })),
    topRepos: repos.slice(0, 12).map((r) => ({
      name: r.name,
      description: r.description,
      url: r.url,
      homepage: r.homepageUrl,
      stars: r.stargazerCount,
      forks: r.forkCount,
      language: r.primaryLanguage?.name ?? null,
      topics: r.repositoryTopics.nodes.map((t) => t.topic.name),
      updatedAt: r.updatedAt,
    })),
    languages,
    totals: {
      repos: repos.length,
      stars: repos.reduce((sum, r) => sum + r.stargazerCount, 0),
    },
  };

  cache = { data, at: Date.now() };
  return data;
}

interface GithubUser {
  login: string;
  name: string | null;
  bio: string | null;
  avatarUrl: string;
  location: string | null;
  company: string | null;
  websiteUrl: string | null;
  url: string;
  followers: { totalCount: number };
  following: { totalCount: number };
  repositories: { totalCount: number; nodes: RepoNode[] };
  pinnedItems: {
    nodes: Array<{
      name: string;
      description: string | null;
      url: string;
      stargazerCount: number;
      forkCount: number;
      primaryLanguage: Lang;
    }>;
  };
}

export interface DetectedRepo {
  owner: string;
  repo: string;
  defaultBranch: string;
  visibility: "Público" | "Privado";
  languages: { name: string; color: string }[];
  testFramework: string;
  stars: string;
}

const langPools: { name: string; color: string }[][] = [
  [
    { name: "TypeScript", color: "#3178c6" },
    { name: "Python", color: "#3572A5" },
    { name: "CSS", color: "#563d7c" },
  ],
  [
    { name: "Python", color: "#3572A5" },
    { name: "Go", color: "#00ADD8" },
    { name: "Dockerfile", color: "#384d54" },
  ],
  [
    { name: "C#", color: "#178600" },
    { name: "TypeScript", color: "#3178c6" },
    { name: "SQL", color: "#e38c00" },
  ],
  [
    { name: "JavaScript", color: "#f1e05a" },
    { name: "TypeScript", color: "#3178c6" },
    { name: "Shell", color: "#89e051" },
  ],
];

const frameworks = ["pytest", "Vitest", "Jest", "xUnit", "Cypress", "Playwright"];

function hash(s: string) {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return h;
}

/** Metadados "detectados" — simulados de forma estável a partir do nome do repo. */
export function detectRepo(owner: string, repo: string): DetectedRepo {
  const h = hash(`${owner}/${repo}`);
  const stars = h % 3 === 0 ? `${(h % 900) + 100}` : `${((h % 40) + 5) / 10}k`.replace(".0k", "k");
  return {
    owner,
    repo,
    defaultBranch: h % 4 === 0 ? "develop" : "main",
    visibility: h % 2 === 0 ? "Privado" : "Público",
    languages: langPools[h % langPools.length],
    testFramework: frameworks[h % frameworks.length],
    stars,
  };
}

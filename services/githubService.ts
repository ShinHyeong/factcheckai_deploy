
import { GoogleGenAI } from "@google/genai";

interface GithubFile {
  path: string;
  type: 'blob' | 'tree';
  url: string;
}

export interface RepoContext {
  structure: string;
  fileContents: string;
  summary: string;
}

// Helper to extract owner/repo from URL
const parseGithubUrl = (url: string): { owner: string; repo: string } | null => {
  try {
    const match = url.match(/github\.com\/([^\/]+)\/([^\/]+)/);
    if (match) {
      return { owner: match[1], repo: match[2].replace('.git', '') };
    }
    return null;
  } catch (e) {
    return null;
  }
};

// Helper to score file importance for fetching context
const scoreFileImportance = (path: string): number => {
  const lower = path.toLowerCase();
  if (lower.includes('readme.md')) return 100;
  if (lower.includes('package.json') || lower.includes('pom.xml') || lower.includes('requirements.txt')) return 90;
  if (lower.includes('docker') || lower.includes('k8s') || lower.includes('helm')) return 85;
  if (lower.includes('config') || lower.includes('settings') || lower.includes('application.y')) return 80; // Configs are key for checking "setup vs usage"
  if (lower.includes('controller') || lower.includes('service') || lower.includes('api')) return 70;
  if (lower.endsWith('.ts') || lower.endsWith('.js') || lower.endsWith('.java') || lower.endsWith('.py') || lower.endsWith('.go')) return 50;
  if (lower.includes('test') || lower.includes('spec')) return 20;
  if (lower.endsWith('.lock') || lower.endsWith('.png') || lower.endsWith('.jpg')) return 0;
  return 10;
};

export const fetchRepoData = async (url: string, token?: string): Promise<RepoContext> => {
  const repoInfo = parseGithubUrl(url);
  if (!repoInfo) {
    throw new Error("유효하지 않은 GitHub URL입니다.");
  }

  const { owner, repo } = repoInfo;
  
  const headers: HeadersInit = {
    'Accept': 'application/vnd.github.v3+json',
  };

  if (token && token.trim().length > 0) {
    headers['Authorization'] = `token ${token}`;
  }

  try {
    // 1. Get Default Branch
    const metaResponse = await fetch(`https://api.github.com/repos/${owner}/${repo}`, { headers });
    if (!metaResponse.ok) {
        if(metaResponse.status === 403 || metaResponse.status === 429) {
             throw new Error("GitHub API 요청 제한을 초과했습니다. 입력창 하단의 'GitHub Token'을 입력하면 제한이 해제됩니다.");
        }
        if(metaResponse.status === 404) {
             throw new Error("레포지토리를 찾을 수 없습니다. URL을 확인하거나 Private 레포지토리인지 확인해주세요.");
        }
        throw new Error(`GitHub API Error: ${metaResponse.statusText}`);
    }
    const meta = await metaResponse.json();
    const defaultBranch = meta.default_branch || 'main';

    // 2. Get File Tree (Recursive)
    // Note: Using recursive=1 to get full structure for "Architecture" analysis
    const treeResponse = await fetch(`https://api.github.com/repos/${owner}/${repo}/git/trees/${defaultBranch}?recursive=1`, { headers });
    if (!treeResponse.ok) {
        if(treeResponse.status === 403) throw new Error("GitHub API 요청 제한을 초과했습니다. Token을 입력해주세요.");
        throw new Error("파일 구조를 가져오는데 실패했습니다.");
    }
    
    const treeData = await treeResponse.json();
    
    if (treeData.truncated) {
        console.warn("File tree truncated by GitHub API");
    }

    const files: GithubFile[] = treeData.tree;

    // Generate Tree Structure String
    // Limit tree size for context window if repo is huge
    const structure = files
      .filter(f => f.type === 'blob')
      .map(f => f.path)
      .slice(0, 500) // Limit to top 500 files to avoid overflowing
      .join('\n');

    // 3. Select Top Files to Fetch Content
    const sortedFiles = files
      .filter(f => f.type === 'blob' && f.url)
      .map(f => ({ ...f, score: scoreFileImportance(f.path) }))
      .sort((a, b) => b.score - a.score)
      .slice(0, 6); // Fetch top 6 most important files

    // 4. Fetch Content
    const contentPromises = sortedFiles.map(async (file) => {
      try {
        const res = await fetch(file.url, { headers });
        const data = await res.json();
        // GitHub API blob content is base64 encoded
        // Handle potential encoding issues or empty content
        if (!data.content) return `\n--- EMPTY FILE: ${file.path} ---`;
        
        const content = atob(data.content.replace(/\n/g, ''));
        return `\n--- START OF FILE: ${file.path} ---\n${content.substring(0, 8000)}\n--- END OF FILE ---`; // Truncate huge files
      } catch (e) {
        return `\n--- ERROR FETCHING: ${file.path} ---`;
      }
    });

    const contents = await Promise.all(contentPromises);

    return {
      structure: `Directory Structure (Root: ${owner}/${repo}):\n${structure}`,
      fileContents: contents.join('\n'),
      summary: `${files.length} files found. Analyzed ${contents.length} key files deeply.`
    };

  } catch (error: any) {
    console.error("GitHub Fetch Error:", error);
    throw error; // Re-throw to be handled by UI
  }
};

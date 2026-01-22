import os from 'os';
import path from 'path';
import fs from 'fs-extra';

/**
 * 获取 Claude 配置目录路径
 */
export function getClaudeDir() {
  return path.join(os.homedir(), '.claude');
}

/**
 * 获取 AI MAX 官方文件目录（更新时会覆盖）
 */
export function getAimaxDir() {
  return path.join(getClaudeDir(), 'aimax');
}

/**
 * 获取用户自定义目录（永不覆盖）
 */
export function getCustomDir() {
  return path.join(getClaudeDir(), 'custom');
}

/**
 * 获取版本文件路径
 */
export function getVersionFilePath() {
  return path.join(getClaudeDir(), '.aimax-version');
}

/**
 * 获取已安装的版本信息
 */
export async function getInstalledVersion() {
  const versionFile = getVersionFilePath();
  try {
    if (await fs.pathExists(versionFile)) {
      const content = await fs.readFile(versionFile, 'utf-8');
      return JSON.parse(content);
    }
  } catch {
    // 忽略错误
  }
  return null;
}

/**
 * 保存已安装版本信息
 */
export async function saveInstalledVersion(version, components) {
  const versionFile = getVersionFilePath();
  await fs.writeJson(versionFile, {
    version,
    components,
    installedAt: new Date().toISOString()
  }, { spaces: 2 });
}

/**
 * 获取包版本
 */
export function getPackageVersion() {
  const pkgPath = new URL('../package.json', import.meta.url);
  const pkg = fs.readJsonSync(pkgPath);
  return pkg.version;
}

/**
 * 组件定义
 */
export const COMPONENTS = {
  agents: {
    name: 'Agents（代理）',
    description: '专用子代理（planner, architect, tdd-guide 等）',
    source: 'agents',
    target: 'agents',
    pattern: '*.md'
  },
  rules: {
    name: 'Rules（规则）',
    description: '必须遵循的准则（security, testing, coding-style 等）',
    source: 'rules',
    target: 'rules',
    pattern: '*.md'
  },
  commands: {
    name: 'aimax 斜杠指令',
    description: '斜杠命令（/aimax:plan, /aimax:tdd, /aimax:code-review 等）',
    source: 'commands',
    target: 'commands/aimax',
    pattern: '*.md'
  },
  skills: {
    name: 'Skills（技能）',
    description: '工作流定义和领域知识',
    source: 'skills',
    target: 'skills',
    pattern: '**/*',
    recursive: true
  }
};

/**
 * 获取源目录（包安装的位置）
 */
export function getSourceDir() {
  return new URL('..', import.meta.url).pathname;
}

/**
 * 默认端口号
 */
export const DEFAULT_PORT = 8099;

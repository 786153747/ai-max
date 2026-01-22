# AI MAX

**Claude Code 增强配置，开箱即用。**

本仓库包含生产级 agents（代理）、skills（技能）、hooks（钩子）、commands（命令）、rules（规则）和 MCP 配置，帮助你快速提升 Claude Code 的使用体验。

---

## 仓库内容

```
aimax/
|-- agents/           # 用于任务委派的专用子代理
|   |-- planner.md           # 功能实现规划
|   |-- architect.md         # 系统设计决策
|   |-- tdd-guide.md         # 测试驱动开发
|   |-- code-reviewer.md     # 质量和安全审查
|   |-- security-reviewer.md # 漏洞分析
|   |-- build-error-resolver.md
|   |-- e2e-runner.md        # Playwright E2E 测试
|   |-- refactor-cleaner.md  # 死代码清理
|   |-- doc-updater.md       # 文档同步
|
|-- skills/           # 工作流定义和领域知识
|   |-- coding-standards.md         # 编程语言最佳实践
|   |-- backend-patterns.md         # API、数据库、缓存模式
|   |-- frontend-patterns.md        # React、Next.js 模式
|   |-- project-guidelines-example.md # 项目特定技能示例
|   |-- tdd-workflow/               # TDD 方法论
|   |-- security-review/            # 安全检查清单
|   |-- clickhouse-io.md            # ClickHouse 分析
|
|-- commands/         # 用于快速执行的斜杠命令
|   |-- tdd.md              # /tdd - 测试驱动开发
|   |-- plan.md             # /plan - 实现规划
|   |-- e2e.md              # /e2e - E2E 测试生成
|   |-- code-review.md      # /code-review - 质量审查
|   |-- build-fix.md        # /build-fix - 修复构建错误
|   |-- refactor-clean.md   # /refactor-clean - 死代码移除
|   |-- test-coverage.md    # /test-coverage - 覆盖率分析
|   |-- update-codemaps.md  # /update-codemaps - 刷新文档
|   |-- update-docs.md      # /update-docs - 同步文档
|
|-- rules/            # 必须遵循的准则
|   |-- security.md         # 强制性安全检查
|   |-- coding-style.md     # 不可变性、文件组织
|   |-- testing.md          # TDD、80% 覆盖率要求
|   |-- git-workflow.md     # 提交格式、PR 流程
|   |-- agents.md           # 何时委派给子代理
|   |-- performance.md      # 模型选择、上下文管理
|   |-- patterns.md         # API 响应格式、hooks
|   |-- hooks.md            # Hook 文档
|
|-- hooks/            # 基于触发器的自动化
|   |-- hooks.json          # PreToolUse、PostToolUse、Stop hooks
|
|-- mcp-configs/      # MCP 服务器配置
|   |-- mcp-servers.json    # GitHub、Supabase、Vercel、Railway 等
|
|-- plugins/          # 插件生态系统文档
|   |-- README.md           # 插件、市场、技能指南
|
|-- examples/         # 示例配置
    |-- CLAUDE.md           # 项目级配置示例
    |-- user-CLAUDE.md      # 用户级配置示例 (~/.claude/CLAUDE.md)
    |-- statusline.json     # 自定义状态栏配置
```

---

## 快速开始

```bash
# 全局安装
npm install -g aimax

# 然后直接使用
aimax                    # 交互式安装
aimax install --all      # 安装全部组件
aimax update             # 更新到最新版本
aimax uninstall          # 卸载
```

或者使用 npx 临时运行（无需安装）：
```bash
npx aimax
npx aimax install --all
```

CLI 提供交互式界面，让你选择要安装的组件：
- **Agents** - 专用子代理（planner, architect, tdd-guide 等）
- **Rules** - 必须遵循的准则（security, testing, coding-style 等）
- **Commands** - 斜杠命令（/plan, /tdd, /code-review 等）
- **Skills** - 工作流定义和领域知识

---

## 核心概念

### Agents（代理）

子代理以有限的范围处理委派的任务。示例：

```markdown
---
name: code-reviewer
description: 审查代码的质量、安全性和可维护性
tools: Read, Grep, Glob, Bash
model: opus
---

你是一位资深代码审查员...
```

### Skills（技能）

技能是由命令或代理调用的工作流定义：

```markdown
# TDD 工作流

1. 首先定义接口
2. 编写失败的测试（红灯）
3. 实现最少代码（绿灯）
4. 重构（改进）
5. 验证 80%+ 覆盖率
```

### Hooks（钩子）

Hooks 在工具事件时触发。示例 - 警告 console.log：

```json
{
  "matcher": "tool == \"Edit\" && tool_input.file_path matches \"\\\\.(ts|tsx|js|jsx)$\"",
  "hooks": [{
    "type": "command",
    "command": "#!/bin/bash\ngrep -n 'console\\.log' \"$file_path\" && echo '[Hook] Remove console.log' >&2"
  }]
}
```

### Rules（规则）

规则是必须始终遵循的准则。保持模块化：

```
~/.claude/rules/
  security.md      # 禁止硬编码密钥
  coding-style.md  # 不可变性、文件限制
  testing.md       # TDD、覆盖率要求
```

---

## 重要说明

### 上下文窗口管理

**关键：** 不要同时启用所有 MCP。启用太多工具可能会使你的 200k 上下文窗口缩小到 70k。

经验法则：
- 配置 20-30 个 MCP
- 每个项目启用不超过 10 个
- 活动工具不超过 80 个

在项目配置中使用 `disabledMcpServers` 禁用未使用的工具。

### 定制化

这些配置适合我的工作流程。你应该：
1. 从与你产生共鸣的内容开始
2. 根据你的技术栈修改
3. 移除你不使用的内容
4. 添加你自己的模式

---

## 许可证

MIT - 自由使用，按需修改，如果可以请回馈贡献。

---

**如果有帮助请给这个仓库点星。阅读指南。构建伟大的东西。**

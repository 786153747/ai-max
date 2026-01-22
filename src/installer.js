import path from 'path';
import fs from 'fs-extra';
import ora from 'ora';
import chalk from 'chalk';
import { getClaudeDir, getSourceDir, COMPONENTS, saveInstalledVersion, getPackageVersion } from './utils.js';

/**
 * 安装选中的组件
 */
export async function install(selectedComponents, options = {}) {
  const claudeDir = getClaudeDir();
  const sourceDir = getSourceDir();
  const { backup = true, force = false } = options;

  const spinner = ora('正在准备安装...').start();

  try {
    // 确保 claude 目录存在
    await fs.ensureDir(claudeDir);

    const installedFiles = [];
    const skippedFiles = [];

    for (const componentKey of selectedComponents) {
      const component = COMPONENTS[componentKey];
      if (!component) continue;

      spinner.text = `正在安装 ${component.name}...`;

      const sourcePath = path.join(sourceDir, component.source);
      const targetPath = path.join(claudeDir, component.target);

      // 确保目标目录存在
      await fs.ensureDir(targetPath);

      if (component.recursive) {
        // 递归复制整个目录
        const files = await copyRecursive(sourcePath, targetPath, { backup, force });
        installedFiles.push(...files.installed);
        skippedFiles.push(...files.skipped);
      } else {
        // 只复制匹配的文件
        const files = await fs.readdir(sourcePath);
        for (const file of files) {
          if (!file.endsWith('.md')) continue;

          const srcFile = path.join(sourcePath, file);
          const destFile = path.join(targetPath, file);

          const stats = await fs.stat(srcFile);
          if (!stats.isFile()) continue;

          const exists = await fs.pathExists(destFile);
          if (exists && !force) {
            if (backup) {
              await fs.copy(destFile, `${destFile}.backup`);
            }
          }

          await fs.copy(srcFile, destFile);
          installedFiles.push(destFile);
        }
      }
    }

    // 保存版本信息
    await saveInstalledVersion(getPackageVersion(), selectedComponents);

    spinner.succeed(chalk.green('安装完成！'));

    console.log('');
    console.log(chalk.cyan('已安装文件：'));
    console.log(chalk.gray(`  安装目录：${getClaudeDir()}`));
    console.log(chalk.gray(`  文件数量：${installedFiles.length}`));
    console.log('');

    if (skippedFiles.length > 0) {
      console.log(chalk.yellow(`  已跳过：${skippedFiles.length}`));
    }

    return { installedFiles, skippedFiles };

  } catch (error) {
    spinner.fail(chalk.red('安装失败'));
    throw error;
  }
}

/**
 * 递归复制文件
 */
async function copyRecursive(src, dest, options = {}) {
  const { backup = true, force = false } = options;
  const installed = [];
  const skipped = [];

  const items = await fs.readdir(src);

  for (const item of items) {
    const srcPath = path.join(src, item);
    const destPath = path.join(dest, item);
    const stats = await fs.stat(srcPath);

    if (stats.isDirectory()) {
      await fs.ensureDir(destPath);
      const subResult = await copyRecursive(srcPath, destPath, options);
      installed.push(...subResult.installed);
      skipped.push(...subResult.skipped);
    } else {
      const exists = await fs.pathExists(destPath);
      if (exists && !force) {
        if (backup) {
          await fs.copy(destPath, `${destPath}.backup`);
        }
      }
      await fs.copy(srcPath, destPath);
      installed.push(destPath);
    }
  }

  return { installed, skipped };
}

/**
 * 卸载组件
 */
export async function uninstall(selectedComponents) {
  const claudeDir = getClaudeDir();
  const spinner = ora('正在移除文件...').start();

  try {
    const removedFiles = [];

    for (const componentKey of selectedComponents) {
      const component = COMPONENTS[componentKey];
      if (!component) continue;

      spinner.text = `正在移除 ${component.name}...`;

      const targetPath = path.join(claudeDir, component.target);

      if (await fs.pathExists(targetPath)) {
        // 对于 commands，移除 aimax 子目录
        if (componentKey === 'commands') {
          await fs.remove(targetPath);
          removedFiles.push(targetPath);
        } else {
          // 移除单个文件但保留目录
          const files = await fs.readdir(targetPath);
          for (const file of files) {
            const filePath = path.join(targetPath, file);
            await fs.remove(filePath);
            removedFiles.push(filePath);
          }
        }
      }
    }

    // 移除版本文件
    const versionFile = path.join(claudeDir, '.aimax-version');
    if (await fs.pathExists(versionFile)) {
      await fs.remove(versionFile);
    }

    spinner.succeed(chalk.green('卸载完成！'));
    console.log(chalk.gray(`  已移除：${removedFiles.length} 个项目`));

    return removedFiles;

  } catch (error) {
    spinner.fail(chalk.red('卸载失败'));
    throw error;
  }
}

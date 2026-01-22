import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import os from 'os';
import path from 'path';
import fs from 'fs-extra';
import {
  getClaudeDir,
  getAimaxDir,
  getCustomDir,
  getVersionFilePath,
  getInstalledVersion,
  saveInstalledVersion,
  getPackageVersion,
  COMPONENTS,
  DEFAULT_PORT
} from '../src/utils.js';

describe('utils.js', () => {
  describe('getClaudeDir', () => {
    it('should return path to .claude directory in home folder', () => {
      const result = getClaudeDir();
      const expected = path.join(os.homedir(), '.claude');
      expect(result).toBe(expected);
    });
  });

  describe('getAimaxDir', () => {
    it('should return path to aimax directory inside .claude', () => {
      const result = getAimaxDir();
      const expected = path.join(os.homedir(), '.claude', 'aimax');
      expect(result).toBe(expected);
    });
  });

  describe('getCustomDir', () => {
    it('should return path to custom directory inside .claude', () => {
      const result = getCustomDir();
      const expected = path.join(os.homedir(), '.claude', 'custom');
      expect(result).toBe(expected);
    });
  });

  describe('getVersionFilePath', () => {
    it('should return path to .aimax-version file', () => {
      const result = getVersionFilePath();
      const expected = path.join(os.homedir(), '.claude', '.aimax-version');
      expect(result).toBe(expected);
    });
  });

  describe('getPackageVersion', () => {
    it('should return version string from package.json', () => {
      const result = getPackageVersion();
      expect(result).toBe('0.0.1');
    });
  });

  describe('COMPONENTS', () => {
    it('should have agents component with correct structure', () => {
      expect(COMPONENTS.agents).toMatchObject({
        name: 'Agents（代理）',
        source: 'agents',
        target: 'agents',
        pattern: '*.md'
      });
    });

    it('should have rules component with correct structure', () => {
      expect(COMPONENTS.rules).toMatchObject({
        name: 'Rules（规则）',
        source: 'rules',
        target: 'rules',
        pattern: '*.md'
      });
    });

    it('should have commands component with correct structure', () => {
      expect(COMPONENTS.commands).toMatchObject({
        name: 'aimax 斜杠指令',
        source: 'commands',
        target: 'commands/aimax',
        pattern: '*.md'
      });
    });

    it('should have skills component with correct structure', () => {
      expect(COMPONENTS.skills).toMatchObject({
        name: 'Skills（技能）',
        source: 'skills',
        target: 'skills',
        pattern: '**/*',
        recursive: true
      });
    });

    it('should have exactly 4 components', () => {
      expect(Object.keys(COMPONENTS)).toHaveLength(4);
    });
  });

  describe('DEFAULT_PORT', () => {
    it('should be 8099', () => {
      expect(DEFAULT_PORT).toBe(8099);
    });
  });

  describe('getInstalledVersion', () => {
    const testVersionFile = path.join(os.tmpdir(), '.aimax-test-version');

    beforeEach(async () => {
      // Mock getVersionFilePath temporarily
      vi.spyOn(fs, 'pathExists').mockImplementation(async (p) => {
        if (p.includes('.aimax-version')) {
          return fs.pathExists(testVersionFile);
        }
        return fs.pathExists(p);
      });
    });

    afterEach(async () => {
      vi.restoreAllMocks();
      await fs.remove(testVersionFile);
    });

    it('should return null if version file does not exist', async () => {
      vi.spyOn(fs, 'pathExists').mockResolvedValue(false);
      const result = await getInstalledVersion();
      expect(result).toBeNull();
    });

    it('should return version info if file exists', async () => {
      const versionInfo = {
        version: '1.0.0',
        components: ['agents', 'rules'],
        installedAt: '2024-01-01T00:00:00.000Z'
      };

      vi.spyOn(fs, 'pathExists').mockResolvedValue(true);
      vi.spyOn(fs, 'readFile').mockResolvedValue(JSON.stringify(versionInfo));

      const result = await getInstalledVersion();
      expect(result).toEqual(versionInfo);
    });

    it('should return null on parse error', async () => {
      vi.spyOn(fs, 'pathExists').mockResolvedValue(true);
      vi.spyOn(fs, 'readFile').mockResolvedValue('invalid json');

      const result = await getInstalledVersion();
      expect(result).toBeNull();
    });
  });

  describe('saveInstalledVersion', () => {
    afterEach(() => {
      vi.restoreAllMocks();
    });

    it('should save version info to file', async () => {
      const writeJsonMock = vi.spyOn(fs, 'writeJson').mockResolvedValue();

      await saveInstalledVersion('1.0.0', ['agents', 'rules']);

      expect(writeJsonMock).toHaveBeenCalledWith(
        expect.stringContaining('.aimax-version'),
        expect.objectContaining({
          version: '1.0.0',
          components: ['agents', 'rules'],
          installedAt: expect.any(String)
        }),
        { spaces: 2 }
      );
    });
  });
});

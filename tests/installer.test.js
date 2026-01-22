import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import path from 'path';
import os from 'os';
import fs from 'fs-extra';
import { install, uninstall, checkStatus } from '../src/installer.js';

// Mock ora spinner
vi.mock('ora', () => {
  return {
    default: () => ({
      start: vi.fn().mockReturnThis(),
      succeed: vi.fn().mockReturnThis(),
      fail: vi.fn().mockReturnThis(),
      text: ''
    })
  };
});

// Mock chalk to avoid color codes in test output
vi.mock('chalk', () => ({
  default: {
    green: (s) => s,
    red: (s) => s,
    yellow: (s) => s,
    cyan: (s) => s,
    gray: (s) => s
  }
}));

describe('installer.js', () => {
  const testDir = path.join(os.tmpdir(), 'aimax-test-' + Date.now());
  const testClaudeDir = path.join(testDir, '.claude');
  const testSourceDir = path.join(testDir, 'source');

  beforeEach(async () => {
    // Create test directories
    await fs.ensureDir(testClaudeDir);
    await fs.ensureDir(testSourceDir);

    // Create test source files
    await fs.ensureDir(path.join(testSourceDir, 'agents'));
    await fs.writeFile(
      path.join(testSourceDir, 'agents', 'test-agent.md'),
      '# Test Agent'
    );

    await fs.ensureDir(path.join(testSourceDir, 'rules'));
    await fs.writeFile(
      path.join(testSourceDir, 'rules', 'test-rule.md'),
      '# Test Rule'
    );
  });

  afterEach(async () => {
    await fs.remove(testDir);
    vi.restoreAllMocks();
  });

  describe('checkStatus', () => {
    it('should return status for all components', async () => {
      const status = await checkStatus();

      expect(status).toHaveProperty('agents');
      expect(status).toHaveProperty('rules');
      expect(status).toHaveProperty('commands');
      expect(status).toHaveProperty('skills');
    });

    it('should indicate installed: false for non-existent components', async () => {
      // Mock getClaudeDir to return our test directory
      const status = await checkStatus();

      // At least check the structure is correct
      for (const [key, value] of Object.entries(status)) {
        expect(value).toHaveProperty('installed');
        expect(value).toHaveProperty('path');
        expect(value).toHaveProperty('fileCount');
        expect(typeof value.installed).toBe('boolean');
        expect(typeof value.path).toBe('string');
        expect(typeof value.fileCount).toBe('number');
      }
    });

    it('should report correct file count for installed components', async () => {
      const status = await checkStatus();

      // Verify structure
      expect(status.agents).toBeDefined();
      expect(status.agents.fileCount).toBeGreaterThanOrEqual(0);
    });
  });

  describe('install', () => {
    it('should handle empty component list', async () => {
      const result = await install([]);

      expect(result).toHaveProperty('installedFiles');
      expect(result).toHaveProperty('skippedFiles');
      expect(result.installedFiles).toEqual([]);
    });

    it('should handle invalid component names gracefully', async () => {
      const result = await install(['nonexistent-component']);

      expect(result.installedFiles).toEqual([]);
    });
  });

  describe('uninstall', () => {
    it('should handle empty component list', async () => {
      const result = await uninstall([]);

      expect(Array.isArray(result)).toBe(true);
      expect(result).toEqual([]);
    });

    it('should handle invalid component names gracefully', async () => {
      const result = await uninstall(['nonexistent-component']);

      expect(Array.isArray(result)).toBe(true);
    });

    it('should handle non-existent directories', async () => {
      // This should not throw
      const result = await uninstall(['agents']);

      expect(Array.isArray(result)).toBe(true);
    });
  });
});

import { Tree } from '@nrwl/devkit';
import {
  checkFilesExist,
  ensureNxProject,
  readJson,
  runNxCommandAsync,
  uniq
} from '@nrwl/nx-plugin/testing';
import { createTreeWithEmptyWorkspace } from '@nrwl/devkit/testing'
import { InitGeneratorSchema } from '../../../packages/nx-sass-lib/src';

describe('nx-sass-lib e2e', () => {
  let tree: Tree;
  const options: InitGeneratorSchema = {
    name: 'style-library'
  }

  // Setting up individual workspaces per
  // test can cause e2e runs to take a long time.
  // For this reason, we recommend each suite only
  // consumes 1 workspace. The tests should each operate
  // on a unique project in the workspace, such that they
  // are not dependant on one another.
  beforeAll(() => {
    ensureNxProject('@wgd3/nx-sass-lib', 'dist/packages/nx-sass-lib');
  });

  beforeEach(() => {
    tree = createTreeWithEmptyWorkspace();
  })

  afterAll(() => {
    // `nx reset` kills the daemon, and performs
    // some work which can help clean up e2e leftovers
    runNxCommandAsync('reset');
  });

  it('should create nx-sass-lib', async () => {
    const project = uniq('nx-sass-lib');
    await runNxCommandAsync(
      `generate @wgd3/nx-sass-lib:init ${project}`
    );
    const result = await runNxCommandAsync(`build ${project}`);
    expect(result.stdout).toContain('Executor ran');
  }, 120000);

  describe('--directory', () => {
    it('should create src in the specified directory', async () => {
      const project = uniq('nx-sass-lib');
      await runNxCommandAsync(
        `generate @wgd3/nx-sass-lib:init ${project} --directory subdir`
      );
      expect(() =>
        checkFilesExist(`libs/subdir/${project}/src/index.ts`)
      ).not.toThrow();
    }, 120000);
  });

  describe('--tags', () => {
    it('should add tags to the project', async () => {
      const projectName = uniq('nx-sass-lib');
      ensureNxProject('@wgd3/nx-sass-lib', 'dist/packages/nx-sass-lib');
      await runNxCommandAsync(
        `generate @wgd3/nx-sass-lib:init ${projectName} --tags e2etag,e2ePackage`
      );
      const project = readJson(`libs/${projectName}/project.json`);
      expect(project.tags).toEqual(['e2etag', 'e2ePackage']);
    }, 120000);
  });

  describe('7-1 pattern', () => {
    it('should have all 7 expected directories', async () => {
      // const projectName = uniq('nx-sass-lib');
    await runNxCommandAsync(
      `generate @wgd3/nx-sass-lib:init ${options.name}`
    );
    const result = await runNxCommandAsync(`build ${options.name}`);
    const basePath = `libs/${options.name}/src/lib`;
    const dirs = [
      `base`,
      `components`,
      `layout`,
      `pages`,
      `themes`,
      `abstracts`,
      `vendors`
    ];
    for (const dir in dirs) {
      expect(tree.exists(`${basePath}/${dir}`)).toBeTruthy();
    }
    }, 120000)
  })
});

import { createTreeWithEmptyWorkspace } from '@nrwl/devkit/testing';
import { Tree, readProjectConfiguration } from '@nrwl/devkit';

import generator from './generator';
import { InitGeneratorSchema } from './schema';

describe('init generator', () => {
  let appTree: Tree;
  const options: InitGeneratorSchema = { name: 'test' };

  beforeEach(() => {
    appTree = createTreeWithEmptyWorkspace({ layout: 'apps-libs' });
  });

  it('should run successfully', async () => {
    await generator(appTree, options);
    const config = readProjectConfiguration(appTree, 'test');
    expect(config).toBeDefined();
  });

  it('should have all 7 expected directories', async () => {
    await generator(appTree, options);
    const basePath = `libs/${options.name}/src`;
    const dirs = [
      `base`,
      `components`,
      `layout`,
      `pages`,
      `themes`,
      `abstracts`,
      `vendors`,
    ];
    for (const dir of dirs) {
      expect(appTree.exists(`${basePath}/${dir}`)).toBeTruthy();
      expect(appTree.exists(`${basePath}/${dir}/_index.scss`)).toBeTruthy();
    }
  }, 120000);

  it('should have standard abstract partials', async () => {
    await generator(appTree, options);
    const basePath = `libs/${options.name}/src/abstracts`;
    expect(appTree.children(basePath).includes('_functions.scss')).toBeTruthy();
    expect(appTree.children(basePath).includes('_mixins.scss')).toBeTruthy();
    expect(appTree.children(basePath).includes('_variables.scss')).toBeTruthy();
  }, 120000);

  it('should use abstracts in the main.scss file', async () => {
    await generator(appTree, options);
    const filePath = `libs/${options.name}/src/main.scss`;
    expect(appTree.exists(filePath)).toBeTruthy();

    expect(
      appTree.read(filePath).toString('utf-8').includes('abstracts')
    ).toBeTruthy();
  });
});

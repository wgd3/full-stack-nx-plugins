import {
  addProjectConfiguration,
  ensurePackage,
  formatFiles,
  generateFiles,
  getWorkspaceLayout,
  names,
  offsetFromRoot,
  ProjectConfiguration,
  readProjectConfiguration,
  TargetConfiguration,
  Tree,
  updateProjectConfiguration,
} from '@nrwl/devkit';
import * as fs from 'fs';
import { NgAddGeneratorSchema } from './schema';

interface NormalizedSchema extends NgAddGeneratorSchema {
  angularProjectConfig: ProjectConfiguration;
  styleProjectConfig: ProjectConfiguration;
}

function normalizeSchema(
  tree: Tree,
  options: NgAddGeneratorSchema
): NormalizedSchema {
  const ngConfig = readProjectConfiguration(tree, options.angularApplication);
  const styleConfig = readProjectConfiguration(tree, options.styleLibrary);

  return {
    ...options,
    angularProjectConfig: ngConfig,
    styleProjectConfig: styleConfig,
  };
}

function updateAppConfig(tree: Tree, options: NormalizedSchema) {
  const styleSourceRoot = options.styleProjectConfig.sourceRoot;
  const ngBuildTarget: TargetConfiguration =
    options.angularProjectConfig.targets?.['build'];
  if (!ngBuildTarget) {
    throw new Error(
      `No build target found for application ${options.angularApplication}`
    );
  }
  const existingOpts = { ...ngBuildTarget.options };

  const updatedConfig = {
    ...options.angularProjectConfig,
    targets: {
      ...options.angularProjectConfig.targets,
      build: {
        ...ngBuildTarget,
        options: {
          ...existingOpts,
          stylePreprocessorOptions: {
            includePaths: [styleSourceRoot],
          },
        },
      },
    },
  };

  updateProjectConfiguration(tree, options.angularApplication, updatedConfig);
}

async function updateMainStyles(tree: Tree, options: NormalizedSchema) {
  const stylesFile = `${options.angularProjectConfig.sourceRoot}/styles.scss`;
  const content = fs.readFileSync(stylesFile).toString().split('\n');
  content.splice(0, 0, `@use 'main';`);
  const newContent = content.join('\n');

  fs.writeFile(stylesFile, newContent, (err) => {
    if (err) return err;
  })
}

export default async function (tree: Tree, options: NgAddGeneratorSchema) {
  const normalizedOptions = normalizeSchema(tree, options);
  updateAppConfig(tree, normalizedOptions);
  updateMainStyles(tree, normalizedOptions);
  await formatFiles(tree);
}

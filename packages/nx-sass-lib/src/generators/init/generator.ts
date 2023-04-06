import {
  addDependenciesToPackageJson,
  addProjectConfiguration,
  ensurePackage,
  formatFiles,
  generateFiles,
  GeneratorCallback,
  getWorkspaceLayout,
  installPackagesTask,
  names,
  offsetFromRoot,
  removeDependenciesFromPackageJson,
  runTasksInSerial,
  Tree,
} from '@nrwl/devkit';
import * as path from 'path';
import { InitGeneratorSchema } from './schema';

interface NormalizedSchema extends InitGeneratorSchema {
  projectName: string;
  projectRoot: string;
  projectDirectory: string;
  parsedTags: string[];
}

function normalizeOptions(
  tree: Tree,
  options: InitGeneratorSchema
): NormalizedSchema {
  const name = names(options.name).fileName;
  const projectDirectory = options.directory
    ? `${names(options.directory).fileName}/${name}`
    : name;
  const projectName = projectDirectory.replace(new RegExp('/', 'g'), '-');
  const projectRoot = `${getWorkspaceLayout(tree).libsDir}/${projectDirectory}`;
  const parsedTags = options.tags
    ? options.tags.split(',').map((s) => s.trim())
    : [];

  return {
    ...options,
    projectName,
    projectRoot,
    projectDirectory,
    parsedTags,
  };
}

function addFiles(tree: Tree, options: NormalizedSchema) {
  const templateOptions = {
    ...options,
    ...names(options.name),
    offsetFromRoot: offsetFromRoot(options.projectRoot),
    template: '',
  };
  generateFiles(
    tree,
    path.join(__dirname, 'files'),
    options.projectRoot,
    templateOptions
  );
}

function updateDependencies(tree: Tree, options: InitGeneratorSchema): GeneratorCallback {
  removeDependenciesFromPackageJson(tree, [], ['nx-stylelint', 'stylelint']);

  const devDeps = {
    "stylelint": "^15.0.0",
    "stylelint-config-standard": "^30.0.0",
    "stylelint-config-standard-scss": "^7.0.0",
  }

  if (options.addNxStylelint) {
    devDeps['nx-stylelint'] = '^15.0.0';
  }

  return addDependenciesToPackageJson(tree, {}, devDeps);
}


export default async function (tree: Tree, options: InitGeneratorSchema) {
  console.log(`Running nx-sass-lib generator...`);
  const tasks: GeneratorCallback[] = [];

  const normalizedOptions = normalizeOptions(tree, options);
  addProjectConfiguration(tree, normalizedOptions.projectName, {
    root: normalizedOptions.projectRoot,
    projectType: 'library',
    sourceRoot: `${normalizedOptions.projectRoot}/src`,
    targets: {
      build: {
        executor: '@wgd3/nx-sass-lib:build',
      },
    },
    tags: normalizedOptions.parsedTags,
  });
  addFiles(tree, normalizedOptions);

  tasks.push(updateDependencies(tree, options));

  if (options.addNxStylelint) {
    console.log(`Adding nx-stylelint!`);
    ensurePackage('stylelint', '^15.0.0');
    ensurePackage('nx-stylelint', '^15.0.0');
    const {
      initGenerator: nxStylelintInitGenerator,
      configurationGenerator: nxStylelintConfigurationGenerator,
      scssGenerator: nxStylelintScssGenerator
    } = await import('nx-stylelint');
    const stylelintInitTask = await nxStylelintInitGenerator(tree, {
      skipFormat: false,
    });
    const stylelintConfigurationTask = (await nxStylelintConfigurationGenerator(
      tree,
      { project: options.name, skipFormat: false }
    )) as GeneratorCallback;
    const stylelintScssTask = await nxStylelintScssGenerator(tree, {project: options.name, skipFormat: false});
    // tasks.push(stylelintInitTask);
    tasks.push(stylelintConfigurationTask);
    tasks.push(stylelintScssTask);
    // tasks.push(addDependenciesToPackageJson(tree, {}, {
    //   'nx-stylelint': '^15.0.0',
    //   'stylelint': '^15.0.0'
    // }));
  }

  await formatFiles(tree);
  return runTasksInSerial(...tasks);
}

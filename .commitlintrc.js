const {
  utils: { getProjects },
} = require('@commitlint/config-nx-scopes');

module.exports = {
  extends: ['@commitlint/config-angular'],
  rules: {
    'scope-enum': async (ctx) => [
      2,
      'always',
      [
        ...(await getProjects(
          ctx,
          ({ name, projectType }) => !name.includes('e2e')
        )),
        'repo',
        'docs',
      ],
    ],
    'type-enum': () => [
      2,
      'always',
      [
        'build',
        'ci',
        'docs',
        'feat',
        'fix',
        'perf',
        'refactor',
        'revert',
        'style',
        'test',
        'chore',
      ],
    ],
  },
};

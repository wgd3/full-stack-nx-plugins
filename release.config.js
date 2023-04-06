module.exports = {
    branches: [
      'main'
    ],
    plugins: [
      [
        '@semantic-release/commit-analyzer',
        {
          preset: 'angular',
          releaseRules: [
            { type: 'docs', release: 'patch' },
            { type: 'refactor', release: 'patch' },
            { type: 'style', release: 'patch' },
            { type: 'ci', release: 'patch' },
          ],
          parserOpts: {
            noteKeywords: ['BREAKING CHANGE', 'BREAKING CHANGES'],
          },
        },
      ],
      [
        '@semantic-release/release-notes-generator',
        {
          preset: 'conventionalcommits',
          parserOpts: {
            noteKeywords: ['BREAKING CHANGE', 'BREAKING CHANGES', 'BREAKING'],
          },
          writerOpts: {
            commitsSort: ['subject', 'scope'],
          },
          presetConfig: {
            types: [
              { type: 'feat', section: 'Features' },
              { type: 'fix', section: 'Bug Fixes' },
              { type: 'chore', hidden: true },
              { type: 'docs', section: 'Documentation' },
              { type: 'style', section: 'Style' },
              { type: 'refactor', section: 'Other' },
              { type: 'perf', hidden: false },
              { type: 'test', hidden: false },
              { type: 'ci', section: 'Other' },
            ],
          },
        },
      ],
      [
        '@semantic-release/changelog',
        {
          changelogFile: 'CHANGELOG.md',
        },
      ],
      [
        "@semantic-release/npm",
        {
          "tarballDir": "dist"
        }
      ],
      [
        "@semantic-release/github",
        {
          "assets": ["dist/*.tgz"]
        }
      ],
      [
        '@semantic-release/git',
        {
          assets: ['package.json', 'yarn.lock', 'CHANGELOG.md'],
        //   message:
        //     'chore(release): ${nextRelease.version}\n\n${nextRelease.notes}',
        },
      ],
    ],
  };
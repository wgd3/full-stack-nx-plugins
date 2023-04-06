import * as jsdoc2md from 'jsdoc-to-markdown';
import * as fs from 'fs';
import * as path from 'path';
import * as glob from 'glob';

interface IJsDocComment {
  description?: string;
  kind?: string | 'function';
  category?: string;
  examples?: string;
}

const FILES = glob.sync('packages/nx-sass-lib/src/**/*.ts');

console.log(`Getting template data...`);

const res: IJsDocComment[] = jsdoc2md.getTemplateDataSync({
  files: FILES,
  configure: 'packages/nx-sass-lib/jsdoc.json',
});

console.log(`got template data, looking up categories...`);

const categories = res.reduce((acc, curr) => {
  const category = curr.category?.toLowerCase();
  console.log(`evaluating category ${category}`);
  if (category) {
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push({ ...curr, category });
  }

  return acc;
}, {});
// console.log(`Categories:\n${JSON.stringify(categories, null, 2)}`);

const outputPath = path.join('docs', 'docs', 'nx-sass-lib');
if (!fs.existsSync(outputPath)) {
  console.log(`Output path ${outputPath} does not exist, creating!`);
  fs.mkdirSync(outputPath);
}

for (const [category, items] of Object.entries(categories)) {
  let md = `---\nslug: /nx-sass-lib/${category.toLowerCase()}\n---\n\n# ${capitalize(
    category
  )}\n\n`;

  md += items
    .sort((funcA, funcB) => sortFunctions(funcA, funcB))
    .map(getDocsSection)
    .join('\n\n---\n\n');

  fs.writeFileSync(path.join(outputPath, `${category.toLowerCase()}.md`), md, {
    encoding: 'utf8',
  });
}

function capitalize(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

function getDocsSection({ name, description, examples }) {
  let section = ``;
  const sperator = `\n\n`;
  const header = `### \`\`\`${name}\`\`\``;
  const sectionText = `${description}`;
  const usageText = `\`\`\`shell\n$ npm i -D @wgd3/nx-sass-lib\n\n${examples.join(
    '\n'
  )}\n\`\`\``;

  section += header;
  section += sperator;
  section += sectionText;
  section += sperator;
  section += usageText;

  return section;
}

function sortFunctions(funcA, funcB) {
  if (funcA.name < funcB.name) {
    return -1;
  }

  if (funcA.name > funcB.name) {
    return 1;
  }

  return 0;
}

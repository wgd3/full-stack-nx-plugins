---
slug: /nx-sass-lib/generators
---

# Generators

### `init`

Creates a style library in an Nx workspace

```shell
$ npm i -D @wgd3/nx-sass-lib

$ nx g @wgd3/nx-sass-lib:init my-style-lib
```

---

### `ng-add`

Integrates a local style library with an Angular application.

The specified application's `project.json` file is updated so that it's build target options include `stylePreprocessorOptions` that point to the style library. It also updates the application's main `styles.scss` file.

```shell
$ npm i -D @wgd3/nx-sass-lib

$ nx g @wgd3/nx-sass-lib:ng-add \
  --angularApplication my-app \
  --styleLibrary my-style-lib
```

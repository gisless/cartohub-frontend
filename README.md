# CartoHub Frontend

DEMO: https://dtehonlcam52.cloudfront.net/

## Features (not implemented)

- CartoHub is not a geo-referencing app, but a map image archive and tile delivery infrastructure
- A geo-referencing app frontend is just attached to the delivery infrastructure
- Cloud-native, with high availability and scalability
- Users can operate via the app interface/API
- Users can upload map images
- Users can geo-reference the map
- Users can fork other users' maps. While MapWarper had a 1:1 ratio between maps and geo-references, allowing forking makes it possible to have a 1:n ratio between maps and geo-references
- Mosaic feature, enables what Hinata GIS did with the gaihozu maps, without relying on such external users
- Geo-reference is just one function. Should we provide plugin-like spatial operations within StepFunctions?
- gazetteer
- image recognition

---

# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react/README.md) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type aware lint rules:

- Configure the top-level `parserOptions` property like this:

```js
   parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
    project: ['./tsconfig.json', './tsconfig.node.json'],
    tsconfigRootDir: __dirname,
   },
```

- Replace `plugin:@typescript-eslint/recommended` to `plugin:@typescript-eslint/recommended-type-checked` or `plugin:@typescript-eslint/strict-type-checked`
- Optionally add `plugin:@typescript-eslint/stylistic-type-checked`
- Install [eslint-plugin-react](https://github.com/jsx-eslint/eslint-plugin-react) and add `plugin:react/recommended` & `plugin:react/jsx-runtime` to the `extends` list

import { terser } from 'rollup-plugin-terser';
import pluginTypescript from '@rollup/plugin-typescript';
import pluginCommonjs from '@rollup/plugin-commonjs';
import pluginNodeResolve from '@rollup/plugin-node-resolve';
import { babel } from '@rollup/plugin-babel';
import * as path from 'path';
import defaultTsConfig from './tsconfig.json';
import multiInput from 'rollup-plugin-multi-input';
import pkg from './package.json';
import postcss from 'rollup-plugin-postcss';
import postcssImport from 'postcss-import';
import autoprefixer from 'autoprefixer';

const moduleName = pkg.name.replace(/^@.*\//, '');
const inputFileName = ['src/**/*.ts', 'src/**/*.tsx'];
const author = pkg.author;

const bundles = {
  es: 'dist/bundle-es',
  cjs: 'dist/bundle-cjs',
  browser: 'dist/scout-bar',
};

const banner = `
  /**
   * @license
   * author: ${author}
   * ${moduleName}.js v${pkg.version}
   * Released under the ${pkg.license} license.
   */
`;

const pluginsSetups = bundle => ({
  external: [
    ...Object.keys(pkg.dependencies || {}),
    ...Object.keys(pkg.devDependencies || {}),
    'react',
    'react-dom',
    'prop-types',
  ],
  plugins: [
    multiInput(),
    postcss({ plugins: [postcssImport(), autoprefixer()], minimize: true }),
    pluginTypescript({
      ...defaultTsConfig.compilerOptions,
      ...{
        declaration: true,
        emitDeclarationOnly: true,
        outDir: `${bundle}`,
        declarationDir: `${bundle}`,
      },
    }),
    babel({
      babelHelpers: 'bundled',
      configFile: path.resolve(__dirname, '.babelrc.js'),
      extensions: ['.js', '.ts', '.tsx'],
    }),

    pluginCommonjs({
      extensions: ['.js', '.ts', '.tsx'],
    }),

    pluginNodeResolve({
      browser: false,
    }),
  ],
});

export default [
  {
    input: inputFileName,
    external: [
      ...Object.keys(pkg.dependencies || {}),
      ...Object.keys(pkg.devDependencies || {}),
      'react',
      'react-dom',
      'prop-types',
    ],
    output: [
      {
        name: moduleName,
        dir: bundles.browser,
        format: 'esm',
        sourcemap: 'inline',
        banner,
        plugins: [terser()],
      },
    ],
    plugins: [
      multiInput(),
      postcss({ plugins: [postcssImport(), autoprefixer()], minimize: true }),
      pluginTypescript({
        ...defaultTsConfig.compilerOptions,
        ...{
          declaration: true,
          emitDeclarationOnly: true,
          outDir: `${bundles.browser}`,
          declarationDir: `${bundles.browser}`,
          exclude: [...defaultTsConfig.exclude],
        },
      }),
      babel({
        babelHelpers: 'bundled',
        configFile: path.resolve(__dirname, '.babelrc.js'),
        extensions: ['.js', '.ts', '.tsx'],
      }),

      pluginCommonjs({
        extensions: ['.js', '.ts', '.tsx'],
      }),

      pluginNodeResolve({
        browser: true,
      }),
    ],
  },

  // ES
  {
    input: inputFileName,
    output: [
      {
        dir: bundles.es,
        format: 'es',
        sourcemap: 'inline',
        banner,
        exports: 'named',
      },
    ],
    ...pluginsSetups(bundles.es),
  },

  // CommonJS
  {
    input: inputFileName,
    output: [
      {
        dir: bundles.cjs,
        format: 'cjs',
        sourcemap: 'inline',
        banner,
        exports: 'named',
      },
    ],
    ...pluginsSetups(bundles.cjs),
  },
];

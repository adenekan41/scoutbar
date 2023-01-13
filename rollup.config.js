/* -------------------------------------------------------------------------- */
/*                            External Dependencies                           */
/* -------------------------------------------------------------------------- */
import * as path from 'path';

import pluginTypescript from '@rollup/plugin-typescript';
import pluginCommonjs from '@rollup/plugin-commonjs';
import pluginNodeResolve from '@rollup/plugin-node-resolve';
import { babel } from '@rollup/plugin-babel';
import replace from '@rollup/plugin-replace';

import { terser } from 'rollup-plugin-terser';
import multiInput from 'rollup-plugin-multi-input';
import postcss from 'rollup-plugin-postcss';

import postcssImport from 'postcss-import';
import autoprefixer from 'autoprefixer';

import serve from 'rollup-plugin-serve';
import livereload from 'rollup-plugin-livereload';
import analyze from 'rollup-plugin-analyzer';
import visualizer from 'rollup-plugin-visualizer';

/* -------------------------- Internal Dependencies ------------------------- */
import pkg from './package.json';
import defaultTsConfig from './tsconfig.json';

const moduleName = pkg.name.replace(/^@.*\//, '');
const inputFileName = [
  'src/**/*.ts',
  process.env.NODE_ENV === 'prod' ? 'src/!(test.tsx)/**/*.tsx' : 'src/**/*.tsx',
];

const author = pkg.author;

const bundles = {
  es: 'dist/bundle-es',
  cjs: 'dist/bundle-cjs',
  browser: 'dist/scout-bar',
};

const banner = `
  /**
   * ${moduleName}.js 
   * @summary ${pkg.description}
   * @version v${pkg.version}
   * @author  ${author}
   * @license Released under the ${pkg.license} license.
   * @copyright Adenekan Wonderful 2021
   */
`;

const pluginsSetups = bundle => ({
  external: ['react', 'react-dom'],
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
        exclude: [
          'node_modules',
          'dist',
          process.env.NODE_ENV === 'prod' ? 'src/test.tsx' : '',
        ],
      },
    }),
    analyze({
      hideDeps: true,
      summaryOnly: true,
    }),
    visualizer(),
    babel({
      babelHelpers: 'bundled',
      configFile: path.resolve(__dirname, '.babelrc.js'),
      extensions: ['.ts', '.tsx'],
      exclude: 'node_modules/**',
    }),

    pluginCommonjs({
      extensions: ['.ts', '.tsx'],
    }),

    replace({
      'process.env.NODE_ENV': JSON.stringify(
        process.env.NODE_ENV === 'prod' ? 'production' : 'development'
      ),
      preventAssignment: true,
    }),

    pluginNodeResolve({
      browser: bundle === bundles.browser ? true : false,
    }),
  ],
});

export default [
  {
    input: inputFileName,
    output: [
      {
        name: moduleName,
        dir: bundles.browser,
        format: 'esm',
        sourcemap: 'inline',
        banner,
        plugins:
          process.env.NODE_ENV === 'prod'
            ? [terser()]
            : [
                serve({
                  verbose: true,
                  contentBase: '',
                  historyApiFallback: false,
                  host: 'localhost',
                  port: 3008,
                }),
                livereload('dist'),
              ],
      },
    ],
    ...pluginsSetups(bundles.browser),
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

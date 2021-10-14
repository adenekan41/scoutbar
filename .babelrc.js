module.exports = {
  env: {
    test: {
      presets: ['@babel/env', '@babel/preset-react'],
      plugins: [
        'babel-plugin-dynamic-import-node',
        '@babel/plugin-transform-runtime',
      ],
    },
  },
  presets: [
    [
      '@babel/env',
      {
        loose: true,
        modules: false,
      },
    ],
    '@babel/preset-react',
  ],
  plugins: [
    [
      '@babel/plugin-proposal-class-properties',
      {
        loose: true,
      },
    ],
    '@babel/plugin-proposal-object-rest-spread',
  ],
};

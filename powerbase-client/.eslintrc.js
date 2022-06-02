const path = require('path');

module.exports = {
  parser: '@babel/eslint-parser',
  parserOptions: {
    babelOptions: {
      configFile: path.resolve(__dirname, '.babelrc'),
    },
  },
  extends: ['airbnb'],
  env: {
    browser: true,
    node: true,
    jest: true,
    commonjs: true,
  },
  settings: {
    'import/resolver': {
      webpack: {
        config: 'webpack.config.js',
      },
      node: {
        moduleDirectory: ['./node_modules'],
      },
    },
  },
  rules: {
    camelcase: 'off',
    'react/jsx-filename-extension': [1, { extensions: ['.js', '.jsx'] }],
    'import/prefer-default-export': 'off',
    'react/jsx-one-expression-per-line': 'off',
    'react/require-default-props': 'off',
    'react/forbid-prop-types': 'off',
    'react/button-has-type': 'off',
    'no-param-reassign': 'off',
    'no-nested-ternary': 'off',
    'no-unused-vars': 'warn',
    'react/jsx-props-no-spreading': 'off',
    'jsx-a11y/label-has-associated-control': 'off',
    'max-len': 'off',
  },
};

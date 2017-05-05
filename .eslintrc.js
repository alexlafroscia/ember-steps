module.exports = {
  root: true,
  parserOptions: {
    ecmaVersion: 6,
    sourceType: 'module'
  },
  extends: [
    'eslint:recommended',
    'plugin:ember-suave/recommended',
    'prettier'
  ],
  plugins: [
    'prettier'
  ],
  env: {
    'browser': true
  },
  rules: {
    'prefer-const': 'error',

    'ember-suave/no-const-outside-module-scope': 'off',

    'prettier/prettier': ['error', {
      printWidth: 120,
      singleQuote: true
    }]
  }
};

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
    // Prettier
    'prettier/prettier': ['error', {
      printWidth: 120,
      singleQuote: true
    }],

    // Ember Suave
    'ember-suave/no-const-outside-module-scope': 'off',

    // Built In
    'prefer-const': 'error'
  }
};

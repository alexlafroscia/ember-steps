module.exports = {
  root: true,
  parserOptions: {
    ecmaVersion: 2017,
    sourceType: "module"
  },
  plugins: ["ember", "prettier"],
  extends: ["eslint:recommended", "plugin:ember/recommended", "prettier"],
  env: {
    browser: true
  },
  rules: {
    "prettier/prettier": "error",

    "ember/avoid-leaking-state-in-ember-objects": [
      "error",
      ["actions", "localClassNames", "queryParams"]
    ]
  },
  overrides: [
    // TypeScript files
    {
      files: ["**/*.ts"],
      parser: "typescript-eslint-parser",
      rules: {
        "no-undef": "off",
        "no-unused-vars": "off"
      }
    },
    // node files
    {
      files: [
        "index.js",
        "testem.js",
        "ember-cli-build.js",
        "commitlint.config.js",
        "config/**/*.js",
        "tests/dummy/config/**/*.js"
      ],
      excludedFiles: ["app/**", "addon/**", "tests/dummy/app/**"],
      parserOptions: {
        sourceType: "script",
        ecmaVersion: 2015
      },
      env: {
        browser: false,
        node: true
      },
      plugins: ["node"],
      rules: Object.assign(
        {},
        require("eslint-plugin-node").configs.recommended.rules,
        {
          "node/no-unpublished-require": "off"
        }
      )
    }
  ]
};

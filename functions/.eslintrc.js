module.exports = {
  env: {
    es6: true,
    node: true,
  },
  parserOptions: {
    "ecmaVersion": 2018,
  },
  extends: [
    "eslint:recommended",
    "google",
  ],
  rules: {
    "no-restricted-globals": ["error", "name", "length"],
    "prefer-arrow-callback": "error",
    "quotes": ["error", "double", {"allowTemplateLiterals": true}],
    // Relax line ending rules for Windows compatibility
    "linebreak-style": "off",
    // Allow both single and double quotes in some contexts
    "object-curly-spacing": ["error", "never"],
    // Relax some Google style rules for better compatibility
    "max-len": ["error", {"code": 100, "ignoreUrls": true}],
    "comma-dangle": ["error", "always-multiline"],
    "semi": ["error", "always"],
    "no-trailing-spaces": "error",
    "indent": ["error", 2],
  },
  overrides: [
    {
      files: ["**/*.spec.*", "**/*.test.*"],
      env: {
        mocha: true,
        jest: true,
      },
      globals: {
        "describe": "readonly",
        "it": "readonly",
        "test": "readonly",
        "expect": "readonly",
        "beforeEach": "readonly",
        "afterEach": "readonly",
        "beforeAll": "readonly",
        "afterAll": "readonly",
        "jest": "readonly",
      },
      rules: {
        "no-undef": "off", // Jest globals are handled above
      },
    },
  ],
  globals: {},
};

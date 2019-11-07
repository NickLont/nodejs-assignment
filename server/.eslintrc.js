module.exports = {
  env: {
    browser: true,
    es6: true
  },
  extends: [
    'standard'
  ],
  globals: {
    Atomics: 'readonly',
    SharedArrayBuffer: 'readonly'
  },
  parserOptions: {
    ecmaVersion: 2018,
    sourceType: 'module'
  },
  rules: {
    "strict": 0,
    "semi": ["error", "never"],
    "no-console": 0,
    "indent": ["warn", 2],
    "comma-dangle": "warn",
    "object-curly-spacing": ["warn", "always"],
    "no-unused-vars": ["warn"]
  }
}

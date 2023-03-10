module.exports = {
  env: { browser: true, es2021: true, node: true },
  extends: ['eslint:recommended', 'plugin:@typescript-eslint/recommended'],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module'
  },
  plugins: ['@typescript-eslint'],
  rules: {
    // indent: ['error', 2],
    indent: 'off',
    '@typescript-eslint/indent': ['error', 2],
    "@typescript-eslint/no-explicit-any": "off",
    // quotes: ['error', 'single'],
    // semi: ['error', 'never'],
    'linebreak-style': ['error', 'unix']
  }
}

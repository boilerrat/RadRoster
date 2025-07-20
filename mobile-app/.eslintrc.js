module.exports = {
  root: true,
  extends: ['@react-native/eslint-config'],
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint'],
  rules: {
    '@typescript-eslint/no-unused-vars': 'error',
    '@typescript-eslint/no-explicit-any': 'warn',
    'prefer-const': 'error',
    'no-var': 'error',
    'quotes': 'off',
    'prettier/prettier': 'off',
    '@typescript-eslint/func-call-spacing': 'off',
  },
};

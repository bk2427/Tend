module.exports = {
  extends: 'expo',
  rules: {
    // Catch console.log statements left in production code
    'no-console': ['warn', { allow: ['warn', 'error'] }],
    // Prevent unused variables silently slipping through
    '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
  },
};

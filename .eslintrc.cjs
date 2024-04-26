module.exports = {
  root: true,
  extends: ['@vben'],
  rules: {
    'no-undef': 'off',
    // // 注意你必须禁用基本规则，因为它可以报告不正确的错误
    // 'no-unused-vars': 'error', //没使用的变量显示灰色
    // '@typescript-eslint/no-unused-vars': ['off'], //是否监测未使用的变量
  },
};

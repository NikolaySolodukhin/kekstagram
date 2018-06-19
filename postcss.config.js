module.exports = {
  plugins: [
    require('postcss-import'),
    require('postcss-url'),
    require('pleeease-filters'),
    require('postcss-preset-env')({
      stage: 1,
    }),
    require('postcss-nested'),
    require('postcss-color-mod-function'),
  ],
};

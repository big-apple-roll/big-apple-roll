/* eslint-disable no-undef */
/* eslint-disable @typescript-eslint/no-require-imports */
const config = {
  plugins: [
    require("@csstools/postcss-global-data")({
      files: ["./src/components/style/variables/media.css"],
    }),
    require("postcss-custom-media")(),
    require("postcss-hover-media-feature"),
    require("autoprefixer")(),
  ],
};

module.exports = () => config;

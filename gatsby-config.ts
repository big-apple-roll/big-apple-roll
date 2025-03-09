import type { GatsbyConfig } from "gatsby";

const config: GatsbyConfig = {
  pathPrefix: "/big-apple-roll",
  siteMetadata: {
    siteUrl: "https://big-apple-roll.github.io/",
  },
  graphqlTypegen: true,
  plugins: [
    {
      resolve: `gatsby-omni-font-loader`,
      options: {
        enableListener: true,
        preconnect: [`https://fonts.googleapis.com`, `https://fonts.gstatic.com`],
        web: [
          {
            name: `Open Sans`,
            file: `https://fonts.googleapis.com/css2?family=Open+Sans:ital,wght@0,300..800;1,300..800&display=swap`,
          },
          {
            name: "Oswald",
            file: "https://fonts.googleapis.com/css2?family=Oswald:wght@200..700&display=swap",
          },
          {
            name: "Material Symbols Outlined",
            file: "https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined",
          },
        ],
      },
    },
    "gatsby-plugin-image",
    "gatsby-plugin-postcss",
    "gatsby-plugin-dts-css-modules", // Must be after gatsby-plugin-postcss, component must be imported for types to be generated
    "gatsby-plugin-root-import",
    "gatsby-plugin-sharp",
    {
      resolve: "gatsby-plugin-robots-txt",
      options: {
        policy: [{ userAgent: "*", disallow: "/big-apple-roll" }],
      },
    },
    {
      resolve: `gatsby-source-filesystem`,
      options: {
        name: `content`,
        path: `./content`,
      },
    },
    {
      resolve: "gatsby-transformer-remark",
      options: {
        plugins: ["gatsby-remark-images"],
      },
    },
    "gatsby-transformer-sharp",
  ],
};

export default config;

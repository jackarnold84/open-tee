import type { GatsbyConfig } from "gatsby";

const config: GatsbyConfig = {
  siteMetadata: {
    title: `Open Tee`,
    siteUrl: `https://opentee.jarno.site`
  },
  plugins: [
    {
      resolve: 'gatsby-plugin-antd',
      options: {
        style: true
      }
    },
    {
      resolve: `gatsby-plugin-less`,
      options: {
        lessOptions: {
          javascriptEnabled: true,
          modifyVars: {
            '@primary-color': '#768f13',
            '@font-size-base': '16px',
            '@font-family': "'Source Sans Pro', sans-serif",
            '@border-radius-base': '6px',
          }
        },
      },
    },
    "gatsby-plugin-styled-components",
    "gatsby-plugin-image",
    "gatsby-plugin-sharp",
    {
      resolve: 'gatsby-source-filesystem',
      options: {
        "name": "images",
        "path": "./src/images/"
      },
      __key: "images"
    },
    {
      resolve: `gatsby-plugin-manifest`,
      options: {
        name: "OpenTee",
        short_name: "OpenTee",
        start_url: "/",
        background_color: "#768f13",
        theme_color: "#768f13",
        display: "standalone",
        icon: "src/images/icon.png",
      },
    },
  ]
};

export default config;

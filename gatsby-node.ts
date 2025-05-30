import { GatsbyNode } from "gatsby";

export const onCreateWebpackConfig: GatsbyNode["onCreateWebpackConfig"] = ({ actions, getConfig }) => {
  const config = getConfig();

  if (config.module) {
    config.ignoreWarnings = [
      (warning: any) => {
        if (
          warning.message &&
          warning.message.includes("mini-css-extract-plugin") &&
          warning.message.includes("Conflicting order")
        ) {
          return true;
        }
        return false;
      }
    ];
  }

  actions.replaceWebpackConfig(config);
};

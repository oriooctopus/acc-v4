module.exports = {
  graphql: {
    config: {
      syncDir: "config/sync",
      minify: false,
      importOnBootstrap: false,
      customTypes: [],
      excludedTypes: [],
      excludedConfig: [],
      defaultLimit: 100,
    },
  },
  "challenge-view": {
    enabled: true,
    resolve: "./src/plugins/challenge-view",
  },
};

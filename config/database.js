const parse = require("pg-connection-string").parse;
const databaseUrl = process.env.DATABASE_URL
  ? parse(process.env.DATABASE_URL)
  : {};

module.exports = ({ env }) => ({
  connection: {
    client: "postgres",
    connection: {
      host: databaseUrl.host || "127.0.0.1",
      port: databaseUrl.port || 5432,
      database: databaseUrl.database || env("DATABASE_NAME", "postgres"),
      user: databaseUrl.user || env("DATABASE_USER", "postgres"),
      password: databaseUrl.password || env("DATABASE_PASSWORD", "password"),
      ssl: env.bool("IS_PRODUCTION", false)
        ? {
            rejectUnauthorized: false,
          }
        : false,
    },
  },
});

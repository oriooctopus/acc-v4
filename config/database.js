const parse = require("pg-connection-string").parse;
const config = process.env.DATABASE_URL ? parse(process.env.DATABASE_URL) : {};

const isProduction = true;

console.log("is production?", isProduction);

console.log("THIS IS THE CONFIG", config);
console.log("");
console.log("other process envs", process.env);

module.exports = ({ env }) => ({
  connection: {
    client: "postgres",
    connection: {
      // I'm pretty sure env is a helper and can help me get rid of ||
      host: config.host || env("DATABASE_HOST", "127.0.0.1"),
      port: config.port || env.int("DATABASE_PORT", 5432),
      database: config.database || env("DATABASE_NAME", "acc-v4"),
      user: config.user || env("DATABASE_USERNAME", "username"),
      password: config.password || env("DATABASE_PASSWORD", "password"),
      // ssl: config.sslEnabled || env.bool("DATABASE_SSL", false),
      // ssl: true,
      ssl: isProduction
        ? {
            rejectUnauthorized: false,
          }
        : false,
    },
  },
});

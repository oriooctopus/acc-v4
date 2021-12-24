const parse = require("pg-connection-string").parse;
const config = parse(process.env.DATABASE_URL);

console.log("THIS IS THE CONFIG", config);
console.log("");
console.log("other process envs", process.env);

module.exports = ({ env }) => ({
  connection: {
    client: "postgres",
    connection: {
      host: config.host || env("DATABASE_HOST", "127.0.0.1"),
      // port: env.int('DATABASE_PORT', 5432),
      port: config.port || env.int("DATABASE_PORT", 1111),
      database: config.database || env("DATABASE_NAME", "acc-v4"),
      user: config.user || env("DATABASE_USERNAME", "username"),
      password: config.password || env("DATABASE_PASSWORD", "password"),
      // ssl: config.sslEnabled || env.bool("DATABASE_SSL", false),
      ssl: true,
    },
  },
});

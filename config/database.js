module.exports = ({ env }) => ({
  connection: {
    client: "postgres",
    connection: {
      host: env("DATABASE_HOST", "127.0.0.1"),
      // port: env.int('DATABASE_PORT', 5432),
      port: env.int("DATABASE_PORT", 1111),
      database: env("DATABASE_NAME", "acc-v4"),
      user: env("DATABASE_USERNAME", "username"),
      password: env("DATABASE_PASSWORD", "password"),
      ssl: env.bool("DATABASE_SSL", false),
    },
  },
});

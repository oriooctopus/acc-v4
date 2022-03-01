module.exports = ({ env }) => ({
  auth: {
    secret: env("ADMIN_JWT_SECRET", "9f57058c01429d625346594277bcfcf4"),
  },
  watchIgnoreFiles: ["**/config/sync/**"],
});

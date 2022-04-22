const pluginPkg = require("../../package.json");

const pluginId = pluginPkg.name.replace(/^@strapi\/plugin-/i, "");
console.log("yo", pluginId);

module.exports = pluginId;

const {execSync} = require("node:child_process");

module.exports = {
  name: "plugin-run-patch-package",
  factory: () => ({
    hooks: {
      afterAllInstalled: () => execSync('npx patch-package',{stdio:'inherit'}),
    },
  }),
};

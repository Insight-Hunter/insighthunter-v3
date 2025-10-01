// setup.js
const fs = require("fs");
const path = require("path");

const baseDir = path.join(__dirname, "src", "worker", "onboarding");

const files = [
  "businessSetupAPI.ts",
  "accountConnectionAPI.ts",
  "invoiceSetupAPI.ts",
  "walletSyncAPI.ts",
  "preferencesAPI.ts",
  "summaryAPI.ts",
];

// ensure directory exists
fs.mkdirSync(baseDir, { recursive: true });

// create files
files.forEach((file) => {
  const filePath = path.join(baseDir, file);
  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, "", "utf8");
    console.log("Created:", filePath);
  } else {
    console.log("Exists:", filePath);
  }
});

// create onboarding.ts (one level above)
const routerFile = path.join(path.dirname(baseDir), "onboarding.ts");
if (!fs.existsSync(routerFile)) {
  fs.writeFileSync(
    routerFile,
    `// Main router that imports and wires onboarding APIs\n`,
    "utf8"
  );
  console.log("Created:", routerFile);
} else {
  console.log("Exists:", routerFile);
}

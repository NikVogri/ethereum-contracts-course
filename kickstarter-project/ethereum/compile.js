const path = require("path");
const fs = require("fs-extra");
const solc = require("solc");

// remove the old build dir
const buildPath = path.resolve(__dirname, "build");
fs.removeSync(buildPath);

// rebuild build dir
fs.readdirSync(path.resolve(__dirname, "contracts")).forEach((file) => {
	if (!file.endsWith(".sol")) return;

	const source = fs.readFileSync(path.join(__dirname, "contracts", file), "utf8");
	const output = solc.compile(source, 1).contracts;

	fs.ensureDirSync(buildPath);

	for (const contract in output) {
		fs.outputJsonSync(path.join(buildPath, contract.replace(":", "") + ".json"), output[contract]);
	}
});

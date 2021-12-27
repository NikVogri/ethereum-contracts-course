const HDWalletProvider = require("@truffle/hdwallet-provider");
const { interface, bytecode } = require("./compile");
const Web3 = require("web3");

const provider = new HDWalletProvider("", "");

const web3 = new Web3(provider);

(async () => {
	const accounts = await web3.eth.getAccounts();
	console.log(`Attempting to deploy from account: ${accounts[0]}`);

	const contract = await new web3.eth.Contract(JSON.parse(interface))
		.deploy({
			data: bytecode,
		})
		.send({ from: accounts[0], gas: "1000000" });

	console.log("interface", interface);
	console.log(`contract: ${contract.options.address}`);
	provider.engine.stop();
})();

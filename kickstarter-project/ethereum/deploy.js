const HDWalletProvider = require("@truffle/hdwallet-provider");
const Web3 = require("web3");
const compiledFactory = require("./build/CampaignFactory.json");

const provider = new HDWalletProvider("", "");
const web3 = new Web3(provider);

(async () => {
	const accounts = await web3.eth.getAccounts();
	console.log(`Attempting to deploy from account: ${accounts[0]}`);

	const contract = await new web3.eth.Contract(JSON.parse(compiledFactory.interface))
		.deploy({
			data: compiledFactory.bytecode,
		})
		.send({ from: accounts[0], gas: "1000000" });

	console.log(`deployed address: ${contract.options.address}`);
	provider.engine.stop();
})();

const assert = require("assert");
const ganache = require("ganache-cli");
const Web3 = require("web3");

const provider = ganache.provider();
const web3 = new Web3(provider);

const compiledCampaign = require("../ethereum/build/Campaign.json");
const compiledFactory = require("../ethereum/build/CampaignFactory.json");

let accounts;
let factory;
let campaignAddress;
let campaign;

beforeEach(async () => {
	accounts = await web3.eth.getAccounts();
	factory = await new web3.eth.Contract(JSON.parse(compiledFactory.interface))
		.deploy({ data: compiledFactory.bytecode })
		.send({ from: accounts[0], gas: "1000000" });

	await factory.methods.createCampaign("100").send({
		from: accounts[0],
		gas: "1000000",
	});

	[campaignAddress] = await factory.methods.getDeployedCampaigns().call();
	campaign = await new web3.eth.Contract(JSON.parse(compiledCampaign.interface), campaignAddress);
});

describe("Campaigns", () => {
	it("deploys a factory and a campaign", () => {
		assert.ok(factory.options.address);
		assert.ok(campaign.options.address);
	});

	it("marks caller as the campaign manager", async () => {
		const manager = await campaign.methods.manager().call();
		assert.equal(accounts[0], manager);
	});

	it("allows people to contribute money and marks them as approvers", async () => {
		await campaign.methods.contribute().send({
			value: "200",
			from: accounts[1],
		});

		const isContributor = await campaign.methods.approvers(accounts[1]).call();
		assert(isContributor);
	});

	it("requires a minimum contribution", async () => {
		let errorHasBeenThrown = false;
		try {
			await campaign.methods.contribute().send({
				value: "1",
				from: accounts[1],
			});
		} catch (error) {
			errorHasBeenThrown = true;
		}

		assert(errorHasBeenThrown);
	});

	it("allows manager to create payment request", async () => {
		await campaign.methods.createRequest("buy rubber for wheels", "100", accounts[1]).send({
			from: accounts[0],
			gas: "1000000",
		});

		const request = await campaign.methods.requests(0).call();
		assert.ok(request);
		assert.equal("buy rubber for wheels", request.description);
	});

	it("processes requests", async () => {
		// person #1 contributes
		await campaign.methods.contribute().send({
			from: accounts[1],
			value: web3.utils.toWei("10", "ether"),
		});

		// manager creates request
		await campaign.methods
			.createRequest("buy rubber for wheels", web3.utils.toWei("5", "ether"), accounts[3])
			.send({
				from: accounts[0],
				gas: "1000000",
			});

		// person #1 votes on the request
		await campaign.methods.approveRequest(0).send({
			from: accounts[1],
			gas: "1000000",
		});

		// manager finalizes request and vendor has received requested money
		const vendorMoneyBefore = web3.utils.fromWei(await web3.eth.getBalance(accounts[3]));
		await campaign.methods.finalizeRequest(0).send({
			from: accounts[0],
			gas: "1000000",
		});

		const vendorMoneyAfter = web3.utils.fromWei(await web3.eth.getBalance(accounts[3]));

		assert(vendorMoneyAfter - vendorMoneyBefore === 5);
	});
});

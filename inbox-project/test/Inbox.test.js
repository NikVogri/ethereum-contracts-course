const Web3 = require("web3");
const assert = require("assert");
const ganache = require("ganache-cli");
const { interface, bytecode } = require("../compile");

const web3 = new Web3(ganache.provider());

let accounts;
let inbox;
beforeEach(async () => {
	accounts = await web3.eth.getAccounts();

	inbox = await new web3.eth.Contract(JSON.parse(interface))
		.deploy({
			data: bytecode,
			arguments: ["Hi there!"],
		})
		.send({
			from: accounts[0],
			gas: "1000000",
		});
});

describe("inbox", () => {
	it("should deploy a contract", () => {
		assert.ok(inbox.options.address);
	});

	it("should have a default message", async () => {
		const message = await inbox.methods.message().call();
		assert.equal(message, "Hi there!");
	});

	it("should update the message", async () => {
		await inbox.methods.setMessage("Bye!").send({
			from: accounts[0],
			gas: "1000000",
		});
		const message = await inbox.methods.message().call();
		assert.equal(message, "Bye!");
	});
});

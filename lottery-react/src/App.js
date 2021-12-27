import "./App.css";
import React from "react";
import web3 from "./web3";
import lottery from "./lottery";

class App extends React.Component {
	state = {
		manager: "",
		players: [],
		balance: "",
		value: "",
		message: "",
		pickingWinner: false,
		localAccounts: [],
	};

	async componentDidMount() {
		const manager = await lottery.methods.manager().call();
		const players = await lottery.methods.getPlayers().call();
		const balance = await web3.eth.getBalance(lottery.options.address);
		const accounts = await web3.eth.getAccounts();

		this.setState({ manager, players, balance, localAccounts: accounts });
	}

	pickWinner = async () => {
		this.setState({ pickingWinner: true });
		const accounts = await web3.eth.getAccounts();

		await lottery.methods.pickWinner().send({
			from: accounts[0],
		});
		this.setState({ pickingWinner: false });
	};

	onSubmit = async (e) => {
		e.preventDefault();

		this.setState({ message: "Waiting on transaction success..." });

		await lottery.methods.enter().send({
			from: this.state.localAccounts[0],
			value: web3.utils.toWei(this.state.value, "ether"),
		});

		this.setState({ message: "Successfully entered the lottery, good luck!" });
	};

	render() {
		console.log(this.state);
		return (
			<div className="App">
				<h2>Lottery contract</h2>
				<p>This contract is managed by: {this.state.manager}.</p>
				<p>
					There are currently {this.state.players.length} players entered competing to win:{" "}
					{web3.utils.fromWei(this.state.balance)} ether.
				</p>
				<ul>
					<p>Players:</p>
					{this.state.players.map((address) => (
						<li key={address}>{address}</li>
					))}
				</ul>
				<hr />
				<form onSubmit={this.onSubmit}>
					<h4>Want to try your luck?</h4>
					<label>Amount of ether to enter: </label>
					<input
						type="number"
						value={this.state.value}
						onChange={(e) => this.setState({ value: e.target.value })}
					/>
					<button type="submit">enter</button>
				</form>
				<p>{this.state.message}</p>

				<hr />
				{this.state.localAccounts.includes(this.state.manager) && (
					<button onClick={this.pickWinner}>Pick winner</button>
				)}
				{this.state.pickingWinner ? <p>picking winner...</p> : <p>winner has been picked</p>}
			</div>
		);
	}
}
export default App;

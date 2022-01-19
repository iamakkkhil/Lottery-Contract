const assert = require("assert")
const ganache = require("ganache-cli")
const Web3 = require("web3");
const web3 = new Web3(ganache.provider());

const { abi, evm } = require('../compile');

let accounts;
let lottery;

beforeEach(async() => {
    accounts = await web3.eth.getAccounts();

    lottery = await new web3.eth.Contract(abi)
    .deploy({ data: evm.bytecode.object })
    .send({ gas: '1000000', from: accounts[0] });
})

describe("Lottery Contract", () => {
    it("deploys a contract", () => {
        assert.ok(lottery.options.address)
    })

    it("allows one account to enter", async () => {
        await lottery.methods.enter().send({
            from: accounts[0],
            value: web3.utils.toWei("0.2", "ether")
        })

        const players = await lottery.methods.getPlayers().call({
            from: accounts[0]
        })

        assert.equal(accounts[0], players[0])
        assert.equal(1, players.length)
    })

    it("allows multiple accounts to enter", async () => {
        await lottery.methods.enter().send({
            from: accounts[0],
            value: web3.utils.toWei("0.2", "ether")
        })
        await lottery.methods.enter().send({
            from: accounts[1],
            value: web3.utils.toWei("0.5", "ether")
        })
        await lottery.methods.enter().send({
            from: accounts[2],
            value: web3.utils.toWei("0.9", "ether")
        })

        const players = await lottery.methods.getPlayers().call({
            from: accounts[0]
        })

        assert.equal(accounts[0], players[0])
        assert.equal(accounts[1], players[1])
        assert.equal(accounts[2], players[2])
        assert.equal(3, players.length)
    })

    it("requires minimum amount of ether to enter", async() => {
        try {
            await lottery.methods.enter().send({
                from: accounts[0],
                value: 0
            })
            assert(false)
        }
        catch(err) {
            assert(err)
        }
    })

    it("only manager can call pickWinner function", async() => {
        try {
            await lottery.methods.enter().send({
                from: accounts[1]
            })
            assert(false)
        }
        catch(err) {
            assert(err)
        }
    })

    it("sends money to the player and resets the player array", async()=> {
        await lottery.methods.enter().send({
            from: accounts[0],
            value: web3.utils.toWei("2", "ether")
        })

        const initialBalanace = await web3.eth.getBalance(accounts[0]);
        await lottery.methods.pickWinner().send({ from: accounts[0] })
        const finalBalanace = await web3.eth.getBalance(accounts[0]);

        const difference = finalBalanace - initialBalanace
        assert(difference > web3.utils.toWei("1.8", "ether"))
    })
})
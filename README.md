# Web3-toolbox

## Purpose
Provide test support for [ethreum](https://www.ethereum.org/) related projects.
This project is not a replacement for the [truffle suite](http://truffleframework.com/) it is rather complementary to truffle.

## Motivation

If you want make your solidity functionality available without to install
truffle and [ganache](http://truffleframework.com/ganache/) then you may
consider the web3-toolbox.

`Web3-toolbox` address cases when you deal with functionality that relays on the blockhain logic (e.g. like a REST facade or a user interface) but you are not directly involved in the blockchain logic(e.g. smart contract) development.
Each of this functionality (the block chain and the one that relays on it) can/should be hosted in to a separate projects.
The blockchain project can be tested with truffle and ganache-cli but the other project that relays on the blockchain project (like our REST facade) has no chances for a proper testing.
The most popular approach for this kind of solution is to mix the both project in to a single compound project, but the compound nature will pay its praise when the  as the project grows.

With `web3-toolbox` you can start your own blockchain that contains only the contract that you need for your tests, you only need the contract file.

Here is an example: you have two teams one frontend and a (blockcahin based) backend. With the `web3-toolbox` your backend team can focus on blockchain themes without to interfere in any way with the frontend team. The frontend team can
use `web3-toolbox` to spawn (test purposed) blockhains with the contract of their choice.

## Usage

Functionality provided that far:

1. `deploy`, it compiles your contract, starts a ganache instance and it deploys the contract of your choice in to the fresh started chain. A successful `deploy` call with deliver an `deploy report` that contains all the needed information (e.g. [ABI](https://github.com/ethereum/wiki/wiki/Ethereum-Contract-ABI), accounts, contract owner, etc.) to contact and interact with the chain.
The deploy report is described in the next section.
2. `close` - it stops the blockchain stared with deploy.
3. `buildABI` - build the contract [ABI](https://github.com/ethereum/wiki/wiki/Ethereum-Contract-ABI)
for the given contract file.

### Deploy report

The result for an successfully deployment is a deploy report, this is a JSON with the following structure:

```javascript

{
    "owner": "0x6f7fb273f2a00cb4f2d7b2bbcdd88bd022f4f8a4",
    "transactionHash": "0xf0eede1d7b98fd6a12ed8c39fa802b853d3bbe78b10990fe66913afdca1897d2",
    "gas": 150629,
    "gasPrice": "0x1b48eb57e000",
    "contract": {
        "file": "contract.sol",
        "address": "0x0d168E5D03d4623ecF1086Dd4431f329F48C84a9",
        "abi": [...]
    },
    "accountToKey": {
        "0x6f7fb273f2a00cb4f2d7b2bbcdd88bd022f4f8a4": "f759413c5e20ed20e34e6ffafc2ec1dcb34cfd38cfe079a0e22e419314dde67a",
        "0x9aed84ddef8bafffc062b2180793b71ad1da8066": "28a941827c7b2d060121f82d365c8115307c836f52f466672df72d78ff9741f8"
      }
}
```

Here are the properties semantics:

1. `owner` - the contract owner address.
2. `transactionHash` - the deploy transaction hash.
3. `gas` - the amount of gas used for the contract deployment.
4. `gasPrice` - the price of gas in wei.
5. `contract.file` - the path to the contract file.
6. `contract.address` - the address where the contract was deployed
7. `abi` - the ABI for the contract.
8. `accountToKey` - map where the chain account are the keys and the corresponding private key are values.  

Consider the (example.js)[./example.js] and test file for more details.

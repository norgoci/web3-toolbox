# Web3-toolbox

## Purpose
Provide test support for [ethreum](https://www.ethereum.org/) related projects.
This project is not a replacement for the [truffle suite](http://truffleframework.com/) it is rather complementary to truffle.

## Motivation

If you want make your [solidity](https://solidity.readthedocs.io/en/v0.4.24/) contract functionality available over [JSON RPC](http://www.jsonrpc.org/specification) to some consumer without to make use of truffle and [ganache](http://truffleframework.com/ganache/) then you may consider the web3-toolbox.

`Web3-toolbox` address cases when you deal with functionality that relays on the blockhain logic (e.g. like a REST facade or a user interface) but you are not directly involved in the blockchain logic development.

With `web3-toolbox` you can start your own blockchain that contains only the contract and interact with according with your needs.

Here is an example: you need to build a user interface for functionality represented as smart contract.
Under normal circumstances you will need truffle suite to compile and to deploy and [ganache-cli](https://github.com/trufflesuite/ganache-cli) as test chain. The `web3-toolbox` is able to start a node, compile and deploy your contract allowing you to interact with contract over the JSON-RPC interface.

## Usage

Functionality provided that far:

1. `deploy`, it compiles your contract, starts a ganache instance and it deploys the contract of your choice in to the fresh started chain. A successful `deploy` call with deliver an `deploy report` that contains all the needed information (e.g. [ABI](https://github.com/ethereum/wiki/wiki/Ethereum-Contract-ABI), accounts, contract owner, etc.) to contact and interact with the chain. The deploy uses the default ganache port, the 8545. 
The deploy report is described in the next section.
2. `close` - it stops the blockchain stared with deploy.
3. `buildABI` - build the contract [ABI](https://github.com/ethereum/wiki/wiki/Ethereum-Contract-ABI)
for the given contract file.

Consider the (example.js)[./example.js] and test file for more details.


### The Deployment report

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



## Source Code 

The source code is hosted [here](https://github.com/norgoci/web3-toolbox).
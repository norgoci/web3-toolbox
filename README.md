# Web3-toolbox

## Purpose
Provide test support for [ethreum](https://www.ethereum.org/) related projects.
This project is not a replacement for the [truffle suite](http://truffleframework.com/) it is rather complementary
to the truffle suite project.

## Motivation

If you want make your [solidity](https://solidity.readthedocs.io/en/v0.4.24/) contract functionality available over
[JSON RPC](http://www.jsonrpc.org/specification) to some consumer without to make use of truffle suite and
[ganache](http://truffleframework.com/ganache/) (or any other chain client) then you may consider the `web3-toolbox`.

`Web3-toolbox` address cases when you deal with functionality that relays on the blockhain logic
(e.g. like a REST facade or a user interface) but you are not directly involved in the blockchain logic development.

With `web3-toolbox` you can start your own in memory private (block) chain that contains only the contract that you need
and interact with according with it your use-case.

Here is an example: you need to build a user interface for functionality represented as smart contract.
Under normal circumstances you will need truffle suite to compile and to deploy and
[ganache-cli](https://github.com/trufflesuite/ganache-cli) as test chain.
The `web3-toolbox` is able to start a node, compile and deploy your contract allowing you to interact with contract over
the JSON-RPC interface.

## Usage

Until now the web3-toolbox has two releases (1.xx and 2.xx).


### web3-toolbox version 1.xx

This version provides the following functionality:

1. `deploy`, starts and deploys your contract.
More precisely the `deploy` compiles your contract, starts a ganache instance
and it deploys the contract in to the fresh started chain.
A successful `deploy` call delivers an `deploy report` that contains all the needed information
(e.g. [ABI](https://github.com/ethereum/wiki/wiki/Ethereum-Contract-ABI), accounts, contract owner, etc.)
to contact and interact with the contract.
The `deploy report` is described in the next section.
The method takes three arguments:
    1. `port`, represents the port where the chain client will accept (JSON RPC) requests,
   if its not provided then the the `8545` will be used.
    2. `contractFile` - the solidity file to be deploy.
    3. `gasPrice` - the gas price used by deployment.
2. `close` - it stops the blockchain stared with deploy.
3. `buildABI` - build the contract [ABI](https://github.com/ethereum/wiki/wiki/Ethereum-Contract-ABI)
for the given contract file.

The next code snippet shows how to use it. 

```javascript
const deployer = require('web3-toolbox');
const contractFile = 'contract.sol';
const abi = deployer.buildABI(contractFile);
console.log(abi);
deployer.deploy('contract.sol').then((deployReport) => {
  console.log('The contract %s is own by the user %s, the contract deploy transaction %s costs %s gas.',
  deployReport.contract.file, deployReport.owner, deployReport.transactionHash, deployReport.gas);
  console.log('The contract address is %s', deployReport.contract.address);
});
deployer.close();
```


#### Limitation

With the web3-toolbox version 1.xx you are able to deploy a single contract
and the contract constructor must have no arguments. 
If you want to deploy more contracts and/or you deal with contract
constructor that accepts arguments then you need to consider the version 2.xx.  

### web3-toolbox version 2.xx

This version introduces the following flow:

1. start
2. deploy contracts, this step can be call several times. 
Each deploy has as result a `deployment report` below described. 
3. close

In the [example1.js](https://github.com/norgoci/web3-toolbox/blob/master/example1.js) the server is started with the statement

```javascript
deployer.start().then(function (web3) {
  ...
} 
```

After the server starts the underlying web3 instance is returned,
the web3 instance is used to deploy the contract `contract.sol` as in the next code snippet.  
```javascript
deployer.start().then(function (web3) {
  console.log('Start web3.')
  return deployer.deploy(web3, 'contract.sol');
}).then(function (deployReport) {
  ....
}
```
The `deployer.deploy()` method can be used more times if you have more contracts,
in this example for simplicity we deal with only one contract.

A successful deploy end with a deploy report (below described). 
The next code snippet prints the report to the system out and after this 
it closes the server (with the `deployer.close()` method). Under normal circumstances you use the deploy report 
to interact with the contract.

```javascript
deployer.start().then(function (web3) {
  console.log('Start web3.')
  return deployer.deploy(web3, 'contract.sol');
}).then(function (deployReport) {
  console.log('The contract %s is own by the user %s, the contract deploy transaction %s costs %s gas.',
    deployReport.contract.file, deployReport.owner, deployReport.transactionHash, deployReport.gas);
  console.log('The contract address is %s', deployReport.contract.address);
  const report = JSON.stringify(deployReport, null, 4);
  console.log(report);
}).then(function () {
  deployer.close();
});
```

You can run the example1 script with the `node example1` command.

#### Alternative, short flow

As alternative to the `start - deploy - close` flow,
the version 2.xx provides also a `start and deploy - close` flow. 
This can be used if you have __only one__ contract.

Consider the [example2.js](https://github.com/norgoci/web3-toolbox/blob/master/example2.js)
as example for this kind of flow.

You can run the example1 script with the `node example2` command.
   
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

### Advanced Testing

With the version 2.0.2 the `ẁeb3-toolbox` provides you a set of helper methods destined reduce
the amount of boiler plate code for your tests. Here are the methods and their semantic:
1. getAllAccounts - returns a String array with all the accounts encapsulated in a deploy report.
2. accountExist - proves if  certain account exists in a deploy report.
3. getKey - get the private key for a given account from a given deploy report.
4. getKeyForOwner - get the private key for the contract owner from a given deploy report.
5. callMethod - calls a method on the contract.

The methods `getAllAccounts, accountExist, getKey, getKeyForOwner` are meant to make the deploy contract manipulation more easy.
Here is an example:

```javascript
  let allAccounts = deployer.getAllAccounts(deployReport);
  assert.equal(10, allAccounts.length, 'Ten accounts expected');
```

The `callMethod` method allows you to prepare the contract (by calling certain methods) before the a test occur.  
Here is an example:
```javascript
  const abi = deployReport.contract.abi;
  const contractAddress = deployReport.contract.address;
  const sender = deployReport.owner;
  // calls the method getSolution with no arguments, the method caller is the owner
  const solution = await deployer.callMethod(web3, abi, 'getSolution', [], sender, contractAddress);
```
      


## Source Code

The source code is hosted [here](https://github.com/norgoci/web3-toolbox).

If you find a bug or you need a new feature don't be shy and create a new issue git lab issue for it.

## Release log

For more information about the version and features consider the [CHANGE-LOG.md](https://github.com/norgoci/web3-toolbox/blob/master/CHANGE-LOG.md)

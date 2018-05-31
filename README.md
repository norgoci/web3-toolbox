# Web3-toolbox

## Purpose
Provide test support for blockchain related projects.

## Motivation

.....

## Usage

Functionality provided that far:

1. `deploy` - it starts a local blockchain ([ganache](https://github.com/trufflesuite/ganache-cli])) deploys the given contract and returns the contract owner account, the transaction hash (used to deploy the contract), and the contract file. Consider the following code snippet:
```javascript
deployer.deploy('contract.sol').then(function(results) {
  // results[0] - contract owner
  // results[1] - transaction
  // results[2] - contract file
  console.log('The contract %s was deploy is own by the account %s with transaction %s',
  results[2], results[0], results[1]);
});
```
The delpoy start the blockchain but it does not stop it.
2. `stop` - it stops the blockchain stared with the deploy.
3. `buildABI` - build the [ABI](https://github.com/ethereum/wiki/wiki/Ethereum-Contract-ABI)
for the given contract file.

const deployer = require('./index');

const contractFile = 'contract.sol';

//const abi = deployer.buildABI(contractFile);
//console.log(abi);

deployer.deploy('contract.sol').then(function(results) {
  // results[0] - contract owner
  // results[1] - transaction
  // results[2] - gas cost for the transaction
  // results[3] - contract file
  console.log('The contract %s is own by the account %s, the contract deploy transaction %s costs %s gas.',
  results[3], results[0], results[1], results[2]);
});
//deployer.close();

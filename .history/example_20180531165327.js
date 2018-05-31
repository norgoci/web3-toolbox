const deployer = require('./index');

const contractFile = 'contract.sol';

//const abi = deployer.buildABI(contractFile);
//console.log(abi);

deployer.deploy('contract.sol').then(function(results) {
  // results[0] - contract owner
  // 
  console.log('The contract %s was deploy is own by the account %s with transaction %s', 
  results[2], results[0], results[1]);
});
//deployer.close();

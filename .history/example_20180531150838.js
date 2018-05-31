const deployer = require('./index');

const contractFile = 'contract.sol';

//const abi = deployer.buildABI(contractFile);
//console.log(abi);

deployer.deploy('contract.sol').then(function(account, transactionHash, contractFile) {
  console.log('--->' + transactionHash);
  console.log('--->' + account);
  console.log('--->' + contractFile);
});
//deployer.close();

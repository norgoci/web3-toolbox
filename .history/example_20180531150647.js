const deployer = require('./index');

const contractFile = 'contract.sol';

//const abi = deployer.buildABI(contractFile);
//console.log(abi);

deployer.deploy('contract.sol').spr(function(transactionHash, contractFile) {
  console.log('--->' + transactionHash);
  console.log('--->' + contractFile);
});
//deployer.close();

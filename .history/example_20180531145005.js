const deployer = require('./index');

const contractFile = 'contract.sol';

//const abi = deployer.buildABI(contractFile);
//console.log(abi);

deployer.deploy('contract.sol').then(function(transactionHash, c) {
    console.log('--->' + transactionHash);
});
//deployer.close();

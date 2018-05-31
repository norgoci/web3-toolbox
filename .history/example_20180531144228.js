const deployer = require('./index');

const contractFile = 'contract.sol';

//const abi = deployer.buildABI(contractFile);
//console.log(abi);

deployer.deploy('contract.sol').then( func (contractFile, transactionHash) => {
    console.log('Contract %s was deployed with transaction %s', contractFile, transactionHash);
});
//deployer.close();

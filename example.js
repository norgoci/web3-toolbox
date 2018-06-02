const deployer = require('./index');

const contractFile = 'contract.sol';

//const abi = deployer.buildABI(contractFile);
//console.log(abi);

deployer.deploy('contract.sol').then((deployReport) => {
  console.log('The contract %s is own by the user %s, the contract deploy transaction %s costs %s gas.',
  deployReport.contract.file, deployReport.owner, deployReport.transactionHash, deployReport.gas);
  console.log('The contract address is %s', deployReport.contract.address);
});
//deployer.close();

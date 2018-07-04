const deployer = require('./index');

const contractFile = 'contract.sol';

const abi = deployer.buildABI(contractFile);
console.log('----abi for %s------', contractFile);
console.log(abi);
console.log('----abi for %s------', contractFile);

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

const deployer = require('./deployer');

exports.deploy = function(contractFile, gasPrice, port = 8545) {
  if (!contractFile) {
    throw 'The contract file must be provided';
  }


  return deployer.deploy(port, contractFile, gasPrice);
}

exports.buildABI = function(contractFile) {
  if (!contractFile) {
    throw 'The contract file must be provided';
  }
  return deployer.buildABI(contractFile);
}

exports.close = function () {
  deployer.closeWeb3();
}

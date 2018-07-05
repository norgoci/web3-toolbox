const deployer = require('./deployer');
const fs = require('fs');

exports.buildABI = function (contractFile) {
  if (!contractFile) {
    throw 'The contract file must be provided';
  }
  return deployer.buildABI(contractFile);
}

exports.runAndDeploy = function (contractFile,
                                 contractArguments = [],
                                 gasPrice = '30000000000000',
                                 host = 'localhost',
                                 port = 8545) {
  if (!contractFile) {
    throw 'The contract file must be provided';
  }

  return deployer.startWeb3(host, port).then(function (web3) {
    return deployer.deployContract(web3, contractFile, contractArguments, gasPrice);
  });
}

exports.start = function (host = 'localhost', port = 8545) {
  return deployer.startWeb3(host, port);
}

exports.deploy = function (web3,
                           contractFile,
                           contractArguments = [],
                           gasPrice = '30000000000000') {

  if (!web3) {
    throw Error("The web3 client can not be undefined.");
  }

  if (!contractFile) {
    throw Error("The contract file can not be undefined.");
  }

  if (!fs.existsSync(contractFile)) {
    throw Error("Can not read the contract file.");
  }

  if (!gasPrice) {
    throw Error("The gas price can not be undefined.");
  }

  return deployer.deployContract(web3, contractFile, contractArguments, gasPrice);
}


exports.close = function () {
  deployer.closeWeb3();
}

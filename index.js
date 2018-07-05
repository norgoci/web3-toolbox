const deployer = require('./deployer');
const fs = require('fs');

/**
 * Builds a <a href="https://docs.web3j.io/abi.html">ABI</a> for the given file.
 *
 * @param contractFile the contract file to be transformed in ABI.
 * @returns {any} a <a href="https://docs.web3j.io/abi.html">ABI</a> for the given file.
 */
exports.buildABI = function (contractFile) {
  if (!contractFile) {
    throw 'The contract file must be provided';
  }
  return deployer.buildABI(contractFile);
}


/**
 * It does:
 * <ul>
 * <li> compile to given file
 * <li> start a <a href="https://github.com/trufflesuite/ganache-cli">ganache</a>
 * instance on the specified port and hosts
 * <li> deploys the compiled contract in the the fresh started ganache instance.
 * <li> returns a deploy report
 * <ul>
 *
 * @param contractFile the contract file to be deployed.
 * @param contractArguments the arguments array for the contract constructor.
 * If is not specified then an empty array is used.
 * @param gasPrice the gas price for deployed contract. If is not specified then the '30000000000000' value is used.
 * @param host the host where the ganache instace will be started, if not specified then the localhost value is used.
 * @param port the host where the ganache instace will be started, if not specified then the 8545 value is used.
 * @returns {Promise<T | never>} a deploy report.
 */
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

/**
 * Starts the <a href="https://github.com/trufflesuite/ganache-cli">ganache</a>
 * on the given host and port.
 * Most of the time it is called in conjunction with deploy and close method.
 *
 * @param host the host where the ganache instace will be started, if not specified then the localhost value is used.
 * @param port the host where the ganache instace will be started, if not specified then the 8545 value is used.
 * @returns {Promise<T | never>} a the underlying web3 for the started ganache instance.
 */
exports.start = function (host = 'localhost', port = 8545) {
  return deployer.startWeb3(host, port);
}

/**
 * Deploys the given contract using a given web3 instance, the web3 refers a running ganache instance.
 * This method can be call repetitive.
 *
 * @param web3 the web3 client pointing to a running ganache instance.
 * @param contractFile the contract file to be deployed.
 * @param contractArguments the arguments array for the contract constructor.
 * If is not specified then an empty array is used.
 * @param gasPrice the gas price for deployed contract. If is not specified then the '30000000000000' value is used.
 * @returns {Promise<T | never>} a deploy report.
 */
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

  return deployer.deployContract(web3, contractFile, contractArguments, gasPrice);
}

/**
 * Closes the underlying ganache instance.
 */
exports.close = function () {
  deployer.closeWeb3();
}

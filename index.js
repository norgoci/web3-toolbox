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
                                 port = 8545,
                                 protocol = 'http') {
  if (!contractFile) {
    throw 'The contract file must be provided';
  }

  return deployer.startWeb3(host, port, protocol).then(function (web3) {
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
exports.start = function (host = 'localhost', port = 8545, protocol = 'http') {
  return deployer.startWeb3(host, port, protocol);
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

/**
 * Returns an array with all the test accounts encapsulated in the given deploy report.
 *
 * @param deployReport the involved deploy report.
 * @returns {string[]} all the accounts from the given deploy report.
 */
exports.getAllAccounts = function(deployReport) {
  if (!deployReport) {
    throw Error("The deploy report argument can not be undefined.");
  }

  return deployer.getAllAccounts(deployReport);
}

/**
 * Proves if a given account exists or not in in the given deploy report.
 *
 * @param deployReport the involved deploy report.
 * @param account {string} the account presence to be proven.
 * @returns {boolean} true if the given account exists in the deploy report.
 */
exports.accountExist = function(deployReport, account) {
  if (!deployReport) {
    throw Error("The deploy report argument can not be undefined.");
  }

  if (!account) {
    throw Error("The account can not be undefined.");
  }

  return deployer.accountExist(deployReport, account);
}

/**
 * Returns the private key for the given account.
 * If the account is not preset in the given deploy report then this method retuns undefined.
 *
 * @param deployReport the involved deploy report, it can not be undefined.
 * @param account {string} the account to be searched, it can not be undefined.
 * @returns {string} the private key associated to the given account or undefined
 * if the deploy report does not contains the given account.
 */
exports.getKey = function(deployReport, account) {
  if (!deployReport) {
    throw Error("The deploy report argument can not be undefined.");
  }

  if (!account) {
    throw Error("The account can not be undefined.");
  }

  if (!deployer.accountExist(deployReport, account)) {
    throw Error("The account is not available in the deploy report.");
  }

  return deployer.getKey(deployReport, account);
}


/**
 * Returns the private key associated to the owner.
 *
 * @param deployReport the involved deploy report, it can not be undefined.
 * @returns {string} the private key associated to the owner account.
 */
exports.getKeyForOwner = function(deployReport) {
  if (!deployReport) {
    throw Error("The deploy report argument can not be undefined.");
  }

  return deployer.getKey(deployReport, deployReport.owner);
}

/**
 * Calls a method on the given contract and returns its results.
 *
 * @param web3 the involved web3 instance.
 * @param abi the contract ABI.
 * @param methodName {string} the method name to be call.
 * @param args {string[]} the arguments for the method, empty array for no arguments.
 * @param sender {string} actor that call the method.
 * @param contractAddress {string} the contract address.
 * @returns {Promise<string>} the method result as promise.
 */
exports.callMethod = function(web3, abi, methodName, args, sender, contractAddress) {

  if (!web3) {
    throw Error("The web3 argument can not be undefined.");
  }

  if (!abi) {
    throw Error("The abi argument can not be undefined.");
  }

  if (!methodName) {
    throw Error("The methodName argument can not be undefined.");
  }

  if (!args) {
    throw Error("The args argument can not be undefined.");
  }

  if (!sender) {
    throw Error("The sender argument can not be undefined.");
  }

  if (!contractAddress) {
    throw Error("The contractAddress argument can not be undefined.");
  }

  return deployer.callMethod(web3, abi, methodName, args, sender, contractAddress)
}

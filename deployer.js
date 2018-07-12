const ganache = require('ganache-cli');
const server = ganache.server();
const fs = require('fs');
const solc = require('solc');
const Web3 = require('web3');

/**
 * Builds the ABI for the given solidity contract file.
 *
 * @param contractFile the contract file for the ABI.
 * @return {any} the ABI for the given solidity contract file.
 */
exports.buildABI = function(contractFile) {
  let contractMeta = solveContract(contractFile);
  return contractMeta.abi;
};

/**
 * Compile the given file and return an object that encapsulates
 * the ABI and the copiled contract bytecode.
 *
 * @param contractFile the contract file to be considered.
 * @return {{abi: any, bytecode: (contractOutput.evm.bytecode|{object, opcodes, sourceMap, linkReferences})}}
 */
function solveContract(contractFile) {
  if (!fs.existsSync(contractFile)) {
    throw Error("Can not read the contract file.");
  }

  let input = fs.readFileSync(contractFile);
  let output = solc.compile(input.toString(), 1);
  let contractKey = Object.keys(output.contracts)[0];
  let bytecode = output.contracts[contractKey].bytecode;
  let abi = JSON.parse(output.contracts[contractKey].interface);
  return {abi: abi, bytecode: bytecode};
}

var port;

exports.startWeb3 = function(host, port, protocol) {

  return new Promise(function(resolve, reject) {
    if (!port) {
      reject(Error('No port information is available.'));
    }

    if (port === this.port) {
      reject(Error('The port is already allocated.'));
    }
    this.port = port;
    server.listen(port);

    let web3URL = protocol + '://' + host + ':' + port;
    let web3;

    if (protocol === 'http') {
      web3 = new Web3(new Web3.providers.HttpProvider(web3URL));
    } else if (protocol === 'ws') {
      web3 = new Web3(new Web3.providers.WebsocketProvider(web3URL));
    }

    console.log('Ganache runs on : %s', web3URL);
    resolve(web3);
  });
}

exports.deployContract = function(web3, contractFile, contractArguments, gasPrice) {

  if (!web3) {
    throw Error("The web3 client can not be undefined.");
  }

  if (!contractFile) {
    throw Error("Can the contract file can not be undefined.");
  }

  if (!fs.existsSync(contractFile)) {
    throw Error("Can not read the contract file.");
  }

  if (!gasPrice) {
    throw Error("The gas price can not be undefined.");
  }

  contractArguments = contractArguments ? contractArguments : [];

  let eth = web3.eth;

  return new Promise(function(resolve, reject) {
    eth.getAccounts().then(function(accounts) {
      if (!accounts || accounts.length < 1) {
        console.error('No accounts are available, the contract %s *WAS NOT* deployed.', contractFile);
        reject(Error('No accounts are available.'));
      }

      let contractMeta = solveContract(contractFile);
      let bytecode = contractMeta.bytecode;
      let abi = contractMeta.abi;

      new eth.Contract(abi).deploy({
        data: bytecode,
        arguments: contractArguments
      })
        .estimateGas((error, gasAmount) => {
          if (error) {
            console.error(error);
            reject(error);
          }

          let account = accounts[0].toLowerCase();
          let fromJSON = {
            from: account,
            gas: gasAmount,
            gasPrice: gasPrice
          };

          // // TODO: find a better way to find the estimated gas
          new eth.Contract(abi).deploy({
            data: bytecode,
            arguments: contractArguments
          }).send(fromJSON, function(error, transactionHash) {
            if (error) {
              console.error(error);
              reject(error);
            }

            if (!transactionHash) {
              console.error('The contract %s *WAS NOT* deployed on the account %s.', contractFile, account);
              reject(Error('The contract *WAS NOT* deployed'));
            }

            eth.getTransactionReceipt(transactionHash).then(function (transactionReceipt) {
              if (!transactionReceipt) {
                console.error('No transaction receipt for the transation, the contract *WAS NOT* deployed.');
                reject(Error('No transaction receipt for the transation.'));
              }

              let contractAddress = transactionReceipt.contractAddress;
              if (!contractAddress) {
                console.error('No contract address found, the contract *WAS NOT* deployed.');
                reject(Error('No contract address found.'));
              }

              let result = {
                owner:account,
                transactionHash: transactionHash,
                gas: gasAmount,
                gasPrice: fromJSON.gasPrice,
                contract: {
                  file: contractFile,
                  address: contractAddress,
                  abi: abi
                },
                accountToKey: {}
              };

              let ganacheState = server.provider.manager.state;
              let ganacheAccounts = ganacheState.accounts;
              let ganacheAddresses = Object.keys(ganacheAccounts);
              ganacheAddresses.forEach(function(address, index) {
                let key = '0x' + ganacheAccounts[address].secretKey.toString("hex").toLowerCase();
                result.accountToKey[address] = key;
              });
              resolve(result);
            });
          });
        });
    });
  });
};

exports.closeWeb3 = () => {
  server.close();
  console.log("Ganache node stops.");
};

/**
 * Returns an array with all the test accounts encapsulated in the given deploy report.
 *
 * @param deployReport the involved deploy report.
 * @returns {string[]} all the accounts from the given deploy report.
 */
exports.getAllAccounts = function(deployReport) {
  return Object.keys(deployReport.accountToKey);
}

/**
 * Proves if a given account exists or not in in the given deploy report.
 *
 * @param deployReport the involved deploy report.
 * @param account {string} the account presence to be proven.
 * @returns {boolean} true if the given account exists in the deploy report.
 */
exports.accountExist = function(deployReport, account) {
  // use _ for contains prove
  return Object.keys(deployReport.accountToKey).indexOf(account) != -1;
}

/**
 * Returns the private key for the given account.
 * If the account is not preset in the given deploy report then this method retuns undefined.
 *
 * @param deployReport the involved deploy report.
 * @param account {string} the account to be serached.
 * @returns {string} the private key associated to the given account or undefined
 * if the deploy report does not contains the given account.
 */
exports.getKey = function(deployReport, account) {
  return deployReport.accountToKey[account];
}

/**
 * Returns the private key associated to the owner.
 *
 * @param deployReport the involved deploy report.
 * @returns {string} the private key associated to the owner account.
 */
exports.getKeyForOwner = function(deployReport) {
  return getKey(deployReport, deployReport.owner);
}

/**
 * Encodes a method call for a given contract.
 *
 * @param web3 the involved web3 instance.
 * @param abi the contract ABI.
 * @param methodName the method name to be call.
 * @param args the arguments for the method, empty array for no arguments.
 * @returns {string} the encoded method call.
 */
function encodeFunctionCall(web3, abi, methodName, args) {
  const methodAbi = web3.utils._.find(abi, function (item) { return item.name === methodName;});
  return web3.eth.abi.encodeFunctionCall(methodAbi, args);
}

/**
 * Calls a method on the given contract and returns its results.
 *
 * @param web3 the involved web3 instance.
 * @param abi the contract ABI.
 * @param methodName the method name to be call.
 * @param args the arguments for the method, empty array for no arguments.
 * @param sender actor that call the method.
 * @param contractAddress the contract address.
 * @returns {Promise<string>} the method result as promise.
 */
exports.callMethod = async function(web3, abi, methodName, args, sender, contractAddress) {
  const transaction = {
    data: encodeFunctionCall(web3, abi, methodName, args),
    from: sender,
    gasPrice: '200000000000',
    to: contractAddress,
    value: 0
  };
  const gas = await web3.eth.estimateGas(transaction);
  transaction.gas = gas;
  return web3.eth.call(transaction);
}

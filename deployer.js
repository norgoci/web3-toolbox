const ganache = require('ganache-cli');
const server = ganache.server();
const fs = require('fs');
const solc = require('solc');
const Web3 = require('web3');

exports.buildABI = function(contractFile) {
  let contractMeta = solveContract(contractFile);
  return contractMeta.abi;
};

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


exports.deploy = function(port, contractFile, gasPrice) {
  if (!fs.existsSync(contractFile)) {
    throw Error("Can not read the contract file.");
  }

  server.listen(port);
  let web3URL = 'http://localhost:' + port;
  let web3 = new Web3(new Web3.providers.HttpProvider(web3URL));
  console.log('Ganache runs on : %s', web3URL);
  let eth = web3.eth;

  return new Promise(function(resolve, reject) {
      let accounts = eth.getAccounts().then(function(accounts) {
      if (!accounts || accounts.length < 1) {
        console.error('No accounts are available, the contract %s *WAS NOT* deployed.', contractFile);
        reject(Error('No accounts are available.'));
      }

      let contractMeta = solveContract(contractFile);
      let bytecode = contractMeta.bytecode;
      let abi = contractMeta.abi;

      new eth.Contract(abi).deploy({data: bytecode})
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
            data: bytecode
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

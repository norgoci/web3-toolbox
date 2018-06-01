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


exports.deploy = function(port, contractFile) {
  if (!fs.existsSync(contractFile)) {
    throw Error("Can not read the contract file.");
  }

  server.listen(port);
  let web3URL = 'http://localhost:' + port;
  let web3 = new Web3(new Web3.providers.HttpProvider(web3URL));
  console.log('Listen to : %s', web3URL);
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

          let account = accounts[0];
          let fromJSON = {
            from: account,
            gas: gasAmount,
            gasPrice: '30000000000000'
          };
          
          // // TODO: find a better way to pile the estimated gas
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

            resolve([account, transactionHash, gasAmount, contractFile]);
          });
      });
    });
  });
};

exports.closeWeb3 = () => {
  server.close();
  console.log("Web3 connection is closed.");
};

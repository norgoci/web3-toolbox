const ganache = require('ganache-cli');
const server = ganache.server();
const fs = require('fs');
const solc = require('solc');
const Web3 = require('web3');


exports.buildABI = function(contractFile) {
  let input = fs.readFileSync(contractFile);
  let output = solc.compile(input.toString(), 1);
  let contractKey = Object.keys(output.contracts)[0];
  let bytecode = output.contracts[contractKey].bytecode;
  let abi = JSON.parse(output.contracts[contractKey].interface);
  return abi;
};

exports.deploy = function(port, contractFile) {
  server.listen(port);
  let web3URL = 'http://localhost:' + port;
  let web3 = new Web3(new Web3.providers.HttpProvider(web3URL));
  console.log('Listen to : %s', web3URL);
  let eth = web3.eth;
  return new Promise(function(resolve, reject) {
      let accounts = eth.getAccounts().then(function(accounts) {
      if (!accounts) {
        console.error('No accounts are available, the contract %s was not deployed.', contractFile);
        reject(error);
      } 

      let account = accounts[0];
      console.log('The contract owner is %s.', account);
      let input = fs.readFileSync(contractFile);
      let output = solc.compile(input.toString(), 1);
      let contractKey = Object.keys(output.contracts)[0];
      let bytecode = output.contracts[contractKey].bytecode;
      let abi = JSON.parse(output.contracts[contractKey].interface);
      let fromJSON = {
        from: account,
        gas: 1500000,
        gasPrice: '30000000000000'
      };

      let contract = new eth.Contract(abi).deploy({
        data: bytecode
      }).send(fromJSON, function(error, transactionHash) {
        if (error) {
          console.error(error);
          reject(error);
        }

        if (!transactionHash) {
          console.error('The contract %s was not deployed on the account %s.', contractFile, account);
          reject(Error('The contract was not deploye'));
        }

        resolve([account, transactionHash, contractFile]);
      });
    });
  });
};



exports.closeWeb3 = () => {
  server.close();
  console.log("Web3 connection is closed.");
};

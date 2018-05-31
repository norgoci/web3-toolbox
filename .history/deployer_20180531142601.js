const ganache = require('ganache-cli');
const server = ganache.server();
const fs = require('fs');
const solc = require('solc');
const Web3 = require('web3');


exports.buildABI = function(contractFile) {
  const input = fs.readFileSync(contractFile);
  const output = solc.compile(input.toString(), 1);
  const contractKey = Object.keys(output.contracts)[0];
  const bytecode = output.contracts[contractKey].bytecode;
  const abi = JSON.parse(output.contracts[contractKey].interface);

  return abi;
};

exports.deploy = function(port, contractFile) {
  server.listen(port);
  const web3URL = 'http://localhost:' + port;
  const web3 = new Web3(new Web3.providers.HttpProvider(web3URL));
  console.log("Listen to : %s", web3URL);
  const eth = web3.eth;
  return new Promise(function(resolve, reject) {
      let accounts = eth.getAccounts().then(function(accounts) {
      let account = accounts[0];
      console.log('Contract is deploy on %s', account);
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

        console.log("Contract %s was deployed with transaction %s", contractFile, transactionHash);
          resolve(transactionHash);
      });
    });
  });
};



exports.closeWeb3 = () => {
  server.close();
  console.log("Web3 connection is closed.");
};

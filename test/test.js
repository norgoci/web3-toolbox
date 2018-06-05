const assert = require('assert');
const deployer = require('../index');
const Web3 = require('web3');
const web3 = new Web3(new Web3.providers.HttpProvider('http://localhost:8545'));
const eth = web3.eth;

describe('test deployer', function() {

  // the deploy report with all the needed information
  // (e.g. contract abi or address).
  // if this is undefined then the contract was not deployed
  var deployReport;

  // starts the ganache, copile and deploys the given contract.
  // as result a deploy report is published.
  // the report contains contract related details as its address, its owner
  // or its abi.
  before(async function() {
    this.timeout(10000);
    deployReport = await deployer.deploy('contract.sol');
    assert(deployReport, 'The contract deploy report is undefined.');
    assert(deployReport.owner, 'The contract ownwer is undefined.');
    assert(deployReport.transactionHash, 'The contract deploy transaction hash is undefined.');
    assert(deployReport.gas, 'The contract deploy transation gas value is undefined.');
    assert(deployReport.gasPrice, 'The contract deploy transation gas price is undefined.');
    assert(deployReport.contract, 'The contract metadata is undefined.');
    assert(deployReport.contract.file, 'The contract file is undefined.');
    assert(deployReport.contract.abi, 'The contract file is undefined.');
    assert(deployReport.contract.address, 'The contract file is undefined.');
    assert(deployReport.accountToKey, 'The accounts to key mapping can is undefined.');

    let accountToKey = deployReport.accountToKey;
    let accounts = Object.keys(accountToKey);
    assert.equal(10, accounts.length, 'Ten accounts expected');
  });

  // closes the ganache server.
  after(function() {
    deployer.close();
  });

  // invoke a method on the cntract and prove if the result is the expected one.
  it('invoke contract', async function () {
      this.timeout(10000);
      const abi = deployReport.contract.abi;
      const contractAddress = deployReport.contract.address;
      const contract =  new eth.Contract(abi, contractAddress);
      const solution = await contract.methods.getSolution().call();
      assert(solution, 'The contract method can not be invoked');
      assert.equal('42', solution, 'The contract answers with wrong value.');
  });
});

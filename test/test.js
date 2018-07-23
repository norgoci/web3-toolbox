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
    deployReport = await deployer.runAndDeploy('contract.sol');
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

    let allAccounts = deployer.getAllAccounts(deployReport);
    assert.equal(10, allAccounts.length, 'Ten accounts expected');
  });

  // closes the ganache server.
  after(function() {
    deployer.close();
  });

  // invoke a method on the cntract and prove if the result is the expected one.
  it('invoke contract default sender', async function () {
      this.timeout(10000);
      const abi = deployReport.contract.abi;
      const contractAddress = deployReport.contract.address;
      const contract =  new eth.Contract(abi, contractAddress);
      const solution = await contract.methods.getSolution().call();

      assert(solution, 'The contract method can not be invoked');
      assert.equal('42', solution, 'The contract answers with wrong value.');
  });

  it('invoke contract owner as sender', async function () {
    this.timeout(10000);
    const abi = deployReport.contract.abi;
    const contractAddress = deployReport.contract.address;
    const contract =  new eth.Contract(abi, contractAddress);
    const sender = deployReport.owner;
    const solution = await contract.methods.getSolution().call({from: sender});

    assert(solution, 'The contract method can not be invoked');
    assert.equal('42', solution, 'The contract answers with wrong value.');
  });

  it('send transaction with owner as sender', async function () {
    this.timeout(10000);
    const abi = deployReport.contract.abi;
    const contractAddress = deployReport.contract.address;
    const sender = deployReport.owner;
    // calls the method getSolution with no arguments, the method caller is the owner
    const solution = await deployer.callMethod(web3, abi, 'getSolution', [], sender, contractAddress);
    assert(solution, 'The method result can not be undefined.');
    // 0x....2a == 42, trust me :)
    assert.equal('0x000000000000000000000000000000000000000000000000000000000000002a', solution, 'The contract answers with wrong value.');
  });

  it('test account exist', async function () {
    const owner = deployReport.owner;
    var accountExist = deployer.accountExist(deployReport, owner);
    assert(accountExist, 'The owner account can not be undefined.');
  });

  it('test get key', async function () {
    const owner = deployReport.owner;
    const ownerKey = deployer.getKey(deployReport, owner);
    assert(ownerKey, 'The owner private key can not be undefined.');
    var keyForOwner = deployer.getKeyForOwner(deployReport);
    assert(keyForOwner, 'The owner private key can not be undefined.');
  });
});

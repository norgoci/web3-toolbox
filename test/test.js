const assert = require('assert');
const deployer = require('../index');
const Web3 = require('web3');
const web3 = new Web3(new Web3.providers.HttpProvider('http://localhost:8545'));
const eth = web3.eth;


describe('test deployer', function() {

  it('deploy, invoke contract and close', async function () {
      this.timeout(10000);
      const deployReport = await deployer.deploy('contract.sol');
      assert(deployReport, 'The contract deploy report is undefined.');
      assert(deployReport.owner, 'The contract ownwer is undefined.');
      assert(deployReport.transactionHash, 'The contract deploy transaction hash is undefined.');
      assert(deployReport.gas, 'The contract deploy transation gas value is undefined.');
      assert(deployReport.contract, 'The contract metadata is undefined.');
      assert(deployReport.contract.file, 'The contract file is undefined.');
      assert(deployReport.contract.abi, 'The contract file is undefined.');
      assert(deployReport.contract.address, 'The contract file is undefined.');

      const abi = deployReport.contract.abi;
      const contractAddress = deployReport.contract.address;
      const contract =  new eth.Contract(abi, contractAddress);
      const solution = await contract.methods.getSolution().call();
      assert(solution, 'The contract method can not be invoked');
      assert.equal('42', solution, 'The contract answers with wrong value.');

      deployer.close();
  });
});

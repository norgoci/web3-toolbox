declare module "web3-toolbox" {

  /**
   * Used to describe the environment for a single contract.
   */
  interface Configuration {

    /**
     * The address for the contract owner.
     */
    owner: string;

    /**
     * The transaction hash for the transaction that deploys the contract, this property is optional.
     */
    transactionHash?: string;

    /**
     * The amount of gas used to deploy the contract, this property is optional.
     */
    gas?: number;

    /**
     * The gas price, this property is optional.
     */
    gasPrice?: string;

    /**
     * Used to describe the contract.
     */
    contract: ContractConfiguration;

    /**
     * A map where like keys are accounts addresses and as value the corresponding private key.
     */
    accountToKey: KeyConfiguration;
  }

  /**
   * Used to describe a single contract.
   */
  interface ContractConfiguration {

    /**
     * The address where the contract is deployed.
     */
    address: string;

    /**
     * The ABI for the contract.
     */
    abi: any[];

    /**
     * The solidity file, optional.
     */
    file?: string;
  }

  /**
   * A map where like keys are accounts addresses and as value the corresponding private key.
   */
  interface KeyConfiguration {
    [key: string]: string;
  }

  export function buildABI(contractFile: string): any[];

  export function runAndDeploy(contractFile: string,
                               contractArguments: any[],
                               gasPrice: string,
                               gas: number,
                               port: number | 8545,
                               protocol: string | 'http'): Promise<Configuration>;

  // todo use a WEB3 type
  export function start(host: string | 'localhost',
                        port: number | 8545,
                        protocol :string | 'http'): any;

  export function deploy(web3: any,
                         contractFile: string,
                         contractArguments: any[],
                         gasPrice: string | '0'): Promise<Configuration>;

  export function close(): void;
}
import Web3 from 'web3'
import { Contract } from 'web3-eth-contract'
const erc20FactoryABI = [
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'address',
        name: 'previousOwner',
        type: 'address',
      },
      {
        indexed: true,
        internalType: 'address',
        name: 'newOwner',
        type: 'address',
      },
    ],
    name: 'OwnershipTransferred',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'address',
        name: 'series',
        type: 'address',
      },
      {
        indexed: false,
        internalType: 'address',
        name: 'value',
        type: 'address',
      },
    ],
    name: 'TokenCreated',
    type: 'event',
  },
  {
    inputs: [],
    name: 'owner',
    outputs: [
      {
        internalType: 'address',
        name: '',
        type: 'address',
      },
    ],
    stateMutability: 'view',
    type: 'function',
    constant: true,
  },
  {
    inputs: [],
    name: 'renounceOwnership',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: 'newOwner',
        type: 'address',
      },
    ],
    name: 'transferOwnership',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: 'token',
        type: 'address',
      },
      {
        internalType: 'address[]',
        name: 'previousSeries',
        type: 'address[]',
      },
      {
        internalType: 'address[]',
        name: 'previousTokens',
        type: 'address[]',
      },
    ],
    name: 'initialize',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: 'newAddress',
        type: 'address',
      },
    ],
    name: 'updateTokenContract',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: 'newAddress',
        type: 'address',
      },
    ],
    name: 'updateRegistryContract',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'uint256',
        name: '_supply',
        type: 'uint256',
      },
      {
        internalType: 'string',
        name: '_name',
        type: 'string',
      },
      {
        internalType: 'string',
        name: '_symbol',
        type: 'string',
      },
      {
        internalType: 'address',
        name: '_series',
        type: 'address',
      },
    ],
    name: 'createERC20',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
]

export default {
  addresses: {
    private: '0x0826fD5FC8E2dB19b0A1d40e619295F6D65D9c76',
    ropsten: '0xC144f588C813a7BC74C4EC0c83Fbe111E6F87103',
    // main: '0xA9fEFffa8026a259109c322e7351F6C5cbf3CBd8',
  },
  abi: erc20FactoryABI,
  getContract: function (network = 'ropsten'): Contract {
    const web3: Web3 = window.web3
    return new web3.eth.Contract(this.abi, this.addresses[network]) // web3.eth.contract(this.abi).at(this.addresses[network]);
  },
}

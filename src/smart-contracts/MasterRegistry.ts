import Web3 from 'web3'
import { Contract } from 'web3-eth-contract'
const MasterRegistryABI = [
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
        indexed: true,
        internalType: 'uint16',
        name: 'key',
        type: 'uint16',
      },
      {
        indexed: false,
        internalType: 'string',
        name: 'value',
        type: 'string',
      },
    ],
    name: 'ContentChanged',
    type: 'event',
  },
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
        indexed: true,
        internalType: 'uint16',
        name: 'key',
        type: 'uint16',
      },
      {
        indexed: false,
        internalType: 'address',
        name: 'value',
        type: 'address',
      },
    ],
    name: 'RecordChanged',
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
        name: 'series',
        type: 'address',
      },
      {
        internalType: 'uint16',
        name: 'key',
        type: 'uint16',
      },
      {
        internalType: 'address',
        name: 'value',
        type: 'address',
      },
    ],
    name: 'setRecord',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: 'series',
        type: 'address',
      },
      {
        internalType: 'uint16',
        name: 'key',
        type: 'uint16',
      },
    ],
    name: 'getRecord',
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
    inputs: [
      {
        internalType: 'address',
        name: 'series',
        type: 'address',
      },
      {
        internalType: 'uint16',
        name: 'key',
        type: 'uint16',
      },
      {
        internalType: 'string',
        name: 'value',
        type: 'string',
      },
    ],
    name: 'setContent',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: 'series',
        type: 'address',
      },
      {
        internalType: 'uint16',
        name: 'key',
        type: 'uint16',
      },
    ],
    name: 'getContent',
    outputs: [
      {
        internalType: 'string',
        name: '',
        type: 'string',
      },
    ],
    stateMutability: 'view',
    type: 'function',
    constant: true,
  },
  {
    inputs: [
      {
        internalType: 'uint16',
        name: 'pluginID',
        type: 'uint16',
      },
      {
        internalType: 'address',
        name: 'pluginAddress',
        type: 'address',
      },
    ],
    name: 'setPluginController',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
]

export default {
  addresses: {
    private: '0x0826fD5FC8E2dB19b0A1d40e619295F6D65D9c76',
    ropsten: '0x7149583ff02E51B2aa5A97525Ca3040A04a6E8a8',
    main: '0x54dED98a6720EcEAA54EB0F858c81737CDe9FF9E',
  },
  abi: MasterRegistryABI,
  getContract: function (network = 'ropsten'): Contract {
    const web3: Web3 = window.web3
    return new web3.eth.Contract(this.abi, this.addresses[network]) // web3.eth.contract(this.abi).at(this.addresses[network]);
  },
}

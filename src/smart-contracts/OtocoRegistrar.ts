import Web3 from 'web3'
import { Contract } from 'web3-eth-contract'
const FIFSRegistrarAbi = [
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
        internalType: 'string',
        name: 'value',
        type: 'string',
      },
    ],
    name: 'NameClaimed',
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
        internalType: 'contract ENS',
        name: 'ensAddr',
        type: 'address',
      },
      {
        internalType: 'contract Resolver',
        name: 'resolverAddr',
        type: 'address',
      },
      {
        internalType: 'bytes32',
        name: 'node',
        type: 'bytes32',
      },
      {
        internalType: 'address[]',
        name: 'previousSeries',
        type: 'address[]',
      },
      {
        internalType: 'bytes32[]',
        name: 'previousDomains',
        type: 'bytes32[]',
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
        internalType: 'bytes32',
        name: 'label',
        type: 'bytes32',
      },
      {
        internalType: 'address',
        name: 'owner',
        type: 'address',
      },
      {
        internalType: 'address',
        name: 'addr',
        type: 'address',
      },
    ],
    name: 'register',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'string',
        name: 'domain',
        type: 'string',
      },
      {
        internalType: 'contract OwnableUpgradeable',
        name: 'target',
        type: 'address',
      },
      {
        internalType: 'address',
        name: 'addr',
        type: 'address',
      },
    ],
    name: 'registerAndStore',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: 'addr',
        type: 'address',
      },
      {
        internalType: 'uint8',
        name: 'index',
        type: 'uint8',
      },
    ],
    name: 'resolve',
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
        internalType: 'address',
        name: 'addr',
        type: 'address',
      },
    ],
    name: 'ownedDomains',
    outputs: [
      {
        internalType: 'uint256',
        name: '',
        type: 'uint256',
      },
    ],
    stateMutability: 'view',
    type: 'function',
    constant: true,
  },
  {
    inputs: [
      {
        internalType: 'bytes32',
        name: '_bytes32',
        type: 'bytes32',
      },
    ],
    name: 'bytes32ToString',
    outputs: [
      {
        internalType: 'string',
        name: '',
        type: 'string',
      },
    ],
    stateMutability: 'pure',
    type: 'function',
    constant: true,
  },
]

const PublicResolverAbi = [
  {
    inputs: [{ internalType: 'contract ENS', name: '_ens', type: 'address' }],
    payable: false,
    stateMutability: 'nonpayable',
    type: 'constructor',
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: 'bytes32', name: 'node', type: 'bytes32' },
      {
        indexed: true,
        internalType: 'uint256',
        name: 'contentType',
        type: 'uint256',
      },
    ],
    name: 'ABIChanged',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: 'bytes32', name: 'node', type: 'bytes32' },
      { indexed: false, internalType: 'address', name: 'a', type: 'address' },
    ],
    name: 'AddrChanged',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: 'bytes32', name: 'node', type: 'bytes32' },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'coinType',
        type: 'uint256',
      },
      {
        indexed: false,
        internalType: 'bytes',
        name: 'newAddress',
        type: 'bytes',
      },
    ],
    name: 'AddressChanged',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: 'bytes32', name: 'node', type: 'bytes32' },
      {
        indexed: true,
        internalType: 'address',
        name: 'owner',
        type: 'address',
      },
      {
        indexed: true,
        internalType: 'address',
        name: 'target',
        type: 'address',
      },
      {
        indexed: false,
        internalType: 'bool',
        name: 'isAuthorised',
        type: 'bool',
      },
    ],
    name: 'AuthorisationChanged',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: 'bytes32', name: 'node', type: 'bytes32' },
      { indexed: false, internalType: 'bytes', name: 'hash', type: 'bytes' },
    ],
    name: 'ContenthashChanged',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: 'bytes32', name: 'node', type: 'bytes32' },
      { indexed: false, internalType: 'bytes', name: 'name', type: 'bytes' },
      {
        indexed: false,
        internalType: 'uint16',
        name: 'resource',
        type: 'uint16',
      },
      { indexed: false, internalType: 'bytes', name: 'record', type: 'bytes' },
    ],
    name: 'DNSRecordChanged',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: 'bytes32', name: 'node', type: 'bytes32' },
      { indexed: false, internalType: 'bytes', name: 'name', type: 'bytes' },
      {
        indexed: false,
        internalType: 'uint16',
        name: 'resource',
        type: 'uint16',
      },
    ],
    name: 'DNSRecordDeleted',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: 'bytes32', name: 'node', type: 'bytes32' },
    ],
    name: 'DNSZoneCleared',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: 'bytes32', name: 'node', type: 'bytes32' },
      {
        indexed: true,
        internalType: 'bytes4',
        name: 'interfaceID',
        type: 'bytes4',
      },
      {
        indexed: false,
        internalType: 'address',
        name: 'implementer',
        type: 'address',
      },
    ],
    name: 'InterfaceChanged',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: 'bytes32', name: 'node', type: 'bytes32' },
      { indexed: false, internalType: 'string', name: 'name', type: 'string' },
    ],
    name: 'NameChanged',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: 'bytes32', name: 'node', type: 'bytes32' },
      { indexed: false, internalType: 'bytes32', name: 'x', type: 'bytes32' },
      { indexed: false, internalType: 'bytes32', name: 'y', type: 'bytes32' },
    ],
    name: 'PubkeyChanged',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: 'bytes32', name: 'node', type: 'bytes32' },
      {
        indexed: true,
        internalType: 'string',
        name: 'indexedKey',
        type: 'string',
      },
      { indexed: false, internalType: 'string', name: 'key', type: 'string' },
    ],
    name: 'TextChanged',
    type: 'event',
  },
  {
    constant: true,
    inputs: [
      { internalType: 'bytes32', name: 'node', type: 'bytes32' },
      { internalType: 'uint256', name: 'contentTypes', type: 'uint256' },
    ],
    name: 'ABI',
    outputs: [
      { internalType: 'uint256', name: '', type: 'uint256' },
      { internalType: 'bytes', name: '', type: 'bytes' },
    ],
    payable: false,
    stateMutability: 'view',
    type: 'function',
  },
  {
    constant: true,
    inputs: [{ internalType: 'bytes32', name: 'node', type: 'bytes32' }],
    name: 'addr',
    outputs: [{ internalType: 'address payable', name: '', type: 'address' }],
    payable: false,
    stateMutability: 'view',
    type: 'function',
  },
  {
    constant: true,
    inputs: [
      { internalType: 'bytes32', name: 'node', type: 'bytes32' },
      { internalType: 'uint256', name: 'coinType', type: 'uint256' },
    ],
    name: 'addr',
    outputs: [{ internalType: 'bytes', name: '', type: 'bytes' }],
    payable: false,
    stateMutability: 'view',
    type: 'function',
  },
  {
    constant: true,
    inputs: [
      { internalType: 'bytes32', name: '', type: 'bytes32' },
      { internalType: 'address', name: '', type: 'address' },
      { internalType: 'address', name: '', type: 'address' },
    ],
    name: 'authorisations',
    outputs: [{ internalType: 'bool', name: '', type: 'bool' }],
    payable: false,
    stateMutability: 'view',
    type: 'function',
  },
  {
    constant: false,
    inputs: [{ internalType: 'bytes32', name: 'node', type: 'bytes32' }],
    name: 'clearDNSZone',
    outputs: [],
    payable: false,
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    constant: true,
    inputs: [{ internalType: 'bytes32', name: 'node', type: 'bytes32' }],
    name: 'contenthash',
    outputs: [{ internalType: 'bytes', name: '', type: 'bytes' }],
    payable: false,
    stateMutability: 'view',
    type: 'function',
  },
  {
    constant: true,
    inputs: [
      { internalType: 'bytes32', name: 'node', type: 'bytes32' },
      { internalType: 'bytes32', name: 'name', type: 'bytes32' },
      { internalType: 'uint16', name: 'resource', type: 'uint16' },
    ],
    name: 'dnsRecord',
    outputs: [{ internalType: 'bytes', name: '', type: 'bytes' }],
    payable: false,
    stateMutability: 'view',
    type: 'function',
  },
  {
    constant: true,
    inputs: [
      { internalType: 'bytes32', name: 'node', type: 'bytes32' },
      { internalType: 'bytes32', name: 'name', type: 'bytes32' },
    ],
    name: 'hasDNSRecords',
    outputs: [{ internalType: 'bool', name: '', type: 'bool' }],
    payable: false,
    stateMutability: 'view',
    type: 'function',
  },
  {
    constant: true,
    inputs: [
      { internalType: 'bytes32', name: 'node', type: 'bytes32' },
      { internalType: 'bytes4', name: 'interfaceID', type: 'bytes4' },
    ],
    name: 'interfaceImplementer',
    outputs: [{ internalType: 'address', name: '', type: 'address' }],
    payable: false,
    stateMutability: 'view',
    type: 'function',
  },
  {
    constant: false,
    inputs: [{ internalType: 'bytes[]', name: 'data', type: 'bytes[]' }],
    name: 'multicall',
    outputs: [{ internalType: 'bytes[]', name: 'results', type: 'bytes[]' }],
    payable: false,
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    constant: true,
    inputs: [{ internalType: 'bytes32', name: 'node', type: 'bytes32' }],
    name: 'name',
    outputs: [{ internalType: 'string', name: '', type: 'string' }],
    payable: false,
    stateMutability: 'view',
    type: 'function',
  },
  {
    constant: true,
    inputs: [{ internalType: 'bytes32', name: 'node', type: 'bytes32' }],
    name: 'pubkey',
    outputs: [
      { internalType: 'bytes32', name: 'x', type: 'bytes32' },
      { internalType: 'bytes32', name: 'y', type: 'bytes32' },
    ],
    payable: false,
    stateMutability: 'view',
    type: 'function',
  },
  {
    constant: false,
    inputs: [
      { internalType: 'bytes32', name: 'node', type: 'bytes32' },
      { internalType: 'uint256', name: 'contentType', type: 'uint256' },
      { internalType: 'bytes', name: 'data', type: 'bytes' },
    ],
    name: 'setABI',
    outputs: [],
    payable: false,
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    constant: false,
    inputs: [
      { internalType: 'bytes32', name: 'node', type: 'bytes32' },
      { internalType: 'uint256', name: 'coinType', type: 'uint256' },
      { internalType: 'bytes', name: 'a', type: 'bytes' },
    ],
    name: 'setAddr',
    outputs: [],
    payable: false,
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    constant: false,
    inputs: [
      { internalType: 'bytes32', name: 'node', type: 'bytes32' },
      { internalType: 'address', name: 'a', type: 'address' },
    ],
    name: 'setAddr',
    outputs: [],
    payable: false,
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    constant: false,
    inputs: [
      { internalType: 'bytes32', name: 'node', type: 'bytes32' },
      { internalType: 'address', name: 'target', type: 'address' },
      { internalType: 'bool', name: 'isAuthorised', type: 'bool' },
    ],
    name: 'setAuthorisation',
    outputs: [],
    payable: false,
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    constant: false,
    inputs: [
      { internalType: 'bytes32', name: 'node', type: 'bytes32' },
      { internalType: 'bytes', name: 'hash', type: 'bytes' },
    ],
    name: 'setContenthash',
    outputs: [],
    payable: false,
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    constant: false,
    inputs: [
      { internalType: 'bytes32', name: 'node', type: 'bytes32' },
      { internalType: 'bytes', name: 'data', type: 'bytes' },
    ],
    name: 'setDNSRecords',
    outputs: [],
    payable: false,
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    constant: false,
    inputs: [
      { internalType: 'bytes32', name: 'node', type: 'bytes32' },
      { internalType: 'bytes4', name: 'interfaceID', type: 'bytes4' },
      { internalType: 'address', name: 'implementer', type: 'address' },
    ],
    name: 'setInterface',
    outputs: [],
    payable: false,
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    constant: false,
    inputs: [
      { internalType: 'bytes32', name: 'node', type: 'bytes32' },
      { internalType: 'string', name: 'name', type: 'string' },
    ],
    name: 'setName',
    outputs: [],
    payable: false,
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    constant: false,
    inputs: [
      { internalType: 'bytes32', name: 'node', type: 'bytes32' },
      { internalType: 'bytes32', name: 'x', type: 'bytes32' },
      { internalType: 'bytes32', name: 'y', type: 'bytes32' },
    ],
    name: 'setPubkey',
    outputs: [],
    payable: false,
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    constant: false,
    inputs: [
      { internalType: 'bytes32', name: 'node', type: 'bytes32' },
      { internalType: 'string', name: 'key', type: 'string' },
      { internalType: 'string', name: 'value', type: 'string' },
    ],
    name: 'setText',
    outputs: [],
    payable: false,
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    constant: true,
    inputs: [{ internalType: 'bytes4', name: 'interfaceID', type: 'bytes4' }],
    name: 'supportsInterface',
    outputs: [{ internalType: 'bool', name: '', type: 'bool' }],
    payable: false,
    stateMutability: 'pure',
    type: 'function',
  },
  {
    constant: true,
    inputs: [
      { internalType: 'bytes32', name: 'node', type: 'bytes32' },
      { internalType: 'string', name: 'key', type: 'string' },
    ],
    name: 'text',
    outputs: [{ internalType: 'string', name: '', type: 'string' }],
    payable: false,
    stateMutability: 'view',
    type: 'function',
  },
]

const ReverseRegistrarAbi = [
  {
    inputs: [
      { internalType: 'contract ENS', name: 'ensAddr', type: 'address' },
      {
        internalType: 'contract Resolver',
        name: 'resolverAddr',
        type: 'address',
      },
    ],
    payable: false,
    stateMutability: 'nonpayable',
    type: 'constructor',
  },
  {
    constant: true,
    inputs: [],
    name: 'ADDR_REVERSE_NODE',
    outputs: [{ internalType: 'bytes32', name: '', type: 'bytes32' }],
    payable: false,
    stateMutability: 'view',
    type: 'function',
  },
  {
    constant: false,
    inputs: [{ internalType: 'address', name: 'owner', type: 'address' }],
    name: 'claim',
    outputs: [{ internalType: 'bytes32', name: '', type: 'bytes32' }],
    payable: false,
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    constant: false,
    inputs: [
      { internalType: 'address', name: 'owner', type: 'address' },
      { internalType: 'address', name: 'resolver', type: 'address' },
    ],
    name: 'claimWithResolver',
    outputs: [{ internalType: 'bytes32', name: '', type: 'bytes32' }],
    payable: false,
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    constant: true,
    inputs: [],
    name: 'defaultResolver',
    outputs: [{ internalType: 'contract Resolver', name: '', type: 'address' }],
    payable: false,
    stateMutability: 'view',
    type: 'function',
  },
  {
    constant: true,
    inputs: [],
    name: 'ens',
    outputs: [{ internalType: 'contract ENS', name: '', type: 'address' }],
    payable: false,
    stateMutability: 'view',
    type: 'function',
  },
  {
    constant: true,
    inputs: [{ internalType: 'address', name: 'addr', type: 'address' }],
    name: 'node',
    outputs: [{ internalType: 'bytes32', name: '', type: 'bytes32' }],
    payable: false,
    stateMutability: 'pure',
    type: 'function',
  },
  {
    constant: false, // 7
    inputs: [{ internalType: 'string', name: 'name', type: 'string' }],
    name: 'setName',
    outputs: [{ internalType: 'bytes32', name: '', type: 'bytes32' }],
    payable: false,
    stateMutability: 'nonpayable',
    type: 'function',
  },
]

export default {
  addresses: {
    dev: '',
    ropsten: '0xbB460dEb628095f88E60B7Cc3979b97A5B52aB8e',
    // main: '0xB1845524fA2852BD5459DC3aF4e5E75d5269d826',
  },
  resolvers: {
    ropsten: '0x42D63ae25990889E35F215bC95884039Ba354115',
    main: '0x4976fb03C32e5B8cfe2b6cCB31c09Ba78EBaBa41',
  },
  reverseRegistrars: {
    ropsten: '0x6F628b68b30Dc3c17f345c9dbBb1E483c2b7aE5c',
    main: '0x084b1c3C81545d370f3634392De611CaaBFf8148',
  },
  abi: FIFSRegistrarAbi,
  resolverAbi: PublicResolverAbi,
  reverseAbi: ReverseRegistrarAbi,
  getContract: function (address: string): Contract {
    const web3: Web3 = window.web3
    return new web3.eth.Contract(this.abi, this.addresses[address])
  },
  getResolver: function (network = 'ropsten'): Contract {
    const web3: Web3 = window.web3
    return new web3.eth.Contract(this.resolverAbi, this.resolvers[network]) // web3.eth.contract(this.abi).at(this.addresses[network]);
  },
}

// OTOCO Node: 0xd60cd0a683332ca8ad4a4d342320945cb769f25760b42a21f2d88d3be25cc6aa
// NODES ARE CREATED USING namehash.hash(domain)
// LABELS ARE CREATED USING web3.sha3(label)
// console.log('label hash', web3.utils.sha3(label));
// console.log('namehash', namehash.hash(domain));

// ROPSTEN ENS = 0x00000000000C2E074eC69A0dFb2997BA6C7d2e1e
// ROPSTEN RESOLVER = 0x42D63ae25990889E35F215bC95884039Ba354115
// ROPSTEN REVERSE REGISTRAR = 0x6F628b68b30Dc3c17f345c9dbBb1E483c2b7aE5c

// MAIN ENS = 0x00000000000c2e074ec69a0dfb2997ba6c7d2e1e
// MAIN RESOLVER = 0x4976fb03C32e5B8cfe2b6cCB31c09Ba78EBaBa41
// MAIN REVERSE REGISTRAR = 0x084b1c3C81545d370f3634392De611CaaBFf8148

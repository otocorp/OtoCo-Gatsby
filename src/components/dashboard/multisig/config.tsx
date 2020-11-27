import React, { Dispatch, FC, useState } from 'react'
import Web3 from 'web3'
import axios from 'axios'
import { connect } from 'react-redux'
import Icon from '../../icon/icon'
import { faTimes } from '@fortawesome/free-solid-svg-icons'
import TransactionMonitor from '../../transactionMonitor/transactionMonitor'
import AddressWidget from '../../addressWidget/addressWidget'
import GnosisSafe from '../../../smart-contracts/GnosisSafe'
import MultisigFactory from '../../../smart-contracts/MultisigFactory'
import MasterRegistry from '../../../smart-contracts/MasterRegistry'
import {
  SET_MULTISIG_CONFIG,
  SET_MULTISIG_DEPLOYED,
  SeriesType,
  ManagementActionTypes,
  MultisigConfig,
} from '../../../state/management/types'
import { IState } from '../../../state/types'

interface Props {
  account?: string | null
  network?: string | null
  managing: SeriesType
  multisigConfig: MultisigConfig
  dispatch: Dispatch<ManagementActionTypes>
}

const Config: FC<Props> = ({
  account,
  network,
  managing,
  multisigConfig,
  dispatch,
}: Props) => {
  const [error, setError] = useState<string | null>(null)
  const [currentOwner, setCurrentOwner] = useState<string>('')
  const [owners, setOwners] = useState<string[]>([])
  const [threshold, setThreshold] = useState<number>(1)
  const [transaction, setTransaction] = useState<string | null>(null)

  const web3: Web3 = window.web3

  const ListOwners = () => {
    return owners.map((owner, idx) => (
      <div className="small" key={idx}>
        <div>
          {owner.substring(0, 12) +
            '...' +
            owner.substring(owner.length - 6, owner.length - 1)}
          <button
            className="btn btn-sm"
            onClick={handleRemoveOwner.bind(undefined, idx)}
          >
            <Icon icon={faTimes}>&#10005;</Icon>
          </button>
        </div>
      </div>
    ))
  }

  const handleOwnerInputChange = (event) => {
    setCurrentOwner(event.target.value.toLowerCase())
    setError(null)
  }

  const handleRemoveOwner = (idx: number) => {
    console.log('passou', idx)
    const owns = [...owners]
    owns.splice(idx, 1)
    setOwners(owns)
  }

  const handleThresholdChange = (event) => {
    setThreshold(event.target.value)
    setError(null)
  }

  const handleAddOwner = (event) => {
    if (!web3.utils.isAddress(currentOwner)) {
      setError('Owner selected isn`t a valid address.')
      return
    }
    if (owners.indexOf(currentOwner) >= 0) {
      setError('Owner already added.')
      return
    }
    const owns = owners
    owns.push(currentOwner)
    setOwners(owns)
    setCurrentOwner('')
  }

  const handleClickDeploy = async () => {
    if (threshold > owners.length) {
      setError('Threshold should not be bigger than owners quantity.')
      return
    }
    if (!network) return
    console.log('WILL SEND', owners, threshold)
    dispatch({
      type: SET_MULTISIG_CONFIG,
      payload: {
        owners,
        threshold: threshold.toString(),
      },
    })
    const requestInfo = { from: account, gas: 500000, gasPrice: '' }
    try {
      const gasFees = await axios.get(
        `https://ethgasstation.info/api/ethgasAPI.json`
      )
      requestInfo.gasPrice = web3.utils.toWei(
        (gasFees.data.fast * 0.1).toString(),
        'gwei'
      )
    } catch (err) {
      console.log('Could not fetch gas fee for transaction.')
    }
    try {
      const setupParametersEncoded = web3.eth.abi.encodeFunctionCall(
        GnosisSafe.abi[36], // Abi for Initialize wallet with Owners config
        [
          owners, // Array of owners
          threshold, // Threshold
          '0x0000000000000000000000000000000000000000',
          '0x0',
          '0x0000000000000000000000000000000000000000',
          '0x0000000000000000000000000000000000000000',
          0,
          '0x0000000000000000000000000000000000000000',
        ]
      )
      MultisigFactory.getContract(network)
        .methods.createMultisig(managing.contract, setupParametersEncoded)
        .send(requestInfo, (error, hash: string) => {
          console.log(hash)
          setTransaction(hash)
        })
    } catch (err) {
      console.log(err)
    }
  }

  const deployFinished = async () => {
    const multisigAddress = await MasterRegistry.getContract(network)
      .methods.getRecord(managing.contract, 2)
      .call({ from: account })
    if (multisigAddress === '0x0000000000000000000000000000000000000000') {
      return
    }
    setTransaction(null)
    dispatch({
      type: SET_MULTISIG_DEPLOYED,
      payload: {
        contract: multisigAddress,
        balances: {},
      },
    })
  }

  return (
    <div>
      <div className="small pb-2">
        Create a Gnosis-Safe Multisig wallet to store your company assets.
      </div>
      <div className="small pb-2">Insert some wallet owners:</div>
      {!transaction && (
        <div>
          <div className="row">
            <div className="mb-2 col-12">
              <ListOwners></ListOwners>
            </div>
            <div className="mb-2 col-12">
              {error && <p className="text-warning small">{error}</p>}
            </div>
          </div>
          <div className="row">
            <div className="input-group col-12 col-md-6">
              <input
                type="text"
                className="form-control right"
                placeholder="Paste a owner address to insert..."
                aria-label="Text input with button"
                onChange={handleOwnerInputChange}
              />
              <div className="input-group-append">
                <p className="btn btn-primary" onClick={handleAddOwner}>
                  Insert Owner
                </p>
              </div>
            </div>
          </div>
          <div className="row">
            <div className="input-group mb-2 col-12 col-md-6">
              <input
                type="text"
                className="form-control right"
                placeholder="Paste a owner address to insert..."
                aria-label="Text input with button"
                onChange={handleThresholdChange}
              />
              <div className="input-group-append">
                <p className="btn btn-primary disabled">Approval threshold</p>
              </div>
            </div>
          </div>
        </div>
      )}
      {!transaction && (
        <button className="btn btn-primary" onClick={handleClickDeploy}>
          Create Wallet
        </button>
      )}
      {transaction && (
        <TransactionMonitor
          hash={transaction}
          title="Creating Wallet"
          callbackSuccess={deployFinished}
        ></TransactionMonitor>
      )}
    </div>
  )
}

export default connect((state: IState) => ({
  account: state.account.account,
  network: state.account.network,
  managing: state.management.managing,
  multisigConfig: state.management.multisigConfig,
}))(Config)

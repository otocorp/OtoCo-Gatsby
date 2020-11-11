import React, { Dispatch, FC, useState } from 'react'
import ENS from 'ethereum-ens'
import Web3 from 'web3'
import axios from 'axios'
import OtocoRegistrar from '../../../smart-contracts/OtocoRegistrar'
import { connect } from 'react-redux'
import TransactionMonitor from '../../transactionMonitor/transactionMonitor'
import AddressWidget from '../../addressWidget/addressWidget'
import {
  SET_ENS_CONFIG,
  SeriesType,
  ENSConfig,
  ManagementActionTypes,
} from '../../../state/management/types'
import { IState } from '../../../state/types'

interface Props {
  account?: string | null
  network?: string | null
  managing?: SeriesType
  ensConfig?: ENSConfig
  dispatch: Dispatch<ManagementActionTypes>
}

const Config: FC<Props> = ({
  account,
  network,
  managing,
  ensConfig,
  dispatch,
}: Props) => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [domainOwner, setDomainOwner] = useState<string | null>(null)
  const [selectedName, setSelectedName] = useState<string | undefined>(
    undefined
  )
  const [selectedDomain, setSelectedDomain] = useState<string>('otoco.eth')
  const [transaction, setTransaction] = useState<string | null>(null)
  const [status, setStatus] = useState<
    'start' | 'typing' | 'used' | 'available' | 'claiming' | 'success'
  >('start')

  const web3: Web3 = window.web3
  const ens = new ENS(web3.currentProvider)

  //   const handleDomainChange = (e, data) => {
  //     dispatch({ type: 'Set ENS Domain', domain: data.value })
  //   }

  const handleInputChange = (event) => {
    setSelectedName(event.target.value.toLowerCase())
    setDomainOwner(null)
    setStatus('typing')
  }

  const handleClickVerify = async (event) => {
    setLoading(true)
    if (!selectedName) return
    if (selectedName.length < 2 || selectedName.length > 30) {
      setError('Keep domain name length biggen than 3 and less than 30')
      setLoading(false)
      return
    }
    try {
      console.log('WILL VERIFY:', `${selectedName}.${selectedDomain}`)
      const addr = await ens
        .resolver(`${selectedName}.${selectedDomain}`)
        .addr()
      console.log('OWNER:', addr)
      setDomainOwner(addr)
      setStatus('used')
    } catch (err) {
      setDomainOwner(null)
      setStatus('available')
    }
    setLoading(false)
  }

  const handleClickClaim = async () => {
    if (!network) return
    const requestInfo = { from: account, gas: 200000, gasPrice: '' }
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
    console.log(network, requestInfo)
    try {
      OtocoRegistrar.getContract(network)
        .methods.registerAndStore(name, managing?.contract)
        .send(requestInfo, (error, hash: string) => {
          console.log(hash)
          setTransaction(hash)
          setStatus('claiming')
        })
    } catch (err) {
      console.log(err)
    }
  }

  const registeringFinished = async () => {
    setTransaction(null)
    dispatch({
      type: SET_ENS_CONFIG,
      payload: {
        domain: selectedDomain,
        name: selectedName,
      },
    })
  }

  return (
    <div>
      <div className="small pb-2">
        Link your company address{' '}
        <AddressWidget address={managing?.contract}></AddressWidget> to an
        otoco.eth to make it easy to use. Simply check availability and claim
        your domain for free.
      </div>
      {status != 'claiming' && (
        <div className="row">
          <div className="input-group mb-4 col-12 col-md-6">
            <input
              type="text"
              className="form-control right"
              placeholder="Choose a subdomain..."
              aria-label="Text input with dropdown button"
              onChange={handleInputChange}
            />
            <div className="input-group-append">
              <p className="btn btn-primary disabled">.otoco.eth</p>
            </div>
          </div>
        </div>
      )}
      {loading && <p>Loading...</p>}
      {domainOwner && domainOwner !== managing?.contract && (
        <p className="text-alert">
          Sorry! This domain has been used. Please Enter Another Domain Name.
        </p>
      )}
      {domainOwner && domainOwner === managing?.contract && (
        <p className="text-warning">
          Your series already own this domain! No need to register it.
        </p>
      )}
      {status == 'available' && (
        <p className="text-success">
          This domain is available! To register, click 'Claim Name'.
        </p>
      )}
      {status == 'typing' && (
        <button className="btn btn-primary" onClick={handleClickVerify}>
          Verify Name
        </button>
      )}
      {status == 'available' && (
        <button className="btn btn-primary" onClick={handleClickClaim}>
          Claim Name
        </button>
      )}
      {transaction && (
        <TransactionMonitor
          hash={transaction}
          title="Register Subdomain"
          callbackSuccess={registeringFinished}
        ></TransactionMonitor>
      )}
    </div>
  )
}

export default connect((state: IState) => ({
  account: state.account.account,
  network: state.account.network,
  managing: state.management.managing,
  ensConfig: state.management.ensConfig,
}))(Config)

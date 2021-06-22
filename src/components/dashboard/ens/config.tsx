import React, { Dispatch, FC, useState } from 'react'
import ENS from 'ethereum-ens'
import Web3 from 'web3'
import OtocoRegistrar from '../../../smart-contracts/OtocoRegistrar'
import { connect } from 'react-redux'
import TransactionUtils from '../../../services/transactionUtils'
import TransactionMonitor from '../../transactionMonitor/transactionMonitor'
import AddressWidget from '../../addressWidget/addressWidget'
import { SeriesType } from '../../../state/management/types'
import {
  SET_ENS_DOMAINS,
  ENSDomains,
  ENSActionTypes,
} from '../../../state/management/ens/types'
import { MultisigDeployed } from '../../../state/management/multisig/types'
import { IState } from '../../../state/types'

interface Props {
  account?: string | null
  network?: string | null
  managing?: SeriesType
  ensDomains?: ENSDomains
  multisigDeployed?: MultisigDeployed
  dispatch: Dispatch<ENSActionTypes>
}

const Config: FC<Props> = ({
  account,
  network,
  managing,
  ensDomains,
  multisigDeployed,
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
    setError(null)
    setLoading(true)
    if (!selectedName) return
    if (!/^[a-z0-9-]*$/.test(selectedName)) {
      setError('Use only lower-case letters, number and dashes.')
      setLoading(false)
      return
    }
    if (
      selectedName.charAt(0) == '-' ||
      selectedName.charAt(selectedName.length - 1) == '-'
    ) {
      setError('Name should not start or end with dash.')
      setLoading(false)
      return
    }
    if (selectedName.length < 2 || selectedName.length > 30) {
      setError('Keep domain name length biggen than 3 and less than 30')
      setLoading(false)
      return
    }
    try {
      const addr = await ens
        .resolver(`${selectedName}.${selectedDomain}`)
        .addr()
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
    if (!account) return
    const requestInfo = await TransactionUtils.getTransactionRequestInfo(
      account,
      '200000'
    )
    try {
      OtocoRegistrar.getContract(network)
        .methods.registerAndStore(
          selectedName,
          managing?.contract,
          multisigDeployed?.contract
        )
        .send(requestInfo, (error, hash: string) => {
          setTransaction(hash)
          setStatus('claiming')
        })
    } catch (err) {
      console.error(err)
    }
  }

  const registeringFinished = async () => {
    setTransaction(null)
    dispatch({
      type: SET_ENS_DOMAINS,
      payload: {
        domains: [
          {
            domain: `${selectedName}.${selectedDomain}`,
            address: multisigDeployed?.contract,
          },
        ],
      },
    })
  }

  return (
    <div>
      <div className="small pb-2">
        Link your multisig wallet address{' '}
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
              <div className="btn btn-primary disabled">.otoco.eth</div>
            </div>
          </div>
        </div>
      )}
      {loading && <p>Loading...</p>}
      {error && <p className="text-warning small">{error}</p>}
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
          {selectedName} is available! To register, click 'Claim Name'.
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
  ensDomains: state.ens.ensDomains,
  multisigDeployed: state.multisig.multisigDeployed,
}))(Config)

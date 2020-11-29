import React, { Dispatch, FC, useState } from 'react'
import Web3 from 'web3'
import axios from 'axios'
import ENS from 'ethereum-ens'
import namehash from 'eth-ens-namehash'
import OtocoRegistrar from '../../../smart-contracts/OtocoRegistrar'
import TransactionMonitor from '../../transactionMonitor/transactionMonitor'
import { connect } from 'react-redux'
import {
  SET_ENS_DOMAINS,
  SeriesType,
  ManagementActionTypes,
  ENSDomains,
  ENSDomain,
  MultisigDeployed,
} from '../../../state/management/types'
import { sendMultisigTransaction } from '../../../services/safe/safeTxSender'
import { IState } from '../../../state/types'

interface Props {
  account?: string | null
  network?: string | null
  managing?: SeriesType
  ensDomains?: ENSDomains
  multisigDeployed?: MultisigDeployed
  dispatch: Dispatch<ManagementActionTypes>
}

type ENSDomainsLabeled = {
  domain: string
  address: string
  reverse?: string
  label?: string
}

interface DomainProps {
  handleTransfer: (domain: string) => void
  handleSetReverse: (domain: string) => void
  domains: ENSDomainsLabeled[]
}

const ListDomains = ({
  domains,
  handleTransfer,
  handleSetReverse,
}: DomainProps) => {
  return domains.map((d, idx) => (
    <tr key={idx}>
      <td>
        <a
          href={`https://app.ens.domains/name/${d.domain}`}
          target="_blank"
          rel="noreferrer"
        >
          {d.domain}
        </a>
      </td>
      <td>
        {d.label && <div>{d.label}</div>}
        {!d.label && (
          <div>
            {d.address.substring(0, 6) +
              '...' +
              d.address.substring(d.address.length - 5, d.address.length - 1)}
          </div>
        )}
      </td>
      <td>
        {d.label === 'series' && (
          <button
            className="btn btn-primary btn-sm"
            onClick={handleTransfer.bind(undefined, d.domain)}
          >
            transfer to multisig
          </button>
        )}
        {d.label === 'multisig-no-rev' && (
          <button
            className="btn btn-primary btn-sm"
            onClick={handleSetReverse.bind(undefined, d.domain)}
          >
            set reverse lookup
          </button>
        )}
      </td>
    </tr>
  ))
}

const Registered: FC<Props> = ({
  account,
  network,
  managing,
  ensDomains,
  multisigDeployed,
  dispatch,
}: Props) => {
  const [transaction, setTransaction] = useState<string | null>(null)
  const domainsList = ensDomains?.domains.map((d: ENSDomainsLabeled) => {
    if (multisigDeployed && multisigDeployed.contract == d.address)
      d.label = 'multisig'
    if (d.label == 'multisig' && !d.reverse) d.label += '-no-rev'
    if (managing && managing.contract == d.address) d.label = 'series'
    return d
  })

  const updateDomains = async () => {
    setTransaction(null)
    const web3: Web3 = window.web3
    const ens = new ENS(web3.currentProvider)
    OtocoRegistrar.getContract(network)
      .methods.ownedDomains(managing.contract)
      .call(async (error: any, quantity: number) => {
        if (quantity <= 0) {
          return
        }
        const domains: ENSDomain[] = []
        for (let i = 0; i < quantity; i++) {
          const domain = await OtocoRegistrar.getContract(network)
            .methods.resolve(managing.contract, i)
            .call({ from: account })
          // Remove WRONGLY set of old Domains
          if (!/^[a-z0-9-]*$/.test(domain)) continue
          const address = await ens.resolver(`${domain}.otoco.eth`).addr()
          let reverse
          try {
            reverse = await ens.reverse(address).name()
          } catch (err) {
            console.log('No reverse set for', address)
          }
          domains.push({
            domain: `${domain}.otoco.eth`,
            address,
            reverse,
          })
        }
        dispatch({
          type: SET_ENS_DOMAINS,
          payload: { domains: domains },
        })
      })
  }

  const handleClickTransfer = async (domain) => {
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
    try {
      OtocoRegistrar.getResolver(network)
        .methods.setAddr(namehash.hash(domain), multisigDeployed?.contract)
        .send(requestInfo, (error, hash: string) => {
          setTransaction(hash)
        })
    } catch (err) {
      console.log(err)
    }
  }

  const handleClickSetReverse = async (domain: string) => {
    if (!account) return
    if (!multisigDeployed) return
    setTransaction(
      await sendMultisigTransaction(
        account,
        multisigDeployed.contract,
        OtocoRegistrar.reverseRegistrars[network],
        OtocoRegistrar.reverseAbi[7],
        [domain],
        '300000'
      )
    )
  }

  return (
    // <div className="small">
    //   You successfully claimed <AddressWidget address={managing?.contract} /> as
    //   the name for your company address {managing.contract}.
    // </div>
    <div>
      <div className="small pb-2">You sucessfully claimed a domain.</div>
      {!transaction && (
        <table className="table small">
          <thead>
            <tr>
              <th scope="col">Domain</th>
              <th scope="col">Address To</th>
              <th scope="col">Operations</th>
            </tr>
          </thead>
          <tbody>
            <ListDomains
              domains={domainsList}
              handleTransfer={handleClickTransfer}
              handleSetReverse={handleClickSetReverse}
            ></ListDomains>
          </tbody>
        </table>
      )}
      {transaction && (
        <TransactionMonitor
          hash={transaction}
          title="Transfering Subdomain"
          callbackSuccess={updateDomains}
        ></TransactionMonitor>
      )}
      <div className="small">
        If your domain is addressing your series contract, it is possible to
        transfer to your multisig address, using <b>transfer to multisig</b>{' '}
        above.
      </div>
    </div>
  )
}

export default connect((state: IState) => ({
  account: state.account.account,
  network: state.account.network,
  managing: state.management.managing,
  ensDomains: state.management.ensDomains,
  multisigDeployed: state.management.multisigDeployed,
}))(Registered)

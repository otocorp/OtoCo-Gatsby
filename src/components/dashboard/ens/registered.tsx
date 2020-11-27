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
import AddressWidget from '../../addressWidget/addressWidget'
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
  label?: string
}

interface DomainProps {
  handleTransfer: (domain: string) => void
  domains: ENSDomainsLabeled[]
}

const ListDomains = ({ domains, handleTransfer }: DomainProps) => {
  const clickManageHandler = async (domain) => {
    window.open(`https://app.ens.domains/name/${domain}`, '_blank')
  }

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
            className="btn small btn-primary btn-outline btn-sm"
            onClick={handleTransfer.bind(undefined, d.domain)}
          >
            transfer to multisig
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
          domains.push({
            domain: `${domain}.otoco.eth`,
            address,
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

  return (
    // <div className="small">
    //   You successfully claimed <AddressWidget address={managing?.contract} /> as
    //   the name for your company address {managing.contract}.
    // </div>
    <div>
      <div className="small pb-2">You sucessfully claimed a domain.</div>
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
          ></ListDomains>
        </tbody>
      </table>
      <div className="small">
        If your domain is addressing your series contract, it is possible to
        transfer to your multisig address, using <b>transfer to multisig</b>{' '}
        above.
      </div>
      {transaction && (
        <TransactionMonitor
          hash={transaction}
          title="Transfering Subdomain"
          callbackSuccess={updateDomains}
        ></TransactionMonitor>
      )}
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

import React, { Dispatch, FC, useState } from 'react'
import { connect } from 'react-redux'
import Web3 from 'web3'
import ENS from 'ethereum-ens'
import Config from './ens/config'
import Registered from './ens/registered'
import OtocoRegistrar from '../../smart-contracts/OtocoRegistrar'
import {
  SET_ENS_DOMAINS,
  ENSDomain,
  ENSDomains,
  SeriesType,
  ManagementActionTypes,
  MultisigDeployed,
} from '../../state/management/types'
import { IState } from '../../state/types'
import multisigWidget from '../multisigWidget/multisigWidget'

interface Props {
  account?: string | null
  network?: string | null
  managing?: SeriesType
  ensDomains?: ENSDomains
  multisigDeployed?: MultisigDeployed
  dispatch: Dispatch<ManagementActionTypes>
}

const SeriesENS: FC<Props> = ({
  account,
  network,
  managing,
  ensDomains,
  multisigDeployed,
  dispatch,
}: Props) => {
  const [loading, setLoading] = useState(true)

  React.useEffect(() => {
    setTimeout(async () => {
      if (!network || !managing) return
      const web3: Web3 = window.web3
      const ens = new ENS(web3.currentProvider)
      const seriesQuantity = await OtocoRegistrar.getContract(network)
        .methods.ownedDomains(managing.contract)
        .call({ from: account })
      if (seriesQuantity <= 0) {
        setLoading(false)
        return
      }
      const domains: ENSDomain[] = []
      for (let i = 0; i < seriesQuantity; i++) {
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
      console.log('DOMAINS', domains)
      dispatch({
        type: SET_ENS_DOMAINS,
        payload: { domains: domains },
      })
      setLoading(false)
    }, 0)
  }, [account, multisigDeployed])

  return (
    <div className="card">
      <h6 className="card-header">ENS Domain</h6>
      <div className="card-body">
        {(multisigDeployed?.contract || ensDomains?.domains.length) && (
          <div className="card-text">
            {loading && <p>Loading...</p>}
            {!loading && ensDomains !== undefined && <Registered></Registered>}
            {!loading && ensDomains === undefined && <Config></Config>}
          </div>
        )}
        {!(multisigDeployed?.contract || ensDomains?.domains.length) && (
          <div className="small">
            This option will be available when a Multisig is deployed.
          </div>
        )}
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
}))(SeriesENS)

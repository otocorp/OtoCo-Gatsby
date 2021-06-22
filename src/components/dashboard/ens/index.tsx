import React, { Dispatch, FC, useState } from 'react'
import { connect } from 'react-redux'
import Web3 from 'web3'
import ENS from 'ethereum-ens'
import Config from './config'
import Registered from './registered'
import OtocoRegistrar from '../../../smart-contracts/OtocoRegistrar'
import { SeriesType } from '../../../state/management/types'
import {
  SET_ENS_DOMAINS,
  ENSDomain,
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
        let reverse
        try {
          reverse = await ens.reverse(address).name()
        } catch (err) {
          console.error('No reverse set for', address)
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
      setLoading(false)
    }, 0)
  }, [account, multisigDeployed])

  return (
    <div>
      <div className="d-grid gap-1 mb-5">
        <h3 className="m-0">ENS Domain</h3>
        {(multisigDeployed?.contract || ensDomains?.domains.length) && (
          <div className="card-text">
            {loading && <p>Loading...</p>}
            {!loading && ensDomains !== undefined && <Registered></Registered>}
            {!loading && ensDomains === undefined && <Config></Config>}
          </div>
        )}
        {!(multisigDeployed?.contract || ensDomains?.domains.length) && (
          <div className="text-muted small">
            This option will be available once Multisig is deployed.
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
  ensDomains: state.ens.ensDomains,
  multisigDeployed: state.multisig.multisigDeployed,
}))(SeriesENS)

import React, { Dispatch, FC, useState } from 'react'
import { connect } from 'react-redux'
import Config from './ens/config'
import Registered from './ens/registered'
import OtocoRegistrar from '../../smart-contracts/OtocoRegistrar'
import {
  SET_ENS_CONFIG,
  SeriesType,
  ENSConfig,
  ManagementActionTypes,
} from '../../state/management/types'
import { IState } from '../../state/types'

interface Props {
  account?: string | null
  network?: string | null
  managing?: SeriesType
  ensConfig?: ENSConfig
  dispatch: Dispatch<ManagementActionTypes>
}

const SeriesENS: FC<Props> = ({
  account,
  network,
  managing,
  ensConfig,
  dispatch,
}: Props) => {
  const [loading, setLoading] = useState(true)

  React.useEffect(() => {
    if (!network || !managing) return
    OtocoRegistrar.getContract(network)
      .methods.ownedDomains(managing.contract)
      .call(async (error: any, quantity: number) => {
        if (quantity <= 0) {
          setLoading(false)
          return
        }
        OtocoRegistrar.getContract(network)
          .methods.resolve(managing.contract, quantity - 1)
          .call(async (error: any, name: string) => {
            // Remove WRONGLY set of old Domains
            if (name.substring(name.length - 9, name.length) == 'otoco.eth') {
              setLoading(false)
              return
            }
            dispatch({
              type: SET_ENS_CONFIG,
              payload: {
                name,
                domain: 'otoco.eth',
              },
            })
            setLoading(false)
          })
      })
  }, [])

  return (
    <div className="card">
      <h6 className="card-header">ENS Domain</h6>
      <div className="card-body">
        <div className="card-text">
          {loading && <p>Loading...</p>}
          {!loading && !ensConfig && <Config></Config>}
          {!loading && ensConfig !== undefined && <Registered></Registered>}
        </div>
      </div>
    </div>
  )
}

export default connect((state: IState) => ({
  account: state.account.account,
  network: state.account.network,
  managing: state.management.managing,
  ensConfig: state.management.ensConfig,
}))(SeriesENS)

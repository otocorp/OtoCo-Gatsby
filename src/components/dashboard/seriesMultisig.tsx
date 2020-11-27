import React, { Dispatch, FC, useState } from 'react'
import { connect } from 'react-redux'
import MasterRegistry from '../../smart-contracts/MasterRegistry'
import GnosisSafe from '../../smart-contracts/GnosisSafe'

import Config from './multisig/config'
import Wallet from './multisig/wallet'

import {
  SET_MULTISIG_CONFIG,
  SET_MULTISIG_DEPLOYED,
  UPDATE_MULTISIG_BALANCE,
  SeriesType,
  ManagementActionTypes,
  MultisigBalance,
  MultisigConfig,
  MultisigDeployed,
} from '../../state/management/types'
import { IState } from '../../state/types'

interface Props {
  account?: string | null
  network?: string | null
  managing?: SeriesType
  multisigConfig?: MultisigConfig
  multisigDeployed?: MultisigDeployed
  dispatch: Dispatch<ManagementActionTypes>
}

const SeriesMultisig: FC<Props> = ({
  account,
  network,
  managing,
  multisigConfig,
  multisigDeployed,
  dispatch,
}: Props) => {
  const [loading, setLoading] = useState(true)

  React.useEffect(() => {
    setTimeout(async () => {
      if (!network || !managing) return
      const multisigAddress = await MasterRegistry.getContract(network)
        .methods.getRecord(managing.contract, 2)
        .call({ from: account })
      if (multisigAddress === '0x0000000000000000000000000000000000000000') {
        dispatch({
          type: SET_MULTISIG_CONFIG,
          payload: {
            owners: [],
            threshold: '1',
          },
        })
        setLoading(false)
        return
      }
      const safeContract = GnosisSafe.getContract(multisigAddress)
      dispatch({
        type: SET_MULTISIG_CONFIG,
        payload: {
          owners: await safeContract.methods
            .getOwners()
            .call({ from: account }),
          threshold: await safeContract.methods
            .getThreshold()
            .call({ from: account }),
        },
      })
      dispatch({
        type: SET_MULTISIG_DEPLOYED,
        payload: {
          contract: multisigAddress,
          balances: {},
        },
      })
      setLoading(false)
    }, 0)
  }, [])

  return (
    <div className="card">
      <h6 className="card-header">Multisig Wallet</h6>
      <div className="card-body">
        {loading && (
          <div className="d-flex justify-content-center">
            <div className="row">
              <div className="col-12 text-center">Loading</div>
              <div className="col-12 text-center">
                <div className="spinner-border" role="status"></div>
              </div>
            </div>
          </div>
        )}
        {!loading && !multisigDeployed && multisigConfig && <Config></Config>}
        {!loading && multisigDeployed && <Wallet></Wallet>}
      </div>
    </div>
  )
}

export default connect((state: IState) => ({
  account: state.account.account,
  network: state.account.network,
  managing: state.management.managing,
  multisigConfig: state.management.multisigConfig,
  multisigDeployed: state.management.multisigDeployed,
}))(SeriesMultisig)

import React, { Dispatch, FC, useState } from 'react'
import Web3 from 'web3'
import BN from 'bn.js'
import { connect } from 'react-redux'
import Config from './token/config'
import Shares from './token/shares'
import FactoryContract from '../../smart-contracts/TokenFactory'
import MasterRegistry from '../../smart-contracts/MasterRegistry'
import TokenContract from '../../smart-contracts/OtocoToken'
import {
  SET_TOKEN_CONFIG,
  SET_TOKEN_DEPLOYED,
  SeriesType,
  TokenDeployed,
  ManagementActionTypes,
} from '../../state/management/types'
import { IState } from '../../state/types'

interface Props {
  account?: string | null
  network?: string | null
  managing?: SeriesType
  tokenDeployed?: TokenDeployed
  dispatch: Dispatch<ManagementActionTypes>
}

const SeriesToken: FC<Props> = ({
  account,
  network,
  managing,
  tokenDeployed,
  dispatch,
}: Props) => {
  const [loading, setLoading] = useState(true)

  const web3: Web3 = window.web3
  const getBNDecimals = (decimals: number) => {
    return new BN(10).pow(new BN(decimals))
  }

  React.useEffect(() => {
    setTimeout(async () => {
      if (!account || !network || !managing) return

      const contract = await MasterRegistry.getContract(network)
        .methods.getRecord(managing.contract, 1)
        .call({ from: account })
      if (contract === '0x0000000000000000000000000000000000000000') {
        setLoading(false)
        return
      }
      const shares = await TokenContract.getContract(contract)
        .methods.totalSupply()
        .call({ from: account })
      const decimals = await TokenContract.getContract(contract)
        .methods.decimals()
        .call({ from: account })
      const sharesBN = new BN(shares)

      dispatch({
        type: SET_TOKEN_CONFIG,
        payload: {
          name: await TokenContract.getContract(contract)
            .methods.name()
            .call({ from: account }),
          symbol: await TokenContract.getContract(contract)
            .methods.symbol()
            .call({ from: account }),
          shares: sharesBN.div(getBNDecimals(decimals)).toString(),
          decimals: decimals,
        },
      })
      // Get Token creation
      const events = await TokenContract.getContract(
        contract
      ).getPastEvents('Initialized', { fromBlock: 0, toBlock: 'latest' })
      const timestamp = await web3.eth.getBlock(events[0].blockNumber)
      const creation = new Date(parseInt(timestamp.timestamp.toString()) * 1000)
      dispatch({
        type: SET_TOKEN_DEPLOYED,
        payload: {
          creation,
          contract,
        },
      })
      setLoading(false)
    }, 0)
  })

  return (
    <div className="card">
      <h6 className="card-header">Token</h6>
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
        {!loading && !tokenDeployed && <Config></Config>}
        {!loading && tokenDeployed && <Shares></Shares>}
      </div>
    </div>
  )
}

export default connect((state: IState) => ({
  account: state.account.account,
  network: state.account.network,
  managing: state.management.managing,
  tokenDeployed: state.management.tokenDeployed,
}))(SeriesToken)

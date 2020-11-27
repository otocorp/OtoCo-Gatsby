import React, { Dispatch, FC, useState } from 'react'
import Web3 from 'web3'
import axios from 'axios'
import BN from 'bn.js'
import { connect } from 'react-redux'
import FactoryContract from '../../../smart-contracts/TokenFactory'
import MasterRegistry from '../../../smart-contracts/MasterRegistry'
import TokenContract from '../../../smart-contracts/OtocoToken'
import TransactionMonitor from '../../transactionMonitor/transactionMonitor'
import {
  SET_TOKEN_CONFIG,
  SET_TOKEN_DEPLOYED,
  SeriesType,
  ManagementActionTypes,
} from '../../../state/management/types'
import { IState } from '../../../state/types'

interface Props {
  account?: string | null
  network?: string | null
  managing?: SeriesType
  dispatch: Dispatch<ManagementActionTypes>
}

const Config: FC<Props> = ({ account, network, managing, dispatch }: Props) => {
  const decimals = 18
  const [error, setError] = useState<string | null>(null)
  const [shares, setShares] = useState(0)
  const [name, setName] = useState('')
  const [symbol, setSymbol] = useState('')
  const [transaction, setTransaction] = useState('')

  const web3: Web3 = window.web3
  const getBNDecimals = (decimals: number) => {
    return new BN(10).pow(new BN(decimals))
  }

  const handleChangeName = (event: React.FormEvent<HTMLInputElement>) => {
    setName(event.target.value)
  }
  const handleChangeSymbol = (event: React.FormEvent<HTMLInputElement>) => {
    setSymbol(event.target.value)
  }
  const handleChangeShares = (event: React.FormEvent<HTMLInputElement>) => {
    setShares(parseInt(event.target.value))
  }

  const handleClickDeploy = async () => {
    //console.log(token)
    if (name.length < 3 || name.length > 50) {
      setError('Keep token name length biggen than 2 and less than 50')
      return
    }
    if (!/^[A-Z]+$/.test(symbol)) {
      setError('For Token Symbol only use upper case letters')
      return
    }
    if (symbol.length < 3) {
      setError('For Token Symbol only use upper case letters')
      return
    }
    if (shares < 100 || shares > 100000000000) {
      setError('For Total Shares use integers between 100 and 100000000000')
      return
    }
    dispatch({
      type: SET_TOKEN_CONFIG,
      payload: {
        shares: shares.toString(),
        decimals,
        name,
        symbol,
      },
    })
    if (!account || !network || !managing) {
      setError('Not connected or not account related.')
      return
    }
    const requestInfo = { from: account, gas: 300000, gasPrice: '0' }
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
      FactoryContract.getContract(network)
        .methods.createERC20(
          new BN(shares).mul(getBNDecimals(decimals)).toString(),
          name,
          symbol,
          managing.contract
        )
        .send(requestInfo, (error, hash: string) => {
          if (error) return console.log(error)
          console.log('deployed token', hash)
          setTransaction(hash)
        })
    } catch (err) {
      console.log(err)
    }
  }

  const handleNextStep = async () => {
    if (!account || !network || !managing) {
      setError('Not connected or not account related.')
      return
    }
    // Get deployed Token Contract
    const contract = await MasterRegistry.getContract(network)
      .methods.getRecord(managing.contract, 1)
      .call({ from: account })
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
  }

  return (
    <div>
      <div className="small">
        We made it easy for your new company to issue ERC20 tokens.
      </div>
      <div className="small pb-2">
        You decide what the tokens represent: equity in your company, a usage
        right, a convertible, etc. Simply set you token parameters and click{' '}
        <b>Deploy Token</b> to create the new contract.
      </div>
      {error && <p className="small text-danger">{error}</p>}
      {!transaction && (
        <div className="row">
          <div className="col-12 col-md-6">
            <div className="input-group mb-4">
              <input
                type="text"
                className="form-control right"
                placeholder="Choose token name"
                aria-label="Text input with dropdown button"
                onChange={handleChangeName}
              />
              <div className="input-group-append">
                <p className="btn btn-primary disabled">Token Name</p>
              </div>
            </div>
          </div>
          <div className="w-100"></div>
          <div className="col-12 col-md-6">
            <div className="input-group mb-4">
              <input
                type="text"
                className="form-control right"
                placeholder="e.g.: TOK"
                aria-label="Text input with dropdown button"
                onChange={handleChangeSymbol}
              />
              <div className="input-group-append">
                <p className="btn btn-primary disabled">Token Symbol</p>
              </div>
            </div>
          </div>
          <div className="w-100"></div>
          <div className="col-12 col-md-6">
            <div className="input-group mb-4">
              <input
                type="text"
                className="form-control right"
                placeholder="e.g.: 1000000"
                aria-label="Text input with dropdown button"
                onChange={handleChangeShares}
              />
              <div className="input-group-append">
                <p className="btn btn-primary disabled">Token Quantity</p>
              </div>
            </div>
          </div>
          <div className="w-100"></div>
          <div className="col-12 col-md-6">
            <button className="btn btn-primary" onClick={handleClickDeploy}>
              Deploy Token
            </button>
          </div>
        </div>
      )}
      {transaction && (
        <TransactionMonitor
          hash={transaction}
          title="Deploying Tokens"
          callbackSuccess={handleNextStep}
        ></TransactionMonitor>
      )}
    </div>
  )
}

export default connect((state: IState) => ({
  account: state.account.account,
  network: state.account.network,
  managing: state.management.managing,
}))(Config)

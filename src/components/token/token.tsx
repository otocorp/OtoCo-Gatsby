import React, { FC, Dispatch, useState } from 'react'
import Web3 from 'web3'
import BN from 'bn.js'
import ENS from 'ethereum-ens'
import { navigate } from '@reach/router'
import { connect } from 'react-redux'
import { IState } from '../../state/types'
import Web3Integrate from '../../services/web3-integrate'

import { ChevronLeft } from 'react-bootstrap-icons'
import Icon from '../icon/icon'
import AddressWidget from '../addressWidget/addressWidget'
import TransactionMonitor from '../transactionMonitor/transactionMonitor'

import TokenContract from '../../smart-contracts/OtocoToken'

import '../dashboard/style.scss'

import {
  SET_ACCOUNT,
  SET_NETWORK,
  AccountActionTypes,
} from '../../state/account/types'
import {
  SET_TOKEN_CONFIG,
  TokenConfig,
  TokenDeployed,
  TokenActionTypes,
} from '../../state/management/token/types'
import { Link } from 'gatsby'

interface Props {
  id: string
  account?: string
  network?: string
  managing?: string
  tokenConfig: TokenConfig
  tokenDeployed: TokenDeployed
  dispatch: Dispatch<AccountActionTypes | TokenActionTypes>
}

const Token: FC<Props> = ({
  id,
  account,
  network,
  managing,
  tokenConfig,
  tokenDeployed,
  dispatch,
}: Props) => {
  const [balance, setBalance] = useState<string | null>(null)
  const [transaction, setTransaction] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [to, setTo] = useState('')
  const [ensAddress, setENSAddress] = useState<string | null>(null)
  const [amount, setAmount] = useState('')

  const getBNDecimals = (decimals) => {
    return new BN(10).pow(new BN(decimals))
  }

  React.useEffect(() => {
    setTimeout(async () => {
      // IF NOT CONNECTED YET
      if (!account) {
        await Web3Integrate.callModal()
        const web3: Web3 = window.web3
        const accounts = await web3.eth.getAccounts()
        dispatch({
          type: SET_NETWORK,
          payload: await web3.eth.net.getNetworkType(),
        })
        dispatch({ type: SET_ACCOUNT, payload: accounts[0] })
        return
      }
      // ALREADY CONNECTED
      const decimals = await TokenContract.getContract(id)
        .methods.decimals()
        .call({ from: account })
      const shares = await TokenContract.getContract(id)
        .methods.totalSupply()
        .call({ from: account })
      const balance = await TokenContract.getContract(id)
        .methods.balanceOf(account)
        .call({ from: account })
      const sharesBN = new BN(shares)
      const balanceBN = new BN(balance)

      dispatch({
        type: SET_TOKEN_CONFIG,
        payload: {
          name: await TokenContract.getContract(id)
            .methods.name()
            .call({ from: account }),
          symbol: await TokenContract.getContract(id)
            .methods.symbol()
            .call({ from: account }),
          shares: sharesBN.div(getBNDecimals(decimals)).toString(),
          decimals: decimals,
        },
      })
      setBalance(balanceBN.div(getBNDecimals(decimals)).toString())
    }, 0)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [account, balance])

  const sendTransaction = async () => {
    try {
      const toAddress = ensAddress ? ensAddress : to
      TokenContract.getContract(id)
        .methods.transfer(
          toAddress,
          new BN(amount).mul(getBNDecimals(tokenConfig.decimals)).toString()
        )
        .send({ from: account }, (error, hash) => {
          if (error) alert(error)
          else setTransaction(hash)
        })
    } catch (err) {
      alert(err)
    }
  }

  const clearTransaction = async () => {
    const balance = await TokenContract.getContract(id)
      .methods.balanceOf(account)
      .call({ from: account })
    const balanceBN = new BN(balance)
    setBalance(balanceBN.div(getBNDecimals(tokenConfig.decimals)).toString())
    setTransaction(null)
  }

  const handleChangeAmount = (event) => {
    setAmount(event.target.value)
  }

  const handleChangeTo = (event) => {
    const web3: Web3 = window.web3
    const ens = new ENS(web3.currentProvider)
    ens
      .resolver(event.target.value)
      .addr()
      .then((addr: string) => {
        setENSAddress(addr)
      })
      .catch(() => {
        setENSAddress(null)
      })
    setTo(event.target.value)
  }

  return (
    <div className="container-sm limiter-md content">
      <h1>Token Transfer Tool</h1>
      <h5 className="mb-4">Easily transfer your tokens.</h5>
      <div className="card card-body px-4">
        {balance && (
          <div>
            <h2>
              {tokenConfig.symbol} - {tokenConfig.name}
            </h2>
            <div>
              Total Supply: <b>{tokenConfig.shares}</b>
            </div>
          </div>
        )}
        {balance && !transaction && (
          <div>
            Balance: <b>{balance}</b>
          </div>
        )}
        {balance && !transaction && (
          <div>
            Connected Wallet: <AddressWidget address={account}></AddressWidget>
          </div>
        )}
        {balance && !transaction && (
          <div>
            Your Percentage:{' '}
            <div className="progress mb-4 mt-2">
              <div
                className="progress-bar bg-success"
                role="progressbar"
                style={{
                  width: `${
                    (parseInt(balance) / parseInt(tokenConfig.shares)) * 100
                  }%`,
                }}
                aria-valuenow={
                  (parseInt(balance) / parseInt(tokenConfig.shares)) * 100
                }
                aria-valuemin={0}
                aria-valuemax={100}
              >
                {(parseInt(balance) / parseInt(tokenConfig.shares)) * 100}%
              </div>
            </div>
          </div>
        )}
        {balance && !transaction && (
          <div>
            <div className="input-group mb-4">
              <input
                type="text"
                className="form-control right"
                placeholder="Address or ENS..."
                onChange={handleChangeTo}
              />
              <div className="input-group-append">
                <div className="btn btn-primary disabled">To</div>
              </div>
            </div>
            <div className="input-group mb-4">
              <input
                type="number"
                className="form-control right"
                defaultValue={0}
                max={balance}
                onChange={handleChangeAmount}
              />
              <div className="input-group-append">
                <div className="btn btn-primary disabled">Amount</div>
              </div>
            </div>
            <p>
              <button className="btn btn-primary" onClick={sendTransaction}>
                Transfer Tokens
              </button>
            </p>
          </div>
        )}
        {!balance && (
          <div className="d-flex justify-content-center">
            <div className="row">
              <div className="col-12 text-center">Loading Token</div>
              <div className="col-12 text-center">
                <div className="spinner-border" role="status"></div>
              </div>
            </div>
          </div>
        )}
        {transaction && (
          <TransactionMonitor
            hash={transaction}
            title="Transfering Tokens"
            callbackSuccess={clearTransaction}
            callbackError={clearTransaction}
          ></TransactionMonitor>
        )}
      </div>
      {managing && (
        <Link
          className="btn btn-back btn-primary-outline btn-sm"
          to={`/dashpanel/entity/${managing?.contract}`}
        >
          <ChevronLeft />
          <span style={{ paddingLeft: '10px' }}>Back to Entity</span>
        </Link>
      )}
      {!managing && (
        <Link
          className="btn btn-back btn-primary-outline btn-sm"
          to={`/dashpanel/`}
        >
          <ChevronLeft />
          <span style={{ paddingLeft: '10px' }}>Back to Dashpanel</span>
        </Link>
      )}
    </div>
  )
}

export default connect((state: IState) => ({
  account: state.account.account,
  network: state.account.network,
  managing: state.management.managing,
  tokenConfig: state.token.tokenConfig,
  tokenDeployed: state.token.tokenDeployed,
}))(Token)

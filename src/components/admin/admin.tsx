import React, { FC, Dispatch, useState } from 'react'
import Web3 from 'web3'
import BN from 'bn.js'
import { connect } from 'react-redux'
import { IState } from '../../state/types'
import Web3Integrate from '../../services/web3-integrate'
import MainContract from '../../smart-contracts/MainContract'
import ERC20 from '../../smart-contracts/ERC20'

import {
  SET_ACCOUNT,
  SET_NETWORK,
  AccountActionTypes,
} from '../../state/account/types'

import {
  SeriesType,
  SET_OWN_SERIES,
  ManagementActionTypes,
} from '../../state/management/types'

import { IJurisdictionOption } from '../../state/spinUp/types'

interface Props {
  account?: string
  network?: string
  series: SeriesType[]
  managing?: SeriesType
  jurisdictionOptions: IJurisdictionOption[]
  dispatch: Dispatch<
    AccountActionTypes | ManagementActionTypes | AccountActionTypes
  >
}

const Admin: FC<Props> = ({
  account,
  network,
  managing,
  series,
  jurisdictionOptions,
  dispatch,
}: Props) => {
  const [error, setError] = useState<string | null>(null)
  const [tokenAddress, setTokenAddress] = useState('')
  const [amountTax, setAmount] = useState('')
  const [balanceDelaware, setBalanceDe] = useState('')
  const [balanceWyoming, setBalanceWy] = useState('')

  const getBNDecimals = (decimals) => {
    const BN = web3.utils.BN
    return new BN(10).pow(new BN(decimals))
  }

  React.useEffect(() => {
    setTimeout(async () => {
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
      const web3: Web3 = window.web3
      const accounts = await web3.eth.getAccounts()
      console.log(network)
      if (
        (await MainContract.getContract(network, 'us_de')
          .methods.owner()
          .call({ from: accounts[0] })) !== accounts[0]
      )
        setError('Not the contract owner DELAWARE')
      if (
        (await MainContract.getContract(network, 'us_wy')
          .methods.owner()
          .call({ from: accounts[0] })) !== accounts[0]
      )
        setError('Not the contract owner WYOMING')

      const balanceDelaware = await ERC20.getContract(network)
        .methods.balanceOf(MainContract.addresses[network + '_us_de'])
        .call({ from: accounts[0] })
      const balanceWyoming = await ERC20.getContract(network)
        .methods.balanceOf(MainContract.addresses[network + '_us_wy'])
        .call({ from: accounts[0] })

      const balanceDeBN = new BN(balanceDelaware)
      const balanceWyBN = new BN(balanceWyoming)

      setBalanceDe(balanceDeBN.div(getBNDecimals(18)).toString())
      setBalanceWy(balanceWyBN.div(getBNDecimals(18)).toString())
    }, 10)
  }, [account])

  const sendTokenChange = async (jurisdiction) => {
    try {
      MainContract.getContract(network, jurisdiction)
        .methods.changeTknAddr(tokenAddress)
        .send({ from: account }, (error, hash) => {
          if (error) alert(error.message)
        })
    } catch (err) {
      alert(err)
    }
  }

  const sendTaxChange = async (jurisdiction: string) => {
    try {
      console.log(
        jurisdiction,
        new BN(amountTax).mul(getBNDecimals(18)).toString()
      )
      MainContract.getContract(network, jurisdiction)
        .methods.changeSeriesFee(
          new BN(amountTax).mul(getBNDecimals(18)).toString()
        )
        .send({ from: account }, (error, hash) => {
          if (error) alert(error.message)
        })
    } catch (err) {
      alert(err)
    }
  }

  const sendWithdraw = async (jurisdiction: string) => {
    try {
      console.log(
        jurisdiction,
        new BN(amountTax).mul(getBNDecimals(18)).toString()
      )
      MainContract.getContract(network, jurisdiction)
        .methods.withdrawTkn()
        .send({ from: account }, (error, hash) => {
          if (error) alert(error.message)
        })
    } catch (err) {
      alert(err)
    }
  }

  const handleChangeAmount = (event) => {
    setAmount(event.target.value)
  }

  const handleChangeToken = (event) => {
    setTokenAddress(event.target.value)
  }

  return (
    <div>
      {!error && (
        <div className="row">
          <div className="col-12 col-md-6">
            <div className="col-12 card card-body">
              <div className="input-group mb-4">
                <input
                  type="text"
                  className="form-control right"
                  placeholder="Address or ENS..."
                  aria-label="Text input with dropdown button"
                  onChange={handleChangeToken}
                />
                <div className="input-group-append">
                  <p className="btn btn-primary disabled">Token Address</p>
                </div>
              </div>
              <button
                className="btn btn-primary mb-2"
                onClick={sendTokenChange.bind(undefined, 'us_de')}
              >
                Change Delaware
              </button>
              <button
                className="btn btn-primary"
                onClick={sendTokenChange.bind(undefined, 'us_wy')}
              >
                Change Wyoming
              </button>
            </div>
          </div>
          <div className="col-12 col-md-6">
            <div className="col-12 card card-body">
              <div className="input-group mb-4">
                <input
                  type="text"
                  className="form-control right"
                  placeholder="Tax to spin up..."
                  aria-label="Text input with dropdown button"
                  onChange={handleChangeAmount}
                />
                <div className="input-group-append">
                  <p className="btn btn-primary disabled">Spin-Up Tax</p>
                </div>
              </div>
              <button
                className="btn btn-primary mb-2"
                onClick={sendTaxChange.bind(undefined, 'us_de')}
              >
                Change Delaware
              </button>
              <button
                className="btn btn-primary"
                onClick={sendTaxChange.bind(undefined, 'us_wy')}
              >
                Change Wyoming
              </button>
            </div>
          </div>
          <div className="col-12 col-md-6">
            <div className="col-12 card card-body">
              <h3>Withdraw Tokens</h3>
              <button
                className="btn btn-primary mb-2"
                onClick={sendWithdraw.bind(undefined, 'us_de')}
              >
                Delaware : {balanceDelaware}
              </button>
              <button
                className="btn btn-primary"
                onClick={sendWithdraw.bind(undefined, 'us_wy')}
              >
                Wyoming : {balanceWyoming}
              </button>
            </div>
          </div>
        </div>
      )}
      {error && <h3>{error}</h3>}
    </div>
  )
}

export default connect((state: IState) => ({
  account: state.account.account,
  network: state.account.network,
  jurisdictionOptions: state.spinUp.jurisdictionOptions,
  managing: state.management.managing,
  series: state.management.series,
}))(Admin)

import React, { Dispatch, FC, useState } from 'react'
import Web3 from 'web3'
import { connect } from 'react-redux'
import { IState } from '../../../state/types'
import TransactionUtils from '../../../services/transactionUtils'
import AddressWidget from '../../addressWidget/addressWidget'
import {
  SET_CURRENT_STEP,
  CLEAR_AVAILABLE_NAME,
  SpinUpActionTypes,
} from '../../../state/spinUp/types'

import ERC20Contract from '../../../smart-contracts/ERC20'

interface Props {
  balance: string
  allowance: string
  fee: number
  feeBN: string
  currency: string
  mainContractAddress: string
  setTransaction: React.Dispatch<React.SetStateAction<string>>
  account?: string | null
  network?: string | null
  jurisdictionSelected: string
  dispatch: Dispatch<SpinUpActionTypes>
}

const EnoughBalanceForm: FC<Props> = ({
  balance,
  allowance,
  fee,
  feeBN,
  currency,
  mainContractAddress,
  account,
  network,
  dispatch,
  setTransaction,
}: Props) => {
  const web3: Web3 = window.web3

  const clickApproveHandler = async () => {
    if (!account) return
    const requestInfo = await TransactionUtils.getTransactionRequestInfo(
      account,
      '200000'
    )
    try {
      ERC20Contract.getContractDAI(network)
        .methods.approve(
          mainContractAddress,
          web3.utils.toWei(feeBN.toString(), 'ether')
        )
        .send(requestInfo, (error: any, hash: string) => {
          setTransaction(hash)
        })
    } catch (err) {
      console.error(err)
    }
  }

  const clickBackHandler = () => {
    dispatch({ type: CLEAR_AVAILABLE_NAME })
    dispatch({ type: SET_CURRENT_STEP, payload: 1 })
  }

  return (
    <div>
      <p>
        Please approve payment of{' '}
        <b>
          {fee} {currency}
        </b>{' '}
        to OtoCo from your connected wallet to instantly activate your new LLC.
      </p>
      <p className="small">
        Approved{' '}
        <b>
          {allowance} {currency}
        </b>{' '}
        of total{' '}
        <b>
          {balance} {currency}
        </b>{' '}
        available.
      </p>
      {account && (
        <div className="small">
          From Your Account: <AddressWidget address={account}></AddressWidget>
        </div>
      )}
      <p className="small">
        To Address:{' '}
        <AddressWidget address={mainContractAddress}></AddressWidget>
      </p>
      <div className="d-flex row-cols-2 pt-4 gap-5 flex-row">
        <button
          className="btn btn-primary-outline flex-fill"
          onClick={clickBackHandler}
        >
          Back
        </button>
        <button
          className="btn btn-primary flex-fill"
          onClick={clickApproveHandler}
        >
          Approve Payment
        </button>
      </div>
    </div>
  )
}

export default connect((state: IState) => ({
  account: state.account.account,
  network: state.account.network,
  jurisdictionSelected: state.spinUp.jurisdictionSelected,
}))(EnoughBalanceForm)

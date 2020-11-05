import React, { Dispatch, FC, useState } from 'react'
import axios, { AxiosError, AxiosResponse } from 'axios'
import { connect } from 'react-redux'
import { IState } from '../../../state/types'
import AddressWidget from '../../addressWidget/addressWidget'
import {
  SET_CURRENT_STEP,
  SpinUpActionTypes,
} from '../../../state/spinUp/types'

interface Props {
  balance: string
  fee: number
  currency: string
  environment: string
  account?: string
  network?: string
  jurisdictionName?: string
  dispatch: Dispatch<SpinUpActionTypes>
}

const NoBalanceForm: FC<Props> = ({
  balance,
  fee,
  currency,
  environment,
  account,
  jurisdictionName,
  dispatch,
}: Props) => {
  const clickBackHandler = () => {
    dispatch({ type: SET_CURRENT_STEP, payload: 0 })
  }

  // env: 'testwyre',
  // accountId: 'AC_JEFLTVQQPQH', // put your account number here
  // auth: {
  //   type: 'secretKey',
  //   secretKey: 'SK-4EZV7WXH-HPR9XZ9J-NZ4WDNU7-3YJZ4GQP', // make an API key, put the secret here :)
  // },
  // operation: {
  //   type: 'debitcard',
  //   destCurrency: currency,
  //   destAmount: fee,
  //   dest: `ethereum:${account}`,

  type WyreResponseType = {
    url: string
    reservation: string
  }

  const options = {
    headers: {
      Authorization: 'Bearer xxxxxx',
      'Content-Type': 'application/json',
    },
  }

  const requestPaymentWyre = () => {
    axios
      .post(
        'https://api.testwyre.com/v3/orders/reserve',
        {
          destCurrency: currency,
          paymentMethod: 'debit-card',
          referrerAccountId: 'AC_JEFLTVQQPQH',
          dest: `ethereum:${account}`,
          lockFields: ['dest', 'destCurrency', 'paymentMethod'],
        },
        options
      )
      .then((response: AxiosResponse<WyreResponseType>) => {
        window.open(response.data.url, '_blank')
      })
      .catch((err: AxiosError) => {
        console.log(err)
      })
  }

  return (
    <div>
      <p>
        We let you create a company for FREE but you need to cover the{' '}
        <b>USD 39 (in DAI)</b> in first year’s maintenance which includes its{' '}
        registered address in {jurisdictionName}.
      </p>
      <div className="small">
        You only have{' '}
        <b>
          {balance} {currency}
        </b>{' '}
        available. You can top up DAI from here:
        <ul>
          <li>
            <a href="https://oasis.app" target="_blank" rel="noreferrer">
              Maker DAO Oasis
            </a>{' '}
            Trade or Borrow ETH/DAI
          </li>
          <li>
            <a href="https://1inch.exchange" target="_blank" rel="noreferrer">
              1inch Enchange
            </a>{' '}
            Trade ETH/DAI
          </li>
          <li>
            <a href="https://app.uniswap.org" target="_blank" rel="noreferrer">
              UniSwap Dex
            </a>{' '}
            Trade ETH/DAI
          </li>
        </ul>
        {/* <div>
          You can also{' '}
          <a
            href={`https://pay.testwyre.com/purchase?&destCurrency=${currency}&dest=ethereum:${account}&amount=${fee}`}
            target="_blank"
            rel="noreferrer"
          >
            Buy {currency} with Wyre
          </a>{' '}
          using debit-card.
        </div> */}
      </div>
      <div className="align-right mt-4">
        <button className="btn btn-primary mr-4" onClick={clickBackHandler}>
          Back
        </button>
      </div>
    </div>
  )
}

export default connect((state: IState) => ({
  account: state.account.account,
  network: state.account.network,
  jurisdictionName: state.spinUp.jurisdictionName,
}))(NoBalanceForm)

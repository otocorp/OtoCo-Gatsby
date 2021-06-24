import React, { FC } from 'react'
import Web3 from 'web3'
import BN from 'bn.js'
import UTCDate from '../utcDate/utcDate'
import accounting from 'accounting'
import { StakeInterface } from './index'

interface ListMessagesProps {
  stakes: StakeInterface[]
}

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
const StakeList = ({ stakes }: ListMessagesProps) => {
  return (
    <>
      {stakes.map((m, idx) => (
        <tr className="small" key={m.id}>
          <td>#{m.id}</td>
          <td className="text-end">
            {accounting.formatMoney(Web3.utils.fromWei(m.amount), '')}{' '}
            {m.token.symbol}
          </td>
          <td className="text-end">
            {accounting.formatMoney(Web3.utils.fromWei(m.price), '', 4)} USD
          </td>
          <td className="text-end">
            {accounting.formatMoney(Web3.utils.fromWei(m.shares), '')}
          </td>
        </tr>
      ))}
    </>
  )
}

export default StakeList

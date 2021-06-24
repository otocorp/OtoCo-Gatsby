import React, { FC } from 'react'
import Web3 from 'web3'
import BN from 'bn.js'
import { XLg } from 'react-bootstrap-icons'
import UTCDate from '../utcDate/utcDate'
import accounting from 'accounting'
import { StakeInterface } from './index'

interface ListMessagesProps {
  stakes: StakeInterface[]
  handleUnstake: (index: number) => void
}

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
const StakeList = ({ stakes, handleUnstake }: ListMessagesProps) => {
  return (
    <>
      {stakes.map((m, idx) => (
        <tr className="small" key={m.id}>
          <td>#{m.id}</td>
          <td className="text-end d-none d-md-table-cell">
            {accounting.formatMoney(Web3.utils.fromWei(m.amount), '')}{' '}
            {m.token.symbol}
          </td>
          <td className="text-end d-none d-md-table-cell">
            {accounting.formatMoney(Web3.utils.fromWei(m.price), '', 4)} USD
          </td>
          <td className="text-end d-none d-md-table-cell">
            {accounting.formatMoney(Web3.utils.fromWei(m.shares), '')}
          </td>
          <td className="text-end d-table-cel d-md-none">
            <div>
              {accounting.formatMoney(Web3.utils.fromWei(m.amount), '')}{' '}
              {m.token.symbol}
            </div>
            <div style={{ borderBottom: '1px solid' }}>
              x {accounting.formatMoney(Web3.utils.fromWei(m.price), '', 4)} USD
            </div>
            <div>
              {accounting.formatMoney(Web3.utils.fromWei(m.shares), '')}
            </div>
          </td>
          <td className="text-end">
            {m.amount.gt(new BN(0)) && (
              <button
                className="btn btn-primary btn-sm"
                onClick={handleUnstake.bind(undefined, idx)}
              >
                <XLg></XLg>
              </button>
            )}
          </td>
        </tr>
      ))}
    </>
  )
}

export default StakeList

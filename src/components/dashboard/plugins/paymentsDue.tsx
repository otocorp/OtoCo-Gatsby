import React, { FC } from 'react'
import { DecryptedMailbox } from '../../../state/account/types'
import { Trash } from 'react-bootstrap-icons'
import UTCDate from '../../utcDate/utcDate'

interface ListMessagesProps {
  contract: string // Company/Entity contract address
  messages: DecryptedMailbox[]
  handlePay: (p: string, a: number) => void
}

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export const PaymentsDue = ({
  contract,
  messages,
  handlePay: handle,
}: ListMessagesProps) => {
  const tempMessages = messages
    .filter((m) => m.body.method === 'billing')
    .map((m) => {
      return {
        messageId: m.id,
        billId: m.body.message._id,
        entity: m.body.message.entity,
        product: m.body.message.product,
        timestamp: m.body.message.timestamp,
        env: m.body.message.method + '-' + m.body.message.environment,
        amount: m.body.message.amount,
        currency: m.body.message.currency,
      }
    })
    .filter((m) => m.entity === contract)

  return tempMessages.map((m) => (
    <tr className="small" key={m.billId}>
      <td>
        {m.product} <span className="text-secondary">({m.billId})</span>
      </td>
      <td className="text-end">{m.amount} USD</td>
      <td className="text-end">
        <button
          className="btn btn-primary btn-sm"
          onClick={handle.bind(
            undefined,
            m.product,
            m.messageId,
            m.billId,
            m.amount
          )}
        >
          Pay
        </button>
      </td>
    </tr>
  ))
}

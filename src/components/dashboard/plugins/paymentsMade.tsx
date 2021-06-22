import React, { FC } from 'react'
import { DecryptedMailbox } from '../../../state/account/types'
import { Trash } from 'react-bootstrap-icons'
import UTCDate from '../../utcDate/utcDate'

interface ListMessagesProps {
  contract: string // Company/Entity contract address
  messages: DecryptedMailbox[]
}

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export const PaymentsMade = ({ contract, messages }: ListMessagesProps) => {
  const tempMessages = messages
    .filter((m) => m.body.method === 'payment')
    .map((m) => {
      return {
        id: m.id,
        entity: m.body.message.entity,
        product: m.body.message.product,
        receipt: m.body.message._id,
        timestamp: m.body.message.timestamp,
        env: m.body.message.method + '-' + m.body.message.environment,
        amount: m.body.message.amount,
        currency: m.body.message.currency,
      }
    })
    .filter((m) => m.entity === contract)

  return tempMessages.map((m) => (
    <tr className="small" key={m.id}>
      <td>
        {m.product} - {m.env}
      </td>
      {m.receipt.length > 20 && (
        <td>
          {m.receipt.substring(0, 7)} ...
          {m.receipt.substring(m.receipt.length - 8, m.receipt.length)}
        </td>
      )}
      {m.receipt.length <= 20 && <td>{m.receipt}</td>}
      <td className="text-end">
        <UTCDate date={new Date(m.timestamp)} separator="-" />
      </td>
      <td className="text-end">
        {m.amount} {m.currency}
      </td>
    </tr>
  ))
}

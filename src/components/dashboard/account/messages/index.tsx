import React, { Dispatch, FC } from 'react'
import { connect } from 'react-redux'
import { IState } from '../../../../state/types'
import Textile from '../../../../services/textile'
import { PrivateKey } from '@textile/hub'
import { ListInboxMessages } from './listInboxMessages'
import { ListOutboxMessages } from './listOutboxMessages'

import { ManagementActionTypes } from '../../../../state/management/types'
import {
  AccountActionTypes,
  DecryptedMailbox,
  SET_INBOX_MESSAGES,
  SET_OUTBOX_MESSAGES,
} from '../../../../state/account/types'
import Account from '../index'

interface Props {
  account?: string
  privatekey?: PrivateKey
  inboxMessages: DecryptedMailbox[]
  outboxMessages: DecryptedMailbox[]
  dispatch: Dispatch<ManagementActionTypes | AccountActionTypes>
}

const SeriesIdentity: FC<Props> = ({
  privatekey,
  inboxMessages,
  outboxMessages,
  dispatch,
}: Props) => {
  React.useEffect(() => {
    setTimeout(async () => {
      dispatch({
        type: SET_INBOX_MESSAGES,
        payload: await Textile.listInboxMessages(),
      })
      dispatch({
        type: SET_OUTBOX_MESSAGES,
        payload: await Textile.listOutboxMessages(),
      })
    }, 0)
  }, [privatekey])

  const handleDelete = async (id: string) => {
    if (!privatekey) return
    await Textile.deleteMessage(id)
  }

  const handleDownload = async (obj: any) => {
    const dataStr =
      'data:text/json;charset=utf-8,' +
      encodeURIComponent(JSON.stringify(obj, undefined, 2))
    const a = document.createElement('a')
    a.href = 'data:' + dataStr
    a.download = 'report.json'
    a.innerHTML = 'download JSON'
    a.click()
  }

  return (
    <Account tab="messages">
      <h5>inbox</h5>
      <table className="table table-hover mb-5">
        <thead>
          <tr>
            <th scope="col">From</th>
            <th scope="col">Message</th>
            <th
              scope="col"
              className="d-none d-md-block"
              style={{ textAlign: 'right' }}
            >
              Action
            </th>
          </tr>
        </thead>
        {privatekey && (
          <tbody>
            <ListInboxMessages
              publicKey={privatekey.public.toString()}
              messages={inboxMessages}
              handleDelete={handleDelete}
              handleDownload={handleDownload}
            ></ListInboxMessages>
          </tbody>
        )}
      </table>
      <h5>sent</h5>
      <table className="table table-hover mb-5">
        <thead>
          <tr>
            <th scope="col">Message</th>
            <th
              scope="col"
              className="d-none d-md-block"
              style={{ textAlign: 'right' }}
            >
              Action
            </th>
          </tr>
        </thead>
        <tbody>
          {privatekey && (
            <ListOutboxMessages
              publicKey={privatekey.public.toString()}
              messages={outboxMessages}
              handleDelete={handleDelete}
            ></ListOutboxMessages>
          )}
        </tbody>
      </table>
    </Account>
  )
}

export default connect((state: IState) => ({
  account: state.account.account,
  inboxMessages: state.account.inboxMessages,
  outboxMessages: state.account.outboxMessages,
  privatekey: state.account.privatekey,
}))(SeriesIdentity)

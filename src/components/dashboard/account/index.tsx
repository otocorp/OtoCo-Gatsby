import React, { Dispatch, FC, useState } from 'react'
import { Link } from 'gatsby'
import { connect } from 'react-redux'
import { IState } from '../../../state/types'
import Textile from '../../../services/textile'
import { PrivateKey } from '@textile/hub'
import NotificationForm from '../welcomeForm'
import { ChevronLeft } from 'react-bootstrap-icons'
import Icon from '../../icon/icon'

import {
  SeriesType,
  ManagementActionTypes,
} from '../../../state/management/types'
import {
  AccountActionTypes,
  DecryptedMailbox,
  SET_INBOX_MESSAGES,
  SET_OUTBOX_MESSAGES,
} from '../../../state/account/types'

import '../style.scss'

interface Props {
  account?: string
  network?: string
  managing?: SeriesType
  alias?: string
  privatekey?: PrivateKey
  inboxMessages: DecryptedMailbox[]
  outboxMessages: DecryptedMailbox[]
  dispatch: Dispatch<ManagementActionTypes | AccountActionTypes>
  children?: React.ReactNode
  tab: string
}

const Account: FC<Props> = ({
  account,
  privatekey,
  dispatch,
  children,
  tab,
}: Props) => {
  const [error, setError] = useState<string>('')

  React.useEffect(() => {
    setTimeout(async () => {
      try {
        if (!privatekey) return
        setError('')
        dispatch({
          type: SET_INBOX_MESSAGES,
          payload: await Textile.listInboxMessages(),
        })
        dispatch({
          type: SET_OUTBOX_MESSAGES,
          payload: await Textile.listOutboxMessages(),
        })
      } catch (err) {
        console.error(err)
        setError('An error ocurred acessing messaging service.')
      }
    }, 0)
  }, [account, privatekey])

  return (
    <div className="container-sm limiter-md content">
      <Link
        className="btn btn-back btn-primary-outline btn-sm"
        to={`/dashpanel/`}
      >
        <ChevronLeft />
        <span style={{ paddingLeft: '10px' }}>Back</span>
      </Link>
      {account && !privatekey && <NotificationForm></NotificationForm>}
      {!error && account && privatekey && (
        <div>
          <div className="card">
            <div className="card-body">
              <ul className="nav nav-account justify-content-left">
                <li className="nav-item">
                  <Link
                    className={`nav-link ${tab == 'messages' ? 'active' : ''}`}
                    aria-current="page"
                    to="/dashpanel/account/messages"
                  >
                    Messages
                  </Link>
                </li>
                <li className="nav-item">
                  <Link
                    className={`nav-link ${tab == 'settings' ? 'active' : ''}`}
                    aria-current="page"
                    to="/dashpanel/account/settings"
                  >
                    Settings
                  </Link>
                </li>
              </ul>
              {children}
            </div>
          </div>
        </div>
      )}
      {!account && (
        <div className="d-flex justify-content-center">
          <div className="row">
            <div className="col-12 text-center">No account connected.</div>
          </div>
        </div>
      )}
      {error && (
        <div className="d-flex justify-content-center">
          <div className="row">
            <div className="col-12 text-center text-warning">{error}</div>
            <div className="col-12 text-center">Try again in some minutes.</div>
          </div>
        </div>
      )}
    </div>
  )
}

export default connect((state: IState) => ({
  account: state.account.account,
  network: state.account.network,
  alias: state.account.alias,
  inboxMessages: state.account.inboxMessages,
  outboxMessages: state.account.outboxMessages,
  privatekey: state.account.privatekey,
  managing: state.management.managing,
}))(Account)

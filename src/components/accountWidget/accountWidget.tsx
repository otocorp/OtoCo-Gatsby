import React, { useEffect, Dispatch, FC, useState } from 'react'
import Web3 from 'web3'
import { CSSTransition } from 'react-transition-group'
import Web3Integrate from '../../services/web3-integrate'
import { connect } from 'react-redux'
import { IState } from '../../state/types'
import {
  Bell,
  BellFill,
  XDiamond,
  Clipboard,
  ChevronDown,
  PencilSquare,
  BoxArrowRight,
} from 'react-bootstrap-icons'
import {
  SET_ACCOUNT,
  SET_NETWORK,
  DISCONNECT,
  SET_ALIAS,
  SET_PRIVATEKEY,
  SET_INBOX_MESSAGES,
  ADD_INBOX_MESSAGES,
  SET_OUTBOX_MESSAGES,
  DecryptedMailbox,
  AccountActionTypes,
} from '../../state/account/types'

import './style.scss'
import { Link } from 'gatsby'
import Textile from '../../services/textile'
import { PrivateKey } from '@textile/hub'
import OtocoIcon from '../icons'

interface Props {
  account?: string
  alias?: string
  privatekey?: string
  network?: string
  inboxMessages: DecryptedMailbox[]
  dispatch: Dispatch<AccountActionTypes>
}

const AccountWidget: FC<Props> = ({
  account,
  alias,
  privatekey,
  network,
  inboxMessages,
  dispatch,
}: Props) => {
  const [show, setShow] = useState(true)
  const [collapsed, setCollapse] = useState(true)

  const handleConnect = async () => {
    const web3: Web3 = await Web3Integrate.callModal()
    //const web3: Web3 = window.web3
    const accounts = await web3.eth.getAccounts()
    dispatch({
      type: SET_NETWORK,
      payload: await web3.eth.net.getNetworkType(),
    })
    dispatch({ type: SET_ACCOUNT, payload: accounts[0] })
  }

  const handleScroll = (event) => {
    if (event.target.scrollTop < 20) {
      setShow(true)
    } else {
      setShow(false)
    }
    setCollapse(true)
  }

  React.useEffect(() => {
    window.addEventListener('scroll', handleScroll, true)
    setCollapse(true)
  }, [account, show])

  React.useEffect(() => {
    setTimeout(async () => {
      if (!account) return
      const cached = await Textile.fetchIdentity(
        account,
        process.env.GATSBY_PASSWORD
      )
      if (cached) {
        if (cached.alias.length > 0)
          dispatch({ type: SET_ALIAS, payload: cached.alias })
        dispatch({
          type: SET_PRIVATEKEY,
          payload: PrivateKey.fromString(cached.key),
        })
        // Textile.setCallbackInbox(callbackInboxNewMessage)
      } else {
        dispatch({ type: SET_PRIVATEKEY, payload: null })
        dispatch({ type: SET_ALIAS, payload: null })
      }
    }, 0)
  }, [account])

  React.useEffect(() => {
    const interval = setInterval(async () => {
      dispatch({
        type: SET_INBOX_MESSAGES,
        payload: await Textile.listInboxMessages(),
      })
      dispatch({
        type: SET_OUTBOX_MESSAGES,
        payload: await Textile.listOutboxMessages(),
      })
    }, 120000)
    return () => clearInterval(interval)
  }, [privatekey])

  const handleDisconnect = () => {
    Web3Integrate.disconnect()
    dispatch({ type: DISCONNECT })
  }

  const handleDropdown = () => {
    setCollapse(!collapsed)
  }

  const callbackInboxNewMessage = (message: DecryptedMailbox) => {
    dispatch({
      type: ADD_INBOX_MESSAGES,
      payload: message,
    })
  }

  return (
    <CSSTransition in={show} timeout={200} classNames="slide-up" unmountOnExit>
      <div className="account-widget">
        {account && (
          <div className="vert">
            <div className="p-3 shine-on-hover" onClick={handleDropdown}>
              <OtocoIcon icon="chainclosed" size="16px" className="me-3" />
              {alias && <span>{alias}</span>}
              {!alias && (
                <span>
                  {account.substring(0, 8)}...
                  {account.substring(account.length - 4, account.length)}
                </span>
              )}
              <Link to="/dashpanel/account/messages/">
                {inboxMessages.length > 0 && (
                  <OtocoIcon
                    icon="bellring"
                    size="16px"
                    className="mx-3 text-warning bell-animation"
                  />
                )}
                {inboxMessages.length == 0 && (
                  <OtocoIcon icon="bell" size="16px" className="mx-3" />
                )}
              </Link>
              <ChevronDown className={collapsed ? 'icon' : 'icon rotated'} />
            </div>
            {/* {!collapsed && privatekey != undefined && (
              <div className="pt-3 pb-2 px-3 with-divider shine-on-hover">
                <OtocoIcon icon="clipboard" size="16px" className="me-3" />
                Copy Account Public Key
              </div>
            )} */}
            {!collapsed && privatekey != undefined && (
              <Link
                className="py-3 px-3 with-divider shine-on-hover"
                to="/dashpanel/account/settings"
              >
                <OtocoIcon icon="pencil" size="16px" className="me-3" />
                My Account settings
              </Link>
            )}
            {!collapsed && (
              <div
                className="p-3 with-divider shine-on-hover"
                onClick={handleDisconnect}
              >
                <BoxArrowRight size="16px" className="me-3" />
                Disconnect
              </div>
            )}
          </div>
        )}
        {!account && (
          <div className="p-3" onClick={handleConnect}>
            Connect your Wallet{' '}
            <OtocoIcon icon="chainopen" size="16px" className="ms-3" />
          </div>
        )}
      </div>
    </CSSTransition>
  )
}

export default connect((state: IState) => ({
  account: state.account.account,
  alias: state.account.alias,
  privatekey: state.account.privatekey,
  network: state.account.network,
  inboxMessages: state.account.inboxMessages,
}))(AccountWidget)

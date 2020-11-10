import React, { FC, Dispatch, useState } from 'react'
import Web3 from 'web3'
import { connect } from 'react-redux'
import { CSSTransition } from 'react-transition-group'
import { IState } from '../../state/types'
import Web3Integrate from '../../services/web3-integrate'
import SeriesListing from './seriesListing'
import SeriesManagement from './seriesManagement'
import ContactForm from './contactForm'

import database from '../../services/firebase'

import MainContract from '../../smart-contracts/MainContract'
import SeriesContract from '../../smart-contracts/SeriesContract'

import './style.scss'

import {
  SET_ACCOUNT,
  SET_NETWORK,
  AccountActionTypes,
} from '../../state/account/types'

import {
  SeriesType,
  SET_OWN_SERIES,
  SET_CONTACT_FORM,
  ManagementActionTypes,
} from '../../state/management/types'

import { IJurisdictionOption } from '../../state/spinUp/types'

interface Props {
  account?: string
  network?: string
  series: SeriesType[]
  managing?: SeriesType
  jurisdictionOptions: IJurisdictionOption[]
  contactForm: boolean
  dispatch: Dispatch<
    AccountActionTypes | ManagementActionTypes | AccountActionTypes
  >
}

const Dashboard: FC<Props> = ({
  account,
  network,
  managing,
  series,
  jurisdictionOptions,
  contactForm,
  dispatch,
}: Props) => {
  const [error, setError] = useState<string | null>(null)
  const contactFormLastRequest = async () => {
    const now = new Date()
    now.setDate(now.getDate() - 10)
    try {
      const lastRequest = new Date(
        window.localStorage.getItem('contactFormLastRequest')
      )
      if (lastRequest < now) throw 'Must show form'
    } catch (err) {
      dispatch({ type: SET_CONTACT_FORM, payload: true })
    }
  }

  React.useEffect(() => {
    setTimeout(async () => {
      // IF NOT CONNECTED YET
      setError(null)
      dispatch({ type: SET_OWN_SERIES, payload: [] })
      if (!account) {
        try {
          await Web3Integrate.callModal()
          const web3: Web3 = window.web3
          const accounts = await web3.eth.getAccounts()
          dispatch({
            type: SET_NETWORK,
            payload: await web3.eth.net.getNetworkType(),
          })
          dispatch({ type: SET_ACCOUNT, payload: accounts[0] })
          return
        } catch (err) {
          setError('Error connecting wallet. ' + err)
        }
      }
      // ALREADY CONNECTED
      const web3: Web3 = window.web3
      const ownSeries: SeriesType[] = []

      if (!web3) {
        setError('Failed to connect wallet.')
        return
      }
      if (!network) {
        setError('Unknown network.')
        return
      }
      setError(null)
      if (!(await database.getFilling(account))) contactFormLastRequest()
      for (const j of jurisdictionOptions) {
        const seriesAddresses = await MainContract.getContract(network, j.value)
          .methods.mySeries()
          .call({ from: account })

        for (const s of seriesAddresses) {
          const newSeries: SeriesType = {
            jurisdiction: j.text,
            contract: s,
            created: new Date(),
            name: '',
            owner: '',
          }
          // window.testContract = SeriesContract.getContract(s);
          const events = await SeriesContract.getContract(
            s
          ).getPastEvents('allEvents', { fromBlock: 0, toBlock: 'latest' })
          const timestamp = await web3.eth.getBlock(events[0].blockNumber)
          newSeries.created = new Date(
            parseInt(timestamp.timestamp.toString()) * 1000
          )
          newSeries.name = await SeriesContract.getContract(s)
            .methods.getName()
            .call({ from: account })
          newSeries.owner = await SeriesContract.getContract(s)
            .methods.owner()
            .call({ from: account })
          ownSeries.push(newSeries)
        }
        dispatch({ type: SET_OWN_SERIES, payload: ownSeries })
        if (ownSeries.length < 1)
          setError('You own no companies at the moment.')
        else setError(null)
      }
    }, 0)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [account])

  return (
    <div style={{ position: 'relative' }}>
      <CSSTransition
        in={contactForm}
        timeout={{
          appear: 200,
          enter: 200,
          exit: 0,
        }}
        classNames="my-node"
        unmountOnExit
      >
        <ContactForm></ContactForm>
      </CSSTransition>
      <CSSTransition
        in={!contactForm && managing !== undefined && account !== undefined}
        timeout={{
          appear: 200,
          enter: 200,
          exit: 0,
        }}
        classNames="my-node"
        unmountOnExit
      >
        <SeriesManagement></SeriesManagement>
      </CSSTransition>
      <CSSTransition
        in={!contactForm && series.length > 0 && !managing}
        timeout={{
          appear: 200,
          enter: 200,
          exit: 0,
        }}
        classNames="my-node"
        unmountOnExit
      >
        <SeriesListing></SeriesListing>
      </CSSTransition>
      <CSSTransition
        in={
          !contactForm && series.length == 0 && account !== undefined && !error
        }
        timeout={{
          appear: 200,
          enter: 200,
          exit: 0,
        }}
        classNames="my-node"
        unmountOnExit
      >
        <div className="d-flex justify-content-center">
          <div className="row">
            <div className="col-12 text-center">Loading Companies</div>
            <div className="col-12 text-center">
              <div className="spinner-border" role="status"></div>
            </div>
          </div>
        </div>
      </CSSTransition>
      {error && (
        <div className="d-flex justify-content-center">
          <div className="row">
            <div className="col-12 text-warning">Warning: {error}</div>
            {account === null && (
              <div className="col-12 text-warning">Wallet Not Connected.</div>
            )}
            {network === null && (
              <div className="col-12 text-warning">Invalid Network.</div>
            )}
            {network && (
              <div className="col-12 text-warning">
                Network selected: {network}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default connect((state: IState) => ({
  account: state.account.account,
  network: state.account.network,
  jurisdictionOptions: state.spinUp.jurisdictionOptions,
  managing: state.management.managing,
  series: state.management.series,
  contactForm: state.management.contactForm,
}))(Dashboard)

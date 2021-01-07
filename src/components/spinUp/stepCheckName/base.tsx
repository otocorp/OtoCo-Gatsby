import React, { Dispatch, FC, useState } from 'react'
import Web3 from 'web3'
import { Link } from 'gatsby'
import Icon from '../../icon/icon'
import axios from 'axios'
import { connect } from 'react-redux'
import { IState } from '../../../state/types'
import { faCheckCircle, faTimesCircle } from '@fortawesome/free-solid-svg-icons'
import {
  SET_CURRENT_STEP,
  SET_COMPANY_NAME,
  SET_AVAILABLE_NAME,
  CLEAR_AVAILABLE_NAME,
  SpinUpActionTypes,
} from '../../../state/spinUp/types'
import './style.scss'

import MainContract from '../../../smart-contracts/MainContract'
import TransactionMonitor from '../../transactionMonitor/transactionMonitor'
import JurisdictionSelector from '../jurisdictionSelector/jurisdictionSelector'

interface Props {
  companyName: string
  availableName: string
  jurisdictionName: string
  jurisdictionStreet: { [key: string]: string }
  jurisdictionSelected: string
  dispatch: Dispatch<SpinUpActionTypes>
}

const StepCheckName: FC<Props> = ({
  jurisdictionSelected,
  jurisdictionName,
  jurisdictionStreet,
  companyName,
  availableName,
  dispatch,
}: Props) => {
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const formatBreakLines = (text: string) => {
    return text.split(',').map((elem, idx) => <div key={idx}>{elem}</div>)
  }

  const formatName = (name: string, jurisdiction?: string) => {
    if (jurisdiction == 'us_de')
      return name
        .substring(0, name.length - 4)
        .toLowerCase()
        .trim()
    if (jurisdiction == 'us_wy')
      return name.split(' - Series')[0].toLowerCase().trim()
    return name.toLowerCase()
  }

  const clickCheckHandle = async () => {
    dispatch({ type: CLEAR_AVAILABLE_NAME })
    setError(false)
    setLoading(true)
    try {
      const opencorporates_result = await axios.get(
        `https://api.opencorporates.com/v0.4.8/companies/search?q=${encodeURIComponent(
          companyName + ' LLC'
        )}&jurisdiction_code=${jurisdictionSelected}&api_token=${
          process.env.GATSBY_OPENCORPORATES_KEY
        }`
      )
      const conflictOpenCorporates =
        opencorporates_result.data.results.total_count > 0

      const ws_provider =
        'wss://mainnet.infura.io/ws/v3/f2e6a40391274a0793c63e923de0a170'
      const web3 = new Web3(new Web3.providers.WebsocketProvider(ws_provider))
      const contract = new web3.eth.Contract(
        MainContract.abi,
        MainContract.addresses['main_' + jurisdictionSelected]
      )
      const contractEvents = await contract.getPastEvents('NewSeriesCreated', {
        fromBlock: 10318659,
        toBlock: 'latest',
      })
      const conflictSeries = contractEvents
        .map((elem) => elem.returnValues[2])
        .some((elem) => {
          if (formatName(elem, jurisdictionSelected) == formatName(companyName))
            return true
          return false
        })
      if (conflictSeries || conflictOpenCorporates) {
        setError('taken')
      } else {
        dispatch({ type: SET_AVAILABLE_NAME })
      }
    } catch (err) {
      console.log(err)
      setError('unavailable')
    }
    setLoading(false)
  }

  const clickBackHandle = () => {
    setError('')
    setLoading(false)
    dispatch({ type: CLEAR_AVAILABLE_NAME })
    dispatch({ type: SET_CURRENT_STEP, payload: 0 })
  }

  const clickNextHandle = () => {
    dispatch({ type: SET_CURRENT_STEP, payload: 2 })
    setError('taken')
  }

  const changeNameHandler = (e: React.FormEvent<HTMLInputElement>) => {
    setError('')
    dispatch({ type: CLEAR_AVAILABLE_NAME })
    dispatch({ type: SET_COMPANY_NAME, payload: e.currentTarget.value })
  }

  return (
    <div className="row">
      {/* <p>
        Congrats! <b>{availableName}</b> is available for registration with the{' '}
        <b>{jurisdictionName}</b> State Registry.
      </p> */}
      <div className="col-12">
        <p>
          Enter your company name exactly
          <br />
          as you want it registered.
        </p>
      </div>
      <div className="col-12">
        <div className="input-group mb-4">
          <input
            type="text"
            className="form-control right"
            placeholder="Choose your company name"
            aria-label="Text input with dropdown button"
            onChange={changeNameHandler}
          />
          <div className="input-group-append">
            <button type="button" className="btn disabled">
              LLC
            </button>
          </div>
        </div>
      </div>
      <div className="col-6 spacer-h">
        <div>
          <JurisdictionSelector></JurisdictionSelector>
        </div>
        <div>
          {availableName && (
            <div className="mt-4">
              <div className="text-success">
                <Icon icon={faCheckCircle}></Icon>{' '}
                <span className="mx-2">Available Name.</span>
              </div>
            </div>
          )}
          {error === 'taken' && (
            <div className="mt-4">
              <div className="text-danger">
                <Icon icon={faTimesCircle}></Icon>{' '}
                <span className="mx-2">This name has been used.</span>
              </div>
            </div>
          )}
          {error === 'unavailable' && (
            <div className="mt-4">
              <div className="text-danger">
                <Icon icon={faTimesCircle}></Icon>{' '}
                <span className="mx-2">Search service is busy.</span>
                <div>Try again later.</div>
              </div>
            </div>
          )}
        </div>
      </div>
      <div className="col-6 spacer-h">
        <p className="small">
          {formatBreakLines(jurisdictionStreet[jurisdictionSelected])}
        </p>
      </div>
      <div className="col-12">
        {!availableName && (
          <div className="d-flex row-cols-2 pt-4 gap-5 flex-row">
            <button
              type="button"
              className="btn btn-primary-outline flex-fill"
              onClick={clickBackHandle}
            >
              Back
            </button>
            {!loading && (
              <button
                type="button"
                className="btn btn-primary flex-fill"
                onClick={clickCheckHandle}
              >
                Check
              </button>
            )}
            {loading && (
              <button type="button" className="btn flex-fill">
                Checking...{' '}
                <span
                  className="spinner-border spinner-border-sm"
                  role="status"
                  aria-hidden="true"
                ></span>
              </button>
            )}
          </div>
        )}
        {availableName && (
          <div className="d-flex pt-4 gap-5 flex-row">
            <button
              type="button"
              className="btn btn-primary-outline flex-fill"
              onClick={clickBackHandle}
            >
              Back
            </button>
            <button
              type="button"
              className="btn btn-primary flex-fill"
              onClick={clickNextHandle}
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default connect((state: IState) => ({
  availableName: state.spinUp.availableName,
  companyName: state.spinUp.companyName,
  jurisdictionSelected: state.spinUp.jurisdictionSelected,
  jurisdictionName: state.spinUp.jurisdictionName,
  jurisdictionStreet: state.spinUp.jurisdictionStreet,
}))(StepCheckName)

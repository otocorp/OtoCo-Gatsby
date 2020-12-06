import React, { Dispatch, FC, useState } from 'react'
import { Link } from 'gatsby'
import axios from 'axios'
import { connect } from 'react-redux'
import { IState } from '../../../state/types'
import {
  SET_CURRENT_STEP,
  SET_COMPANY_NAME,
  SET_AVAILABLE_NAME,
  CLEAR_AVAILABLE_NAME,
  SpinUpActionTypes,
} from '../../../state/spinUp/types'

import JurisdictionSelector from '../jurisdictionSelector/jurisdictionSelector'

interface Props {
  companyName: string
  availableName: string
  jurisdictionName: string
  jurisdictionStreet: { [key: string]: string }
  jurisdictionSelected: string
  dispatch: Dispatch<SpinUpActionTypes>
}

const CheckName: FC<Props> = ({
  jurisdictionSelected,
  jurisdictionName,
  jurisdictionStreet,
  companyName,
  availableName,
  dispatch,
}: Props) => {
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const clickCheckHandle = () => {
    dispatch({ type: CLEAR_AVAILABLE_NAME })
    setLoading(true)
    axios
      .get(
        `https://api.opencorporates.com/v0.4.8/companies/search?q=${encodeURIComponent(
          companyName + ' LLC'
        )}&jurisdiction_code=${jurisdictionSelected}?api_token=${process.env.GATSBY_OPENCORPORATES_KEY}`
      )
      .then(function ({ data }) {
        if (data.results.total_count === 0) {
          dispatch({ type: SET_AVAILABLE_NAME })
        } else {
          setError('taken')
          setLoading(false)
        }
      })
      .catch(function (resp) {
        setLoading(false)
        setError('unavailable')
      })
  }

  const clickBackHandle = () => {
    setError('')
    setLoading(false)
    dispatch({ type: CLEAR_AVAILABLE_NAME })
  }

  const clickNextHandle = () => {
    dispatch({ type: SET_CURRENT_STEP, payload: 1 })
    setError('taken')
  }

  const changeNameHandler = (e: React.FormEvent<HTMLInputElement>) => {
    setError('')
    dispatch({ type: SET_COMPANY_NAME, payload: e.currentTarget.value })
  }

  return (
    <div>
      {!availableName && (
        <div className="input-group mb-4">
          <input
            type="text"
            className="form-control right"
            placeholder="Choose your company name"
            aria-label="Text input with dropdown button"
            onChange={changeNameHandler}
          />
          <JurisdictionSelector />
        </div>
      )}
      {error === 'taken' && (
        <div className="mt-4">
          <p className="text-danger">Sorry! This name has been used.</p>
          <p className="small">Please Enter Another Company Name.</p>
        </div>
      )}
      {error === 'unavailable' && (
        <div className="mt-4">
          <p className="text-danger">Sorry! Please try again later.</p>
          <p className="small">Search API service is busy.</p>
        </div>
      )}
      {!availableName && (
        <div className="mt-4">
          <p className="small">
            Enter your company name exactly as you want it registered.
          </p>
          <p className="small">
            Click <b>Check</b> to verify if your preferred name is available.
          </p>
          <p className="small">
            Click <b>My Dashboard</b> if you want to manage your deployed LLC.
          </p>
          <Link to="/dashboard/" className="btn btn-primary mr-4">
            My Dashboard
          </Link>
          {!loading && (
            <button
              type="button"
              className="btn btn-primary"
              onClick={clickCheckHandle}
            >
              Check
            </button>
          )}
          {loading && (
            <button className="btn" type="button">
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
        <div>
          <p>
            Congrats! <b>{availableName}</b> is available for registration with
            the <b>{jurisdictionName}</b> State Registry.
          </p>
          <p className="small">
            Your new company will have its registered address at:
            <br />
            <b>{jurisdictionStreet[jurisdictionSelected]}</b>
          </p>
          {jurisdictionSelected == 'us_wy' && (
            <p className="bold-text small">
              The full legal name is{' '}
              <b>OtoCo WY LLC - {availableName} - Series #</b> (the series
              number).
            </p>
          )}
          <p className="small">
            Click <b>Next</b> to proceed or go Back to try a different name.
          </p>
          <button
            type="button"
            className="btn btn-primary mr-4"
            onClick={clickBackHandle}
          >
            Back
          </button>
          <button
            type="button"
            className="btn btn-primary"
            onClick={clickNextHandle}
          >
            Next
          </button>
        </div>
      )}
    </div>
  )
}

export default connect((state: IState) => ({
  availableName: state.spinUp.availableName,
  companyName: state.spinUp.companyName,
  jurisdictionSelected: state.spinUp.jurisdictionSelected,
  jurisdictionName: state.spinUp.jurisdictionName,
  jurisdictionStreet: state.spinUp.jurisdictionStreet,
}))(CheckName)

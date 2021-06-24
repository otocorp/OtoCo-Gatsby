import React, { Dispatch, FC, useState } from 'react'
import { connect } from 'react-redux'
import { IState } from '../../../state/types'
import {
  SET_JURISDICTION,
  CLEAR_AVAILABLE_NAME,
  SpinUpActionTypes,
  ISpinUpState,
  IJurisdictionOption,
} from '../../../state/spinUp/types'
import './style.scss'

interface Props {
  jurisdictionSelected: string
  jurisdictionName: string
  jurisdictionOptions: IJurisdictionOption[]
  jurisdictionStreet: { [key: string]: string }
  dispatch: Dispatch<SpinUpActionTypes>
}

const JurisdictionSelector: FC<Props> = ({
  jurisdictionSelected,
  jurisdictionOptions,
  jurisdictionName,
  dispatch,
}: Props) => {
  const clickHandle = () => {
    // dispatch({ type: SET_CURRENT_STEP, payload: 1 })
  }

  const selectJurisdictionHandler = (val: IJurisdictionOption) => {
    dispatch({ type: CLEAR_AVAILABLE_NAME })
    dispatch({ type: SET_JURISDICTION, payload: val })
  }

  const listJurisdictions = jurisdictionOptions.map((j, idx) => (
    <li key={idx}>
      <a
        className="dropdown-item"
        onClick={selectJurisdictionHandler.bind(undefined, j)}
      >
        {j.text}
      </a>
    </li>
  ))

  return (
    <div className="dropdown d-flex">
      <button
        className="btn btn-primary-outline dropdown-toggle"
        type="button"
        data-bs-toggle="dropdown"
        aria-expanded="false"
      >
        {jurisdictionName}
      </button>
      <ul className="dropdown-menu">{listJurisdictions}</ul>
    </div>
  )
}

export default connect((state: IState) => ({
  jurisdictionSelected: state.spinUp.jurisdictionSelected,
  jurisdictionOptions: state.spinUp.jurisdictionOptions,
  jurisdictionName: state.spinUp.jurisdictionName,
  jurisdictionStreet: state.spinUp.jurisdictionStreet,
}))(JurisdictionSelector)

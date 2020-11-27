import React, { Dispatch, FC, useState } from 'react'
import Web3 from 'web3'
import { connect } from 'react-redux'
import { faChevronLeft } from '@fortawesome/free-solid-svg-icons'
import Icon from '../icon/icon'
import Address from '../addressWidget/addressWidget'
import UTCDate from '../utcDate/utcDate'
import {
  CLEAR_MANAGE_SERIES,
  SeriesType,
  ManagementActionTypes,
} from '../../state/management/types'
import { IState } from '../../state/types'

import SeriesDocuments from './seriesDocuments'
import SeriesENS from './seriesENS'
import SeriesToken from './seriesToken'
import SeriesMultisig from './seriesMultisig'

interface Props {
  account?: string | null
  network?: string | null
  managing?: SeriesType
  dispatch: Dispatch<ManagementActionTypes>
}

const SeriesManagement: FC<Props> = ({
  account,
  network,
  managing,
  dispatch,
}: Props) => {
  const handleClickBack = () => {
    dispatch({ type: CLEAR_MANAGE_SERIES })
  }

  return (
    <div>
      <h4>
        <button className="btn btn-primary-outline" onClick={handleClickBack}>
          <Icon icon={faChevronLeft} />
          <span style={{ paddingLeft: '10px' }}>Back to Series</span>
        </button>
      </h4>
      {managing !== undefined && (
        <div>
          <div className="row">
            <h4 className="col-9">{managing?.name}</h4>
            <div className="col-3 pull-right">
              <span className="jurisdiction small pull-right">
                {managing?.jurisdiction}
              </span>
            </div>
          </div>
          <div>
            <div>
              Creation: <UTCDate date={managing.created} separator=""></UTCDate>
            </div>
            <div>
              Manager: <Address address={managing.owner}></Address>
            </div>
            <div>
              Address: <Address address={managing.contract}></Address>
            </div>
            <div className="small text-warning">
              Your company address is not a wallet. Please do never send{' '}
              ether/tokens to this address.
            </div>
          </div>
          <div>
            <SeriesDocuments></SeriesDocuments>
            <SeriesMultisig></SeriesMultisig>
            <SeriesToken></SeriesToken>
            <SeriesENS></SeriesENS>
          </div>
        </div>
      )}
    </div>
  )
}

export default connect((state: IState) => ({
  account: state.account.account,
  network: state.account.network,
  managing: state.management.managing,
}))(SeriesManagement)

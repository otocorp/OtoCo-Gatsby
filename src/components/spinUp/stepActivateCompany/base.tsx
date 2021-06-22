import React, { Dispatch, FC, useState } from 'react'
import Web3, { TransactionReceipt } from 'web3'
import { navigate } from '@reach/router'
import { connect } from 'react-redux'
import { IState } from '../../../state/types'
import TransactionUtils from '../../../services/transactionUtils'
import TransactionMonitor from '../../transactionMonitor/transactionMonitor'
import MainContract from '../../../smart-contracts/MainContract'
import SeriesContract from '../../../smart-contracts/SeriesContract'
import {
  SET_ACCOUNT,
  SET_NETWORK,
  AccountActionTypes,
} from '../../../state/account/types'
import {
  SET_CURRENT_STEP,
  SET_COMPANY_NAME,
  CLEAR_AVAILABLE_NAME,
  SpinUpActionTypes,
  SET_COMPANY_CONTRACT,
} from '../../../state/spinUp/types'
import transactionMonitor from '../../transactionMonitor/transactionMonitor'

interface Props {
  account?: string
  network?: string
  availableName?: string
  jurisdictionName: string
  jurisdictionSelected: string
  jurisdictionStreet: { [key: string]: string }
  dispatch: Dispatch<AccountActionTypes | SpinUpActionTypes>
}

interface Request {
  from?: string
  gas: number
  gasPrice?: string
}

const StepActivateCompany: FC<Props> = ({
  account,
  network,
  availableName,
  jurisdictionSelected,
  jurisdictionName,
  jurisdictionStreet,
  dispatch,
}: Props) => {
  const [transaction, setTransaction] = useState('')
  const [fee, setFee] = useState(0)
  const [totalCost, setTotalCost] = useState(0)
  const gasCost = 710000

  const formatBreakLines = (text: string) => {
    return text.split(',').map((elem, idx) => <div key={idx}>{elem}</div>)
  }

  const clickCancelHandler = () => {
    dispatch({ type: CLEAR_AVAILABLE_NAME })
    dispatch({ type: SET_CURRENT_STEP, payload: 1 })
  }

  const clickActivateHandler = async () => {
    if (!account) return
    const requestInfo = await TransactionUtils.getTransactionRequestInfo(
      account,
      '800000'
    )
    MainContract.getContract(network, jurisdictionSelected)
      .methods.createSeries(availableName)
      .send(requestInfo, (error: any, hash: string) => {
        if (error) alert('Something went wrong! Please Try Again Later!')
        else {
          setTransaction(hash)
        }
      })
  }

  const handleConfirmedTransaction = async () => {
    const web3: Web3 = window.web3
    const receipt = await web3.eth.getTransactionReceipt(transaction)
    const contract = receipt.logs[3].address
    const finalName = await SeriesContract.getContract(contract)
      .methods.getName()
      .call({ from: account })
    dispatch({ type: SET_COMPANY_NAME, payload: finalName })
    dispatch({ type: SET_COMPANY_CONTRACT, payload: contract })
    dispatch({ type: SET_CURRENT_STEP, payload: 5 })
  }

  return (
    <div className="animate-slide-left">
      {!transaction && (
        <div>
          {/* <p className="normal-text">
            The current deployment cost is approximately. <b>{totalCost} ETH</b>
            .
          </p> */}
          <div>Upon activation, your wallet with address </div>
          <p className="text-primary font-monospace">{account}</p>
          <div>will be the First Member and Manager of: </div>
          {jurisdictionSelected === 'us_de' && (
            <div>
              <b>{availableName}</b> with registered address at:
            </div>
          )}
          {jurisdictionSelected === 'us_wy' && (
            <div>
              <b>{availableName} - Series ##</b> with registered address at:
            </div>
          )}
          <div className="my-3 text-primary">
            {formatBreakLines(jurisdictionStreet[jurisdictionSelected])}
          </div>
          <p>
            You will be able to download your new entity&apos;s Operating
            Agreement after activation.
          </p>
          <div className="d-flex row-cols-2 pt-4 gap-5 flex-row">
            <button
              className="btn btn-primary-outline flex-fill"
              onClick={clickCancelHandler}
            >
              Cancel
            </button>
            <button
              className="btn btn-primary flex-fill"
              onClick={clickActivateHandler}
            >
              Activate Company
            </button>
          </div>
        </div>
      )}
      {transaction && (
        <TransactionMonitor
          hash={transaction}
          title="Activating Company"
          callbackSuccess={handleConfirmedTransaction}
        ></TransactionMonitor>
      )}
    </div>
  )
}

export default connect((state: IState) => ({
  account: state.account.account,
  network: state.account.network,
  availableName: state.spinUp.availableName,
  jurisdictionSelected: state.spinUp.jurisdictionSelected,
  jurisdictionName: state.spinUp.jurisdictionName,
  jurisdictionStreet: state.spinUp.jurisdictionStreet,
}))(StepActivateCompany)

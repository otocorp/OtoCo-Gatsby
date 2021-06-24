import React, { FC, useState } from 'react'
import Web3 from 'web3'
import BN from 'bn.js'
import { connect } from 'react-redux'
import { CSSTransition } from 'react-transition-group'
import { IState } from '../../../state/types'
import ERC20Contract from '../../../smart-contracts/OtocoToken'
import LaunchPoolContract from '../../../smart-contracts/LaunchPool'
import TransactionUtils from '../../../services/transactionUtils'
import TransactionMonitor from '../../transactionMonitor/transactionMonitor'
import { TokensInterface, displayAmountConverter } from '../index'

import StakesList from './stakesList'
import { StakeInterface } from '../'
import './style.scss'

interface Props {
  account?: string
  opened: boolean
  poolId: string
  stakes: BN[]
  accountStakes: StakeInterface[]
  closeModal: () => void
}

const UnstakeWidget: FC<Props> = ({
  account,
  opened,
  poolId,
  accountStakes,
  closeModal,
}: Props) => {
  const [countdown, setCountdown] = useState<boolean>(false)
  const [transaction, setHash] = useState<string | null>(null)
  const [error, setError] = useState<string>('')

  const handleUnstake = async (index: number) => {
    if (!account) return
    setError('')
    const requestInfo = await TransactionUtils.getTransactionRequestInfo(
      account,
      '400000'
    )
    try {
      const hash: string = await new Promise((resolve, reject) => {
        LaunchPoolContract.getContract(poolId)
          .methods.unstake(index)
          .send(requestInfo, (error: Error, hash: string) => {
            if (error) reject(error.message)
            else resolve(hash)
          })
      })
      setHash(hash)
    } catch (err) {
      console.error('Unstaking error', err)
      setError(err.message)
    }
  }

  const handleCloseModal = async () => {
    setError('')
    setHash(null)
    closeModal()
  }

  const transactionFinished = async () => {
    setHash(null)
  }

  React.useEffect(() => {
    if (opened) {
      setTimeout(() => {
        setCountdown(true)
      }, 200)
    } else {
      setCountdown(false)
    }
  }, [opened])

  return (
    <div>
      {opened && (
        <div className="modal-widget">
          <CSSTransition
            in={countdown}
            timeout={{
              appear: 200,
              enter: 200,
              exit: 200,
            }}
            classNames="slide-up"
            unmountOnExit
          >
            <div className="modal-content">
              <div className="close" onClick={handleCloseModal}>
                &times;
              </div>
              <h3>Your Stakes</h3>
              <table className="table table-hover mb-5">
                <thead>
                  <tr>
                    <th scope="col" className={'table-header'}>
                      Queue
                    </th>
                    <th
                      scope="col"
                      className="text-end d-none d-md-table-cell table-header"
                    >
                      Amount
                    </th>
                    <th
                      scope="col"
                      className="text-end d-none d-md-table-cell table-header"
                    >
                      Your Purchase Price
                    </th>
                    <th
                      scope="col"
                      className="text-end d-none d-md-table-cell table-header"
                    >
                      Number of Tokens
                    </th>
                    <th
                      scope="col"
                      className="text-end d-table-cel d-md-none table-header"
                    >
                      Info
                    </th>
                    <th scope="col" className="text-end table-header">
                      Unstake
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <StakesList
                    stakes={accountStakes}
                    handleUnstake={handleUnstake}
                  ></StakesList>
                </tbody>
              </table>
              {transaction && (
                <TransactionMonitor
                  hash={transaction}
                  title="Unstaking Tokens"
                  callbackSuccess={transactionFinished}
                ></TransactionMonitor>
              )}
              {error && <p className="small text-warning">{error}</p>}
            </div>
          </CSSTransition>
        </div>
      )}
    </div>
  )
}

export default connect((state: IState) => ({
  account: state.account.account,
}))(UnstakeWidget)

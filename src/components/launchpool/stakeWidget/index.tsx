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
import {
  TokensInterface,
  displayAmountConverter,
  LaunchPoolInterface,
  StakeInterface,
} from '../index'
import accounting from 'accounting'

import './style.scss'
import TokenSelector from './tokenSelector'
import StakesList from './stakesList'

interface Props {
  account?: string
  opened: boolean
  poolId: string
  tokens: TokensInterface[]
  accountStakes: StakeInterface[]
  infos: LaunchPoolInterface
  closeModal: () => void
}

const normalizeAmount = (amount: BN, decimals: number): BN => {
  return amount.mul(new BN(10).pow(new BN(18 - decimals)))
}

const StakeWidget: FC<Props> = ({
  account,
  opened,
  poolId,
  tokens,
  infos,
  closeModal,
}: Props) => {
  const [countdown, setCountdown] = useState<boolean>(false)
  const [transaction, setHash] = useState<string | null>(null)
  const [selectedToken, setSelectedToken] = useState<TokensInterface | null>(
    null
  )
  const [amountInput, setAmountInput] = useState<string | null>(null)
  const [approved, setApproved] = useState<BN>(new BN(0))
  const [balance, setBalance] = useState<BN>(new BN(0))
  const [error, setError] = useState<string>('')
  const [closeAfterConfirm, setCloseAfterConfirm] = useState<boolean>(false)

  const handleSetAmountInput = (event) => {
    if (!selectedToken) return
    setAmountInput(event.target.value.trim())
    setError('')
    if (event.target.value == '') return
    try {
      const selectedAmount = new BN(Web3.utils.toWei(event.target.value.trim()))
      if (normalizeAmount(balance, selectedToken.decimals).lt(selectedAmount)) {
        setError(
          `Not enough balance to approve ${accounting.formatMoney(
            event.target.value,
            {
              symbol: '',
              precision: 0,
            }
          )} ${selectedToken?.symbol}`
        )
        return
      }
      if (infos.stakeAmountMin.gt(selectedAmount)) {
        setError(
          `Stake should be bigger than ${accounting.formatMoney(
            Web3.utils.fromWei(infos.stakeAmountMin),
            {
              symbol: '',
              precision: 0,
            }
          )} ${selectedToken?.symbol}`
        )
        return
      }
      if (infos.stakeAmountMax.lt(selectedAmount)) {
        setError(
          `Stake should be smaller than ${accounting.formatMoney(
            Web3.utils.fromWei(infos.stakeAmountMax),
            {
              symbol: '',
              precision: 0,
            }
          )} ${selectedToken?.symbol}`
        )
        return
      }
    } catch (err) {
      setError('Not a valid stake amount')
    }
  }

  const refreshBalanceAndApproval = async (token: TokensInterface) => {
    setBalance(
      new BN(
        await ERC20Contract.getContract(token.address)
          .methods.balanceOf(account)
          .call({ from: account })
      )
    )
    setApproved(
      new BN(
        await ERC20Contract.getContract(token.address)
          .methods.allowance(account, poolId)
          .call({ from: account })
      )
    )
  }

  const handleSelectedToken = async (token: TokensInterface) => {
    setSelectedToken(token)
    refreshBalanceAndApproval(token)
  }

  const handleApprove = async () => {
    if (!account) return
    setError('')
    const requestInfo = await TransactionUtils.getTransactionRequestInfo(
      account,
      '200000'
    )
    try {
      if (!amountInput) throw { message: 'No amount defined.' }
      const amountToWei: BN = new BN(Web3.utils.toWei(amountInput))
      const decimalsToRemove = new BN(10).pow(
        new BN(18 - selectedToken?.decimals)
      )
      if (amountToWei.div(decimalsToRemove).gt(balance))
        throw { message: 'Not enough balance to approve specified amount.' }
      const hash: string = await new Promise((resolve, reject) => {
        ERC20Contract.getContract(selectedToken?.address)
          .methods.approve(poolId, amountToWei.div(decimalsToRemove).toString())
          .send(requestInfo, (error: any, hash: string) => {
            if (error) reject(error.message)
            else resolve(hash)
          })
      })
      setHash(hash)
      setCloseAfterConfirm(false)
    } catch (err) {
      console.error(err)
      setError('Error Approving: ' + err.message)
    }
  }

  const handleStake = async () => {
    if (!account) return
    setError('')
    const requestInfo = await TransactionUtils.getTransactionRequestInfo(
      account,
      '250000'
    )
    try {
      const hash: string = await new Promise((resolve, reject) => {
        LaunchPoolContract.getContract(poolId)
          .methods.stake(selectedToken?.address, approved.toString())
          .send(requestInfo, (error: Error, hash: string) => {
            if (error) reject(error.message)
            else resolve(hash)
          })
      })
      setHash(hash)
      setCloseAfterConfirm(true)
    } catch (err) {
      console.error('Staking error', err)
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
    if (closeAfterConfirm) closeModal()
    else refreshBalanceAndApproval(selectedToken)
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
              <h3>Stake</h3>
              <p className="small">Approve some funds to be staked.</p>
              <div>
                <div className="row justify-content-center">
                  <TokenSelector
                    tokens={tokens}
                    handleSelect={handleSelectedToken}
                  ></TokenSelector>
                </div>
                {balance.gte(new BN(0)) && (
                  <div className="input-group mt-4 col-12 col-md-6">
                    <input
                      type="text"
                      className={
                        'form-control right ' + (transaction ? 'disabled' : '')
                      }
                      placeholder="Choose amount to approve"
                      aria-label="Text input with dropdown button"
                      onChange={handleSetAmountInput}
                    />
                    <div className="input-group-append">
                      <button
                        className={`btn btn-primary ${
                          transaction || error || !amountInput ? 'disabled' : ''
                        } payment-approve`}
                        onClick={handleApprove}
                      >
                        Approve
                      </button>
                    </div>
                  </div>
                )}
                {selectedToken && (
                  <div className="row my-2">
                    <div className="col-12 col-md-6 small">
                      Approved:{' '}
                      {accounting.formatMoney(
                        displayAmountConverter(
                          approved,
                          selectedToken?.decimals
                        ),
                        ''
                      )}{' '}
                      {selectedToken?.symbol}
                    </div>
                    <div className="col-12 col-md-6 small">
                      Balance:{' '}
                      {accounting.formatMoney(
                        displayAmountConverter(
                          balance,
                          selectedToken?.decimals
                        ),
                        ''
                      )}{' '}
                      {selectedToken?.symbol}
                    </div>
                  </div>
                )}
              </div>
              {transaction && (
                <TransactionMonitor
                  hash={transaction}
                  title="Approving/Staking Tokens"
                  callbackSuccess={transactionFinished}
                ></TransactionMonitor>
              )}
              {!transaction && (
                <div>
                  {approved.gt(new BN(0)) && (
                    <>
                      <div className="alert alert-stake mt-3">
                        <div className="row p-3 fw-bold">{`Before you stake:`}</div>
                        <div className="row px-3 pb-3">
                          {`Be sure to check the transaction is a "stake" transaction in your wallet after clicking below!`}
                        </div>
                        <div className="flex-row px-1 pb-3">
                          {`Please also check the transaction's contract is *TBD* (${poolId})`}
                          <a
                            href={`https://etherscan.io/search?f=0&q=${poolId}`}
                            rel="noopener noreferrer"
                            target="_blank"
                          >
                            {' here.'}
                          </a>
                        </div>
                      </div>
                      <div className="row p-3">
                        <button
                          className="btn btn-primary"
                          onClick={handleStake}
                        >
                          Stake{' '}
                          {accounting.formatMoney(
                            displayAmountConverter(
                              approved,
                              selectedToken?.decimals
                            ),
                            ''
                          )}{' '}
                          {selectedToken?.symbol}
                        </button>
                      </div>
                    </>
                  )}
                </div>
              )}
              {error && <p className="small text-warning">{error}</p>}
              {!error && <p className="small">&nbsp;</p>}
            </div>
          </CSSTransition>
        </div>
      )}
    </div>
  )
}

export default connect((state: IState) => ({
  account: state.account.account,
}))(StakeWidget)

import React, { Dispatch, FC, useState } from 'react'
import Web3, { TransactionReceipt } from 'web3'
import { connect } from 'react-redux'
import { CSSTransition } from 'react-transition-group'
import { SeriesType, ManagementActionTypes } from '../../state/management/types'
import { IState } from '../../state/types'
import './style.scss'
import ERC20Contract from '../../smart-contracts/ERC20'
import TransactionUtils from '../../services/transactionUtils'
import { requestPaymentWyre, WyreEnv } from '../../services/wyre'
import { PrivateKey } from '@textile/crypto'
import { PaymentMessage, PaymentProps } from '../../state/account/types'
import Textile from '../../services/textile'
import OtocoIcon from '../icons'

enum StatusType {
  CLOSED = 'closed',
  OPENED = 'opened',
  PROCESSING = 'processing',
  SUCCESS = 'success',
}

interface Props {
  account?: string
  network?: string
  privatekey?: PrivateKey
  managing?: SeriesType
  show: boolean
  billId: string
  messageId: string
  product: string
  amount: number
  closeModal: () => void
  dispatch: Dispatch<ManagementActionTypes>
}

const PaymentWidget: FC<Props> = ({
  account,
  network,
  privatekey,
  managing,
  show,
  billId,
  messageId,
  product,
  amount,
  closeModal,
  dispatch,
}: Props) => {
  const [status, setStatus] = useState<StatusType>(StatusType.CLOSED)
  const [countdown, setCountdown] = useState<boolean>(false)
  // Recept informations
  const [receipt, setReceipt] = useState<PaymentProps | null>(null)
  const [error, setError] = useState<string>('')

  React.useEffect(() => {
    if (show) {
      setStatus(StatusType.OPENED)
      setTimeout(() => {
        setCountdown(true)
      }, 200)
    } else {
      setStatus(StatusType.CLOSED)
      setCountdown(false)
    }
  }, [show])

  const handleWyrePayment = async () => {
    const env = network == 'main' ? WyreEnv.PROD : WyreEnv.TEST
    if (!account || !network) return
    setStatus(StatusType.PROCESSING)
    try {
      const response = await requestPaymentWyre(env, amount)
      const receipt: PaymentProps = {
        receipt: response.id,
        method: 'WYRE',
        currency: 'USD',
        timestamp: response.timestamp,
      }
      setReceipt(receipt)
      setStatus(StatusType.SUCCESS)
      await sendPaymentMessage(receipt)
    } catch (err) {
      setStatus(StatusType.OPENED)
      setError('Payment failed or cancelled.')
      console.error('PAYMENT CANCELLED', err)
    }
  }
  const handleDAIPayment = async () => {
    if (!account || !network) return
    setError('')
    setStatus(StatusType.PROCESSING)
    try {
      const requestInfo = await TransactionUtils.getTransactionRequestInfo(
        account,
        '60000'
      )
      const hash: string = await new Promise((resolve, reject) => {
        ERC20Contract.getContractDAI(network)
          .methods.transfer(
            process.env.GATSBY_WYRE_WALLET,
            Web3.utils.toWei(amount.toString(), 'ether')
          )
          .send(requestInfo, (error: Error, hash: string) => {
            if (error) reject(error.message)
            else resolve(hash)
          })
      })

      // if (!r.status) throw 'Transaction Errored'
      const receipt: PaymentProps = {
        receipt: hash,
        method: 'DAI',
        currency: 'DAI',
        timestamp: Date.now(),
      }
      setReceipt(receipt)
      setStatus(StatusType.SUCCESS)
      await sendPaymentMessage(receipt)
    } catch (err) {
      setStatus(StatusType.OPENED)
      setError('Payment failed or cancelled.')
      console.error('PAYMENT CANCELLED', err)
    }
  }
  const handleUSDTPayment = async () => {
    if (!account || !network) return
    setError('')
    setStatus(StatusType.PROCESSING)
    try {
      const requestInfo = await TransactionUtils.getTransactionRequestInfo(
        account,
        '60000'
      )
      const hash: string = await new Promise((resolve, reject) => {
        ERC20Contract.getContractUSDT(network)
          .methods.transfer(
            process.env.GATSBY_WYRE_WALLET,
            Web3.utils.toWei(amount.toString(), 'mwei')
          )
          .send(requestInfo, (error: Error, hash: string) => {
            if (error) reject(error.message)
            else resolve(hash)
          })
      })
      // if (!r.status) throw 'Transaction Errored'
      const receipt: PaymentProps = {
        receipt: hash,
        method: 'USDT',
        currency: 'USDT',
        timestamp: Date.now(),
      }
      setReceipt(receipt)
      setStatus(StatusType.SUCCESS)
      // TODO In case of error sending message, suggest to RESEND receipt.
      await sendPaymentMessage(receipt)
    } catch (err) {
      // In case of error sending confirmation message
      if (status != StatusType.SUCCESS) {
        setStatus(StatusType.OPENED)
        setError('Payment failed or cancelled.')
        console.log('PAYMENT CANCELLED', err)
      } else {
        setError(
          'Error sending receipt to oracle, wait some minutes and click Re-send message.'
        )
      }
    }
  }
  const handleCloseModal = async () => {
    setError('')
    setReceipt(null)
    setStatus(StatusType.CLOSED)
    closeModal()
  }
  const sendPaymentMessage = async (receipt: PaymentProps) => {
    if (!privatekey) throw 'Error sending payment. No Private Key present.'
    if (!process.env.GATSBY_ORACLE_KEY)
      throw 'Error sending payment. No Oracle public key set.'
    if (!managing) throw 'Error sending payment. No receipt/company found.'
    const message: PaymentMessage = {
      _id: receipt.receipt,
      method: receipt.method,
      currency: receipt.currency,
      entity: managing.contract,
      environment: network,
      timestamp: receipt.timestamp,
      product,
      amount,
      status: 'PROCESSING',
      body: { billRef: billId },
    }
    await Textile.sendMessage(process.env.GATSBY_ORACLE_KEY, {
      method: 'payment',
      message,
    })
    await Textile.readMessage(messageId)
  }

  return (
    <div>
      {status !== StatusType.CLOSED && (
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
              <div
                className={`close ${
                  status == StatusType.OPENED || status == StatusType.SUCCESS
                }`}
                onClick={handleCloseModal}
              >
                &times;
              </div>
              {status == StatusType.OPENED && (
                <div>
                  <h3>Payment method</h3>
                  <div className="small">
                    Item: {product} -{' '}
                    <span className="text-secondary">({billId})</span>
                  </div>
                  <div className="row justify-content-center">
                    <button
                      className="btn btn-primary modal-option"
                      onClick={handleWyrePayment}
                    >
                      <OtocoIcon icon="creditcard" size={48} />
                      <div className="label">Card ${amount}</div>
                    </button>
                    <button
                      className="btn btn-primary modal-option"
                      onClick={handleDAIPayment}
                    >
                      <OtocoIcon icon="dai" size={48} />
                      <div className="label">{amount} DAI</div>
                    </button>
                    <button
                      className="btn btn-primary modal-option"
                      onClick={handleUSDTPayment}
                    >
                      <OtocoIcon icon="usdt" size={48} />
                      <div className="label">{amount} USDT</div>
                    </button>
                  </div>
                  <p className="small">
                    You will receive a message in your dashpanel once your
                    payment is confirmed.
                  </p>
                  {error && <p className="small text-warning">{error}</p>}
                </div>
              )}
              {status == StatusType.PROCESSING && (
                <div>
                  <h3>Processing Payment</h3>
                  <div className="small">Item: {product}</div>
                  <div
                    className="row justify-content-center align-items-center"
                    style={{ minHeight: '230px' }}
                  >
                    <div className="col">
                      <div className="col-12 text-center">
                        <div className="spinner-border" role="status"></div>
                      </div>
                      <div className="col-12 text-center">
                        <b>Payment confirming...</b>
                      </div>
                      <div className="col-12 text-center text-warning">
                        Do not close or refresh page
                      </div>
                    </div>
                  </div>
                </div>
              )}
              {status == StatusType.SUCCESS && (
                <div>
                  <h3>Payment Successfull</h3>
                  <div
                    className="row  align-items-center justify-content-center small"
                    style={{ minHeight: '230px' }}
                  >
                    <div className="col-12">
                      <b>Item:</b>
                      <span className="text-primary">{product}</span>
                    </div>
                    <div className="col-12">
                      <b>company: </b>
                      <span className="text-primary">
                        {managing?.name} ({managing?.jurisdiction})
                      </span>
                    </div>
                    <div className="col-12">
                      <b>receipt: </b>
                      <span className="text-primary">{receipt?.receipt}</span>
                    </div>
                    <div className="col-12">
                      <b>method: </b>
                      <span className="text-primary">{receipt?.method}</span>
                    </div>
                    <div className="col-12">
                      <b>amount: </b>
                      <span className="text-primary">{amount}</span>
                    </div>
                  </div>
                  {error && <p className="small text-warning">{error}</p>}
                </div>
              )}
            </div>
          </CSSTransition>
        </div>
      )}
    </div>
  )
}

export default connect((state: IState) => ({
  account: state.account.account,
  network: state.account.network,
  privatekey: state.account.privatekey,
  managing: state.management.managing,
}))(PaymentWidget)

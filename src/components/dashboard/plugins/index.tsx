import React, { Dispatch, FC, useState } from 'react'
import { connect } from 'react-redux'
import {
  SeriesType,
  ManagementActionTypes,
} from '../../../state/management/types'
import {
  AccountActionTypes,
  DecryptedMailbox,
  SET_INBOX_MESSAGES,
  SET_OUTBOX_MESSAGES,
} from '../../../state/account/types'
import Textile from '../../../services/textile'
import PaymentWidget from '../../paymentWidget'
import { IState } from '../../../state/types'
import { PaymentsMade } from './paymentsMade'
import { PaymentsDue } from './paymentsDue'
import { PrivateKey } from '@textile/crypto'
import WelcomeForm from '../welcomeForm'

interface Props {
  managing?: SeriesType
  privatekey?: PrivateKey
  inboxMessages: DecryptedMailbox[]
  outboxMessages: DecryptedMailbox[]
  dispatch: Dispatch<AccountActionTypes | ManagementActionTypes>
}

interface ModalProps {
  messageId: string
  billId: string
  product: string
  amount: number
}

const SeriesOverview: FC<Props> = ({
  managing,
  privatekey,
  inboxMessages,
  outboxMessages,
  dispatch,
}: Props) => {
  const [modalOpen, setModalOpen] = useState<boolean>(false)
  const [modalInfo, setModalInfo] = useState<ModalProps | null>(null)
  const [error, setError] = useState<string>('')

  React.useEffect(() => {
    setTimeout(async () => {
      if (!privatekey) return
      setError('')
      try {
        dispatch({
          type: SET_INBOX_MESSAGES,
          payload: await Textile.listInboxMessages(),
        })
        dispatch({
          type: SET_OUTBOX_MESSAGES,
          payload: await Textile.listOutboxMessages(),
        })
      } catch (err) {
        console.error(err)
        setError('An error ocurred acessing payment service.')
      }
    }, 0)
  }, [managing, privatekey])

  const closeModal = () => {
    setModalInfo(null)
    setModalOpen(false)
  }

  const handleSelectPlugin = async (
    p: string,
    messageId: string,
    billId: string,
    a: number
  ) => {
    setModalInfo({
      messageId,
      billId,
      product: p,
      amount: a,
    })
    setModalOpen(true)
  }

  return (
    <div>
      <div className="d-grid gap-1 mb-5">
        <h3 className="m-0">Billing</h3>
        <div className="small">
          Here you can pay for the maintenance of your entities and see what
          else you paid for.
        </div>
        {!privatekey && (
          <div className="d-flex justify-content-center">
            <div className="row">
              <WelcomeForm></WelcomeForm>
            </div>
          </div>
        )}
        {error && (
          <div className="d-flex justify-content-center">
            <div className="row">
              <div className="col-12 text-center text-warning">{error}</div>
              <div className="col-12 text-center">
                Try again in some minutes.
              </div>
            </div>
          </div>
        )}
        {!error && privatekey && (
          <div>
            <div>
              {/* <div className="py-4">
              <button
                className="btn btn-primary plugin-option"
                onClick={handleSelectPlugin.bind(undefined, 'Annual Dues', 39)}
              >
                <div className="label">Annual Dues</div>
                <FileMedical size={48}></FileMedical>
                <div className="label">39 USD</div>
              </button>
              {modalOpen}
            </div> */}
              <table className="table">
                <thead>
                  <tr>
                    <th scope="col">Item</th>
                    <th scope="col" className="text-end">
                      Amount
                    </th>
                    <th scope="col" className="text-end">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <PaymentsDue
                    contract={managing?.contract}
                    messages={inboxMessages}
                    handlePay={handleSelectPlugin}
                  ></PaymentsDue>
                </tbody>
              </table>
              <PaymentWidget
                show={modalOpen}
                messageId={modalInfo?.messageId}
                billId={modalInfo?.billId}
                product={modalInfo?.product}
                amount={modalInfo?.amount}
                closeModal={closeModal}
              ></PaymentWidget>
            </div>
            <h3 className="m-0">Payments made</h3>
            <div className="small">
              Easy place to check the payments you have made using plugins
            </div>
            <table className="table">
              <thead>
                <tr>
                  <th scope="col">Item</th>
                  <th scope="col">ID/Hash</th>
                  <th scope="col" className="text-end">
                    Timestamp
                  </th>
                  <th scope="col" className="text-end">
                    Amount
                  </th>
                </tr>
              </thead>
              <tbody>
                <PaymentsMade
                  contract={managing?.contract}
                  messages={outboxMessages}
                ></PaymentsMade>
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

export default connect((state: IState) => ({
  managing: state.management.managing,
  privatekey: state.account.privatekey,
  inboxMessages: state.account.inboxMessages,
  outboxMessages: state.account.outboxMessages,
}))(SeriesOverview)

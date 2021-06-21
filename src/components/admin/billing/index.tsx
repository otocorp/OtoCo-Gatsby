import { PrivateKey, PublicKey } from '@textile/hub'
import React, { FC, useState } from 'react'
import { connect } from 'react-redux'
import { IState } from '../../../state/types'
import Textile from '../../../services/textile'
import { BillingMessage } from '../../../state/account/types'

interface Props {
  network?: string
  privatekey?: PrivateKey
}

const Billing: FC<Props> = ({ network, privatekey }: Props) => {
  const [error, setError] = useState<string>('')
  const [confirmation, setConfirmation] = useState<string>('')
  const [product, setProduct] = useState<string>('')
  const [entity, setEntity] = useState<string>('')
  const [environment, setEnvironment] = useState<'main' | 'ropsten'>('main')
  const [amount, setAmount] = useState<number>(0)

  React.useEffect(() => {
    setTimeout(async () => {
      if (!privatekey) setError('No Account Key-pair found.')
      setEnvironment(network)
    }, 10)
  }, [privatekey, network])

  const handleChangeProduct = (event) => {
    setProduct(event.target.value)
  }
  const handleChangeEntity = (event) => {
    setEntity(event.target.value)
  }
  const handleChangeAmount = (event) => {
    setAmount(parseInt(event.target.value))
  }

  const handleBroadcastMessage = async (val) => {
    if (!privatekey) return
    if (!process.env.GATSBY_ORACLE_KEY) return

    const message: BillingMessage = {
      product,
      entity,
      environment,
      amount,
    }

    await Textile.sendMessage(process.env.GATSBY_ORACLE_KEY, {
      method: 'billing',
      message,
    })
  }

  return (
    <div>
      <div className="row">
        <div className="col-12">
          <div className="col-12 card">
            <div className="input-group mb-4">
              <input
                type="text"
                className="form-control right"
                placeholder="Item to pay for"
                onChange={handleChangeProduct}
              />
              <div className="input-group-append">
                <div className="btn btn-primary disabled">Product</div>
              </div>
            </div>
            <div className="input-group mb-4">
              <input
                type="text"
                className="form-control right"
                placeholder="Entity address"
                onChange={handleChangeEntity}
              />
              <div className="input-group-append">
                <div className="btn btn-primary disabled">Entity</div>
              </div>
            </div>
            <div className="input-group mb-4">
              <input
                type="text"
                className="form-control right"
                placeholder="Payment amount"
                onChange={handleChangeAmount}
              />
              <div className="input-group-append">
                <div className="btn btn-primary disabled">Amount</div>
              </div>
            </div>
            <button
              className="btn btn-primary mb-2"
              onClick={handleBroadcastMessage}
            >
              Send Billing
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default connect((state: IState) => ({
  network: state.account.network,
  privatekey: state.account.privatekey,
}))(Billing)

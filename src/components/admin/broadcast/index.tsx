import { PrivateKey, PublicKey } from '@textile/hub'
import React, { FC, useState } from 'react'
import { connect } from 'react-redux'
import { IState } from '../../../state/types'
import Textile from '../../../services/textile'
import {
  BroadcastFilter,
  BroadcastMessage,
  MessageSchema,
  PaymentMessage,
} from '../../../state/account/types'

interface Props {
  privatekey?: PrivateKey
}

const Broadcast: FC<Props> = ({ privatekey }: Props) => {
  const [error, setError] = useState<string | null>(null)
  const [title, setTitle] = useState<string>('')
  const [link, setLink] = useState<string>('')
  const [description, setDescription] = useState<string>('')
  const [filter, setFilter] = useState<BroadcastFilter | null>(null)

  React.useEffect(() => {
    setTimeout(async () => {
      if (!privatekey) setError('No Account Key-pair found.')
    }, 10)
  }, [privatekey])

  const handleChangeTitle = (event) => {
    setTitle(event.target.value)
  }
  const handleChangeLink = (event) => {
    setLink(event.target.value)
  }
  const handleChangeDescription = (event) => {
    setDescription(event.target.value)
  }
  const handleChangeTarget = (val: BroadcastFilter) => {
    setFilter(val)
  }

  const handleChangeAddress = (event) => {
    setFilter({
      address: event.target.value,
    })
  }

  const handleBroadcastMessage = async (val) => {
    if (!privatekey) return
    if (!process.env.GATSBY_ORACLE_KEY) return

    const message: BroadcastMessage = {
      title,
      message: description,
      link,
      icon: '',
    }

    if (filter) {
      message.filter = filter
    }

    await Textile.sendMessage(process.env.GATSBY_ORACLE_KEY, {
      method: 'broadcast',
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
                placeholder="Message Title"
                onChange={handleChangeTitle}
              />
              <div className="input-group-append">
                <div className="btn btn-primary disabled">Title</div>
              </div>
            </div>
            <div className="input-group mb-4">
              <input
                type="text"
                className="form-control right"
                placeholder="Message Description"
                onChange={handleChangeDescription}
              />
              <div className="input-group-append">
                <div className="btn btn-primary disabled">Description</div>
              </div>
            </div>
            <div className="input-group mb-4">
              <input
                type="text"
                className="form-control right"
                placeholder="Message Link"
                onChange={handleChangeLink}
              />
              <div className="input-group-append">
                <div className="btn btn-primary disabled">Link</div>
              </div>
            </div>
            <div className="form-check">
              <input
                className="form-check-input"
                type="radio"
                name="flexRadioDefault"
                id="flexRadioDefault0"
                checked={!filter}
                onChange={handleChangeTarget.bind(undefined, null)}
              />
              <label className="form-check-label" htmlFor="flexRadioDefault0">
                All Users
              </label>
            </div>
            <div className="form-check">
              <input
                className="form-check-input"
                type="radio"
                name="flexRadioDefault"
                id="flexRadioDefault1"
                checked={filter?.jurisdiction == 'DELAWARE'}
                onChange={handleChangeTarget.bind(undefined, {
                  jurisdiction: 'DELAWARE',
                })}
              />
              <label className="form-check-label" htmlFor="flexRadioDefault1">
                Only Delaware
              </label>
            </div>
            <div className="form-check pb-4">
              <input
                className="form-check-input"
                type="radio"
                name="flexRadioDefault"
                id="flexRadioDefault2"
                checked={filter?.jurisdiction == 'WYOMING'}
                onChange={handleChangeTarget.bind(undefined, {
                  jurisdiction: 'WYOMING',
                })}
              />
              <label className="form-check-label" htmlFor="flexRadioDefault2">
                Only Wyoming
              </label>
            </div>
            <div className="input-group mb-4">
              <input
                type="text"
                className="form-control right"
                placeholder="To Specific Address"
                onChange={handleChangeAddress}
              />
              <div className="input-group-append">
                <div className="btn btn-primary disabled">To Address</div>
              </div>
            </div>
            <button
              className="btn btn-primary mb-2"
              onClick={handleBroadcastMessage}
            >
              Broadcast Message
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default connect((state: IState) => ({
  privatekey: state.account.privatekey,
}))(Broadcast)

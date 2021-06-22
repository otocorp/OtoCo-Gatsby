import React, { useState } from 'react'
import illustrationOne from '../../../static/img/features-icon-1.svg'
import illustrationTwo from '../../../static/img/features-icon-2.svg'
import illustrationThree from '../../../static/img/features-icon-3.svg'
import './style.scss'

import { GraphNetwork, requestSubgraph } from '../../services/thegraph'

const Features: React.FC<unknown> = () => {
  const [counter, setCounter] = useState<number>(100)

  React.useEffect(() => {
    setTimeout(async () => {
      const response = await requestSubgraph(
        GraphNetwork.mainnet,
        `
        {
          masters(first:5) {
            companiesCount
          }
        }
        `
      )
      const count = response.data.data.masters.reduce(
        (accumulator: number, jur) => accumulator + jur.companiesCount,
        0
      )
      setCounter(count)
    }, 0)
  }, [])

  return (
    <div>
      <div className="content feature-background">
        <div className="row">
          <div className="col-12 my-5">
            <h5 className="feature-title">
              Real-world Company Formation using your Digital Wallet
            </h5>
          </div>
          <div className="col-12 col-lg-4 d-flex justify-content-center">
            <div className="align-self-top text-center">
              <img
                className="feature-icon"
                src={illustrationOne}
                alt="Big Feature Icon"
                height="128px"
              />
              <div className="feature-text">
                <div>
                  <h4>Onchain entity formation</h4>
                </div>
                <div>
                  Simply use your Ethereum wallet to spin up a Delaware or
                  Wyoming LLC by sending 39 DAI to the OtoCo company assembly
                  smart contract. Activation is instant without loss of legal
                  validity.
                </div>
              </div>
            </div>
          </div>
          <div className="col-12 col-lg-4 d-flex justify-content-center">
            <div className="align-self-top text-center">
              <img
                className="feature-icon"
                src={illustrationTwo}
                alt="Big Feature Icon"
                height="128px"
              />
              <div className="feature-text">
                <div>
                  <h4>No-code token generation</h4>
                </div>
                <div>
                  Immediately use your new entity to issue security or utility
                  tokens. Distribute them to raise capital, reward token holders
                  and decentralize governance.
                </div>
              </div>
            </div>
          </div>
          <div className="col-12 col-lg-4 d-flex justify-content-center">
            <div className="align-self-top text-center">
              <img
                className="feature-icon"
                src={illustrationThree}
                alt="Big Feature Icon"
                height="128px"
              />
              <div className="feature-text">
                <div>
                  <h4>Add the components you need</h4>
                </div>
                <div>
                  SOON! Shop around our dAppstore to pick up additional parts
                  made by a growing number of outside developers. Bolt them on
                  to your entity in one click.
                </div>
              </div>
            </div>
          </div>
          <div className="col-12 d-flex counter-spacing justify-content-center">
            <div className="align-self-top text-center">
              <div className="counter">
                <div>
                  <h5 className="counter-title">COUNTER</h5>
                  <div className="styled-counter">{counter}</div>
                </div>
                <div className="lead">
                  on-chain LLCs created as of today on OtoCo
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Features

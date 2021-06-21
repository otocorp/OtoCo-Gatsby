import React, { FC, useEffect, useState } from 'react'
import Web3 from 'web3'
import BN from 'bn.js'
import accounting from 'accounting'

import { LaunchPoolInterface, getUnitPrice, getTimePeriod } from '../../index'

//style
import './StakeDisplay.scss'

//components
import Graph from '../Graph/Graph'
import InfoCard from '../InfoCard/InfoCard'
import TimerCard from '../TimerCard/TimerCard'

type Props = {
  infos: LaunchPoolInterface
  tokenSum: BN
  stakesTotal: BN
  stakesCount: number
  onStake: () => void
  onUnstake: () => void
}

const StakeDisplay: FC<Props> = ({
  infos,
  tokenSum,
  stakesTotal,
  stakesCount,
  onStake,
  onUnstake,
}: Props) => {
  const [currentIdx, setCurrentIdx] = useState(0)
  const [currentPrice, setCurrentPrice] = useState<number>(0)
  const [titleText, setTitleText] = useState('LIVE!')

  const specs = () => {
    const max: number = parseFloat(Web3.utils.fromWei(infos.stakesMax))
    return new Array(100).fill(0).map((val, idx) => {
      const currentX = (idx + 1) * (max / 100)
      const currentY = currentX ** 2 / max
      return {
        x: currentX,
        y: currentY,
      }
    })
  }

  useEffect(() => {
    const total = parseInt(Web3.utils.fromWei(stakesTotal))
    const max = parseInt(Web3.utils.fromWei(infos.stakesMax))
    setCurrentIdx(total < max / 100 ? 0 : Math.floor((total / max) * 100) - 1)
    setCurrentPrice(
      parseFloat(
        Web3.utils.fromWei(
          getUnitPrice(
            infos.stakesMax,
            new BN(stakesTotal),
            infos.curveReducer,
            infos.minimumPrice
          )
        )
      )
    )
  }, [stakesCount, stakesTotal])

  return (
    <div className="stake-display">
      <div className="content-container">
        <div className="info-container">
          <InfoCard
            titleText={`US$ ${accounting.formatMoney(
              Web3.utils.fromWei(stakesTotal),
              {
                symbol: '',
                precision: 0,
              }
            )}`}
            infoText={`total currently staked, out of US$${
              parseInt(Web3.utils.fromWei(infos.stakesMax)) / 1000000
            } million hard cap`}
            classProp={'graident-background'}
          />
          <InfoCard
            titleText={`${accounting.formatMoney(Web3.utils.fromWei(tokenSum), {
              symbol: '',
              precision: 0,
            })}`}
            infoText={`tokens currently pre-ordered by ${stakesCount} stakers`}
            useGraidentText={true}
            infoLink={'URL for stats page goes here'}
          />
          <TimerCard
            startDate={infos.startTimestamp}
            endDate={infos.endTimestamp}
            stage={infos.stage}
            setTitleText={setTitleText}
          />
        </div>
        <div className="stake-container">
          <div className="title">
            {`Token pre-order book is ${titleText}`}
            <br />
            <a
              href={'https://otonomos.gitbook.io/otoco/'}
              rel="noopener noreferrer"
              target="_blank"
            >
              {'Learn how to stake here'}
            </a>
          </div>
          <Graph
            currentIdx={currentIdx}
            currentPrice={currentPrice}
            specs={specs()}
          />
          <div className="button-container">
            <button
              className={
                (infos.stage === 1 || infos.stage === 2) &&
                getTimePeriod(infos.startTimestamp, infos.endTimestamp) ===
                  'during'
                  ? 'unstake'
                  : 'unstake disabled'
              }
              disabled={
                !(
                  (infos.stage === 1 || infos.stage === 2) &&
                  getTimePeriod(infos.startTimestamp, infos.endTimestamp) ===
                    'during'
                )
              }
              onClick={onUnstake}
            >
              Unstake
            </button>
            <button
              className={
                infos.stage === 1 &&
                getTimePeriod(infos.startTimestamp, infos.endTimestamp) !==
                  'before'
                  ? 'stake'
                  : 'stake disabled'
              }
              disabled={
                !(
                  infos.stage === 1 &&
                  getTimePeriod(infos.startTimestamp, infos.endTimestamp) !==
                    'before'
                )
              }
              onClick={onStake}
            >
              Stake Now!
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default StakeDisplay

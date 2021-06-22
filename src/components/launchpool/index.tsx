import React, { FC, useState } from 'react'
import Web3, { EventData } from 'web3'
import BN from 'bn.js'
import axios, { AxiosResponse } from 'axios'
import { Link } from 'gatsby'
import { connect } from 'react-redux'
import { IState } from '../../state/types'
import { ChevronLeft } from 'react-bootstrap-icons'
import LaunchPoolContract from '../../smart-contracts/LaunchPool'
import ERC20Contract from '../../smart-contracts/OtocoToken'
import '../style.scss'

import Logo from '../logo/logo'

import StakeDisplay from './stakeGraph/StakeDisplay/StakeDisplay'
import TimerCard from './stakeGraph/TimerCard/TimerCard'

import StakeWidget from './stakeWidget'
import UnstakeWidget from './unstakeWidget'

const options = {
  headers: {
    'Content-Type': 'application/json',
  },
}

export const displayAmountConverter = (
  amount: BN,
  decimals: number
): string => {
  const conv = {
    '18': 'ether',
    '6': 'Mwei',
    '4': 'kwei',
  }
  return Web3.utils.fromWei(amount.toString(), conv[decimals.toString()])
}

export interface TokensInterface {
  address: string
  name: string
  symbol: string
  decimals: number
}

export interface StakeInterface {
  id: number
  token: TokensInterface
  amount: BN
  price: BN
  shares: BN
  timestamp: Date
}

// Get returned shares for a specific stake, pool balance and minimum price
export function getShares(
  supply: BN,
  pool: BN,
  stake: BN,
  reducer: BN,
  minPrice: BN
): BN {
  const curve = pool.mul(pool).div(supply.mul(new BN(100000)).mul(reducer))
  const unitPrice = curve.add(minPrice)
  return stake.mul(new BN(Web3.utils.toWei('1'))).div(unitPrice)
}

// Get unit price based on minimumPrice and pool balance
export function getUnitPrice(
  supply: BN,
  pool: BN,
  reducer: BN,
  minPrice: BN
): BN {
  const curve = pool.mul(pool).div(supply.mul(new BN(100000)).mul(reducer))
  return curve.add(minPrice)
}

// Checks whether the current date is before, during or after the timeframe provided
export const getTimePeriod = (
  startTime: Date,
  endTime: Date
): string | undefined => {
  if (Date.now() < startTime.getTime()) return 'before'
  else if (Date.now() < endTime.getTime()) return 'during'
  else if (endTime.getTime() < Date.now()) return 'after'
}

// Ignore minimum price amount, just the increment is returned
export function getCurve(supply: BN, pool: BN, reducer: BN): BN {
  return pool.mul(pool).div(supply.mul(new BN(100000)).mul(reducer))
}

export interface LaunchPoolInterface {
  title?: string
  description?: string
  network: string
  shares: string
  startTimestamp: Date
  endTimestamp: Date
  stakesMin: BN
  stakesMax: BN
  stakeAmountMin: BN
  stakeAmountMax: BN
  curveReducer: BN
  stage: number
  minimumPrice: BN
  maximumPrice: BN
}

interface Props {
  id: string
  account?: string
  network?: string
}

const LaunchPool: FC<Props> = ({ id, account, network }: Props) => {
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string>('')
  const [stakeModalOpen, setStakeModalOpen] = useState<boolean>(false)
  const [unstakeModalOpen, setUnstakeModalOpen] = useState<boolean>(false)
  const [poolInfo, setPoolInfo] = useState<LaunchPoolInterface | undefined>(
    undefined
  )
  const [poolId, setPoolId] = useState<string>('')
  const [stakesTotal, setStakesTotal] = useState<BN>(new BN(0))
  const [stakesCount, setStakesCount] = useState<number>(0)
  const [sharesTotal, setSharesTotal] = useState<BN>(new BN(0))
  const [allowedTokens, setAllowedTokens] = useState<TokensInterface[]>()
  const [stakes, setStakes] = useState<BN[] | undefined>()
  const [accountStakes, setAccountStakes] = useState<
    StakeInterface[] | undefined
  >()
  const [titleText, setTitleText] = useState<string>('')

  const openStakeModal = () => {
    refreshAccountStakes()
    setStakeModalOpen(true)
  }

  const openUnstakeModal = () => {
    refreshAccountStakes()
    setUnstakeModalOpen(true)
  }

  const closeModals = () => {
    setStakeModalOpen(false)
    setUnstakeModalOpen(false)
  }

  // Fetch general Launch pool info and allowed tokens
  const fetchGeneralInfo = async () => {
    try {
      const sharesAddress = await LaunchPoolContract.getContract(poolId)
        .methods.sharesAddress()
        .call({ from: account })
      const infosContract = await LaunchPoolContract.getContract(poolId)
        .methods.getGeneralInfos()
        .call({ from: account })
      const infosBN = infosContract.map((i: string) => new BN(i))
      const infos: LaunchPoolInterface = {
        startTimestamp: new Date(parseInt(infosBN[0].toString()) * 1000),
        endTimestamp: new Date(parseInt(infosBN[1].toString()) * 1000),
        stakesMin: infosBN[2],
        stakesMax: infosBN[3],
        curveReducer: infosBN[6],
        stage: parseInt(infosBN[7].toString()),
        stakeAmountMin: infosBN[8],
        stakeAmountMax: infosBN[10],
        minimumPrice: infosBN[9],
        maximumPrice: new BN(
          getUnitPrice(infosBN[3], infosBN[3], infosBN[6], infosBN[9])
        ),
        network: network,
        shares: sharesAddress,
      }
      setStakesTotal(infosBN[4])
      setStakesCount(parseInt(infosBN[5].toString()))
      setPoolInfo(infos)
    } catch (err) {
      setError('Not possible to load Pool info.')
      console.error(err)
    }
  }

  const fetchMetadata = async (infos: LaunchPoolInterface) => {
    try {
      const metadata = await LaunchPoolContract.getContract(poolId)
        .methods.metadata()
        .call({ from: account })
      const res: AxiosResponse = await axios.get(
        'https://cloudflare-ipfs.com/ipfs/' + metadata,
        options
      )
      infos.title = res.data.title
      infos.description = res.data.description
      setPoolInfo(infos)
    } catch (err) {
      setError('Not possible to load Pool info.')
      console.error(err)
    }
  }

  const fetchTokenAllowedList = async (poolId: string) => {
    try {
      const tokensList = await LaunchPoolContract.getContract(poolId)
        .methods.tokenList()
        .call({ from: account })
      const allowedList: TokensInterface[] = []
      for (const t of tokensList) {
        const name = await ERC20Contract.getContract(t)
          .methods.name()
          .call({ from: account })
        const symbol = await ERC20Contract.getContract(t)
          .methods.symbol()
          .call({ from: account })
        const decimals = await ERC20Contract.getContract(t)
          .methods.decimals()
          .call({ from: account })
        allowedList.push({ address: t, name, symbol, decimals })
      }
      setAllowedTokens(allowedList)
    } catch (err) {
      setError('Not possible to load Allowed Tokens.')
      console.error(err)
    }
  }

  const mountStake = async (stakeEvent: EventData, amount?: BN) => {
    if (!stakes) return
    if (!poolInfo) return
    if (!allowedTokens) return
    const stake: StakeInterface = {
      id: stakeEvent.returnValues[0],
      token: allowedTokens.find((t) => t.address == stakeEvent.returnValues[2]),
      amount: amount || stakes[parseInt(stakeEvent.returnValues[0])],
      price: new BN(0),
      shares: new BN(0),
      timestamp: new Date(),
    }
    const web3: Web3 = window.web3
    const block = await web3.eth.getBlock(stakeEvent.blockNumber)
    // Set stake timestamp
    stake.timestamp = new Date(parseInt(block.timestamp.toString()) * 1000)
    // If if unstaked return it zeroed
    if (stake.amount.gt(new BN(0))) {
      // Get pool balance until stake offer
      const poolBalance: BN = stakes
        .slice(0, stake.id)
        .reduce((acc: BN, s: BN) => acc.add(s), new BN(0))
      // Set stake current price for each share
      stake.price = new BN(
        getUnitPrice(
          poolInfo.stakesMax,
          poolBalance,
          poolInfo.curveReducer,
          poolInfo.minimumPrice
        )
      )
      // Set stake current amount of shares result
      stake.shares = new BN(
        getShares(
          poolInfo.stakesMax,
          poolBalance,
          amount || stakes[parseInt(stakeEvent.returnValues[0])],
          poolInfo.curveReducer,
          poolInfo.minimumPrice
        )
      )
    }
    return stake
  }

  const registerStake = async (stakeEvent: EventData) => {
    if (!stakes) return
    if (!poolInfo) return
    if (!allowedTokens) return
    // In case of duplicated events
    if (parseInt(stakeEvent.returnValues[0]) < stakes.length) return
    const token = allowedTokens.find(
      (t) => t.address == stakeEvent.returnValues[2]
    )
    const decimalsToAdd = new BN(10).pow(new BN(18 - token?.decimals))
    const normalizedStake = new BN(stakeEvent.returnValues[3]).mul(
      decimalsToAdd
    )
    if (stakeEvent.returnValues[1] == account) {
      const stake: StakeInterface | undefined = await mountStake(
        stakeEvent,
        normalizedStake
      )
      if (stake) {
        const listAccountStakes = accountStakes || []
        listAccountStakes.push(stake)
        setAccountStakes(listAccountStakes)
      }
    }
    setStakes((prevState) => {
      if (!prevState) return [new BN(normalizedStake)]
      prevState[parseInt(stakeEvent.returnValues[0])] = new BN(normalizedStake)
    })
    setStakesTotal((prevState) => new BN(prevState).add(normalizedStake))
    setSharesTotal(calculateTotalShares(stakes))
    setStakesCount((prevState) => prevState + 1)
  }

  const registerUnstake = (unstakeEvent: EventData) => {
    if (!stakes) return
    if (!poolInfo) return
    if (!allowedTokens) return
    if (stakes[parseInt(unstakeEvent.returnValues[0])].eq(new BN(0))) return
    setStakes((prevState) => {
      if (!prevState) return []
      prevState[unstakeEvent.returnValues[0]] = new BN(0)
      return prevState
    })
    if (unstakeEvent.returnValues[1] == account) {
      setAccountStakes((prevState) => {
        const currentState = prevState
        if (!currentState) return []
        const stakeIdx: number = currentState.findIndex(
          (s) => s.id == parseInt(unstakeEvent.returnValues[0])
        )
        currentState[stakeIdx].price = new BN(0)
        currentState[stakeIdx].amount = new BN(0)
        currentState[stakeIdx].shares = new BN(0)
        return currentState
      })
    }
    setStakesTotal((prevState) =>
      new BN(prevState).sub(new BN(unstakeEvent.returnValues[3]))
    )
    setSharesTotal(calculateTotalShares(stakes))
  }

  const refreshPoolStakes = async () => {
    const stakesList = await LaunchPoolContract.getContract(poolId)
      .methods.stakesList()
      .call({ from: account })
    const stks = stakesList.map((s: string) => new BN(s))
    setSharesTotal(calculateTotalShares(stks))
    setStakes(stks)
  }

  const refreshAccountStakes = async () => {
    if (!account) return
    if (!allowedTokens) return
    const stakesAccountEvents: EventData[] = await LaunchPoolContract.getContract(
      poolId
    ).getPastEvents('Staked', {
      fromBlock: 0,
      toBlock: 'latest',
      filter: { investor: account },
    })
    const listAccountStakes: StakeInterface[] = []
    for (const stakeEvent of stakesAccountEvents) {
      const stake: StakeInterface | undefined = await mountStake(stakeEvent)
      if (!stake) return
      listAccountStakes.push(stake)
    }
    setAccountStakes(listAccountStakes)
  }

  const calculateTotalShares = (stks: BN[]) => {
    if (!stks) return new BN(0)
    if (!poolInfo) return new BN(0)
    let balance = new BN(0)
    return stks.reduce(function (acc, s) {
      const shares = getShares(
        poolInfo.stakesMax,
        balance,
        s,
        poolInfo.curveReducer,
        poolInfo.minimumPrice
      )
      balance = balance.add(new BN(s))
      return acc.add(shares)
    }, new BN(0))
  }

  React.useEffect(() => {
    if (id && !poolId) {
      setPoolId(() => id)
      return
    }
    if (!poolId) {
      setPoolId(() => '') // Fill with the respective pool id
      return
    }
    setTimeout(async () => {
      if (account && !poolInfo) {
        await fetchGeneralInfo()
      }
      if (poolInfo && !poolInfo?.title) {
        await fetchMetadata(poolInfo)
      }
      if (poolInfo && !allowedTokens) {
        await fetchTokenAllowedList(id)
      }
      if (poolInfo && !stakes) {
        await refreshPoolStakes()
      }
      if (poolInfo && stakes && !accountStakes) {
        await refreshAccountStakes()
      }
      if (poolInfo && accountStakes && loading) {
        LaunchPoolContract.getContract(poolId).events.allEvents(
          {
            fromBlock: 'latest',
          },
          (err: Error, event: EventData) => {
            if (err) return console.error(err)
            if (event.event === 'Staked') registerStake(event)
            if (event.event === 'Unstaked') registerUnstake(event)
          }
        )
        setLoading(false)
      }
    }, 0)
  }, [account, poolId, poolInfo, stakes, accountStakes])

  return (
    <div className="container-sm content container-sg">
      <Link className="btn btn-back btn-primary-outline btn-sm" to={`/`}>
        <Logo />
      </Link>

      {!error && account && !loading && (
        <StakeDisplay
          infos={poolInfo}
          tokenSum={sharesTotal}
          stakesTotal={stakesTotal}
          stakesCount={stakesCount}
          onStake={openStakeModal}
          onUnstake={openUnstakeModal}
        />
      )}

      <StakeWidget
        opened={stakeModalOpen}
        poolId={poolId}
        tokens={allowedTokens}
        infos={poolInfo}
        closeModal={closeModals}
      ></StakeWidget>
      <UnstakeWidget
        opened={unstakeModalOpen}
        poolId={poolId}
        stakes={stakes}
        accountStakes={accountStakes}
        closeModal={closeModals}
      ></UnstakeWidget>

      {!poolInfo && (
        <div className="no-account-display">
          <div className="d-flex justify-content-center">
            <div className="column">
              <div className="col-12 text-center">
                <div className="title">
                  {`Our Token pre-order window is ${titleText}`}
                  <br />
                  {/* <a
                    href={'https://otonomos.gitbook.io/otoco/'}
                    rel="noopener noreferrer"
                    target="_blank"
                  >
                    {'Learn how to stake here'}
                  </a> */}
                </div>
                <TimerCard
                  classProp="timer"
                  startDate={new Date(1624550400000)}
                  endDate={new Date(1632499200000)}
                  setTitleText={setTitleText}
                />
                {poolId && (
                  <p>
                    No wallet connected. Please connect your wallet to stake.
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
      {loading && poolInfo && (
        <div className="d-flex justify-content-center">
          <div className="row">
            <div className="col-12 text-center">Loading</div>
            <div className="col-12 text-center">
              <div className="spinner-border" role="status"></div>
            </div>
          </div>
        </div>
      )}
      {error && (
        <div className="d-flex justify-content-center">
          <div className="row">
            <div className="col-12 text-center">{error}</div>
          </div>
        </div>
      )}
    </div>
  )
}

export default connect((state: IState) => ({
  account: state.account.account,
  network: state.account.network,
}))(LaunchPool)

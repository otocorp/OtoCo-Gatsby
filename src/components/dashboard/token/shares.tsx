import React, { Dispatch, FC, useState } from 'react'
import BN from 'bn.js'
import { navigate } from '@reach/router'
import { connect } from 'react-redux'
import UTCDate from '../../utcDate/utcDate'
import TransactionUtils from '../../../services/transactionUtils'
import AddressWidget from '../../addressWidget/addressWidget'
import TokenContract from '../../../smart-contracts/OtocoToken'
import RegistryContract from '../../../smart-contracts/MasterRegistry'
import {
  SeriesType,
  TokenOwner,
  TokenConfig,
  TokenDeployed,
} from '../../../state/management/types'
import { IState } from '../../../state/types'
import { Link } from 'gatsby'

interface ListOwnerProps {
  owners: TokenOwner[]
  totalShares?: number
}

const ListOwners = ({ owners, totalShares }: ListOwnerProps) => {
  return owners.map((m, idx) => (
    <tr key={idx}>
      <td>
        <AddressWidget address={m.address}></AddressWidget>
      </td>
      <td>{m.balance}</td>
      <td className="d-none d-md-block">
        <div>{(m.balance / totalShares) * 100}%</div>
        {/* <div className="progress">
          <div
            className="progress-bar bg-success"
            role="progressbar"
            style={{ width: `${(m.balance / totalShares) * 100}%` }}
            aria-valuenow={(m.balance / totalShares) * 100}
            aria-valuemin={0}
            aria-valuemax={100}
          >
            {(m.balance / totalShares) * 100}%
          </div>
        </div> */}
      </td>
    </tr>
  ))
}

const numberWithCommas = (value: string | undefined): string => {
  if (!value) return '0'
  return value.replace(/\B(?=(\d{3})+(?!\d))/g, ',')
}

interface Props {
  account?: string | null
  network?: string | null
  managing?: SeriesType
  tokenConfig?: TokenConfig
  tokenDeployed?: TokenDeployed
}

const Shares: FC<Props> = ({
  account,
  network,
  managing,
  tokenConfig,
  tokenDeployed,
}: Props) => {
  const [owners, setOwners] = useState<TokenOwner[]>([])
  const [advanced, setAdvanced] = useState<boolean>(false)
  const getBNDecimals = (decimals: number) => {
    return new BN(10).pow(new BN(decimals))
  }

  React.useEffect(() => {
    setTimeout(async () => {
      if (!tokenDeployed || !tokenConfig) return
      const owns = new Set<string>()
      const decimals = await TokenContract.getContract(tokenDeployed.contract)
        .methods.decimals()
        .call({ from: account })
      // Add first owner
      const events = await TokenContract.getContract(
        tokenDeployed.contract
      ).getPastEvents('Initialized', { fromBlock: 0, toBlock: 'latest' })
      for (const o of events) {
        owns.add(o.returnValues.member)
      }
      // Add all receivers
      const transferEvent = await TokenContract.getContract(
        tokenDeployed.contract
      ).getPastEvents('Transfer', { fromBlock: 0, toBlock: 'latest' })
      for (const o of transferEvent) {
        owns.add(o.returnValues.to)
      }
      const result: TokenOwner[] = []
      for (const o of [...owns]) {
        const balance = await TokenContract.getContract(tokenDeployed.contract)
          .methods.balanceOf(o)
          .call({ from: account })
        const balanceBN = new BN(balance)
        const owner = {
          address: o,
          balance: balanceBN.div(getBNDecimals(decimals)).toNumber(),
        }
        result.push(owner)
      }
      setOwners(result)
    }, 0)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tokenDeployed?.contract])

  const clickCopyHandler = (info) => {
    let link = ''
    if (network === 'ropsten') link = 'https://ropsten.etherscan.io/address/'
    if (network === 'kovan') link = 'https://kovan.etherscan.io/address/'
    if (network === 'main') link = 'https://etherscan.io/address/'
    link += info
    window.open(link, '_blank')
  }

  const clickTransferHandler = async () => {
    navigate(`/tokens/${tokenDeployed?.contract}`)
  }
  const clickDetachToken = async () => {
    if (!managing) return
    if (!network) return
    if (!account) return
    const requestInfo = await TransactionUtils.getTransactionRequestInfo(
      account,
      '40000'
    )
    const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000'
    RegistryContract.getContract(network)
      .methods.setRecord(managing.contract, 1, ZERO_ADDRESS)
      .send(requestInfo, (error, hash: string) => {
        if (error) return console.error(error)
      })
  }
  const toggleAdvanced = async () => {
    setAdvanced(!advanced)
  }

  return (
    <div>
      <p>
        A total of{' '}
        <b>
          {numberWithCommas(tokenConfig?.shares)} {tokenConfig?.name}
        </b>{' '}
        with symbol <b>{tokenConfig?.symbol}</b> were minted on{' '}
        <UTCDate separator="at" date={tokenDeployed?.creation}></UTCDate>.
      </p>
      {!advanced && (
        <p className="mt-2">
          Click{' '}
          <a href="" onClick={toggleAdvanced}>
            here
          </a>{' '}
          to see advanced options.
        </p>
      )}
      {advanced && (
        <p>
          If you had some problem deploying your token is possible to{' '}
          <a href="" className="text-danger" onClick={clickDetachToken}>
            Detach Token
          </a>
          , then deploy a new one.
        </p>
      )}
      <p className="mt-2">
        {tokenConfig?.symbol} token contract address:&nbsp;&nbsp;
        <AddressWidget address={tokenDeployed?.contract}></AddressWidget>
      </p>
      <div className="small">List of current holders:</div>
      <table className="table table-hover mb-5">
        <thead>
          <tr>
            <th scope="col">Wallet</th>
            <th scope="col">Balance</th>
            <th scope="col" className="d-none d-md-block">
              Tokens
            </th>
          </tr>
        </thead>
        <tbody>
          <ListOwners
            owners={owners}
            totalShares={tokenConfig?.shares}
          ></ListOwners>
        </tbody>
      </table>
      <Link
        className="btn btn-primary"
        to={`/token/${tokenDeployed?.contract}`}
      >
        Transfer Tokens
      </Link>
    </div>
  )
}

export default connect((state: IState) => ({
  account: state.account.account,
  network: state.account.network,
  managing: state.management.managing,
  tokenConfig: state.token.tokenConfig,
  tokenDeployed: state.token.tokenDeployed,
}))(Shares)

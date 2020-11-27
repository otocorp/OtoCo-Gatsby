import React, { Dispatch, FC, useState } from 'react'
import axios, { AxiosError, AxiosResponse } from 'axios'
import Web3 from 'web3'
import BN from 'bn.js'
import { connect } from 'react-redux'
import AddressWidget from '../../addressWidget/addressWidget'
import OtocoToken from '../../../smart-contracts/OtocoToken'
import {
  SET_MULTISIG_BALANCES,
  ManagementActionTypes,
  SeriesType,
  MultisigBalance,
  MultisigBalances,
  MultisigConfig,
  MultisigDeployed,
} from '../../../state/management/types'
import { IState } from '../../../state/types'
import MultisigWidget from '../../multisigWidget/multisigWidget'

type TokenListTransaction = {
  status: number
  result: {
    blockNumber: number
    timestamp: number
    hash: string
    from: string
    to: string
    contractAddress: string
    tokenName: string
    tokenSymbol: string
    tokenDecimal: string
  }[]
}

interface Props {
  account?: string | null
  network?: string | null
  managing?: SeriesType
  multisigConfig?: MultisigConfig
  multisigDeployed?: MultisigDeployed
  multisigBalances?: MultisigBalances
  dispatch: Dispatch<ManagementActionTypes>
}

interface ListOwnersProps {
  owners?: string[]
}

const ListBalances = ({ balances }: MultisigBalances) => {
  return balances.map((b, idx) => (
    <tr key={idx}>
      <td>
        <div>{b.symbol}</div>
      </td>
      <td>
        <div>{b.amount}</div>
      </td>
    </tr>
  ))
}
const ListOwners = ({ owners }: ListOwnersProps) => {
  return owners.map((o, idx) => (
    <tr key={idx}>
      <td>
        <AddressWidget address={o}></AddressWidget>
      </td>
    </tr>
  ))
}

const Wallet: FC<Props> = ({
  account,
  network,
  managing,
  multisigConfig,
  multisigDeployed,
  multisigBalances,
  dispatch,
}: Props) => {
  const getBNDecimals = (decimals: number | string) => {
    return new BN(10).pow(new BN(decimals))
  }

  const fetchTokenBalances = async (multisigAddress: string) => {
    const web3: Web3 = window.web3
    if (!multisigAddress) return
    let path
    if (network === 'ropsten') path = 'https://api-ropsten.etherscan.io/api'
    else if (network === 'main') path = 'https://api.etherscan.io/api'
    else return
    // request parameters
    const increment =
      '?module=account&action=tokentx&startblock=0&endblock=999999999&sort=asc&address='
    // Make request using axios
    const transactionsRequest: AxiosResponse<TokenListTransaction> = await axios.get(
      `${path}${increment}${multisigAddress}`
    )
    // Variable to store unique Tokens info
    const tokensObject: { [contract: string]: MultisigBalance } = {}
    // Store all data on object
    transactionsRequest.data.result.forEach((elem) => {
      tokensObject[elem.contractAddress] = {
        contract: elem.contractAddress,
        name: elem.tokenName,
        symbol: elem.tokenSymbol,
        decimals: parseInt(elem.tokenDecimal),
        amount: '0',
      }
    })
    // For each unique token, fetch balance on smart contract
    for (const token of Object.values(tokensObject)) {
      const balanceBN = new BN(
        await OtocoToken.getContract(token.contract)
          .methods.balanceOf(multisigAddress)
          .call({ from: account })
      )
      token.amount = balanceBN.div(getBNDecimals(token.decimals)).toString()
    }
    // Adding ETH balance
    const ethBalance = await web3.eth.getBalance(multisigAddress)
    tokensObject['0x0000000000000000000000000000000000000000'] = {
      contract: '0x0000000000000000000000000000000000000000',
      name: 'Ether',
      symbol: 'ETH',
      decimals: 18,
      amount: web3.utils.fromWei(ethBalance, 'ether'),
    }
    dispatch({
      type: SET_MULTISIG_BALANCES,
      payload: { balances: Object.values(tokensObject) },
    })
  }

  React.useEffect(() => {
    setTimeout(async () => {
      fetchTokenBalances(multisigDeployed.contract)
    }, 0)
  }, [])

  const clickManageHandler = async () => {
    window.open(
      `https://gnosis-safe.io/app/#/safes/${multisigDeployed?.contract}/apps`,
      '_blank'
    )
  }

  return (
    <div>
      <div className="small">
        Wallet deployed at address:{' '}
        <AddressWidget address={multisigDeployed.contract}></AddressWidget>
      </div>
      <div className="small">
        Number os signatures needed to approve transactions: 1
      </div>
      <table className="table small">
        <thead>
          <tr>
            <th scope="col">Owners</th>
          </tr>
        </thead>
        <tbody>
          <ListOwners owners={multisigConfig.owners}></ListOwners>
        </tbody>
      </table>
      {multisigBalances && multisigBalances?.balances.length > 0 && (
        <table className="table small">
          <thead>
            <tr>
              <th scope="col">Asset</th>
              <th scope="col">Balance</th>
            </tr>
          </thead>
          <tbody>
            <ListBalances balances={multisigBalances.balances}></ListBalances>
          </tbody>
        </table>
      )}
      {!multisigBalances && (
        <div className="d-flex justify-content-center">
          <div className="row">
            <div className="col-12 text-center">Loading Balances</div>
            <div className="col-12 text-center">
              <div className="spinner-border" role="status"></div>
            </div>
          </div>
        </div>
      )}
      <button className="btn btn-primary" onClick={clickManageHandler}>
        Manage Wallet
      </button>
      {/* <MultisigWidget></MultisigWidget> */}
    </div>
  )
}

export default connect((state: IState) => ({
  account: state.account.account,
  network: state.account.network,
  managing: state.management.managing,
  multisigConfig: state.management.multisigConfig,
  multisigDeployed: state.management.multisigDeployed,
  multisigBalances: state.management.multisigBalances,
}))(Wallet)

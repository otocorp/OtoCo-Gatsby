import React, { Dispatch, FC, useState } from 'react'
import Web3 from 'web3'
import BN from 'bn.js'
import axios from 'axios'
import { connect } from 'react-redux'
import { IState } from '../../../state/types'
import {
  SET_CURRENT_STEP,
  CLEAR_AVAILABLE_NAME,
  SpinUpActionTypes,
} from '../../../state/spinUp/types'
import TransactionMonitor from '../../transactionMonitor/transactionMonitor'

import ERC20Contract from '../../../smart-contracts/ERC20'
import MainContract from '../../../smart-contracts/MainContract'

import EnoughBalance from './enoughBalanceForm'
import NoBalanceForm from './noBalanceForm'
import spinUp from '../spinUp'

interface Props {
  account?: string
  network?: string
  availableName: string
  jurisdictionSelected: string
  currentStep: number
  dispatch: Dispatch<SpinUpActionTypes>
}

const StepPayment: FC<Props> = ({
  account,
  network,
  jurisdictionSelected,
  currentStep,
  dispatch,
}: Props) => {
  const [transaction, setTransaction] = useState('')
  const [accountAllowance, setAllowance] = useState('0')
  const [accountBalance, setBalance] = useState('0')
  const [decimals, setDecimals] = useState(18)
  const [erc20Target, setERC20Target] = useState('')
  const [feeBN, setFeeBN] = useState<BN>(new BN(0))
  const [allowanceBN, setAllowanceBN] = useState<BN>(new BN(0))
  const [balanceBN, setBalanceBN] = useState<BN>(new BN(0))

  const erc20 = {
    symbol: 'DAI',
    spinUpFee: 39,
  }

  React.useEffect(() => {
    setTimeout(async () => {
      const allowance: BN = await ERC20Contract.getContractDAI(network)
        .methods.allowance(
          account,
          MainContract.addresses[network + '_' + jurisdictionSelected]
        )
        .call({ from: account })
      const balance: BN = await ERC20Contract.getContractDAI(network)
        .methods.balanceOf(account)
        .call({ from: account })
      const dec: number = await ERC20Contract.getContractDAI(network)
        .methods.decimals()
        .call({ from: account })
      //const allowance = parseFloat(allowance / 10 ** dec)
      // balance = parseFloat(balance / 10 ** dec)
      setERC20Target(
        MainContract.addresses[network + '_' + jurisdictionSelected]
      )
      setDecimals(dec)
      const decimalBN = new BN(dec)
      const divisor = new BN(10).pow(decimalBN)
      const balBN = new BN(balance)
      const allBN = new BN(allowance)
      const feeBN = new BN(erc20.spinUpFee)

      setAllowance(allBN.div(divisor).toString())
      setBalance(balBN.div(divisor).toString())
      setFeeBN(feeBN)
      setAllowanceBN(allBN.div(divisor))
      setBalanceBN(balBN.div(divisor))

      if (feeBN.lte(allBN.div(divisor)) && balBN.gte(allBN))
        dispatch({ type: SET_CURRENT_STEP, payload: 4 })
    }, 0)
  }, [account, accountBalance])

  // https://docs.sendwyre.com/docs/getting-started-wyre-checkout
  // https://docs.sendwyre.com/docs/wallet-order-reservations
  // https://docs.sendwyre.com/docs/wyre-checkout-hosted-dialog

  // UNMOUNT COMPONENT
  React.useEffect(() => {
    const interval = window.setInterval(updateBalance, 3000)
    setTimeout(async () => {
      const balance: BN = await ERC20Contract.getContractDAI(network)
        .methods.balanceOf(account)
        .call({ from: account })
      const decimalBN = new BN(decimals)
      const divisor = new BN(10).pow(decimalBN)
      const balanceBN = new BN(balance)
      const feeBN = new BN(erc20.spinUpFee)
      setBalance(balanceBN.div(divisor).toString())
      if (!feeBN.gt(balanceBN.div(divisor))) {
        window.clearInterval(interval)
      }
    })
    return () => {
      window.clearInterval(interval)
    }
  })

  const updateBalance = async () => {
    const balance: BN = await ERC20Contract.getContractDAI(network)
      .methods.balanceOf(account)
      .call({ from: account })
    const decimalBN = new BN(decimals)
    const divisor = new BN(10).pow(decimalBN)
    const balanceBN = new BN(balance)

    setBalance(balanceBN.div(divisor).toString())
  }

  const nextStepHandler = () => {
    dispatch({ type: SET_CURRENT_STEP, payload: 4 })
  }

  return (
    <div>
      <div>
        {transaction && (
          <div className="animate-slide-left">
            <TransactionMonitor
              hash={transaction}
              title="Approving Tokens"
              callbackSuccess={nextStepHandler}
            ></TransactionMonitor>
            <p>
              * Once transaction is confirmed, it will automatically proceed to
              next step.
            </p>
          </div>
        )}
        {!transaction && feeBN.gt(balanceBN) && (
          <NoBalanceForm
            balance={accountBalance}
            fee={erc20.spinUpFee}
            currency={erc20.symbol}
            environment="testwyre"
          ></NoBalanceForm>
        )}
        {!transaction && feeBN.gt(allowanceBN) && balanceBN.gte(feeBN) && (
          <EnoughBalance
            balance={accountBalance}
            allowance={accountAllowance}
            fee={erc20.spinUpFee}
            currency={erc20.symbol}
            feeBN={feeBN}
            mainContractAddress={
              MainContract.addresses[network + '_' + jurisdictionSelected]
            }
            setTransaction={setTransaction}
          ></EnoughBalance>
        )}
      </div>
    </div>
  )
}

export default connect((state: IState) => ({
  account: state.account.account,
  network: state.account.network,
  availableName: state.spinUp.availableName,
  jurisdictionSelected: state.spinUp.jurisdictionSelected,
  currentStep: state.spinUp.currentStep,
}))(StepPayment)

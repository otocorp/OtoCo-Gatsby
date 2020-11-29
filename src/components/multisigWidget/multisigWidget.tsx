import React, { FC, useState } from 'react'
import axios from 'axios'
import Web3 from 'web3'
import { AbiItem } from 'web3-utils'
import BN from 'bn.js'
import { connect } from 'react-redux'
import GnosisSafe from '../../smart-contracts/GnosisSafe'
import { SetNameAbi } from '../../smart-contracts/ENSRegistrarController'
import {
  MultisigDeployed,
  IManagementState,
  SeriesType,
} from '../../state/management/types'
import { IState } from '../../state/types'
import { estimateSafeTxGas } from '../../services/safe/transactions/gas'
import {
  getTransactionHash,
  getExecutionTransaction,
} from '../../services/safe/transactions/send'
import { tryOffchainSigning } from '../../services/safe/transactions/offchainSigner'

interface Props {
  account?: string
  network?: string
  managing?: SeriesType
  multisigDeployed?: MultisigDeployed
  recipient: string
  abi: AbiItem
  params: string[]
  gas: string
}

interface CreateTransactionArgs {
  operation?: number
  origin?: string | null
  safeAddress: string
  to: string
  txData?: string
  txNonce?: number | string
  valueInWei: string
  safeTxGas?: number
}

const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000'

const MultisigWidget: FC<Props> = ({
  account,
  network,
  managing,
  multisigDeployed,
  recipient,
  abi,
  params,
  gas,
}: Props) => {
  const [transaction, setTransaction] = useState<undefined | string>(undefined)

  const getBNDecimals = (decimals: number | string) => {
    return new BN(10).pow(new BN(decimals))
  }
  // Reverse Ropsten = 0x6f628b68b30dc3c17f345c9dbbb1e483c2b7ae5c
  // Reverse main = 0x084b1c3c81545d370f3634392de611caabff8148
  // setName('name.eth')

  const sendMultisigTransaction = async () => {
    const web3: Web3 = window.web3
    if (!multisigDeployed) return
    // Get gas price form api
    // Get nonce form contract
    // Get estimateSafeTxGas -> /safe/transaction/gas
    // Get getTransactionHash -> /safe/transactions
    // Get tryOffchainSigning -> /safe/transactions/offchainSigner
    // Get getExecutionTransaction -> /safe/transactions/send
    let gasPrice = web3.utils.toWei((50).toString(), 'gwei')
    try {
      const gasFees = await axios.get(
        `https://ethgasstation.info/api/ethgasAPI.json`
      )
      gasPrice = web3.utils.toWei((gasFees.data.fast * 0.1).toString(), 'gwei')
    } catch (err) {
      console.log('Could not fetch gas fee for transaction.')
    }
    console.log('GAS PRICE', gasPrice)
    // Get wallet nonce
    const nonce = await GnosisSafe.getContract(multisigDeployed.contract)
      .methods.nonce()
      .call({ from: account })
    console.log('NONCE', nonce)
    // Encode function call
    const encodedParameters = web3.eth.abi.encodeFunctionCall(
      abi, // Abi for Initialize wallet with Owners config
      params
    )
    console.log('Encoded Function Call', encodedParameters)
    // Estimate Safe TX gas
    const safeGas = await estimateSafeTxGas(
      multisigDeployed.contract,
      encodedParameters,
      recipient,
      '0',
      0 // CALL
    )
    console.log('SAFE GAS', safeGas)
    // https://docs.gnosis.io/safe/docs/docs5/#pre-validated-signatures
    const sigs = `0x000000000000000000000000${account.replace(
      '0x',
      ''
    )}000000000000000000000000000000000000000000000000000000000000000001`
    const txArgs = {
      safeInstance: GnosisSafe.getContract(multisigDeployed.contract),
      to: recipient,
      valueInWei: '0',
      data: encodedParameters,
      operation: 0,
      nonce,
      safeTxGas: safeGas,
      baseGas: gas,
      gasPrice: 0,
      gasToken: ZERO_ADDRESS,
      refundReceiver: ZERO_ADDRESS,
      sender: account,
      sigs,
    }
    // Get transaction HASH
    // const transactionHash = await getTransactionHash(txArgs)
    // console.log('TRANSACTION HASH', transactionHash)
    // const signature = await tryOffchainSigning(
    //   transactionHash,
    //   { ...txArgs, safeAddress: multisigDeployed.contract },
    //   false
    // )
    // console.log('SIGNATURE:', signature)
    try {
      const transaction = await GnosisSafe.getContract(
        multisigDeployed.contract
      )
        .methods.execTransaction(
          txArgs.to,
          txArgs.valueInWei,
          txArgs.data,
          txArgs.operation,
          txArgs.safeTxGas,
          txArgs.baseGas,
          txArgs.gasPrice,
          txArgs.gasToken,
          txArgs.refundReceiver,
          sigs
        )
        .send({
          from: account,
          gas: txArgs.baseGas + txArgs.safeTxGas,
          gasPrice,
        })
      setTransaction(transaction)
    } catch (err) {
      console.log(err)
    }
  }

  return (
    <div>
      <button
        className="btn btn-primary mb-2"
        onClick={sendMultisigTransaction}
      >
        Send Transaction
      </button>
      <div>{transaction}</div>
    </div>
  )
}

export default connect((state: IState) => ({
  account: state.account.account,
  network: state.account.network,
  managing: state.management.managing,
  multisigDeployed: state.management.multisigDeployed,
}))(MultisigWidget)

import axios from 'axios'
import Web3 from 'web3'
import { AbiItem } from 'web3-utils'
import GnosisSafe from '../../smart-contracts/GnosisSafe'
import { estimateSafeTxGas } from '../../services/safe/transactions/gas'

const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000'

export const sendMultisigTransaction = async (
  account: string,
  safeContract: string,
  recipient: string,
  abi: AbiItem,
  params: string[],
  gas: string
): Promise<string | null> => {
  const web3: Web3 = window.web3
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
  const nonce = await GnosisSafe.getContract(safeContract)
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
    safeContract,
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
    safeInstance: GnosisSafe.getContract(safeContract),
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
  //   { ...txArgs, safeAddress: safeContract },
  //   false
  // )
  // console.log('SIGNATURE:', signature)
  return new Promise((resolve, reject) => {
    GnosisSafe.getContract(safeContract)
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
      .send(
        {
          from: account,
          gas: parseInt(txArgs.baseGas) + txArgs.safeTxGas,
          gasPrice,
        },
        (error: unknown, hash: string) => {
          if (error) return reject(error)
          console.log(hash)
          resolve(hash)
        }
      )
  })
}

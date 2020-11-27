type HashTxArgs = {
  baseGas: number
  data: string
  gasPrice: string
  gasToken: string
  nonce: number
  operation: number
  refundReceiver: string
  safeInstance: any
  safeTxGas: number
  sender?: string
  to: string
  valueInWei: string
}

type SendTxArgs = {
  baseGas: number
  data: string
  gasPrice: string
  gasToken: string
  nonce: number
  operation: number
  refundReceiver: string
  safeInstance: any
  safeTxGas: number
  sender?: string
  sigs: string
  to: string
  valueInWei: string
}

export const CALL = 0
export const DELEGATE_CALL = 1
export const TX_TYPE_EXECUTION = 'execution'
export const TX_TYPE_CONFIRMATION = 'confirmation'

export const getTransactionHash = async ({
  baseGas,
  data,
  gasPrice,
  gasToken,
  nonce,
  operation,
  refundReceiver,
  safeInstance,
  safeTxGas,
  sender,
  to,
  valueInWei,
}: HashTxArgs): Promise<string> => {
  const txHash = await safeInstance.methods
    .getTransactionHash(
      to,
      valueInWei,
      data,
      operation,
      safeTxGas,
      baseGas,
      gasPrice,
      gasToken,
      refundReceiver,
      nonce
    )
    .call({
      from: sender,
    })

  return txHash
}

export const getApprovalTransaction = async (
  safeInstance: any,
  txHash: string
): Promise<any> => {
  try {
    return safeInstance.methods.approveHash(txHash)
  } catch (err) {
    console.error(`Error while approving transaction: ${err}`)
    throw err
  }
}

export const getExecutionTransaction = ({
  baseGas,
  data,
  gasPrice,
  gasToken,
  operation,
  refundReceiver,
  safeInstance,
  safeTxGas,
  sigs,
  to,
  valueInWei,
}: SendTxArgs): any => {
  try {
    return safeInstance.methods.execTransaction(
      to,
      valueInWei,
      data,
      operation,
      safeTxGas,
      baseGas,
      gasPrice,
      gasToken,
      refundReceiver,
      sigs
    )
  } catch (err) {
    console.error(`Error while creating transaction: ${err}`)

    throw err
  }
}

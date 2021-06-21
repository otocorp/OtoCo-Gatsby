import Web3 from 'web3'
import axios from 'axios'
import BN from 'bn.js'

type RequestInfo = {
  from: string
  gas: string
  gasPrice: string
}

export default {
  getTransactionRequestInfo: (from: string, gas: int): Promise<RequestInfo> => {
    return new Promise(async (resolve) => {
      const web3: Web3 = window.web3
      const requestInfo = { from, gas, gasPrice: '0' }
      try {
        const gasFees = await axios.get(
          `https://ethgasstation.info/api/ethgasAPI.json`
        )
        requestInfo.gasPrice = web3.utils.toWei(
          (gasFees.data.fast * 0.1).toString(),
          'gwei'
        )
        resolve(requestInfo)
      } catch (err) {
        console.error('Could not fetch gas fee for transaction.')
        resolve({ from, gas, gasPrice: '0' })
      }
    })
  },
}

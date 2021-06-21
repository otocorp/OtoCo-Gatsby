import Web3 from 'web3'
import { provider } from 'web3-core'
import Web3Modal from 'web3modal'
import WalletConnectProvider from '@walletconnect/web3-provider'

interface ModalType {
  getWeb3: () => Promise<Web3 | undefined>
  callModal: () => Promise<Web3>
  disconnect: () => void
  web3?: Web3
  web3Modal?: Web3Modal
  provider?: provider
}

const Modal: ModalType = {
  web3: undefined,
  web3Modal: undefined,
  provider: undefined,

  getWeb3: async function (): Promise<Web3> {
    if (!this.web3) await this.callModal()
    return this.web3
  },
  callModal: async function (): Promise<Web3> {
    if (!this.web3Modal) {
      const providerOptions = {
        walletconnect: {
          package: WalletConnectProvider, // required
          options: {
            infuraId: 'f2e6a40391274a0793c63e923de0a170', // required
          },
        },
      }

      this.web3Modal = new Web3Modal({
        // network: "kovan", // optional
        cacheProvider: false, // optional
        providerOptions, // required
        theme: {
          background: '#0B1326',
          main: 'rgba(255, 255, 255, 0.8)',
          secondary: 'rgba(255, 255, 255, 0.8)',
          border: 'transparent',
          hover: 'rgba(116, 121, 255, 0.2)',
        },
      })
    }

    this.provider = await this.web3Modal.connect()
    this.web3 = new Web3(this.provider)
    window.web3 = this.web3

    // if (this.provider.isAuthereum) this.provider.authereum.showWidget();
    // else if (this.provider.isUniLogin) web3.currentProvider.callModal = this.provider.boundOpenDashboard;
    // else web3.currentProvider.callModal = undefined;
    return this.web3
  },
  disconnect: function (): void {
    if (this.web3Modal) this.web3Modal.clearCachedProvider()
    this.provider = null
    window.web3 = undefined
  },
}

export default Modal

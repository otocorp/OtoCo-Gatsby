import React, { useState, FC } from 'react'
import Web3 from 'web3'
import ENS from 'ethereum-ens'
import Icon from '../icon/icon'
import { faCopy } from '@fortawesome/free-solid-svg-icons'
import { connect } from 'react-redux'
import { IState } from '../../state/types'

import OtocoRegistrar from '../../smart-contracts/OtocoRegistrar'

interface Props {
  address: string
  network?: string
}

const AddressWidget: FC<Props> = ({ address, network }: Props) => {
  const [isEns, setENS] = useState(false)
  const [displayAddress, setDisplayAddress] = useState(address)
  const [linkSearch, setLinkSearch] = useState('')

  const clickCopyHandler = (info: string) => {
    navigator.clipboard.writeText(info)
  }

  React.useEffect(() => {
    const web3: Web3 = window.web3
    if (!web3) return
    const ens = new ENS(web3.currentProvider)
    if (network === 'ropsten')
      setLinkSearch('https://ropsten.etherscan.io/address/')
    if (network === 'kovan')
      setLinkSearch('https://kovan.etherscan.io/address/')
    if (network === 'main') setLinkSearch('https://etherscan.io/address/')

    ens
      .reverse(address)
      .name()
      .then(async (addr: string) => {
        await setDisplayAddress(addr)
        await setENS(true)
        return
      })
      .catch((err: any) => {
        // console.log("ERR", err)
        OtocoRegistrar.getContract(network)
          .methods.ownedDomains(address)
          .call(async (error: any, quantity: number) => {
            if (quantity <= 0) return
            OtocoRegistrar.getContract(network)
              .methods.resolve(address, quantity - 1)
              .call(async (error: any, name: string) => {
                // Remove WRONGLY set of old Domains
                if (!/^[a-z0-9-]*$/.test(name)) return
                await setDisplayAddress(name + '.otoco.eth')
                await setENS(true)
                return
              })
          })
      })
  }, [address, network])

  const formattedAddress = (address: string) => {
    try {
      return (
        displayAddress.substring(0, 6) +
        '...' +
        displayAddress.substring(address.length - 5, address.length - 1)
      )
    } catch {
      console.log('Cannot show address...', displayAddress)
    }
  }

  return (
    <span style={{ display: 'inline-block' }}>
      {isEns && (
        <a className="primary" href={linkSearch + address} target="blank">
          {displayAddress}
        </a>
      )}
      {!isEns && (
        <a className="primary" href={linkSearch + address} target="blank">
          {formattedAddress(displayAddress)}
        </a>
      )}
      &nbsp;
      <a href="#" onClick={clickCopyHandler.bind(undefined, address)}>
        <Icon icon={faCopy}></Icon>
      </a>
    </span>
  )
}

export default connect((state: IState) => ({
  network: state.account.network,
}))(AddressWidget)

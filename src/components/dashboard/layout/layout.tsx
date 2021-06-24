import React, { useEffect } from 'react'
import loadable from '@loadable/component'
const AccountWidget = loadable(
  () => import('../../accountWidget/accountWidget')
  )
  import Footer from '../../footer/footer'
  import Sidebar from '../sidebar/index'
  import './style.scss'
  
interface Props {
  children?: React.ReactNode
}

const Layout: React.FC<Props> = ({ children }: Props) => {
  return (
    <div className="wrapper">
      <Sidebar></Sidebar>
      <div className="dashpanel">
        <div className="dashpanel-content">
          <AccountWidget />
          {children}
        </div>
        <Footer />
      </div>
    </div>
  )
}

export default Layout

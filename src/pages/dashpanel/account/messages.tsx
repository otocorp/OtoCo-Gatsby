import React from 'react'
import loadable from '@loadable/component'
import { Helmet } from 'react-helmet'
// const Layout = loadable(
//   () => import('../../components/dashboard/layout/layout')
// )
import Layout from '../../../components/dashboard/account/layout/layout'
const Messages = loadable(
  () => import('../../../components/dashboard/account/messages')
)

interface Props {
  location: Location
}

const AccountMessages: React.FC<Props> = ({ location }: Props) => {
  return (
    <Layout location={location}>
      <Helmet title="Otoco - Account - Messages" defer={false} />
      <Messages></Messages>
    </Layout>
  )
}

export default AccountMessages

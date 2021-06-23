import React from 'react'
import loadable from '@loadable/component'
import { Helmet } from 'react-helmet'
import Layout from '../components/dashboard/layout/layout'
const Overview = loadable(() => import('../components/dashboard'))

interface Props {
  location: Location
}

const DashpanelIndex: React.FC<Props> = ({ location }: Props) => {
  return (
    <Layout location={location}>
      <Helmet title="Otoco - Dashpanel" defer={false} />
      <Overview></Overview>
    </Layout>
  )
}

export default DashpanelIndex

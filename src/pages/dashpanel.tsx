import React from 'react'
import { Helmet } from 'react-helmet'
import loadable from '@loadable/component'
const Overview = loadable(() => import('../components/dashboard'))
import Layout from '../components/dashboard/layout/layout'

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

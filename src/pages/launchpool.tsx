import React from 'react'
import loadable from '@loadable/component'
import { Helmet } from 'react-helmet'
import { Router } from '@reach/router'
import Layout from '../components/dashboard/layout/layout'
const LaunchPool = loadable(() => import('../components/launchpool'))

interface Props {
  location: Location
}

const LaunchPoolIndex: React.FC<Props> = ({ location }: Props) => {
  return (
    <Layout location={location}>
      <Helmet title="Otoco - Launch Pool" defer={false} />
      <Router>
        <LaunchPool path="/launchpool/:id" />
        <LaunchPool path="/launchpool/" />
      </Router>
    </Layout>
  )
}

export default LaunchPoolIndex

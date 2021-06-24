import React from 'react'
import { Helmet } from 'react-helmet'
import loadable from '@loadable/component'
import Layout from '../components/layout/layout'
const SpinUp = loadable(() => import('../components/spinUp/spinUp'))

interface Props {
  location: Location
}

const SpinUpPage: React.FC<Props> = ({ location }: Props) => {
  return (
    <Layout location={location}>
      <Helmet title="Otoco - Spin-up Company" defer={false} />
      <div className="container-sm limiter-md">
        <SpinUp></SpinUp>
      </div>
    </Layout>
  )
}

export default SpinUpPage

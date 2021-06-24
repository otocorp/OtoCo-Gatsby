import React from 'react'
import { Router } from '@reach/router'
import { Helmet } from 'react-helmet'
import loadable from '@loadable/component'
import Layout from '../components/dashboard/layout/layout'
const Token = loadable(() => import('../components/token/token'))

interface Props {
  location: Location
}

const TokenIndex: React.FC<Props> = ({ location }: Props) => {
  return (
    <Layout location={location}>
      <Helmet title="Otoco - Token Transfer Tool" defer={false} />
      <Router>
        <Token path="/token/:id" />
      </Router>
    </Layout>
  )
}

export default TokenIndex

import React from 'react'
import { Helmet } from 'react-helmet'
import { Router } from '@reach/router'
import loadable from '@loadable/component'
const Company = loadable(() => import('../../../components/dashboard/entity'))
import Layout from '../../../components/dashboard/layout/layout'

interface Props {
  location: Location
}

const CompanyIndex: React.FC<Props> = ({ location }: Props) => {
  return (
    <Layout location={location}>
      <Helmet title="Otoco - Entity" defer={false} />
      <Router>
        <Company path="/dashpanel/entity/:id" />
      </Router>
    </Layout>
  )
}

export default CompanyIndex

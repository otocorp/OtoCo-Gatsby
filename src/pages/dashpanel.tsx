import React from 'react'
import { withPrefix } from 'gatsby'
import { Helmet } from 'react-helmet'
import { Router } from '@reach/router'
import Layout from '../components/dashboard/layout/layout'
import Company from '../components/dashboard'

interface Props {
  location: Location
}

const CompanyIndex: React.FC<Props> = ({ location }: Props) => {
  return (
    <Layout location={location}>
      <Helmet title="Otoco - Entity" defer={false} />
      <Router>
        <Company path="/dashpanel/:id" />
      </Router>
    </Layout>
  )
}

export default CompanyIndex

import React from 'react'
import loadable from '@loadable/component'
import Layout from '../components/layout/layout'

const NotFoundPage: React.VoidFunctionComponent = () => {
  return (
    <Layout>
      <h1>NOT FOUND</h1>
      <p>You just hit a route that doesn&#39;t exist... the sadness.</p>
    </Layout>
  )
}

export default NotFoundPage

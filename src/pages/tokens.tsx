import React from 'react'
import { Link } from 'gatsby'
import { Router } from '@reach/router'

import Layout from '../components/layout/layout'
import Token from '../components/tokens/tokens'

interface Props {
  location: Location
}

const TokenIndex: React.FC<Props> = ({ location }: Props) => {
  // const history = useHistory()

  //   const clickBackHandler = async (e) => {
  //     history.push('/')
  //   }

  return (
    <Layout location={location}>
      <Router>
        <Token path="/tokens/:id" />
      </Router>
    </Layout>
  )
}

export default TokenIndex

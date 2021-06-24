import React from 'react'

import { Helmet } from 'react-helmet'
import Features from '../components/landing/features'
import Footer from '../components/footer/footer'
import Header from '../components/landing/header'

interface Props {
  location: Location
}

const Index: React.FC<Props> = ({ location }: Props) => {
  return (
    <div className="features-bg">
      <Helmet
        title="Otoco - Automated Company Assembly on Blockchain"
        defer={false}
      />
      <div className="padded container">
        <Header></Header>
        <Features></Features>
      </div>
      <Footer></Footer>
    </div>
  )
}

export default Index

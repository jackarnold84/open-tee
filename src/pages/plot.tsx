import React from "react"
import Layout from "../features/layout/Layout"
import PlotDemo from "../features/plot/PlotDemo"

const PlotPage = () => {
  return (
    <Layout>
      <PlotDemo />
    </Layout>
  )
}

export default PlotPage

export const Head = () => <title>Plot Page</title>

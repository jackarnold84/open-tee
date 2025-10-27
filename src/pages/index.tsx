import * as React from "react"
import Home from "../features/home/Home"
import Layout from "../features/layout/Layout"

const IndexPage = () => {
  return (
    <Layout>
      <Home />
    </Layout>
  )
}

export default IndexPage

export const Head = () => <title>OpenTee - Home</title>

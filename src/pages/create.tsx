import * as React from "react"
import Create from "../features/alert/Create"
import Layout from "../features/layout/Layout"

const CreatePage = () => {
  return (
    <Layout>
      <Create />
    </Layout>
  )
}

export default CreatePage

export const Head = () => <title>OpenTee - Create Alert</title>

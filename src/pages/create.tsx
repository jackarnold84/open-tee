import * as React from "react"
import RequireLogin from "../features/account/RequireLogin"
import Create from "../features/alert/Create"
import Layout from "../features/layout/Layout"

const CreatePage = () => {
  return (
    <Layout>
      <RequireLogin>
        <Create />
      </RequireLogin>
    </Layout>
  )
}

export default CreatePage

export const Head = () => <title>OpenTee - Create Alert</title>

import * as React from "react"
import Account from "../features/account/Account"
import RequireLogin from "../features/account/RequireLogin"
import Layout from "../features/layout/Layout"

const AccountPage = () => {
  return (
    <Layout>
      <RequireLogin>
        <Account />
      </RequireLogin>
    </Layout>
  )
}

export default AccountPage

export const Head = () => <title>OpenTee - Account</title>

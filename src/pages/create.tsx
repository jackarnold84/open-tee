import { PageProps } from "gatsby"
import * as React from "react"
import RequireLogin from "../features/account/RequireLogin"
import Create from "../features/alert/Create"
import Layout from "../features/layout/Layout"

const CreatePage: React.FC<PageProps> = ({ location }) => {
  const searchParams = new URLSearchParams(location.search)
  const editAlertId = searchParams.get('edit') || undefined
  const cloneAlertId = searchParams.get('clone') || undefined

  return (
    <Layout>
      <RequireLogin>
        <Create key={`${editAlertId ?? ''}-${cloneAlertId ?? ''}`} editAlertId={editAlertId} cloneAlertId={cloneAlertId} />
      </RequireLogin>
    </Layout>
  )
}

export default CreatePage

export const Head = () => <title>OpenTee - Create Alert</title>

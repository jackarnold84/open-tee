import { PageProps } from "gatsby"
import * as React from "react"
import RequireLogin from "../../features/account/RequireLogin"
import CreateResult from "../../features/alert/CreateResult"
import Layout from "../../features/layout/Layout"

const CreateResultPage: React.FC<PageProps> = ({ location }) => {
  const searchParams = new URLSearchParams(location.search)
  const editAlertId = searchParams.get('edit') || undefined

  return (
    <Layout>
      <RequireLogin>
        <CreateResult location={location} editAlertId={editAlertId} />
      </RequireLogin>
    </Layout>
  )
}

export default CreateResultPage

export const Head = () => <title>OpenTee - Search Results</title>

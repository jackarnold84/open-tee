import * as React from "react"
import styled from "styled-components"
import useSWRMutation from "swr/mutation"
import Container from "../../components/Container"
import { CreateAlertForm, CreateAlertFormValues } from "./CreateAlertForm"
import { SearchResults } from "./SearchResults"

const SEARCH_API_URL = "https://rwz8s6f288.execute-api.us-east-2.amazonaws.com/Prod/opentee/tee-time-search"

async function searchTeeTimes(url: string, { arg }: { arg: CreateAlertFormValues }) {
  const response = await fetch(url, {
    method: "POST",
    body: JSON.stringify(arg),
  })
  if (!response.ok) throw new Error("API request failed")
  return response.json()
}

const Create = () => {
  const [formValues, setFormValues] = React.useState<CreateAlertFormValues | undefined>(undefined)
  const { trigger, data: result, error, isMutating: loading, reset } = useSWRMutation(
    SEARCH_API_URL,
    searchTeeTimes
  )

  const handleSubmit = async (values: CreateAlertFormValues) => {
    setFormValues(values)
    await trigger(values)
  }

  const handleBack = () => {
    reset()
  }

  return (
    <Container size={16} centered width={400}>
      <h2>Create Alert</h2>
      {result ? (
        <SearchResults courses={result.courses || []} onBack={handleBack} />
      ) : (
        <>
          {error && <ErrorMsg>{error.message || "Unknown error"}</ErrorMsg>}
          <CreateAlertForm onSubmit={handleSubmit} initialValues={formValues} />
          {loading && <LoadingMsg>Searching...</LoadingMsg>}
        </>
      )}
    </Container>
  )
}

export default Create

// Add styled components for error/loading
const ErrorMsg = styled.div`
  color: red;
  margin-bottom: 16px;
`
const LoadingMsg = styled.div`
  margin-top: 16px;
`

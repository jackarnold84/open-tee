import * as React from "react"
import styled from "styled-components"
import useSWRMutation from "swr/mutation"
import Container from "../../components/Container"
import { API_BASE } from "../../config/env"
import { useAuth } from "../layout/AuthProvider"
import CreateAlertError from "./CreateAlertError"
import { CreateAlertForm, CreateAlertFormValues } from "./CreateAlertForm"
import CreateAlertSuccess from "./CreateAlertSuccess"
import { SearchResults } from "./SearchResults"

const SEARCH_API_URL = `${API_BASE}/opentee/tee-time-search`
const CREATE_ALERT_API_URL = `${API_BASE}/opentee/create-alert`

const ErrorMsg = styled.div`
  color: red;
  margin-bottom: 16px;
`

async function searchTeeTimes(url: string, { arg }: { arg: CreateAlertFormValues }) {
  const response = await fetch(url, {
    method: "POST",
    body: JSON.stringify(arg),
  })
  if (!response.ok) {
    try {
      const errorBody = await response.text()
      console.error("Search API error response:", errorBody)
    } catch (e) {
      console.error("Search API error, could not read body")
    }
    throw new Error("API request failed")
  }
  return response.json()
}

async function createAlert(
  url: string,
  { arg }: {
    arg: {
      formValues: CreateAlertFormValues;
      alertOptions: { newCourses: boolean; teeTimeChanges: boolean; costChanges: boolean };
      alertUser: string;
      alertEmail: string;
      token: string;
    }
  }
) {
  const { formValues, alertOptions, alertUser, alertEmail, token } = arg
  const { ...teeTimeSearch } = formValues
  const payload = {
    teeTimeSearch,
    alertOptions,
    alertUser,
    alertEmail,
  }
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Basic ${token}`,
    },
    body: JSON.stringify(payload),
  })
  if (!response.ok) {
    let errorBody = ""
    try {
      errorBody = await response.text()
      console.error("Create Alert API error response:", errorBody)
    } catch (e) {
      console.error("Create Alert API error, could not read body")
    }
    return { error: true, errorMessage: errorBody || "Create alert API request failed" }
  }
  return response.json()
}

const Create = () => {
  const { user } = useAuth()
  const { username, email, token } = user

  const [formValues, setFormValues] = React.useState<CreateAlertFormValues | undefined>(undefined)
  const [showSuccess, setShowSuccess] = React.useState(false)
  const [localCreateAlertError, setLocalCreateAlertError] = React.useState<string | null>(null)
  const { trigger, data: result, error, isMutating: loading, reset } = useSWRMutation(
    SEARCH_API_URL,
    searchTeeTimes
  )
  const { trigger: triggerCreateAlert, data: createAlertResult, isMutating: creatingAlert, error: createAlertError } = useSWRMutation(
    CREATE_ALERT_API_URL,
    createAlert
  )

  const handleSubmit = async (values: CreateAlertFormValues) => {
    setFormValues(values)
    await trigger(values)
  }

  const handleBack = () => {
    reset()
  }

  const handleCreateAlert = async (alertOptions: { newCourses: boolean; teeTimeChanges: boolean; costChanges: boolean }) => {
    if (!formValues) return
    const result = await triggerCreateAlert({ formValues, alertOptions, alertUser: username, alertEmail: email, token })
    if (result && result.error) {
      setLocalCreateAlertError(result.errorMessage || "Failed to create alert")
      return
    }
    setShowSuccess(true)
  }

  return (
    <Container size={16} centered width={400}>
      <h2>Create Alert</h2>
      {localCreateAlertError || createAlertError ? (
        <CreateAlertError errorMessage={localCreateAlertError || createAlertError?.message || "Failed to create alert"} />
      ) : showSuccess ? (
        <CreateAlertSuccess alertId={createAlertResult?.alertId} />
      ) : result ? (
        <SearchResults courses={result.courses || []} onBack={handleBack} onCreateAlert={handleCreateAlert} processing={creatingAlert} />
      ) : (
        <>
          {error && <ErrorMsg>{error.message || "Unknown error"}</ErrorMsg>}
          <CreateAlertForm onSubmit={handleSubmit} initialValues={formValues} loading={loading} />
        </>
      )}
    </Container>
  )
}

export default Create

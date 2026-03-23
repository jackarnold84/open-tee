import { Alert, Button } from "antd"
import * as React from "react"
import styled from "styled-components"
import useSWR from "swr"
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
const GET_ALERT_API_URL = `${API_BASE}/opentee/alert`

const ErrorMsg = styled.div`
  color: red;
  margin-bottom: 16px;
`

interface AlertResponse {
  alertId: string;
  alertUser: string;
  alertEmail: string;
  alertOptions: { newCourses: boolean; teeTimeChanges: boolean; costChanges: boolean };
  teeTimeSearch: {
    date: string;
    zipCode: string;
    radius: number;
    holes: number;
    players: number;
    priceMax: number;
    dealsOnly: boolean;
    startHourMin: number;
    startHourMax: number;
    ratingMin: number;
    nameContains: string[];
  };
}

async function fetchAlert(url: string, token: string): Promise<AlertResponse> {
  const response = await fetch(url, {
    method: "GET",
    headers: {
      "Authorization": `Basic ${token}`,
    },
  })
  if (!response.ok) {
    if (response.status === 404) {
      throw new Error("Alert not found")
    }
    if (response.status === 403) {
      throw new Error("You don't have permission to edit this alert")
    }
    throw new Error("Failed to load alert")
  }
  return response.json()
}

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
      alertId?: string;
    }
  }
) {
  const { formValues, alertOptions, alertUser, alertEmail, token, alertId } = arg
  const { ...teeTimeSearch } = formValues
  const payload: any = {
    teeTimeSearch,
    alertOptions,
    alertUser,
    alertEmail,
  }
  if (alertId) {
    payload.alertId = alertId
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

interface Props {
  editAlertId?: string
  cloneAlertId?: string
}

const Create: React.FC<Props> = ({ editAlertId, cloneAlertId }) => {
  const { user } = useAuth()
  const { username, email, token } = user

  const [alertId, setAlertId] = React.useState<string | null>(editAlertId || null)
  const [existingAlertOptions, setExistingAlertOptions] = React.useState<{ newCourses: boolean; teeTimeChanges: boolean; costChanges: boolean } | null>(null)

  // Fetch existing alert when in edit or clone mode
  const fetchAlertId = alertId || cloneAlertId || null
  const { data: existingAlert, error: fetchAlertError, isLoading: loadingAlert } = useSWR(
    fetchAlertId ? `${GET_ALERT_API_URL}/${fetchAlertId}` : null,
    (url) => fetchAlert(url, token)
  )

  const existingFormValues = React.useMemo(() => {
    if (!existingAlert) return undefined
    const search = existingAlert.teeTimeSearch
    return {
      date: search.date,
      zipCode: search.zipCode,
      radius: search.radius,
      holes: search.holes,
      players: search.players,
      priceMax: search.priceMax,
      dealsOnly: search.dealsOnly,
      startHourRange: [search.startHourMin, search.startHourMax] as [number, number],
      ratingMin: search.ratingMin,
      nameContains: search.nameContains || [],
    }
  }, [existingAlert])

  React.useEffect(() => {
    if (existingAlert) {
      setExistingAlertOptions(existingAlert.alertOptions)
    }
  }, [existingAlert])

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

  const isEditMode = !!alertId
  const clearEditMode = () => {
    setAlertId(null)
    setExistingAlertOptions(null)
    if (typeof window !== 'undefined') {
      window.history.replaceState({}, '', window.location.pathname)
    }
  }

  const handleCreateNew = () => {
    setAlertId(null)
    setExistingAlertOptions(null)
    setFormValues(undefined)
    setShowSuccess(false)
    reset()
    if (typeof window !== 'undefined') {
      window.history.replaceState({}, '', window.location.pathname)
    }
  }

  const handleSubmit = async (values: CreateAlertFormValues) => {
    setFormValues(values)
    await trigger(values)
  }

  const handleBack = () => {
    reset()
  }

  const handleCreateAlert = async (alertOptions: { newCourses: boolean; teeTimeChanges: boolean; costChanges: boolean }) => {
    if (!formValues) return
    const result = await triggerCreateAlert({
      formValues,
      alertOptions,
      alertUser: username,
      alertEmail: email,
      token,
      alertId: alertId || undefined
    })
    if (result && result.error) {
      setLocalCreateAlertError(result.errorMessage || (isEditMode ? "Failed to update alert" : "Failed to create alert"))
      return
    }
    setShowSuccess(true)
  }

  const isCloneMode = !!cloneAlertId && !isEditMode

  if ((isEditMode || isCloneMode) && fetchAlertError) {
    return (
      <Container size={16} centered width={400}>
        <h2>{isEditMode ? "Edit Alert" : "Clone Alert"}</h2>
        <Alert
          type="error"
          message={fetchAlertError.message || "Failed to load alert"}
          style={{ marginBottom: 16 }}
        />
        <Button type="primary" onClick={clearEditMode}>
          Create New Alert
        </Button>
      </Container>
    )
  }

  return (
    <Container size={16} centered width={400}>
      <h2>{isEditMode ? "Edit Alert" : isCloneMode ? "Clone Alert" : "Create Alert"}</h2>
      {isEditMode && <Alert type="info" message={loadingAlert ? "Loading..." : `Editing alert ${alertId}`} style={{ marginBottom: 16 }} />}
      {isCloneMode && <Alert type="info" message={loadingAlert ? "Loading..." : `Cloning alert ${cloneAlertId}`} style={{ marginBottom: 16 }} />}
      {(isEditMode || isCloneMode) && loadingAlert ? null : localCreateAlertError || createAlertError ? (
        <CreateAlertError errorMessage={localCreateAlertError || createAlertError?.message || (isEditMode ? "Failed to update alert" : "Failed to create alert")} />
      ) : showSuccess ? (
        <CreateAlertSuccess alertId={createAlertResult?.alertId} isUpdate={isEditMode} onCreateNew={handleCreateNew} />
      ) : result ? (
        <SearchResults
          courses={result.courses || []}
          onBack={handleBack}
          onCreateAlert={handleCreateAlert}
          processing={creatingAlert}
          initialAlertOptions={existingAlertOptions || undefined}
          isEditMode={isEditMode}
        />
      ) : (
        <>
          {error && <ErrorMsg>{error.message || "Unknown error"}</ErrorMsg>}
          <CreateAlertForm onSubmit={handleSubmit} initialValues={formValues || existingFormValues} loading={loading} />
        </>
      )}
    </Container>
  )
}

export default Create

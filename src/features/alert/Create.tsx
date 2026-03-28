import { Alert, Button } from "antd"
import { navigate } from "gatsby"
import * as React from "react"
import styled from "styled-components"
import useSWR from "swr"
import useSWRMutation from "swr/mutation"
import Container from "../../components/Container"
import { API_BASE } from "../../config/env"
import { useAuth } from "../layout/AuthProvider"
import { CreateAlertForm, CreateAlertFormValues } from "./CreateAlertForm"

const SEARCH_API_URL = `${API_BASE}/opentee/tee-time-search`
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

const FORM_STORAGE_KEY = 'opentee_create_form'

interface Props {
  editAlertId?: string
  cloneAlertId?: string
}

const Create: React.FC<Props> = ({ editAlertId, cloneAlertId }) => {
  const { user } = useAuth()
  const { token } = user

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

  const [formValues, setFormValues] = React.useState<CreateAlertFormValues | undefined>(() => {
    if (editAlertId || cloneAlertId) return undefined
    if (typeof window === 'undefined') return undefined
    const saved = sessionStorage.getItem(FORM_STORAGE_KEY)
    if (!saved) return undefined
    try { return JSON.parse(saved) } catch { return undefined }
  })
  const { trigger, error, isMutating: loading } = useSWRMutation(
    SEARCH_API_URL,
    searchTeeTimes
  )

  const isEditMode = !!alertId
  const clearEditMode = () => {
    setAlertId(null)
    setExistingAlertOptions(null)
    if (typeof window !== 'undefined') {
      window.history.replaceState({}, '', window.location.pathname)
    }
  }

  const handleSubmit = async (values: CreateAlertFormValues) => {
    setFormValues(values)
    if (typeof window !== 'undefined') {
      sessionStorage.setItem(FORM_STORAGE_KEY, JSON.stringify(values))
    }
    try {
      const searchResult = await trigger(values)
      if (!searchResult) return
      const targetPath = alertId ? `/create/result?edit=${alertId}` : `/create/result`
      navigate(targetPath, {
        state: {
          courses: searchResult.courses || [],
          formValues: values,
          editAlertId: alertId || undefined,
          existingAlertOptions: existingAlertOptions || undefined,
        }
      })
    } catch {
      // error state from useSWRMutation populates; shown inline on form
    }
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
      {(isEditMode || isCloneMode) && loadingAlert ? null : (
        <>
          {error && <ErrorMsg>{error.message || "Unknown error"}</ErrorMsg>}
          <CreateAlertForm onSubmit={handleSubmit} initialValues={formValues || existingFormValues} loading={loading} />
        </>
      )}
    </Container>
  )
}

export default Create

import * as React from "react"
import useSWRMutation from "swr/mutation"
import { navigate } from "gatsby"
import Container from "../../components/Container"
import { API_BASE } from "../../config/env"
import { useAuth } from "../layout/AuthProvider"
import { CreateAlertFormValues } from "./CreateAlertForm"
import CreateAlertError from "./CreateAlertError"
import CreateAlertSuccess from "./CreateAlertSuccess"
import { SearchResults, Course } from "./SearchResults"

const CREATE_ALERT_API_URL = `${API_BASE}/opentee/create-alert`

interface ResultPageState {
  courses: Course[]
  formValues: CreateAlertFormValues
  editAlertId?: string
  existingAlertOptions?: {
    newCourses: boolean
    teeTimeChanges: boolean
    costChanges: boolean
  }
}

async function createAlert(
  url: string,
  { arg }: {
    arg: {
      formValues: CreateAlertFormValues
      alertOptions: { newCourses: boolean; teeTimeChanges: boolean; costChanges: boolean }
      alertUser: string
      alertEmail: string
      token: string
      alertId?: string
    }
  }
) {
  const { formValues, alertOptions, alertUser, alertEmail, token, alertId } = arg
  const { ...teeTimeSearch } = formValues
  const payload: any = { teeTimeSearch, alertOptions, alertUser, alertEmail }
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
  location: Location
  editAlertId?: string
}

const CreateResult: React.FC<Props> = ({ location, editAlertId }) => {
  const { user } = useAuth()
  const { username, email, token } = user
  const state = (location as any).state as ResultPageState | null

  const [showSuccess, setShowSuccess] = React.useState(false)
  const [localCreateAlertError, setLocalCreateAlertError] = React.useState<string | null>(null)
  const { trigger: triggerCreateAlert, data: createAlertResult, isMutating: creatingAlert, error: createAlertError } = useSWRMutation(
    CREATE_ALERT_API_URL,
    createAlert
  )

  React.useEffect(() => {
    if (!state?.courses) {
      navigate('/create', { replace: true })
    }
  }, [])

  if (!state?.courses) return null

  const isEditMode = !!editAlertId

  const handleBack = () => navigate(-1)
  const handleCreateNew = () => {
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem('opentee_create_form')
    }
    navigate('/create', { replace: true })
  }

  const handleCreateAlert = async (alertOptions: { newCourses: boolean; teeTimeChanges: boolean; costChanges: boolean }) => {
    const result = await triggerCreateAlert({
      formValues: state.formValues,
      alertOptions,
      alertUser: username,
      alertEmail: email,
      token,
      alertId: editAlertId,
    })
    if (result && result.error) {
      setLocalCreateAlertError(result.errorMessage || (isEditMode ? "Failed to update alert" : "Failed to create alert"))
      return
    }
    setShowSuccess(true)
  }

  return (
    <Container size={16} centered width={400}>
      <h2>{isEditMode ? "Edit Alert" : "Search Results"}</h2>
      {localCreateAlertError || createAlertError ? (
        <CreateAlertError errorMessage={localCreateAlertError || createAlertError?.message || (isEditMode ? "Failed to update alert" : "Failed to create alert")} />
      ) : showSuccess ? (
        <CreateAlertSuccess alertId={createAlertResult?.alertId} isUpdate={isEditMode} onCreateNew={handleCreateNew} />
      ) : (
        <SearchResults
          courses={state.courses}
          onBack={handleBack}
          onCreateAlert={handleCreateAlert}
          processing={creatingAlert}
          initialAlertOptions={state.existingAlertOptions}
          isEditMode={isEditMode}
        />
      )}
    </Container>
  )
}

export default CreateResult

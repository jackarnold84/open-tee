import { Button } from "antd"
import * as React from "react"
import styled from "styled-components"

interface Course {
  id: number
  name: string
  location: string
  teeTimes: number
  priceMin: number
  startTimeMin: string
  startTimeMax: string
  averageRating: number
}

interface ResultsProps {
  courses: Course[]
  onBack: () => void
  onCreateAlert: (alertOptions: {
    newCourses: boolean;
    teeTimeChanges: boolean;
    costChanges: boolean;
  }) => void
  processing?: boolean
  initialAlertOptions?: {
    newCourses: boolean;
    teeTimeChanges: boolean;
    costChanges: boolean;
  }
  isEditMode?: boolean
}

const ResultsContainer = styled.div`
  margin-top: 24px;
  max-width: 360px;
  margin: auto;
`

const CourseCard = styled.div`
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.06);
  padding: 20px 24px;
  margin-bottom: 20px;
  display: flex;
  flex-direction: column;
  gap: 2px;
`

const CourseTitle = styled.div`
  font-size: 1.2rem;
  font-weight: 600;
`

const CourseLocation = styled.div`
  color: #888;
  font-size: 1rem;
`

const CourseDetails = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
  font-size: 1rem;
  margin-top: 8px;
`

const DetailsRow = styled.div`
  display: flex;
  align-items: center;
  gap: 18px;
  flex-wrap: wrap;
  justify-content: space-between;
`

const Price = styled.span`
  font-weight: 500;
`

const Rating = styled.span`
  margin-left: auto;
  display: flex;
  align-items: center;
  font-weight: 500;
`

const Star = styled.span`
  color: #f7b500;
  font-size: 1.1em;
  margin-right: 2px;
`

const AlertOptionsContainer = styled.div`
  margin: 24px 0 8px 0;
`

const AlertOptionsLabel = styled.div`
  font-weight: 600;
  margin-bottom: 8px;
`

const AlertOptionsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-top: 8px;
`

const AlertCheckboxLabel = styled.label`
  display: flex;
  align-items: center;
  font-size: 1rem;
  padding: 4px 12px;
  border-radius: 8px;
  cursor: pointer;
  user-select: none;
  transition: background 0.2s;
  input[type="checkbox"] {
    width: 22px;
    height: 22px;
    margin-right: 14px;
    accent-color: #768f13;
  }
`

const ErrorMsg = styled.div`
  color: red;
  font-size: 0.875rem;
  margin-top: 8px;
`

function formatTime(time: string) {
  if (!time) return "";
  const [hourStr, minStr] = time.split(":");
  let hour = parseInt(hourStr, 10);
  const min = minStr ? parseInt(minStr, 10) : 0;
  const ampm = hour >= 12 ? "pm" : "am";
  if (hour === 0) hour = 12;
  else if (hour > 12) hour -= 12;
  return `${hour}${min !== 0 ? ":" + minStr : ""}${ampm}`;
}

export const SearchResults: React.FC<ResultsProps> = ({ courses, onBack, onCreateAlert, processing, initialAlertOptions, isEditMode }) => {
  const [alertOptions, setAlertOptions] = React.useState({
    newCourses: initialAlertOptions?.newCourses ?? false,
    teeTimeChanges: initialAlertOptions?.teeTimeChanges ?? false,
    costChanges: initialAlertOptions?.costChanges ?? false,
  })
  const [optionsError, setOptionsError] = React.useState<string | null>(null)

  const handleCreateClick = () => {
    if (!alertOptions.newCourses && !alertOptions.teeTimeChanges && !alertOptions.costChanges) {
      setOptionsError("Please select at least one alert option.")
      return
    }
    setOptionsError(null)
    onCreateAlert(alertOptions)
  }

  return (
    <ResultsContainer>
      <h3>Search Results</h3>
      {courses.length === 0 ? (
        <div>No courses found.</div>
      ) : (
        courses.map(course => (
          <CourseCard key={course.id}>
            <CourseTitle>{course.name}</CourseTitle>
            <CourseLocation>{course.location}</CourseLocation>
            <CourseDetails>
              <DetailsRow>
                <Price>${course.priceMin.toFixed(2)}</Price>
                <Rating><Star>★</Star>{course.averageRating.toFixed(2)}</Rating>
              </DetailsRow>
              <DetailsRow>
                <span>{course.teeTimes} tee times</span>
                <span>
                  {formatTime(course.startTimeMin)}
                  {course.startTimeMin !== course.startTimeMax ? ` - ${formatTime(course.startTimeMax)}` : ""}
                </span>
              </DetailsRow>
            </CourseDetails>
          </CourseCard>
        ))
      )}
      <AlertOptionsContainer>
        <AlertOptionsLabel>Alert Options</AlertOptionsLabel>
        <AlertOptionsList>
          <AlertCheckboxLabel>
            <input
              type="checkbox"
              checked={alertOptions.newCourses}
              onChange={e => setAlertOptions(opts => ({ ...opts, newCourses: e.target.checked }))}
              title="New Courses Found"
            />
            New Courses
          </AlertCheckboxLabel>
          <AlertCheckboxLabel>
            <input
              type="checkbox"
              checked={alertOptions.teeTimeChanges}
              onChange={e => setAlertOptions(opts => ({ ...opts, teeTimeChanges: e.target.checked }))}
              title="Tee Time Changes"
            />
            Tee Time Changes
          </AlertCheckboxLabel>
          <AlertCheckboxLabel>
            <input
              type="checkbox"
              checked={alertOptions.costChanges}
              onChange={e => setAlertOptions(opts => ({ ...opts, costChanges: e.target.checked }))}
              title="Cost Changes"
            />
            Cost Changes
          </AlertCheckboxLabel>
        </AlertOptionsList>
        {optionsError && <ErrorMsg>{optionsError}</ErrorMsg>}
      </AlertOptionsContainer>
      <Button onClick={onBack} size="large" style={{ marginTop: 16, marginRight: 8 }}>Back to Search</Button>
      <Button type="primary" size="large" onClick={handleCreateClick} style={{ marginTop: 16 }} loading={processing}>{isEditMode ? "Update Alert" : "Create Alert"}</Button>
    </ResultsContainer>
  )
}

import { Button, Switch } from "antd"
import * as React from "react"
import styled from "styled-components"
import Container from "../../components/Container"

interface Course {
  id: number
  name: string
  location: string
  teeTimes: number
  priceMin: number
  startTimeMin: string
  startTimeMax: string
  averageRating: number
  imageURL?: string
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
  border-radius: 10px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.08);
  margin-bottom: 20px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
`

const CourseImage = styled.img`
  width: 100%;
  height: 140px;
  object-fit: cover;
  display: block;
`

const CourseCardBody = styled.div`
  padding: 16px 20px 18px;
  display: flex;
  flex-direction: column;
  gap: 2px;
`

const CourseTitle = styled.div`
  font-size: 1.1rem;
  font-weight: 600;
  line-height: 1.3;
`

const CourseLocation = styled.div`
  color: #888;
  font-size: 0.9rem;
  margin-bottom: 2px;
`

const CourseDetails = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
  font-size: 0.95rem;
  margin-top: 10px;
`

const DetailsRow = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
  justify-content: space-between;
`

const Price = styled.span`
  font-weight: 600;
  color: #4a7c10;
`

const Rating = styled.span`
  display: flex;
  align-items: center;
  font-weight: 500;
  color: #555;
`

const Star = styled.span`
  color: #f7b500;
  font-size: 1em;
  margin-right: 3px;
`

const MetaText = styled.span`
  color: #666;
  font-size: 0.9rem;
`

const AlertOptionsContainer = styled.div`
  margin: 24px 0 8px 0;
  max-width: 256px;
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

const ToggleRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 1rem;
  padding: 4px 0;
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
      <Container>
        <AlertOptionsLabel>Alert Options</AlertOptionsLabel>
        <Container width={200}>
          <AlertOptionsList>
            <ToggleRow>
              <span>New Courses</span>
              <Switch checked={alertOptions.newCourses} onChange={v => setAlertOptions(opts => ({ ...opts, newCourses: v }))} />
            </ToggleRow>
            <ToggleRow>
              <span>Tee Time Changes</span>
              <Switch checked={alertOptions.teeTimeChanges} onChange={v => setAlertOptions(opts => ({ ...opts, teeTimeChanges: v }))} />
            </ToggleRow>
            <ToggleRow>
              <span>Cost Changes</span>
              <Switch checked={alertOptions.costChanges} onChange={v => setAlertOptions(opts => ({ ...opts, costChanges: v }))} />
            </ToggleRow>
          </AlertOptionsList>
        </Container>
        {optionsError && <ErrorMsg>{optionsError}</ErrorMsg>}
      </Container>
      <Button onClick={onBack} size="large" style={{ marginBottom: 16, marginRight: 8 }}>Back to Search</Button>
      <Button type="primary" size="large" onClick={handleCreateClick} style={{ marginBottom: 16 }} loading={processing}>{isEditMode ? "Update Alert" : "Create Alert"}</Button>
      <Container size={20}>
        <h3>Search Results</h3>
        {courses.length === 0 ? (
          <div>No courses found.</div>
        ) : (
          courses.filter((c, i, arr) => arr.findIndex(x => x.id === c.id) === i).map(course => (
            <CourseCard key={course.id}>
              {course.imageURL && <CourseImage src={course.imageURL} alt={course.name} />}
              <CourseCardBody>
                <CourseTitle>{course.name}</CourseTitle>
                <CourseLocation>{course.location}</CourseLocation>
                <CourseDetails>
                  <DetailsRow>
                    <Price>From ${course.priceMin.toFixed(2)}</Price>
                    <Rating><Star>★</Star>{course.averageRating.toFixed(1)}</Rating>
                  </DetailsRow>
                  <DetailsRow>
                    <MetaText>{course.teeTimes} tee times</MetaText>
                    <MetaText>
                      {formatTime(course.startTimeMin)}
                      {course.startTimeMin !== course.startTimeMax ? ` – ${formatTime(course.startTimeMax)}` : ""}
                    </MetaText>
                  </DetailsRow>
                </CourseDetails>
              </CourseCardBody>
            </CourseCard>
          ))
        )}
      </Container>
    </ResultsContainer>
  )
}

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
}

const ResultsContainer = styled.div`
  margin-top: 24px;
`

const CourseCard = styled.div`
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.06);
  padding: 20px 24px;
  margin-bottom: 20px;
  display: flex;
  flex-direction: column;
  gap: 8px;
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
  flex-wrap: wrap;
  gap: 16px;
  font-size: 1rem;
`

const Label = styled.span`
  color: #666;
  font-weight: 500;
`

export const SearchResults: React.FC<ResultsProps> = ({ courses, onBack }) => {
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
              <div><Label>Tee Times:</Label> {course.teeTimes}</div>
              <div><Label>Price:</Label> ${course.priceMin.toFixed(2)}</div>
              <div><Label>Start Time:</Label> {course.startTimeMin}{course.startTimeMin !== course.startTimeMax ? ` - ${course.startTimeMax}` : ''}</div>
              <div><Label>Rating:</Label> {course.averageRating.toFixed(2)}</div>
            </CourseDetails>
          </CourseCard>
        ))
      )}
      <Button onClick={onBack} style={{ marginTop: 16 }}>Back to Search</Button>
    </ResultsContainer>
  )
}

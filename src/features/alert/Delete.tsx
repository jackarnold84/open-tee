import * as React from "react"
import Container from "../../components/Container"

interface DeleteProps {
  alertId: string
}

const Delete: React.FC<DeleteProps> = ({ alertId }) => {
  return (
    <>
      <Container size={16} centered>
        Delete Alert: {alertId}
      </Container>
    </>
  )
}

export default Delete

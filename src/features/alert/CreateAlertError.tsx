import { Button, Result } from "antd"
import { Link } from "gatsby"
import * as React from "react"

interface Props {
  errorMessage?: string
}

const CreateAlertError: React.FC<Props> = ({ errorMessage }) => (
  <Result
    status="error"
    title="Something went wrong"
    subTitle={errorMessage || "An unexpected error occurred while creating your alert. Please try again later."}
    extra={[
      <Link to="/" key="home">
        <Button type="primary">Back to Home</Button>
      </Link>
    ]}
  />
)

export default CreateAlertError

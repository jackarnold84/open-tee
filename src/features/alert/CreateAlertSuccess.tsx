import { CheckCircleFilled } from "@ant-design/icons"
import { Button, Result, Typography } from "antd"
import { Link } from "gatsby"
import * as React from "react"

interface Props {
  alertId?: string
  isUpdate?: boolean
}

const CreateAlertSuccess: React.FC<Props> = ({ alertId, isUpdate }) => (
  <Result
    status="success"
    title={isUpdate ? "Alert Updated!" : "Alert Created!"}
    icon={<CheckCircleFilled style={{ color: "#768f13" }} />}
    subTitle={
      <>
        Your alert has been successfully {isUpdate ? "updated" : "created"}. You will be notified via email for any changes.<br />
        {alertId && (
          <Typography.Text style={{ display: 'block', marginTop: 12 }}>
            <strong>Alert ID:</strong> {alertId}
          </Typography.Text>
        )}
      </>
    }
    extra={[
      <Link to="/" key="done">
        <Button type="primary">
          Done
        </Button>
      </Link>
    ]}
  />
)

export default CreateAlertSuccess

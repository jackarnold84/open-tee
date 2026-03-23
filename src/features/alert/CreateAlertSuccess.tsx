import { CheckCircleFilled } from "@ant-design/icons"
import { Button, Result, Typography } from "antd"
import { Link } from "gatsby"
import * as React from "react"

interface Props {
  alertId?: string
  isUpdate?: boolean
  onCreateNew?: () => void
}

const CreateAlertSuccess: React.FC<Props> = ({ alertId, isUpdate, onCreateNew }) => (
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
    extra={
      <div style={{ display: "flex", flexDirection: "column", gap: 8, alignItems: "stretch", maxWidth: 280, margin: "0 auto" }}>
        <Link to="/" key="done">
          <Button type="primary" block>Done</Button>
        </Link>
        {!isUpdate && alertId && (
          <>
            <Link to={`/create?clone=${alertId}`} key="clone">
              <Button block>Clone Alert</Button>
            </Link>
            <Button block onClick={onCreateNew}>Create New Alert</Button>
          </>
        )}
      </div>
    }
  />
)

export default CreateAlertSuccess

import { Button, message, Space, Typography } from "antd"
import { Link } from "gatsby"
import * as React from "react"
import { useState } from "react"
import useSWRMutation from "swr/mutation"
import Container from "../../components/Container"

const { Title, Text } = Typography

interface DeleteProps {
  alertId: string
}

async function deleteAlert(url: string) {
  const response = await fetch(url, { method: "DELETE" })
  if (!response.ok) {
    throw new Error("Failed to delete alert.")
  }
  return response.json()
}

const Delete: React.FC<DeleteProps> = ({ alertId }) => {
  const [deleted, setDeleted] = useState(false)
  const {
    trigger,
    isMutating,
  } = useSWRMutation(
    `https://rwz8s6f288.execute-api.us-east-2.amazonaws.com/Prod/opentee/delete-alert/${alertId}`,
    deleteAlert
  )

  const handleDelete = async () => {
    try {
      await trigger()
      setDeleted(true)
      message.success("Alert deleted successfully.")
    } catch (error: any) {
      message.error(error.message || "Failed to delete alert.")
    }
  }

  return (
    <Container size={16} centered>
      <Space direction="vertical" size="large" style={{ width: "100%", textAlign: "center" }}>
        <Title level={3}>Delete Alert</Title>
        {deleted ? (
          <>
            <Text>Alert <b>{alertId}</b> was deleted.</Text>
            <Link to="/create">
              <Button>
                Create New Alert
              </Button>
            </Link>
          </>
        ) : (
          <>
            <Text>Are you sure you want to delete alert <b>{alertId}</b>?</Text>
            <div>
              <Button type="primary" danger loading={isMutating} onClick={handleDelete} style={{ marginRight: 8 }}>
                Delete
              </Button>
              <Link to="/">
                <Button disabled={isMutating}>
                  Cancel
                </Button>
              </Link>
            </div>
          </>
        )}
      </Space>
    </Container>
  )
}

export default Delete

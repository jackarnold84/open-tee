import { Button, Typography } from "antd"
import React from "react"
import Container from "../../components/Container"
import { useAuth } from "../layout/AuthProvider"

const { Title, Text } = Typography

const Account: React.FC = () => {
  const { user, logout } = useAuth()

  return (
    <Container size={16} centered width={400}>
      <Title level={4} style={{ marginBottom: 24, textAlign: "center" }}>
        Account
      </Title>
      <Container>
        <Text strong>Username:</Text> <Text>{user?.username}</Text>
      </Container>
      <Container>
        <Text strong>Email:</Text> <Text>{user?.email}</Text>
      </Container>
      <Container size={32}>
        <Button type="primary" onClick={logout}>
          Sign out
        </Button>
      </Container>
    </Container>
  )
}

export default Account

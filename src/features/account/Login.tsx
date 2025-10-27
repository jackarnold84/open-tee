import { Button, Form, Input, Typography } from "antd"
import React, { useState } from "react"
import styled from "styled-components"
import useSWRMutation from "swr/mutation"
import Container from "../../components/Container"
import { API_BASE } from "../../config/env"
import { useAuth } from "../layout/AuthProvider"

const { Title } = Typography

const ErrorMsg = styled.div`
  color: red;
  margin-bottom: 16px;
`

const SupportMsg = styled.div`
  margin-top: 16px;
  font-size: 14px;
  color: #888;
`

const loginFetcher = async (
  url: string,
  { arg }: { arg: { username: string; password: string } }
) => {
  const { username, password } = arg
  const res = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Basic ${btoa(`${username}:${password}`)}`,
    },
  })
  if (!res.ok) {
    let errorJson = null
    try {
      errorJson = await res.json()
    } catch {
      errorJson = { message: "Unknown error" }
    }
    console.log("Login error response:", errorJson)
    if (res.status === 401) {
      throw new Error("Invalid username or password")
    }
    throw new Error(JSON.stringify(errorJson) || "Login failed")
  }
  return res.json()
}

const Login: React.FC = () => {
  const { login } = useAuth()

  const [form] = Form.useForm()
  const [error, setError] = useState<string | null>(null)
  const { trigger, isMutating } = useSWRMutation(`${API_BASE}/opentee/account`, loginFetcher, {
    onError: (err: Error) => {
      setError(err.message)
      form.setFieldValue("password", "")
    },
    onSuccess: () => setError(null),
  })

  const onFinish = async (values: { username: string; password: string }) => {
    setError(null)
    try {
      const data = await trigger(values)
      const token = btoa(`${values.username}:${values.password}`)
      login({ username: data.username, email: data.email, token })
    } catch (e) {
      // error handled in onError
    }
  }

  return (
    <Container size={16} centered width={400}>
      <Title level={4} style={{ marginBottom: 24, textAlign: "center" }}>
        Sign in to your account
      </Title>
      {error && <ErrorMsg>{error}</ErrorMsg>}
      <Form form={form} layout="vertical" onFinish={onFinish}>
        <Form.Item name="username" label="Username" rules={[{ required: true, message: "Please enter your username" }]}>
          <Input autoComplete="username" />
        </Form.Item>
        <Form.Item name="password" label="Password" rules={[{ required: true, message: "Please enter your password" }]}>
          <Input.Password autoComplete="current-password" />
        </Form.Item>
        <Form.Item>
          <Button type="primary" htmlType="submit" block loading={isMutating}>
            Log in
          </Button>
        </Form.Item>
      </Form>
      <Container>
        <SupportMsg>To request an account, contact jarno.push@yahoo.com</SupportMsg>
      </Container>
    </Container>
  )
}

export default Login

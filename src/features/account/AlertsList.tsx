import { Alert, Button, Spin, Typography } from "antd"
import { navigate } from "gatsby"
import React from "react"
import styled from "styled-components"
import useSWR from "swr"
import { API_BASE } from "../../config/env"
import { useAuth } from "../layout/AuthProvider"

const { Title, Text } = Typography

interface AlertResponse {
  alertId: string
  teeTimeSearch: {
    date: string
    players: number
    nameContains: string[]
  }
}

interface ListAlertsResponse {
  alerts: AlertResponse[]
  count: number
}

const ALERTS_URL = `${API_BASE}/opentee/alerts`

function formatDate(dateStr: string): string {
  const d = new Date(dateStr + "T00:00:00")
  return d
    .toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
    })
    .replace(",", "")
}

function formatNameContains(names: string[]): string | null {
  if (!names || names.length === 0) return null
  const capitalize = (s: string) => s.replace(/\b\w/g, (c) => c.toUpperCase())
  const visible = names.slice(0, 2).map(capitalize).join(", ")
  return names.length > 2 ? visible + "..." : visible
}

function playersLabel(n: number): string {
  return n === 1 ? "1 player" : `${n} players`
}

const Wrapper = styled.div`
  margin-top: 24px;
`

const AlertCard = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 12px 0;
  border-bottom: 1px solid #f0f0f0;

  &:first-child {
    border-top: 1px solid #f0f0f0;
  }
`

const AlertInfo = styled.div`
  flex: 1;
  min-width: 0;
  font-size: 14px;
  line-height: 1.4;
  text-align: left;
`

const Actions = styled.div`
  display: flex;
  gap: 8px;
  flex-shrink: 0;
`

const EmptyText = styled.div`
  padding: 16px 0;
  color: #999;
  font-size: 14px;
`

const AlertsList: React.FC = () => {
  const { user } = useAuth()

  const { data, isLoading, error } = useSWR<ListAlertsResponse>(
    user.token ? ALERTS_URL : null,
    () =>
      fetch(ALERTS_URL, {
        headers: { Authorization: `Basic ${user.token}` },
      }).then((r) => {
        if (!r.ok) throw new Error("Failed to load alerts")
        return r.json()
      }),
    { revalidateOnFocus: false }
  )

  const alerts = data?.alerts || []

  return (
    <Wrapper>
      <Title level={5} style={{ marginBottom: 8 }}>
        Your Alerts
      </Title>
      {isLoading && <Spin style={{ display: "block", marginTop: 16 }} />}
      {error && (
        <Alert
          type="error"
          message={error.message || "Failed to load alerts"}
          style={{ marginTop: 8 }}
        />
      )}
      {!isLoading && !error && alerts.length === 0 && (
        <EmptyText>No active alerts</EmptyText>
      )}
      {!isLoading && !error && alerts.map((alert) => {
        const { alertId, teeTimeSearch } = alert
        const { date, players, nameContains } = teeTimeSearch
        const coursesLabel = formatNameContains(nameContains)
        const rest = [playersLabel(players), coursesLabel].filter(Boolean)

        return (
          <AlertCard key={alertId}>
            <AlertInfo>
              <Text strong>{formatDate(date)}</Text>
              {rest.length > 0 && <Text> · {rest.join(" · ")}</Text>}
            </AlertInfo>
            <Actions>
              <Button onClick={() => navigate(`/create?edit=${alertId}`)}>
                Edit
              </Button>
              <Button danger onClick={() => navigate(`/delete?alertId=${alertId}`)}>
                Delete
              </Button>
            </Actions>
          </AlertCard>
        )
      })}
    </Wrapper>
  )
}

export default AlertsList

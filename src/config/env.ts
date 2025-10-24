const host = {
  local: 'http://localhost:3000',
  prod: 'https://rwz8s6f288.execute-api.us-east-2.amazonaws.com/Prod',
}

const isDev = process.env.NODE_ENV === "development"
const prodOverride = false

export const API_BASE = isDev && !prodOverride ? host.local : host.prod

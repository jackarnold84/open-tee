# Open Tee Service API Documentation

Backend service for searching golf tee times and managing alerts.

## Base URL
All endpoints are prefixed with `/opentee`

## Authentication
Protected endpoints require HTTP Basic Authentication with username and password in the Authorization header.

---

## Endpoints

### Health Check
**GET** `/opentee/health`

Check service health status.

**Response**
```json
{
  "status": "healthy"
}
```

---

### Tee Time Search
**POST** `/opentee/tee-time-search`

Search for available golf tee times based on location, date, and preferences.

**Request Body**
```json
{
  "date": "2026-01-20",
  "zipCode": "94105",
  "radius": 25,
  "holes": 18,
  "players": 2,
  "dealsOnly": false,
  "priceMin": 0,
  "priceMax": 150,
  "startHourMin": 8,
  "startHourMax": 16,
  "ratingMin": 3.5,
  "nameContains": ["pebble", "cypress"]
}
```

**Request Parameters**
- `date` (string, required): Date in YYYY-MM-DD format
- `zipCode` (string, required): 5-digit ZIP code
- `radius` (integer, required): Search radius in miles (1-50)
- `holes` (integer): Number of holes (0=any, 9, or 18)
- `players` (integer): Number of players (0-4)
- `dealsOnly` (boolean): Filter for deals only
- `priceMin` (integer): Minimum price (≥0)
- `priceMax` (integer): Maximum price (≥priceMin)
- `startHourMin` (integer): Earliest start hour (0-23)
- `startHourMax` (integer): Latest start hour (0-23, ≥startHourMin)
- `ratingMin` (float): Minimum course rating (0-5)
- `nameContains` (array): Course name filter terms (max 100)

**Response**
```json
{
  "courses": [
    {
      "id": 12345,
      "name": "Pebble Beach Golf Links",
      "location": "Pebble Beach, CA",
      "teeTimes": 8,
      "priceMin": 75.00,
      "startTimeMin": "08:30",
      "startTimeMax": "15:45",
      "averageRating": 4.8
    }
  ],
  "totalTeeTimes": 24
}
```

---

### Create Alert
**POST** `/opentee/create-alert`

🔒 **Requires Authentication**

Create a new tee time alert with search criteria and notification preferences.

**Request Body**
```json
{
  "teeTimeSearch": {
    "date": "2026-01-20",
    "zipCode": "94105",
    "radius": 25,
    "holes": 18,
    "players": 2,
    "dealsOnly": false,
    "priceMin": 0,
    "priceMax": 150,
    "startHourMin": 8,
    "startHourMax": 16,
    "ratingMin": 3.5,
    "nameContains": []
  },
  "alertOptions": {
    "newCourses": true,
    "teeTimeChanges": true,
    "costChanges": false
  },
  "alertUser": "jsmith",
  "alertEmail": "jsmith@example.com"
}
```

**Request Parameters**
- `teeTimeSearch` (object, required): Tee time search criteria (see Tee Time Search endpoint)
- `alertOptions` (object, required): Notification preferences
  - `newCourses` (boolean): Alert on new courses matching criteria
  - `teeTimeChanges` (boolean): Alert on changes to available tee times
  - `costChanges` (boolean): Alert on price changes
- `alertUser` (string, required): Username (must match authenticated user)
- `alertEmail` (string, required): Valid email address for notifications

**Response**
```json
{
  "alertId": "1234567890"
}
```

---

### Delete Alert
**DELETE** `/opentee/delete-alert/{alertId}`

Delete an existing tee time alert.

**Path Parameters**
- `alertId` (string, required): The alert ID to delete

**Response**
```json
{
  "message": "Alert 1234567890 deleted"
}
```

---

### Get Alert
**GET** `/opentee/alert/{alertId}`

🔒 **Requires Authentication**

Retrieve a single alert by ID. Returns 403 if the alert belongs to another user.

**Path Parameters**
- `alertId` (string, required): The alert ID to retrieve

**Response**
```json
{
  "alertId": "1234567890",
  "alertUser": "jsmith",
  "alertEmail": "jsmith@example.com",
  "alertOptions": {
    "newCourses": true,
    "teeTimeChanges": true,
    "costChanges": false
  },
  "teeTimeSearch": {
    "date": "2026-01-20",
    "zipCode": "94105",
    "radius": 25,
    "holes": 18,
    "players": 2,
    "dealsOnly": false,
    "priceMin": 0,
    "priceMax": 150,
    "startHourMin": 8,
    "startHourMax": 16,
    "ratingMin": 3.5,
    "nameContains": []
  }
}
```

---

### List Alerts
**GET** `/opentee/alerts`

🔒 **Requires Authentication**

Retrieve all alerts for the authenticated user.

**Response**
```json
{
  "alerts": [
    {
      "alertId": "1234567890",
      "alertUser": "jsmith",
      "alertEmail": "jsmith@example.com",
      "alertOptions": {
        "newCourses": true,
        "teeTimeChanges": true,
        "costChanges": false
      },
      "teeTimeSearch": {
        "date": "2026-01-20",
        "zipCode": "94105",
        "radius": 25,
        "holes": 18,
        "players": 2,
        "dealsOnly": false,
        "priceMin": 0,
        "priceMax": 150,
        "startHourMin": 8,
        "startHourMax": 16,
        "ratingMin": 3.5,
        "nameContains": []
      }
    }
  ],
  "count": 1
}
```

---

### Get Account Info
**POST** `/opentee/account`

🔒 **Requires Authentication**

Retrieve account information for the authenticated user.

**Response**
```json
{
  "username": "jsmith",
  "name": "John Smith",
  "email": "jsmith@example.com"
}
```

---

## Error Responses

All endpoints may return the following error responses:

**400 Bad Request**
```json
{
  "error": "validation error message"
}
```

**401 Unauthorized**
```json
{
  "error": "authentication error message"
}
```

**403 Forbidden**
```json
{
  "error": "alert belongs to another user"
}
```

**404 Not Found**
```json
{
  "error": "alert not found"
}
```

**500 Internal Server Error**
```json
{
  "error": "internal error message"
}
```

---

## CORS Headers
All endpoints include CORS headers:
- `Access-Control-Allow-Origin: *`
- `Access-Control-Allow-Methods: GET, POST, DELETE, OPTIONS`
- `Access-Control-Allow-Headers: *`

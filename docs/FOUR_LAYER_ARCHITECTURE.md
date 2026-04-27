# 4-Layer API Architecture

## The Complete Flow

```
Frontend (Component)
    ↓ imports & calls
src/api/ (Service Layer)
    ↓ HTTP request via axiosClient
src/app/api/ (Next.js Route Handler)
    ↓ Proxies request with token
Backend API (External)
```

---

## 📍 Layer 1: FRONTEND (Components)

**Location:** `src/app/doctor/page.js`, `src/app/patient/page.js`, etc.

```javascript
// Component imports from /api services
import { getAllDoctors } from "@/api/doctor";

export default function DoctorPage() {
  const handleSearch = async (query) => {
    // Just call the service function
    const doctors = await getAllDoctors({ name: query });
    console.log(doctors);
  };

  return <button onClick={() => handleSearch("john")}>Search</button>;
}
```

**What the component does:**
- Imports service functions from `src/api/`
- Calls them like regular functions
- Doesn't care about HTTP details

---

## 📍 Layer 2: /api (Client Service Layer)

**Location:** `src/api/doctor.js`, `src/api/patient.js`, `src/api/leads.js`, etc.

**Purpose:** Reusable API service functions for the frontend

```javascript
// src/api/doctor.js
import axiosClient from "./client";

export const getAllDoctors = async (params = {}) => {
  try {
    // Make HTTP request to YOUR OWN Next.js route (Layer 3)
    const response = await axiosClient.get(
      "/api/Doctor/search",  // ← This is Layer 3!
      { params, baseURL: "" }
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching doctors:", error);
    throw error;
  }
};

export const addDoctor = async (doctorData) => {
  const response = await axiosClient.post(
    "/api/Doctor/AddDoctor",  // ← This is Layer 3!
    doctorData,
    { baseURL: "" }
  );
  return response.data;
};
```

**What Layer 2 does:**
- Wraps HTTP calls in reusable functions
- Calls Layer 3 (/app/api routes)
- Handles client-side error handling
- Provides clean API to components

---

## 📍 Layer 3: /app/api (Next.js Route Handler)

**Location:** `src/app/api/Doctor/search/route.js`, `src/app/api/Patient/GetAll/route.js`, etc.

**Purpose:** Server-side middleware between frontend and backend

```javascript
// src/app/api/Doctor/search/route.js
import { NextResponse } from "next/server";
import { API_CONFIG } from "@/api/config";
import { authService } from "@/api/auth";

export async function GET(request) {
  try {
    // ✅ Server-side: Get token securely
    const token = await authService.getToken();

    // ✅ Server-side: Extract and forward query params
    const { searchParams } = new URL(request.url);
    const backendParams = new URLSearchParams();
    searchParams.forEach((value, key) => {
      if (value) backendParams.append(key, value);
    });

    // ✅ Build full URL to Layer 4 (Backend)
    const apiUrl = `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.DOCTOR.GET_ALL}${
      backendParams.toString() ? `?${backendParams.toString()}` : ""
    }`;
    // Becomes: https://bmetrics.in/APIDemo/api/Doctor/search?name=john

    // ✅ Make request to Layer 4 (Backend)
    const response = await fetch(apiUrl, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,  // ← Token added here
        accept: "*/*",
      },
      cache: "no-store",
    });

    const data = await response.json();

    // ✅ Server-side error handling
    if (!response.ok) {
      console.error("[Doctor API] Backend error:", response.status);
      return NextResponse.json([], { status: 200 });
    }

    // ✅ Return to Layer 2
    return NextResponse.json(Array.isArray(data) ? data : []);

  } catch (error) {
    console.error("[Doctor API] Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch doctors" },
      { status: 500 }
    );
  }
}
```

**What Layer 3 does:**
- Receives request from Layer 2
- Handles authentication (gets token securely server-side)
- Forwards request to Layer 4 (Backend)
- Handles errors on server-side
- Returns response back to Layer 2

---

## 📍 Layer 4: Backend (External API)

**Location:** `https://bmetrics.in/APIDemo/api`

**Endpoints:**
```
GET  /Doctor/search
GET  /Patient/GetAllPatients
POST /Patient/UpsertPatient
GET  /Leads/GetLeads
etc.
```

**What Layer 4 does:**
- Processes business logic
- Returns data
- Manages database

---

## 🔄 Complete Request Flow Example

### User Action: Search for doctors named "john"

```
┌─ Layer 1: FRONTEND ─────────────────────────────┐
│                                                  │
│  User clicks "Search" button                    │
│  Component calls: getAllDoctors({ name: "john" })│
│                                                  │
└──────────────────────┬──────────────────────────┘
                       │
┌──────────────────────▼──────────────────────────┐
│ Layer 2: src/api/doctor.js                      │
│                                                  │
│ export const getAllDoctors = (params) => {      │
│   return axiosClient.get(                       │
│     "/api/Doctor/search",    ← Makes request    │
│     { params, baseURL: "" }                     │
│   );                                             │
│ }                                               │
└──────────────────────┬──────────────────────────┘
                       │
                       │ HTTP GET /api/Doctor/search?name=john
                       │
┌──────────────────────▼──────────────────────────┐
│ Layer 3: src/app/api/Doctor/search/route.js     │
│                                                  │
│ export async function GET(request) {            │
│   const token = await authService.getToken();   │ ← Get token
│   const apiUrl = "https://bmetrics.in/APIDemo/api/Doctor/search?name=john"
│   const response = await fetch(apiUrl, {        │
│     headers: { Authorization: `Bearer ${token}`}│
│   });                                           │
│   return NextResponse.json(await response.json());
│ }                                               │
└──────────────────────┬──────────────────────────┘
                       │
                       │ HTTP GET /Doctor/search?name=john
                       │ Header: Authorization: Bearer xxxxx
                       │
┌──────────────────────▼──────────────────────────┐
│ Layer 4: https://bmetrics.in/APIDemo/api        │
│                                                  │
│ Receives: GET /Doctor/search?name=john          │
│ Validates token                                 │
│ Queries database for doctors named "john"       │
│ Returns: [ { id: 1, name: "John Doe", ... } ]  │
│                                                  │
└──────────────────────┬──────────────────────────┘
                       │
                       │ JSON response
                       │
┌──────────────────────▼──────────────────────────┐
│ Layer 3: Route Handler                          │
│                                                  │
│ Receives response from Layer 4                  │
│ Returns to Layer 2: [ { id: 1, name: "..." } ] │
│                                                  │
└──────────────────────┬──────────────────────────┘
                       │
                       │ JSON response
                       │
┌──────────────────────▼──────────────────────────┐
│ Layer 2: Service Function                       │
│                                                  │
│ Receives data from Layer 3                      │
│ Returns to Layer 1: response.data               │
│                                                  │
└──────────────────────┬──────────────────────────┘
                       │
                       │ Data array
                       │
┌──────────────────────▼──────────────────────────┐
│ Layer 1: Component                              │
│                                                  │
│ Receives: [ { id: 1, name: "John Doe" } ]      │
│ Updates state: setDoctors(doctors)              │
│ UI re-renders showing search results            │
│                                                  │
└──────────────────────────────────────────────────┘
```

---

## 📊 Data Transformation Flow

```
Component Data
  ↓
  └─→ Service (Layer 2)
       └─→ Format & validate
           ↓
           └─→ axiosClient.get("/api/Doctor/search")
               └─→ Route Handler (Layer 3)
                   └─→ Server-side logic
                       ├─ Get token
                       ├─ Build URL
                       ├─ Add headers
                       ↓
                       └─→ Backend API (Layer 4)
                           └─→ Returns raw data
                               ↓
                               ← Response (Layer 3)
                               ← Service (Layer 2)
                               ← Component renders (Layer 1)
```

---

## ✅ Why This 4-Layer Architecture?

| Layer | Benefit |
|-------|---------|
| **1. Frontend** | User interface |
| **2. /api Services** | Reusable API functions, clean component code |
| **3. /app/api Routes** | Server-side security (token handling), logging, error handling |
| **4. Backend** | Business logic, database |

---

## 🔐 Security Benefits of 3-Layer Proxy

Without Layer 3 (direct call from Layer 2 to Layer 4):
```javascript
// ❌ INSECURE - Token exposed on client
const token = localStorage.getItem("token");
const response = await fetch(BACKEND_URL, {
  headers: { Authorization: `Bearer ${token}` }
});
```

With Layer 3 (proper architecture):
```javascript
// ✅ SECURE - Token handled server-side
// Component never sees token in HTTP layer
// Token refresh logic on server
// Client always goes through trusted Next.js route
```

---

## 📋 When Adding New Feature: All 4 Layers

### Example: Add new endpoint for "Get Patient by ID"

**Layer 4 (Backend):** Already exists  
URL: `GET https://bmetrics.in/APIDemo/api/Patient/GetPatientById?id=123`

**Layer 3 (Create route):**
```javascript
// src/app/api/Patient/GetPatientById/route.js
export async function GET(request) {
  const token = await authService.getToken();
  const id = new URL(request.url).searchParams.get('id');
  const response = await fetch(
    `${API_CONFIG.BASE_URL}/Patient/GetPatientById?id=${id}`,
    { headers: { Authorization: `Bearer ${token}` } }
  );
  return NextResponse.json(await response.json());
}
```

**Layer 2 (Create service):**
```javascript
// src/api/patient.js
export const getPatientById = async (id) => {
  const response = await axiosClient.get(
    `/api/Patient/GetPatientById?id=${id}`,
    { baseURL: "" }
  );
  return response.data;
};
```

**Layer 1 (Use in component):**
```javascript
// src/app/patient/page.js
const patient = await getPatientById(123);
setPatient(patient);
```

---

## 🎯 Key Points

1. **Component always imports from `/api`** (Layer 2)
2. **Service always calls `/api/*` routes** (Layer 3) with `baseURL: ""`
3. **Route always forwards to Backend** (Layer 4) with token
4. **Never skip layers** - don't call Backend directly from component

---

## ✨ Summary

```
Frontend → /api (services) → /app/api (routes) → Backend

Each layer has a job:
- Component: UI logic
- /api service: Reusable API functions
- /app/api route: Token handling, error handling, proxy logic
- Backend: Business logic
```

**This is the recommended architecture for production Next.js apps!** 🚀

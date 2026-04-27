# 📌 Real Examples: Both Patterns Side-by-Side

## Feature: Get All Doctors

---

## ❌ Pattern 1 (Direct axiosClient)

### Component Usage (Same):
```javascript
// src/app/doctor/page.js
"use client";
import { useEffect, useState } from "react";
import { getAllDoctors } from "@/api/doctor";

export default function DoctorPage() {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const data = await getAllDoctors();
        setDoctors(data);
      } catch (error) {
        console.error("Failed to fetch:", error);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  return (
    <div>
      {loading && <p>Loading...</p>}
      <ul>
        {doctors.map(doc => <li key={doc.id}>{doc.name}</li>)}
      </ul>
    </div>
  );
}
```

### Service Layer (Direct - No Route):
```javascript
// src/api/doctor.js - PATTERN 1
import axiosClient from "./client";
import { API_CONFIG } from "./config";

export const getAllDoctors = async (params = {}) => {
  try {
    // ⚠️ DIRECT to external API
    const response = await axiosClient.get(
      API_CONFIG.ENDPOINTS.DOCTOR.GET_ALL,  // "/Doctor/search"
      { params }
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching doctors:", error);
    throw error;  // ← Error handling at component level
  }
};
```

### Issues with Pattern 1:
- ❌ No server-side logging
- ❌ Token refresh logic in client
- ❌ Can't add mock data easily
- ❌ Error handling scattered across components
- ❌ No centralized request/response handling

---

## ✅ Pattern 2 (Recommended - Through Next.js API)

### Component Usage (Identical):
```javascript
// src/app/doctor/page.js
"use client";
import { useEffect, useState } from "react";
import { getAllDoctors } from "@/api/doctor";

export default function DoctorPage() {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const data = await getAllDoctors();
        setDoctors(data);
      } catch (error) {
        console.error("Failed to fetch:", error);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  return (
    <div>
      {loading && <p>Loading...</p>}
      <ul>
        {doctors.map(doc => <li key={doc.id}>{doc.name}</li>)}
      </ul>
    </div>
  );
}
```

### Backend Route Handler:
```javascript
// src/app/api/Doctor/search/route.js - PATTERN 2
import { NextResponse } from "next/server";
import { API_CONFIG } from "@/api/config";
import { authService } from "@/api/auth";

export async function GET(request) {
  try {
    // Server-side: Handle token securely
    const token = await authService.getToken();

    // Server-side: Build full API URL
    const { searchParams } = new URL(request.url);
    const backendParams = new URLSearchParams();
    searchParams.forEach((value, key) => {
      if (value) backendParams.append(key, value);
    });

    const apiUrl = `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.DOCTOR.GET_ALL}${
      backendParams.toString() ? `?${backendParams.toString()}` : ""
    }`;

    // Server-side: Make request with token
    const response = await fetch(apiUrl, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        accept: "*/*",
      },
      cache: "no-store",
    });

    // Server-side: Handle response
    const text = await response.text();
    let data;
    try {
      data = text ? JSON.parse(text) : [];
    } catch {
      data = [];
    }

    // Server-side: Handle errors with mock fallback
    if (!response.ok) {
      console.error("[Doctor API] Backend error:", response.status, data);
      // Could add mock fallback here
      return NextResponse.json([], { status: 200 }); // Fallback to empty
    }

    console.log("[Doctor API] Success:", data.length, "doctors");
    return NextResponse.json(Array.isArray(data) ? data : []);

  } catch (error) {
    console.error("[Doctor API] Error:", error.message);
    // Server-side error handling
    return NextResponse.json(
      { error: "Failed to fetch doctors" },
      { status: 500 }
    );
  }
}
```

### Service Layer (Calls Your Route):
```javascript
// src/api/doctor.js - PATTERN 2
import axiosClient from "./client";

export const getAllDoctors = async (params = {}) => {
  try {
    // ✅ Call YOUR OWN Next.js API route (not external API)
    const response = await axiosClient.get(
      "/api/Doctor/search",  // ← Your route
      { 
        params,
        baseURL: ""  // ← Empty to use relative path
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching doctors:", error);
    throw error;
  }
};
```

### Benefits of Pattern 2:
✅ **Centralized logging** - All requests logged on server  
✅ **Token management** - Handled securely server-side  
✅ **Error handling** - Consistent error responses  
✅ **Mock fallback** - Easy to add test data  
✅ **Security** - Tokens never exposed to client  
✅ **Flexibility** - Add middleware/transformers easily

---

## 📝 Migration Path: Pattern 1 → Pattern 2

### Step 1: Create Next.js Route (Copy handler above)
```bash
Create: src/app/api/Doctor/search/route.js
```

### Step 2: Update Service to Call Route
```javascript
// BEFORE (Pattern 1):
export const getAllDoctors = async (params = {}) => {
  return axiosClient.get(
    API_CONFIG.ENDPOINTS.DOCTOR.GET_ALL,
    { params }
  );
};

// AFTER (Pattern 2):
export const getAllDoctors = async (params = {}) => {
  return axiosClient.get(
    "/api/Doctor/search",  // ← Changed!
    { params, baseURL: "" }  // ← Added!
  );
};
```

### Step 3: Components Work the Same (No Changes!)
```javascript
// No changes needed - same import, same usage
import { getAllDoctors } from "@/api/doctor";
const data = await getAllDoctors();
```

---

## 🎯 Summary

| Aspect | Pattern 1 | Pattern 2 |
|--------|----------|----------|
| **Server Route** | ❌ None | ✅ `src/app/api/` |
| **Service Call** | `axiosClient.get("/Doctor/search")` | `axiosClient.get("/api/Doctor/search")` |
| **Token Handling** | Client-side | ✅ Server-side |
| **Error Logging** | Component-level | ✅ Server-level |
| **Mock Data** | Manual | ✅ Built-in |
| **Component Changes** | ❌ Need updates | ✅ No changes! |

---

## ✅ Recommendation

**For new features, always use Pattern 2:**

1. Create `src/app/api/[resource]/route.js` handler
2. Update `src/api/[resource].js` to call the route
3. Components stay the same (no refactoring needed)

This gives you **maximum control and flexibility** with **minimal code changes**.

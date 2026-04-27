# 🎯 WHEN TO USE WHICH API PATTERN

Your codebase uses **TWO patterns** - understand which to use when:

---

## 📊 Quick Comparison

| Aspect | Direct axiosClient | Through Next.js API |
|--------|-------------------|-------------------|
| **Location** | `src/api/*.js` | `src/app/api/*/route.js` |
| **Use Case** | Simple direct API calls | Need middleware logic |
| **Authentication** | Auto-handled by axiosClient | Explicit token handling |
| **Mock Fallback** | Manual/conditional | Built-in via route |
| **Request Logging** | Component-level | Server-level |
| **Error Handling** | Component handles | Route handler handles |

---

## 🔴 PATTERN 1: Direct axiosClient (Simpler)

### When to Use:
✅ Simple GET requests (fetch list, search)  
✅ Small POST requests (add/update)  
✅ No special middleware needed  
✅ Fast development

### How It Works:
```
Component → axiosClient → External API
```

### Example Code:
```javascript
// src/api/doctor.js
import axiosClient from "./client";

export const searchDoctors = async (params = {}) => {
  const response = await axiosClient.get(
    "/Doctor/search",  // ← Direct to external API
    { params }
  );
  return response.data;
};
```

### Component Usage:
```javascript
// src/app/doctor/page.js
"use client";
import { searchDoctors } from "@/api/doctor";

export default function DoctorPage() {
  const [doctors, setDoctors] = useState([]);

  const handleSearch = async (query) => {
    const results = await searchDoctors({ name: query });
    setDoctors(results);
  };

  return (
    <button onClick={() => handleSearch("john")}>Search</button>
  );
}
```

---

## 🟢 PATTERN 2: Through Next.js API Routes (Better for Production)

### When to Use:
✅ Need to control/log server-side requests  
✅ Want centralized error handling  
✅ Need mock data fallback  
✅ Require special request transformation  
✅ Production app (recommended)

### How It Works:
```
Component → axiosClient → Next.js API Route → External API
```

### Step 1: Create Backend Route
```javascript
// src/app/api/Doctor/search/route.js
import { NextResponse } from "next/server";
import { API_CONFIG } from "@/api/config";
import { authService } from "@/api/auth";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Get auth token (handled server-side)
    const token = await authService.getToken();
    
    // Build URL to external API
    const apiUrl = `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.DOCTOR.GET_ALL}`;
    
    // Forward request to external API
    const response = await fetch(apiUrl, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        accept: "*/*",
      },
    });
    
    const data = await response.json();
    return NextResponse.json(data);
    
  } catch (error) {
    console.error("[Doctor Search] Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch doctors" },
      { status: 500 }
    );
  }
}
```

### Step 2: Create Client Service
```javascript
// src/api/doctor.js (when using through API route)
import axiosClient from "./client";

export const searchDoctors = async (params = {}) => {
  // Call NEXT.JS route instead of external API directly
  const response = await axiosClient.get(
    "/api/Doctor/search",  // ← Your own Next.js route
    { params, baseURL: "" }  // Empty baseURL to use relative path
  );
  return response.data;
};
```

### Step 3: Use in Component (Same as Pattern 1)
```javascript
// src/app/doctor/page.js
"use client";
import { searchDoctors } from "@/api/doctor";

export default function DoctorPage() {
  const [doctors, setDoctors] = useState([]);

  const handleSearch = async (query) => {
    const results = await searchDoctors({ name: query });
    setDoctors(results);
  };

  return (
    <button onClick={() => handleSearch("john")}>Search</button>
  );
}
```

---

## 📋 Decision Tree: Which Pattern Should I Use?

```
START
  │
  ├─→ Is this a simple, small request?
  │   ├─ YES → Can use Pattern 1 ✅ (Direct axiosClient)
  │   └─ NO → Continue...
  │
  ├─→ Do you need error tracking/logging?
  │   ├─ YES → Use Pattern 2 ✅ (Next.js API)
  │   └─ NO → Continue...
  │
  ├─→ Do you need mock data fallback?
  │   ├─ YES → Use Pattern 2 ✅ (Next.js API)
  │   └─ NO → Continue...
  │
  ├─→ Is this production code?
  │   ├─ YES → Use Pattern 2 ✅ (Next.js API)
  │   └─ NO (Dev/Testing) → Can use Pattern 1 ✅ (Direct axiosClient)
  │
END
```

---

## 🏗️ Recommendation: Use Pattern 2 (Next.js API Routes)

### Why Pattern 2 is Better:

✅ **Control**: Centralized request handling  
✅ **Logging**: Server-side audit trail  
✅ **Mock Fallback**: Easy to add test data  
✅ **Error Handling**: Consistent error responses  
✅ **Security**: Token refresh on server, not client  
✅ **Flexibility**: Add middleware/transformers easily  

### Example: Adding Mock Fallback

```javascript
// src/app/api/Doctor/search/route.js
const USE_MOCK_FALLBACK = true;  // ← Toggle this

export async function GET(request) {
  try {
    const token = await authService.getToken();
    const response = await fetch(API_URL, {
      headers: { Authorization: `Bearer ${token}` },
    });
    
    if (!response.ok && USE_MOCK_FALLBACK) {
      // If real API fails, return mock data
      return NextResponse.json(MOCK_DOCTORS);
    }
    
    return NextResponse.json(await response.json());
  } catch (error) {
    if (USE_MOCK_FALLBACK) {
      return NextResponse.json(MOCK_DOCTORS);
    }
    throw error;
  }
}
```

---

## ✅ Best Practice for Your Project

### For NEW features, follow this structure:

1. **Create API config** (if not exists)
   ```javascript
   // src/api/config.js
   ENDPOINTS: {
     DOCTOR: { GET_ALL: "/Doctor/search" }
   }
   ```

2. **Create Next.js API route** (server-side middleware)
   ```javascript
   // src/app/api/Doctor/search/route.js
   export async function GET(request) { /* ... */ }
   ```

3. **Create client service** (calls your route)
   ```javascript
   // src/api/doctor.js
   export const searchDoctors = async (params) => {
     return axiosClient.get("/api/Doctor/search", { params })
   }
   ```

4. **Use in components** (same pattern always)
   ```javascript
   import { searchDoctors } from "@/api/doctor";
   // Use it...
   ```

---

## 🔍 Examples in Your Codebase

### Pattern 1 (Direct) - Leads API:
```javascript
// src/api/leads.js
export const getLeads = async (params = {}) => {
  const response = await fetch(`/api/Leads/getLeads?...`);
  return response.json();
};
```

### Pattern 2 (Through Route) - Doctor Search:
```javascript
// src/app/api/Doctor/search/route.js
export async function GET(request) {
  const token = await authService.getToken();
  const response = await fetch(API_URL, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return NextResponse.json(await response.json());
}

// src/api/doctor.js
export const searchDoctors = async (params = {}) => {
  return axiosClient.get("/api/Doctor/search", { params });
};
```

---

## 💡 Key Takeaway

| Question | Answer |
|----------|--------|
| **When should I use Direct axiosClient?** | For small, simple requests or quick testing |
| **When should I use Next.js API Routes?** | For production, logging, error handling, mock data |
| **What's the best practice?** | Use Next.js API routes for consistency & control |
| **Can I mix both patterns?** | Yes, but not recommended - choose one per feature |
| **Which is used in your codebase?** | Both are used - gradually migrate to Pattern 2 |

---

**Bottom Line:** For new code, always use **Pattern 2 (Next.js API Routes)** for better maintainability and control.

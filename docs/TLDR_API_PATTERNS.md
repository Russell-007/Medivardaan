# 🔥 TL;DR - Quick Reference

## The 2-Second Answer

**Q:** "Should I use direct axiosClient or go through Next.js API routes?"  
**A:** **ALWAYS use Next.js API routes for new code**

---

## The Pattern

```javascript
// ❌ DON'T DO THIS (Pattern 1 - Old way):
import { getAllDoctors } from "@/api/doctor";  // Calls external API directly

// ✅ DO THIS (Pattern 2 - Recommended way):
// 1. Create route: src/app/api/Doctor/GetAll/route.js
// 2. Service calls route: axiosClient.get("/api/Doctor/GetAll", { baseURL: "" })
// 3. Component uses service: getAllDoctors()
```

---

## When Adding New Features

**3-Step Checklist:**

1. **Create Route** → `src/app/api/[Resource]/[Action]/route.js`
   ```javascript
   export async function GET(request) {
     const token = await authService.getToken();
     // ... proxy request to external API
   }
   ```

2. **Update Service** → `src/api/[resource].js`
   ```javascript
   export const getAll = async (params) => {
     return axiosClient.get("/api/[Resource]/[Action]", { 
       params, 
       baseURL: ""  // ← KEY: Empty baseURL!
     });
   };
   ```

3. **Use in Component** → Component stays the same!
   ```javascript
   const data = await getAll();
   ```

---

## Key Differences

| Aspect | Direct | Via Route |
|--------|--------|-----------|
| Service code | `"/Doctor/search"` | `"/api/Doctor/search"` + `baseURL: ""` |
| Where token managed | Component | ✅ Server-side |
| Where errors logged | Component | ✅ Server-side |
| Can add mock data | Manual | ✅ Easy toggle |
| Production ready | ⚠️ Not recommended | ✅ Yes |

---

## Copy-Paste Template

### Route Handler
```javascript
// src/app/api/[Resource]/[Action]/route.js
import { NextResponse } from 'next/server';
import { API_CONFIG } from '@/api/config';
import { authService } from '@/api/auth';

export async function GET(request) {
  try {
    const token = await authService.getToken();
    const { searchParams } = new URL(request.url);
    const backendParams = new URLSearchParams();
    searchParams.forEach((value, key) => {
      if (value) backendParams.append(key, value);
    });

    const apiUrl = `${API_CONFIG.BASE_URL}[ENDPOINT]${
      backendParams.toString() ? `?${backendParams.toString()}` : ""
    }`;

    const response = await fetch(apiUrl, {
      method: "GET",
      headers: { Authorization: `Bearer ${token}`, accept: "*/*" },
      cache: "no-store",
    });

    const data = await response.json();
    return NextResponse.json(Array.isArray(data) ? data : []);
  } catch (error) {
    console.error("[API] Error:", error);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
```

### Service Function
```javascript
// src/api/[resource].js
import axiosClient from "./client";

export const getAll = async (params = {}) => {
  const response = await axiosClient.get(
    "/api/[RESOURCE]/[ACTION]",
    { params, baseURL: "" }  // ← Important!
  );
  return response.data;
};
```

---

## Most Common Mistake

```javascript
// ❌ WRONG - baseURL is still set, so it doubles the path!
axiosClient.get("/api/Doctor/GetAll")
// Actually hits: https://bmetrics.in/APIDemo/api/api/Doctor/GetAll ← WRONG!

// ✅ CORRECT - Clear baseURL for relative path
axiosClient.get("/api/Doctor/GetAll", { baseURL: "" })
// Actually hits: http://localhost:3000/api/Doctor/GetAll ← RIGHT!
```

---

## Existing Good Examples to Copy From

- Route: `src/app/api/Doctor/search/route.js` ✅
- Service: `src/api/doctor.js` (partially) ✅
- Route: `src/app/api/Leads/getLeads/route.js` ✅
- Service: `src/api/leads.js` (partially) ✅

---

## Full Guides

- **Full Decision Tree:** `docs/WHEN_TO_USE_WHICH_API.md`
- **Side-by-Side Examples:** `docs/PATTERN_EXAMPLES.md`
- **Step-by-Step Guide:** `docs/IMPLEMENTATION_CHECKLIST.md`

---

**One rule: Use Next.js API routes for everything new.** 🚀

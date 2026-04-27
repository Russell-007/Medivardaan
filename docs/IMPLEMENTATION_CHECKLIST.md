# ✅ Quick Implementation Checklist

Use this checklist when adding **new API features** to your project.

---

## 📋 Implementing a New Feature (e.g., Get Patients)

### ✅ Step 1: Add to API Config
**File:** `src/api/config.js`

```javascript
ENDPOINTS: {
  DOCTOR: { /* ... */ },
  
  // ADD THIS:
  PATIENT: {
    GET_ALL: "/Patient/GetAllPatients",
    GET_BY_ID: "/Patient/GetPatientById",
    UPSERT: "/Patient/UpsertPatient",
  },
}
```

- [ ] Added endpoint to config
- [ ] Used correct endpoint path from backend

---

### ✅ Step 2: Create Backend Route Handler
**File:** `src/app/api/Patient/GetAllPatients/route.js`

```javascript
import { NextResponse } from 'next/server';
import { API_CONFIG } from '@/api/config';
import { authService } from '@/api/auth';

export async function GET(request) {
  try {
    // Get token
    const token = await authService.getToken();
    
    // Forward query params
    const { searchParams } = new URL(request.url);
    const backendParams = new URLSearchParams();
    searchParams.forEach((value, key) => {
      if (value) backendParams.append(key, value);
    });

    // Build URL
    const apiUrl = `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.PATIENT.GET_ALL}${
      backendParams.toString() ? `?${backendParams.toString()}` : ""
    }`;

    // Make request
    const response = await fetch(apiUrl, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        accept: "application/json",
      },
      cache: "no-store",
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("[Patient API] Error:", response.status);
      return NextResponse.json([], { status: 200 });
    }

    return NextResponse.json(Array.isArray(data) ? data : []);

  } catch (error) {
    console.error("[Patient API] Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch patients" },
      { status: 500 }
    );
  }
}
```

- [ ] Route file created in correct location: `src/app/api/Patient/GetAllPatients/route.js`
- [ ] GET/POST method defined
- [ ] Token handling implemented
- [ ] Error handling added
- [ ] Correct endpoint from config used

---

### ✅ Step 3: Create Client Service
**File:** `src/api/patient.js`

```javascript
import axiosClient from "./client";

// GET all patients
export const getAllPatients = async (params = {}) => {
  try {
    const response = await axiosClient.get(
      "/api/Patient/GetAllPatients",  // ← Your route
      { params, baseURL: "" }  // ← Empty baseURL
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching patients:", error);
    throw error;
  }
};

// GET patient by ID
export const getPatientById = async (id) => {
  try {
    const response = await axiosClient.get(
      `/api/Patient/GetPatientById?id=${id}`,
      { baseURL: "" }
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching patient:", error);
    throw error;
  }
};

// CREATE/UPDATE patient
export const upsertPatient = async (patientData) => {
  try {
    const response = await axiosClient.post(
      "/api/Patient/Upsert",
      patientData,
      { baseURL: "" }
    );
    return response.data;
  } catch (error) {
    console.error("Error saving patient:", error);
    throw error;
  }
};
```

- [ ] Service functions created
- [ ] Using `/api/` routes (not direct external API)
- [ ] `baseURL: ""` set on all requests
- [ ] Error handling included

---

### ✅ Step 4: Create React Query Hook (Optional but Recommended)
**File:** `src/hooks/usePatients.js`

```javascript
import { useQuery } from "@tanstack/react-query";
import { getAllPatients } from "@/api/patient";

export const usePatients = (params = {}) => {
  return useQuery({
    queryKey: ['patients', params],
    queryFn: () => getAllPatients(params),
    staleTime: 1 * 60 * 1000,  // 1 minute
    retry: 1,
  });
};

export const usePatientById = (id) => {
  return useQuery({
    queryKey: ['patient', id],
    queryFn: () => getPatientById(id),
    enabled: !!id,  // Only fetch if id exists
  });
};
```

- [ ] Hook created for each query
- [ ] staleTime configured
- [ ] enabled condition set for conditional queries

---

### ✅ Step 5: Use in Component
**File:** `src/app/patient/page.js`

```javascript
"use client";
import { usePatients } from "@/hooks/usePatients";
import { useEffect, useState } from "react";

export default function PatientPage() {
  const [searchTerm, setSearchTerm] = useState("");
  
  // Fetch patients - will auto-refetch when params change
  const { data: patients = [], isLoading, error } = usePatients({
    name: searchTerm,
  });

  if (isLoading) return <p>Loading patients...</p>;
  if (error) return <p>Error: {error.message}</p>;

  return (
    <div>
      <input
        type="text"
        placeholder="Search patients..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />
      
      <ul>
        {patients.map(patient => (
          <li key={patient.id}>{patient.name}</li>
        ))}
      </ul>
    </div>
  );
}
```

- [ ] Component imports hook
- [ ] Loading state handled
- [ ] Error state handled
- [ ] Data displayed

---

## 🔍 Verification Checklist

After implementing, verify:

- [ ] **Route works**: `curl http://localhost:3000/api/Patient/GetAllPatients`
- [ ] **Token is sent**: Check network tab headers
- [ ] **Error handling**: Try with invalid token
- [ ] **Mock data works**: Toggle `USE_MOCK_FALLBACK` flag
- [ ] **Component loads**: No console errors
- [ ] **Search/filters work**: Params are forwarded correctly
- [ ] **React Query devtools**: Shows cache state

---

## 🚀 Common Patterns

### Pattern: Search with Filters
```javascript
// Route: src/app/api/Patient/Search/route.js
// Forwards all query params to backend

// Hook: usePatients({ name: "john", clinic: 1 })
// Automatically manages caching

// Component: onChange handler updates state
// React Query automatically refetches with new params
```

### Pattern: GET by ID
```javascript
// Route: src/app/api/Patient/GetById/route.js
// Hook: usePatientById(id)
// Component: Pass ID, hook handles the rest
```

### Pattern: Add/Update
```javascript
// Route: src/app/api/Patient/Upsert/route.js
// Hook: useMutation with upsertPatient
// Component: Form submit → mutation.mutate(data)
```

---

## ⚠️ Common Mistakes to Avoid

❌ **Mistake 1:** Direct external API in service
```javascript
// WRONG:
axiosClient.get("/Patient/GetAllPatients")  // Goes to external API!
```
✅ **Fix:** Use your route
```javascript
// CORRECT:
axiosClient.get("/api/Patient/GetAllPatients", { baseURL: "" })
```

---

❌ **Mistake 2:** Forgetting `baseURL: ""`
```javascript
// WRONG - Will use external API:
axiosClient.get("/api/Patient/GetAllPatients")
// Actually hits: https://bmetrics.in/APIDemo/api/api/Patient/GetAllPatients
```
✅ **Fix:** Empty baseURL
```javascript
// CORRECT:
axiosClient.get("/api/Patient/GetAllPatients", { baseURL: "" })
// Hits: http://localhost:3000/api/Patient/GetAllPatients
```

---

❌ **Mistake 3:** Token management in component
```javascript
// WRONG - Insecure:
const token = localStorage.getItem("token");
const data = await fetch("/api/...", {
  headers: { Authorization: `Bearer ${token}` }
});
```
✅ **Fix:** Let route handle it
```javascript
// CORRECT - Secure:
// In route: const token = await authService.getToken();
// In component: just call the service
```

---

## 📝 File Template Summary

**5 files to create for new feature:**

1. **Config** (`src/api/config.js`) - Add endpoint
2. **Route** (`src/app/api/[Resource]/[Action]/route.js`) - Server handler
3. **Service** (`src/api/[resource].js`) - Client wrapper
4. **Hook** (`src/hooks/use[Resource].js`) - React Query wrapper
5. **Component** (`src/app/[resource]/page.js`) - UI

---

## ✨ Pro Tips

💡 **Tip 1:** Copy existing route as template
```bash
Copy: src/app/api/Doctor/search/route.js
Paste as: src/app/api/Patient/GetAllPatients/route.js
Modify endpoint URL
```

💡 **Tip 2:** Use React Query Devtools to debug
```javascript
// In src/app/providers.js, import and add:
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

<QueryClientProvider client={queryClient}>
  {children}
  <ReactQueryDevtools />
</QueryClientProvider>
```

💡 **Tip 3:** Test route directly
```bash
# In browser or curl:
curl "http://localhost:3000/api/Patient/GetAllPatients"

# Should return patient data or error
```

---

**Ready to implement? Follow the 5 steps above!** 🚀

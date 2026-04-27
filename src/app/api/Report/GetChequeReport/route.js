import { NextResponse } from "next/server";
import { API_CONFIG } from "@/api/config";
import { authService } from "@/api/auth";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const backendParams = new URLSearchParams();
    searchParams.forEach((value, key) => {
      if (value) backendParams.append(key, value);
    });
    console.log(backendParams);

    
    const token = await authService.getToken();
    const apiUrl = `${API_CONFIG.BASE_URL}/Report/GetChequeReport${
      backendParams.toString() ? `?${backendParams.toString()}` : ""
    }`;

    const response = await fetch(apiUrl, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        accept: "application/json",
      },
      cache: "no-store",
    });

    const text = await response.text();
    let data;
    try {
      data = text ? JSON.parse(text) : [];
    } catch {
      data = [];
    }

    if (!response.ok) {
      return NextResponse.json(data || { error: "Failed to fetch" }, { status: response.status });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("[GetContactDetails] Proxy Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

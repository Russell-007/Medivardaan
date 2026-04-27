import { NextResponse } from 'next/server';
import { API_CONFIG } from '@/api/config';
import { authService } from '@/api/auth';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Pass all query parameters to the backend
    const backendParams = new URLSearchParams();
    searchParams.forEach((value, key) => {
        // Skip null or 'all' values for doctor/clinic if needed
        if ((key.toLowerCase() === 'doctorid' || key.toLowerCase() === 'clinic') && (value === 'all' || value === '0' || value === '')) return;
        if (value) backendParams.append(key, value);
    });

    // Get Auth Token
    let token;
    try {
        token = await authService.getToken();
    } catch (authError) {
        console.error('Failed to get auth token:', authError);
        return NextResponse.json(
            { error: 'Authentication failed', details: authError.message },
            { status: 401 }
        );
    }

    const { BASE_URL } = API_CONFIG;
    // Assuming the endpoint for getting invoices is /Appointment/Getinvoices based on previous code
    // Ideally this should be in API_CONFIG.ENDPOINTS
    const endpoint = BASE_URL.ENDPOINT.INVOICES; 
    const apiUrl = `${BASE_URL}${endpoint}?${backendParams.toString()}`;
    
    console.log('[DEBUG] Fetching invoices from:', apiUrl);
    console.log('[DEBUG] Outgoing Request URL:', apiUrl);
    // console.log('[DEBUG] Outgoing Request Headers:', { ...headers, Authorization: 'Bearer ***' }); // Mask token

    let response = await fetch(apiUrl, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${token}`,
            'accept': '*/*',
        }
    });

    // Handle 401 - Refresh Token and Retry
    if (response.status === 401) {
        console.log('Received 401, clearing token cache and retrying...');
        authService.clearToken();
        try {
            token = await authService.getToken();
            response = await fetch(apiUrl, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'accept': '*/*',
                }
            });
        } catch (retryError) {
             console.error('Retry failed:', retryError);
             return NextResponse.json(
                { error: 'Authentication retry failed', details: retryError.message },
                { status: 401 }
            );
        }
    }

    console.log(`[DEBUG] invoices API response status: ${response.status}`);
    
    
    // Attempt to parse response
    const text = await response.text();
    let data;
    try {
        data = text ? JSON.parse(text) : {};
    } catch (e) {
        data = { message: text, success: response.ok };
    }

    if (!response.ok) {
        console.error('External API Error:', response.status, text);
        console.error('[DEBUG] Full Upstream Response Text:', text);
        try {
             const errorData = JSON.parse(text);
             console.error('[DEBUG] Upstream Error Data:', JSON.stringify(errorData, null, 2));
        } catch(e) {
             console.error('[DEBUG] Upstream Response is not JSON');
        }

        return NextResponse.json(
            { error: `External API Error: ${response.status}`, details: data },
            { status: response.status }
        );
    }

    return NextResponse.json(data);

  } catch (error) {
    console.error('Error fetching invoices:', error.message);
    return NextResponse.json(
      { error: 'Failed to fetch invoices', details: error.message },
      { status: 500 }
    );
  }
}

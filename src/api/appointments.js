/**
 * Appointments API
 * Handles appointment operations via Next.js API Routes
 */

const CONFIRMED_STATUS_VALUES = ["confirmed", "approved"];

export const normalizeAppointmentStatus = (status, isPatientsConfirmed = null) => {
    if (typeof status === "string" && status.trim()) {
        return status.trim().toLowerCase();
    }

    if (isPatientsConfirmed === true) return "approved";
    if (isPatientsConfirmed === false) return "rejected";

    const numericStatus = Number(status);
    if (Number.isNaN(numericStatus)) return "pending";
    if (numericStatus === 1) return "approved";
    if (numericStatus === 2) return "rejected";
    return "pending";
};

const formatDateKey = (date) => {
    const year = date.getFullYear();
    const month = `${date.getMonth() + 1}`.padStart(2, "0");
    const day = `${date.getDate()}`.padStart(2, "0");
    return `${year}-${month}-${day}`;
};

const extractDateKey = (value) => {
    if (!value) return "";

    if (value instanceof Date && !Number.isNaN(value.getTime())) {
        return formatDateKey(value);
    }

    if (typeof value === "string") {
        const trimmed = value.trim();
        const isoMatch = trimmed.match(/^(\d{4}-\d{2}-\d{2})/);
        if (isoMatch) return isoMatch[1];

        const parsed = new Date(trimmed);
        if (!Number.isNaN(parsed.getTime())) {
            return formatDateKey(parsed);
        }
    }

    return "";
};

export const normalizeAppointment = (appointment = {}) => {
    const patientNo = appointment.patientNo || appointment.PatientNo || appointment.PatientCode || appointment.patientCode || appointment.UHID || appointment.uhid || appointment.appointmenNo || appointment.appointmentNo || "";
    const patientName = appointment.patientName
        || appointment.PatientName
        || `${appointment.FirstName || appointment.firstName || ""} ${appointment.LastName || appointment.lastName || ""}`.trim();
    const mobileNo = appointment.mobileNo || appointment.MobileNo || appointment.Mobile || appointment.mobile || appointment.PhoneNo || appointment.phoneNo || appointment.mobileNo1 || appointment.MobileNo1 || "";
    const doctor = appointment.doctor
        || appointment.doctorName
        || appointment.DoctorName
        || appointment.doctorFullName
        || appointment.DoctorFullName
        || "";
    const appointmentDate = appointment.appointmentDate || appointment.AppointmentDate || appointment.startDate || appointment.StartDate || "";
    const status = normalizeAppointmentStatus(
        appointment.status ?? appointment.Status ?? appointment.appointmentStatus ?? appointment.AppointmentStatus,
        appointment.isPatientsConfirmed ?? appointment.IsPatientsConfirmed
    );

    return {
        ...appointment,
        patientNo,
        patientName,
        mobileNo,
        doctor,
        appointmentDate,
        status,
    };
};

export const getAppointments = async (params = {}) => {
    if (typeof window === 'undefined') return []; // Safety check for server-side

    // Strip undefined/null/empty values so they aren't serialized as the string "undefined"
    const cleanParams = Object.fromEntries(
        Object.entries(params).filter(([, v]) => v !== undefined && v !== null && v !== '')
    );
    const queryString = new URLSearchParams(cleanParams).toString();
    const url = `/api/Appointments/getAppointments${queryString ? `?${queryString}` : ''}`;
    
    // Auth header from local storage
    let headers = { 'Content-Type': 'application/json' };
    if (typeof window !== 'undefined' && window.localStorage) {
        const token = localStorage.getItem("token") || localStorage.getItem("jwt_token");
        if (token) headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(url, { headers, cache: 'no-store' });
    
    if (!response.ok) {
        let errorMsg = `Failed to fetch appointments: ${response.status}`;
        try {
            const errorData = await response.json();
            const detailsStr = typeof errorData.details === 'object' ? JSON.stringify(errorData.details) : errorData.details;
            const errorStr = typeof errorData.error === 'object' ? JSON.stringify(errorData.error) : errorData.error;
            errorMsg += ` - ${detailsStr || errorStr || JSON.stringify(errorData)}`;
        } catch (e) {
            // response might be text
            const errorText = await response.text();
            if (errorText) errorMsg += ` - ${errorText}`;
        }
        throw new Error(errorMsg);
    }
    
    return response.json();
};

export const upsertAppointment = async (data) => {
    // Auth header from local storage
    let headers = { 'Content-Type': 'application/json' };
    if (typeof window !== 'undefined' && window.localStorage) {
        const token = localStorage.getItem("token") || localStorage.getItem("jwt_token");
        if (token) headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch('/api/Appointments/upsertAppointment', {
        method: 'POST',
        headers,
        body: JSON.stringify(data)
    });

    if (!response.ok) {
        throw new Error(`Failed to upsert appointment: ${response.status}`);
    }

    return response.json();
};

export const getAppointmentsReport = async (params = {}) => {
    if (typeof window === 'undefined') return []; // Safety check for server-side

    const queryString = new URLSearchParams(params).toString();
    const url = `/api/Appointments/getAppointmentsReport${queryString ? `?${queryString}` : ''}`;
    
    // Auth header from local storage
    let headers = { 'Content-Type': 'application/json' };
    if (typeof window !== 'undefined' && window.localStorage) {
        const token = localStorage.getItem("token") || localStorage.getItem("jwt_token");
        if (token) headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(url, { headers, cache: 'no-store' });
    
    if (!response.ok) {
        throw new Error(`Failed to fetch appointments report: ${response.status}`);
    }
    
    const data = await response.json();
    // Return empty array if data isn't in expected array format
    return Array.isArray(data) ? data : (data?.data || data?.appointments || []);
};

export const getTodaysConfirmedAppointments = async (params = {}) => {
    const response = await getAppointments(params);
    const appointments = Array.isArray(response)
        ? response
        : (response?.data || response?.appointments || []);
    const todayKey = formatDateKey(new Date());

    return appointments
        .map(normalizeAppointment)
        .filter((appointment) => {
            const appointmentDateKey = extractDateKey(appointment.appointmentDate);
            return appointmentDateKey === todayKey
                && CONFIRMED_STATUS_VALUES.includes(appointment.status);
        });
};

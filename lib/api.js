export const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:4000';

async function request(path, options = {}) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(options.adminPasscode ? { 'x-admin-passcode': options.adminPasscode } : {}),
      ...(options.headers || {}),
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: response.statusText }));
    throw new Error(error.message || 'Request failed');
  }

  if (response.status === 204) return null;
  return response.json();
}

export function getContent(options) {
  return request('/api/content', options);
}

export function saveContent(content, adminPasscode) {
  return request('/api/content', { method: 'PUT', body: JSON.stringify(content), adminPasscode });
}

export function resetContent(adminPasscode) {
  return request('/api/content/reset', { method: 'POST', adminPasscode });
}

export function createEnquiry(enquiry) {
  return request('/api/enquiries', { method: 'POST', body: JSON.stringify(enquiry) });
}

export function getEnquiries(adminPasscode) {
  return request('/api/enquiries', { adminPasscode });
}

export function updateEnquiryStatus(id, status, adminPasscode) {
  return request(`/api/enquiries/${id}`, { method: 'PATCH', body: JSON.stringify({ status }), adminPasscode });
}

export function deleteEnquiry(id, adminPasscode) {
  return request(`/api/enquiries/${id}`, { method: 'DELETE', adminPasscode });
}

export function clearEnquiries(adminPasscode) {
  return request('/api/enquiries', { method: 'DELETE', adminPasscode });
}

export function enquiryExportUrl(adminPasscode) {
  return `${API_BASE_URL}/api/enquiries/export.csv?passcode=${encodeURIComponent(adminPasscode)}`;
}

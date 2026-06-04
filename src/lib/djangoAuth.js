const API_URL = import.meta.env.VITE_API_URL

export async function loginWithDjango(email, password) {
  const res = await fetch(`${API_URL}/accounts/login/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  })

  const data = await res.json()

  if (res.ok) {
    localStorage.setItem('access_token', data.tokens.access)
    localStorage.setItem('refresh_token', data.tokens.refresh)
    return { success: true, user: data.user }
  } else {
    return { success: false, error: data.detail || 'Login failed' }
  }
}

export function getToken() {
  return localStorage.getItem('access_token')
}

export function logout() {
  localStorage.removeItem('access_token')
  localStorage.removeItem('refresh_token')
}

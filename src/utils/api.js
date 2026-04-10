const API_URL = import.meta.env.VITE_API_URL || ''

export function getApiUrl(path) {
  if (!API_URL) return path
  if (path.startsWith('/')) return API_URL + path
  return API_URL + '/' + path
}

export default API_URL
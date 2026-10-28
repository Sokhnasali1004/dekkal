// api.js — module d'accès à l'API, basé sur fetch + async/await
export const API_BASE = 'http://localhost:5000/api';

class ApiError extends Error {
  constructor(message, status) {
    super(message);
    this.status = status;
  }
}

async function requete(chemin, options = {}) {
  const token = localStorage.getItem('dekkal_token');
  const headers = { 'Content-Type': 'application/json', ...(options.headers || {}) };
  if (token) headers.Authorization = `Bearer ${token}`;

  const reponse = await fetch(`${API_BASE}${chemin}`, { ...options, headers });
  const estJson = reponse.headers.get('content-type')?.includes('application/json');
  const corps = estJson ? await reponse.json() : null;

  if (!reponse.ok) {
    throw new ApiError(corps?.message || 'Une erreur est survenue.', reponse.status);
  }
  return corps;
}

export const api = {
  get: (chemin) => requete(chemin),
  post: (chemin, donnees) => requete(chemin, { method: 'POST', body: JSON.stringify(donnees) }),
  put: (chemin, donnees) => requete(chemin, { method: 'PUT', body: JSON.stringify(donnees) }),
  delete: (chemin) => requete(chemin, { method: 'DELETE' }),
};

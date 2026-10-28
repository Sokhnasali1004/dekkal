// auth.js — gestion de la session utilisateur (token JWT en localStorage)
import { api } from './api.js';

const CLE_TOKEN = 'dekkal_token';
const CLE_USER = 'dekkal_user';

export function utilisateurConnecte() {
  const brut = localStorage.getItem(CLE_USER);
  return brut ? JSON.parse(brut) : null;
}

export function estConnecte() {
  return Boolean(localStorage.getItem(CLE_TOKEN));
}

export async function inscrire(donnees) {
  const { token, utilisateur } = await api.post('/auth/inscription', donnees);
  localStorage.setItem(CLE_TOKEN, token);
  localStorage.setItem(CLE_USER, JSON.stringify(utilisateur));
  return utilisateur;
}

export async function connecter(email, motDePasse) {
  const { token, utilisateur } = await api.post('/auth/connexion', { email, motDePasse });
  localStorage.setItem(CLE_TOKEN, token);
  localStorage.setItem(CLE_USER, JSON.stringify(utilisateur));
  return utilisateur;
}

export function deconnecter() {
  localStorage.removeItem(CLE_TOKEN);
  localStorage.removeItem(CLE_USER);
  window.location.href = 'compte.html';
}

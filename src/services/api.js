import { convertFromBackend } from '../utils/formatters';

const API_BASE_URL = 'http://localhost:3000/api';

// Fonction générique pour les requêtes
const request = async (endpoint, options = {}) => {
  const url = `${API_BASE_URL}${endpoint}`;
  
  // Récupérer le token depuis localStorage
  const token = localStorage.getItem('token');
  
  // Debug: vérifier si le token existe
  if (!token) {
    console.warn('⚠️ Aucun token trouvé dans localStorage pour la requête:', endpoint);
  }
  
  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` }),
      ...options.headers,
    },
    ...options,
  };

  try {
    const response = await fetch(url, config);
    const data = await response.json();
    
    if (!response.ok) {
      // Si erreur 401, le token est manquant ou invalide
      if (response.status === 401) {
        console.error('❌ Erreur 401: Token manquant ou invalide');
        console.log('Token présent:', !!token);
        console.log('Headers:', config.headers);
      }
      throw new Error(data.message || 'Une erreur est survenue');
    }
    
    // Convertir les données du backend (snake_case) en camelCase
    return convertFromBackend(data);
  } catch (error) {
    console.error('Erreur API:', error);
    throw error;
  }
};

// API Produits
export const produitsAPI = {
  getAll: () => request('/produits'),
  getById: (id) => request(`/produits/${id}`),
  create: (produit) => request('/produits', {
    method: 'POST',
    body: JSON.stringify(produit),
  }),
  update: (id, produit) => request(`/produits/${id}`, {
    method: 'PUT',
    body: JSON.stringify(produit),
  }),
  delete: (id) => request(`/produits/${id}`, { method: 'DELETE' }),
  getStockFaible: () => request('/produits/stock-faible'),
};

// API Fournisseurs
export const fournisseursAPI = {
  getAll: () => request('/fournisseurs'),
  getById: (id) => request(`/fournisseurs/${id}`),
  create: (fournisseur) => request('/fournisseurs', {
    method: 'POST',
    body: JSON.stringify(fournisseur),
  }),
  update: (id, fournisseur) => request(`/fournisseurs/${id}`, {
    method: 'PUT',
    body: JSON.stringify(fournisseur),
  }),
  delete: (id) => request(`/fournisseurs/${id}`, { method: 'DELETE' }),
};

// API Achats
export const achatsAPI = {
  getAll: () => request('/achats'),
  getById: (id) => request(`/achats/${id}`),
  create: (achat) => request('/achats', {
    method: 'POST',
    body: JSON.stringify(achat),
  }),
  delete: (id) => request(`/achats/${id}`, { method: 'DELETE' }),
  getByDateRange: (dateDebut, dateFin) => 
    request(`/achats/date-range?dateDebut=${dateDebut}&dateFin=${dateFin}`),
};

// API Ventes
export const ventesAPI = {
  getAll: () => request('/ventes'),
  getById: (id) => request(`/ventes/${id}`),
  create: (vente) => request('/ventes', {
    method: 'POST',
    body: JSON.stringify(vente),
  }),
  delete: (id) => request(`/ventes/${id}`, { method: 'DELETE' }),
  getByDateRange: (dateDebut, dateFin) => 
    request(`/ventes/date-range?dateDebut=${dateDebut}&dateFin=${dateFin}`),
};

// API Commandes
export const commandesAPI = {
  getAll: () => request('/commandes'),
  getById: (id) => request(`/commandes/${id}`),
  create: (commande) => request('/commandes', {
    method: 'POST',
    body: JSON.stringify(commande),
  }),
  update: (id, commande) => request(`/commandes/${id}`, {
    method: 'PUT',
    body: JSON.stringify(commande),
  }),
  delete: (id) => request(`/commandes/${id}`, { method: 'DELETE' }),
  getByStatut: (statut) => request(`/commandes/statut/${statut}`),
};

// API Statistiques
export const statistiquesAPI = {
  getAll: () => request('/statistiques'),
  getBenefices: () => request('/statistiques/benefices'),
};

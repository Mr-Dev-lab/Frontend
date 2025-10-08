// Configuration de l'URL de l'API
// Pour utiliser ngrok, remplacez l'URL par votre URL ngrok
// Exemple: export const API_BASE_URL = 'https://xxxx-xxxx-xxxx.ngrok-free.app/api';

export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
export const API_AUTH_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

// Pour ngrok, créez un fichier .env à la racine du frontend avec:
// VITE_API_URL=https://votre-url-ngrok.ngrok-free.app/api

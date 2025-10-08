// Convertir les données du backend (snake_case) vers le frontend (camelCase)
export const convertFromBackend = (data) => {
  if (Array.isArray(data)) {
    return data.map(item => convertFromBackend(item));
  }
  
  if (data && typeof data === 'object') {
    const converted = {};
    for (const [key, value] of Object.entries(data)) {
      // Convertir snake_case en camelCase
      const camelKey = key.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
      converted[camelKey] = value;
    }
    return converted;
  }
  
  return data;
};

// Formater le prix en FCFA
export const formatPrice = (price) => {
  const numPrice = parseFloat(price);
  if (isNaN(numPrice)) return '0 FCFA';
  return `${numPrice.toLocaleString('fr-FR', { minimumFractionDigits: 0, maximumFractionDigits: 0 })} FCFA`;
};

// Formater la date
export const formatDate = (dateString) => {
  if (!dateString) return 'Date invalide';
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return 'Date invalide';
  
  return date.toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
};

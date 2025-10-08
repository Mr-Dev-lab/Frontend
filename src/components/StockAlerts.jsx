import { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';

export default function StockAlerts() {
  const { produits } = useApp();
  const [showAlerts, setShowAlerts] = useState(true);
  const [produitsAlerte, setProduitsAlerte] = useState([]);

  useEffect(() => {
    // Filtrer les produits en alerte
    const alertes = produits.filter(p => 
      parseInt(p.stock) <= parseInt(p.seuilAlerte || 10)
    );
    setProduitsAlerte(alertes);
  }, [produits]);

  if (!showAlerts || produitsAlerte.length === 0) {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 max-w-md z-50">
      <div className="bg-red-500 text-white rounded-lg shadow-lg p-4">
        <div className="flex justify-between items-start mb-2">
          <div className="flex items-center gap-2">
            <span className="text-2xl">⚠️</span>
            <h3 className="font-bold text-lg">Alertes Stock Faible</h3>
          </div>
          <button
            onClick={() => setShowAlerts(false)}
            className="text-white hover:text-gray-200 text-xl"
          >
            ×
          </button>
        </div>
        
        <div className="space-y-2 max-h-60 overflow-y-auto">
          {produitsAlerte.slice(0, 5).map(produit => (
            <div key={produit.id} className="bg-red-600 rounded p-2 text-sm">
              <div className="font-semibold">{produit.nom}</div>
              <div className="text-xs">
                Stock: {produit.stock} / Seuil: {produit.seuilAlerte}
              </div>
            </div>
          ))}
          {produitsAlerte.length > 5 && (
            <div className="text-xs text-center pt-2 border-t border-red-400">
              +{produitsAlerte.length - 5} autres produits en alerte
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

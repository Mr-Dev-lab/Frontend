import { useApp } from '../context/AppContext';
import { formatPrice } from '../utils/formatters';

export default function Stocks() {
  const { produits } = useApp();

  const stockTotal = produits.reduce((acc, p) => acc + parseInt(p.stock || 0), 0);
  const valeurTotale = produits.reduce((acc, p) => 
    acc + (parseInt(p.stock || 0) * parseFloat(p.prixAchat || 0)), 0
  );

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Gestion des Stocks</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <h3 className="text-gray-500 dark:text-gray-400 text-sm font-medium">Stock Total</h3>
          <p className="text-3xl font-bold mt-2">{stockTotal} unités</p>
        </div>
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <h3 className="text-gray-500 dark:text-gray-400 text-sm font-medium">Valeur du Stock</h3>
          <p className="text-3xl font-bold mt-2">{formatPrice(valeurTotale)}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <h3 className="text-gray-500 dark:text-gray-400 text-sm font-medium">Produits en Stock</h3>
          <p className="text-3xl font-bold mt-2">{produits.length}</p>
        </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Produit
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Catégorie
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Stock Actuel
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Prix Unitaire
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Valeur Stock
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Statut
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {produits.length > 0 ? (
              produits.map((produit) => {
                const stock = parseInt(produit.stock || 0);
                const valeur = stock * parseFloat(produit.prixAchat || 0);
                return (
                  <tr key={produit.id}>
                    <td className="px-6 py-4 whitespace-nowrap font-medium">{produit.nom}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{produit.categorie}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{stock}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{formatPrice(produit.prixAchat)}</td>
                    <td className="px-6 py-4 whitespace-nowrap font-semibold">{formatPrice(valeur)}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 rounded text-sm ${
                        stock === 0 
                          ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' 
                          : stock < 10 
                          ? 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200'
                          : 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                      }`}>
                        {stock === 0 ? 'Rupture' : stock < 10 ? 'Faible' : 'Suffisant'}
                      </span>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan="6" className="px-6 py-8 text-center text-gray-500 dark:text-gray-400">
                  Aucun produit en stock
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

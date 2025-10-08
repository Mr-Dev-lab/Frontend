import { useApp } from '../context/AppContext';
import { formatPrice } from '../utils/formatters';
import SalesChart from '../components/SalesChart';
import CategoryChart from '../components/CategoryChart';

export default function Accueil() {
  const { getStatistiques, ventes, achats, produits } = useApp();
  const stats = getStatistiques();

  // Produits avec stock faible
  const produitsStockFaible = produits.filter(p => parseInt(p.stock) < 10);

  // Activités récentes (dernières ventes et achats)
  const activitesRecentes = [
    ...ventes.slice(-5).map(v => ({ ...v, type: 'vente', date: v.dateVente })),
    ...achats.slice(-5).map(a => ({ ...a, type: 'achat', date: a.dateAchat }))
  ].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 10);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Tableau de Bord</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <h3 className="text-gray-500 dark:text-gray-400 text-sm font-medium">Total Produits</h3>
          <p className="text-3xl font-bold mt-2">{stats.totalProduits}</p>
        </div>
        
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <h3 className="text-gray-500 dark:text-gray-400 text-sm font-medium">Stock Total</h3>
          <p className="text-3xl font-bold mt-2">{stats.stockTotal}</p>
        </div>
        
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <h3 className="text-gray-500 dark:text-gray-400 text-sm font-medium">Ventes du Mois</h3>
          <p className="text-3xl font-bold mt-2 text-green-600">{formatPrice(stats.totalVentesMois)}</p>
        </div>
        
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <h3 className="text-gray-500 dark:text-gray-400 text-sm font-medium">Bénéfices du Mois</h3>
          <p className={`text-3xl font-bold mt-2 ${stats.beneficesMois >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {formatPrice(stats.beneficesMois)}
          </p>
        </div>
      </div>

      {/* Graphiques */}
      <div className="grid grid-cols-1 gap-6">
        <SalesChart ventes={ventes} achats={achats} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <CategoryChart produits={produits} />
        
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Activité Récente</h2>
          {activitesRecentes.length > 0 ? (
            <div className="space-y-3">
              {activitesRecentes.map((activite, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded">
                  <div>
                    <span className={`inline-block px-2 py-1 text-xs rounded ${
                      activite.type === 'vente' 
                        ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' 
                        : 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                    }`}>
                      {activite.type === 'vente' ? 'Vente' : 'Achat'}
                    </span>
                    <p className="mt-1 text-sm">{activite.produitNom || 'Produit'}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">{formatPrice(activite.prixTotal)}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{formatDate(activite.date)}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 dark:text-gray-400">Aucune activité récente</p>
          )}
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Alertes Stock Faible</h2>
          {produitsStockFaible.length > 0 ? (
            <div className="space-y-3">
              {produitsStockFaible.map((produit) => (
                <div key={produit.id} className="flex items-center justify-between p-3 bg-red-50 dark:bg-red-900/20 rounded border border-red-200 dark:border-red-800">
                  <div>
                    <p className="font-medium">{produit.nom}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{produit.categorie}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-red-600 dark:text-red-400 font-bold">{produit.stock} unités</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 dark:text-gray-400">Tous les stocks sont suffisants</p>
          )}
        </div>
      </div>
    </div>
  );
}

import { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import Button from '../components/Button';
import { formatPrice, formatDate } from '../utils/formatters';
import { exportToCSV, exportToJSON, printReport, generateTableHTML } from '../utils/exportUtils';

export default function Rapports() {
  const { produits, achats, ventes, fournisseurs, commandes } = useApp();
  const { canManage } = useAuth();
  const [dateDebut, setDateDebut] = useState('');
  const [dateFin, setDateFin] = useState('');
  const [typeRapport, setTypeRapport] = useState('ventes');

  useEffect(() => {
    // Définir les dates par défaut (dernier mois)
    const today = new Date();
    const lastMonth = new Date(today.getFullYear(), today.getMonth() - 1, today.getDate());
    
    setDateFin(today.toISOString().split('T')[0]);
    setDateDebut(lastMonth.toISOString().split('T')[0]);
  }, []);

  if (!canManage()) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-red-600">Accès refusé</h2>
        <p className="mt-4">Vous n'avez pas les permissions pour accéder aux rapports.</p>
      </div>
    );
  }

  // Filtrer les données par date
  const filtrerParDate = (items, dateField) => {
    if (!dateDebut || !dateFin) return items;
    
    return items.filter(item => {
      const itemDate = new Date(item[dateField]);
      const debut = new Date(dateDebut);
      const fin = new Date(dateFin);
      fin.setHours(23, 59, 59, 999); // Inclure toute la journée de fin
      
      return itemDate >= debut && itemDate <= fin;
    });
  };

  const ventesFiltrees = filtrerParDate(ventes, 'dateVente');
  const achatsFiltres = filtrerParDate(achats, 'dateAchat');

  // Calculer les statistiques
  const stats = {
    totalVentes: ventesFiltrees.reduce((sum, v) => sum + parseFloat(v.prixTotal || 0), 0),
    totalAchats: achatsFiltres.reduce((sum, a) => sum + parseFloat(a.prixTotal || 0), 0),
    nombreVentes: ventesFiltrees.length,
    nombreAchats: achatsFiltres.length,
  };
  stats.benefice = stats.totalVentes - stats.totalAchats;

  // Produits les plus vendus
  const produitsVendus = {};
  ventesFiltrees.forEach(vente => {
    const produitId = vente.produitId;
    if (!produitsVendus[produitId]) {
      produitsVendus[produitId] = {
        produit: produits.find(p => p.id === produitId),
        quantite: 0,
        montant: 0
      };
    }
    produitsVendus[produitId].quantite += parseInt(vente.quantite || 0);
    produitsVendus[produitId].montant += parseFloat(vente.prixTotal || 0);
  });

  const topProduits = Object.values(produitsVendus)
    .filter(p => p.produit)
    .sort((a, b) => b.montant - a.montant)
    .slice(0, 10);

  // Exporter les données
  const handleExportCSV = () => {
    let dataToExport = [];
    let filename = '';

    switch (typeRapport) {
      case 'ventes':
        dataToExport = ventesFiltrees.map(v => ({
          Date: formatDate(v.dateVente),
          Produit: produits.find(p => p.id === v.produitId)?.nom || 'N/A',
          Quantité: v.quantite,
          'Prix Unitaire': v.prixUnitaire,
          Total: v.prixTotal,
          Client: v.clientNom || 'N/A'
        }));
        filename = 'rapport_ventes';
        break;
      case 'achats':
        dataToExport = achatsFiltres.map(a => ({
          Date: formatDate(a.dateAchat),
          Produit: produits.find(p => p.id === a.produitId)?.nom || 'N/A',
          Fournisseur: fournisseurs.find(f => f.id === a.fournisseurId)?.nom || 'N/A',
          Quantité: a.quantite,
          'Prix Unitaire': a.prixUnitaire,
          Total: a.prixTotal
        }));
        filename = 'rapport_achats';
        break;
      case 'stock':
        dataToExport = produits.map(p => ({
          Produit: p.nom,
          Catégorie: p.categorie,
          Stock: p.stock,
          'Seuil Alerte': p.seuilAlerte,
          'Prix Achat': p.prixAchat,
          'Prix Vente': p.prixVente,
          'Valeur Stock': p.stock * p.prixAchat
        }));
        filename = 'rapport_stock';
        break;
    }

    exportToCSV(dataToExport, filename);
  };

  const handleExportJSON = () => {
    let dataToExport = {};
    
    dataToExport = {
      periode: { debut: dateDebut, fin: dateFin },
      statistiques: stats,
      ventes: ventesFiltrees,
      achats: achatsFiltres,
      topProduits
    };

    exportToJSON(dataToExport, 'rapport_complet');
  };

  const handlePrint = () => {
    const headers = ['Produit', 'Quantité Vendue', 'Montant Total'];
    const rows = topProduits.map(p => [
      p.produit.nom,
      p.quantite,
      formatPrice(p.montant)
    ]);

    const tableHTML = generateTableHTML(headers, rows);
    const content = `
      <h2>Période: ${formatDate(dateDebut)} - ${formatDate(dateFin)}</h2>
      <div style="margin: 20px 0;">
        <p><strong>Total Ventes:</strong> ${formatPrice(stats.totalVentes)}</p>
        <p><strong>Total Achats:</strong> ${formatPrice(stats.totalAchats)}</p>
        <p><strong>Bénéfice:</strong> ${formatPrice(stats.benefice)}</p>
      </div>
      <h3>Top 10 Produits</h3>
      ${tableHTML}
    `;

    printReport('Rapport de Ventes', content);
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Rapports et Analyses</h1>

      {/* Filtres */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4">Filtres</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">Date de début</label>
            <input
              type="date"
              value={dateDebut}
              onChange={(e) => setDateDebut(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Date de fin</label>
            <input
              type="date"
              value={dateFin}
              onChange={(e) => setDateFin(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Type de rapport</label>
            <select
              value={typeRapport}
              onChange={(e) => setTypeRapport(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
            >
              <option value="ventes">Ventes</option>
              <option value="achats">Achats</option>
              <option value="stock">Stock</option>
            </select>
          </div>
        </div>

        <div className="flex gap-3 mt-4">
          <Button onClick={handleExportCSV}>📊 Exporter CSV</Button>
          <Button onClick={handleExportJSON} variant="secondary">📄 Exporter JSON</Button>
          <Button onClick={handlePrint} variant="secondary">🖨️ Imprimer</Button>
        </div>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-blue-500 text-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-2">Total Ventes</h3>
          <p className="text-3xl font-bold">{formatPrice(stats.totalVentes)}</p>
          <p className="text-sm mt-2">{stats.nombreVentes} transactions</p>
        </div>
        <div className="bg-orange-500 text-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-2">Total Achats</h3>
          <p className="text-3xl font-bold">{formatPrice(stats.totalAchats)}</p>
          <p className="text-sm mt-2">{stats.nombreAchats} transactions</p>
        </div>
        <div className={`${stats.benefice >= 0 ? 'bg-green-500' : 'bg-red-500'} text-white p-6 rounded-lg shadow`}>
          <h3 className="text-lg font-semibold mb-2">Bénéfice</h3>
          <p className="text-3xl font-bold">{formatPrice(stats.benefice)}</p>
          <p className="text-sm mt-2">{stats.benefice >= 0 ? 'Positif' : 'Négatif'}</p>
        </div>
        <div className="bg-purple-500 text-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-2">Marge Moyenne</h3>
          <p className="text-3xl font-bold">
            {stats.totalAchats > 0 ? ((stats.benefice / stats.totalAchats) * 100).toFixed(1) : 0}%
          </p>
          <p className="text-sm mt-2">Sur la période</p>
        </div>
      </div>

      {/* Top Produits */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
        <div className="p-6">
          <h2 className="text-xl font-semibold mb-4">Top 10 Produits Vendus</h2>
        </div>
        <table className="w-full">
          <thead className="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Rang</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Produit</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Quantité</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Montant Total</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {topProduits.length > 0 ? (
              topProduits.map((item, index) => (
                <tr key={item.produit.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-2xl font-bold text-gray-400">#{index + 1}</span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-medium">{item.produit.nom}</div>
                    <div className="text-sm text-gray-500">{item.produit.categorie}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">{item.quantite}</td>
                  <td className="px-6 py-4 whitespace-nowrap font-semibold">{formatPrice(item.montant)}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="4" className="px-6 py-8 text-center text-gray-500">
                  Aucune vente sur cette période
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

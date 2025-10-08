import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

export default function ClientsManagement() {
  const { user } = useAuth();
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedClient, setSelectedClient] = useState(null);
  const [showStatsModal, setShowStatsModal] = useState(false);
  const [clientStats, setClientStats] = useState(null);

  useEffect(() => {
    fetchClients();
  }, []);

  const fetchClients = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:3000/api/super-admin/clients', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) throw new Error('Erreur lors du chargement');
      
      const data = await response.json();
      setClients(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const toggleClientStatus = async (clientId, currentStatus) => {
    if (!confirm(`Voulez-vous vraiment ${currentStatus ? 'désactiver' : 'activer'} ce client ?`)) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:3000/api/super-admin/clients/${clientId}/status`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ actif: !currentStatus })
      });

      if (!response.ok) throw new Error('Erreur');
      
      fetchClients();
      alert('Statut mis à jour avec succès');
    } catch (err) {
      alert('Erreur lors de la mise à jour');
    }
  };

  const extendSubscription = async (clientId) => {
    const mois = prompt('Nombre de mois à ajouter:', '12');
    if (!mois) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:3000/api/super-admin/clients/${clientId}/extend`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ mois: parseInt(mois) })
      });

      if (!response.ok) throw new Error('Erreur');
      
      fetchClients();
      alert(`Abonnement prolongé de ${mois} mois`);
    } catch (err) {
      alert('Erreur lors de la prolongation');
    }
  };

  const viewClientStats = async (clientId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:3000/api/super-admin/clients/${clientId}/stats`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) throw new Error('Erreur');
      
      const data = await response.json();
      setClientStats(data);
      setShowStatsModal(true);
    } catch (err) {
      alert('Erreur lors du chargement des statistiques');
    }
  };

  const deleteClient = async (clientId, nomEntreprise) => {
    if (!confirm(`⚠️ ATTENTION: Supprimer le client "${nomEntreprise}" supprimera TOUTES ses données (utilisateurs, produits, ventes, etc.). Cette action est IRRÉVERSIBLE. Continuer ?`)) {
      return;
    }

    const confirmation = prompt('Tapez "SUPPRIMER" pour confirmer:');
    if (confirmation !== 'SUPPRIMER') {
      alert('Suppression annulée');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:3000/api/super-admin/clients/${clientId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) throw new Error('Erreur');
      
      fetchClients();
      alert('Client supprimé avec succès');
    } catch (err) {
      alert('Erreur lors de la suppression');
    }
  };

  const getStatusBadge = (statut) => {
    const styles = {
      'Actif': 'bg-green-100 text-green-800',
      'Expiré': 'bg-red-100 text-red-800',
      'Expire bientôt': 'bg-orange-100 text-orange-800',
      'Illimité': 'bg-blue-100 text-blue-800'
    };

    return (
      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${styles[statut] || 'bg-gray-100 text-gray-800'}`}>
        {statut}
      </span>
    );
  };

  if (loading) {
    return <div className="p-6">Chargement...</div>;
  }

  return (
    <div className="p-6 space-y-6">
      {/* En-tête */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Gestion des Clients
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            {clients.length} client(s) au total
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-semibold"
        >
          + Nouveau Client
        </button>
      </div>

      {/* Liste des clients */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                Entreprise
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                Email
              </th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                Statut
              </th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                Utilisateurs
              </th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                Produits
              </th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                CA Total
              </th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                Abonnement
              </th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {clients.map((client) => (
              <tr key={client.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold mr-3">
                      {client.nom_entreprise.charAt(0)}
                    </div>
                    <div>
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        {client.nom_entreprise}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        ID: {client.id}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                  {client.email}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-center">
                  {client.actif ? (
                    <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-semibold">
                      Actif
                    </span>
                  ) : (
                    <span className="px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs font-semibold">
                      Inactif
                    </span>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-900 dark:text-white">
                  {client.nb_users}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-900 dark:text-white">
                  {client.nb_produits}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-semibold text-green-600">
                  {parseFloat(client.ca_total).toLocaleString()} €
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-center">
                  {getStatusBadge(client.statut_abonnement)}
                  {client.date_expiration && (
                    <div className="text-xs text-gray-500 mt-1">
                      {new Date(client.date_expiration).toLocaleDateString()}
                    </div>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-center text-sm">
                  <div className="flex justify-center space-x-2">
                    <button
                      onClick={() => viewClientStats(client.id)}
                      className="text-blue-600 hover:text-blue-800"
                      title="Voir les statistiques"
                    >
                      📊
                    </button>
                    <button
                      onClick={() => toggleClientStatus(client.id, client.actif)}
                      className={client.actif ? 'text-orange-600 hover:text-orange-800' : 'text-green-600 hover:text-green-800'}
                      title={client.actif ? 'Désactiver' : 'Activer'}
                    >
                      {client.actif ? '🔒' : '🔓'}
                    </button>
                    <button
                      onClick={() => extendSubscription(client.id)}
                      className="text-purple-600 hover:text-purple-800"
                      title="Prolonger l'abonnement"
                    >
                      📅
                    </button>
                    <button
                      onClick={() => deleteClient(client.id, client.nom_entreprise)}
                      className="text-red-600 hover:text-red-800"
                      title="Supprimer"
                    >
                      🗑️
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal Statistiques Client */}
      {showStatsModal && clientStats && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                Statistiques - {clientStats.client.nom_entreprise}
              </h2>
              <button
                onClick={() => setShowStatsModal(false)}
                className="text-gray-500 hover:text-gray-700 text-2xl"
              >
                ×
              </button>
            </div>
            
            <div className="p-6 space-y-6">
              {/* Statistiques globales */}
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-blue-50 dark:bg-blue-900 p-4 rounded-lg">
                  <div className="text-sm text-gray-600 dark:text-gray-300">Utilisateurs</div>
                  <div className="text-2xl font-bold text-blue-600">{clientStats.stats.nb_users}</div>
                </div>
                <div className="bg-green-50 dark:bg-green-900 p-4 rounded-lg">
                  <div className="text-sm text-gray-600 dark:text-gray-300">Produits</div>
                  <div className="text-2xl font-bold text-green-600">{clientStats.stats.nb_produits}</div>
                </div>
                <div className="bg-purple-50 dark:bg-purple-900 p-4 rounded-lg">
                  <div className="text-sm text-gray-600 dark:text-gray-300">Fournisseurs</div>
                  <div className="text-2xl font-bold text-purple-600">{clientStats.stats.nb_fournisseurs}</div>
                </div>
              </div>

              {/* CA et dépenses */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-green-50 dark:bg-green-900 p-4 rounded-lg">
                  <div className="text-sm text-gray-600 dark:text-gray-300">CA Total</div>
                  <div className="text-2xl font-bold text-green-600">
                    {parseFloat(clientStats.stats.ca_total).toLocaleString()} €
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    {clientStats.stats.nb_ventes} ventes
                  </div>
                </div>
                <div className="bg-red-50 dark:bg-red-900 p-4 rounded-lg">
                  <div className="text-sm text-gray-600 dark:text-gray-300">Dépenses Total</div>
                  <div className="text-2xl font-bold text-red-600">
                    {parseFloat(clientStats.stats.depenses_total).toLocaleString()} €
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    {clientStats.stats.nb_achats} achats
                  </div>
                </div>
              </div>

              {/* Top produits */}
              <div>
                <h3 className="text-lg font-semibold mb-3 text-gray-900 dark:text-white">
                  Top 5 Produits
                </h3>
                <div className="space-y-2">
                  {clientStats.topProduits.slice(0, 5).map((produit) => (
                    <div key={produit.id} className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700 rounded">
                      <span className="text-gray-900 dark:text-white">{produit.nom}</span>
                      <div className="text-right">
                        <div className="text-sm font-semibold text-gray-900 dark:text-white">
                          {produit.quantite_vendue} vendus
                        </div>
                        <div className="text-xs text-gray-500">
                          {parseFloat(produit.ca_genere).toLocaleString()} €
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

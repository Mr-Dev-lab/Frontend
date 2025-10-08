import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

export default function SuperAdminDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:3000/api/super-admin/dashboard', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) throw new Error('Erreur lors du chargement');
      
      const data = await response.json();
      setStats(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl">Chargement...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* En-tête */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Tableau de Bord Super Admin
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Vue d'ensemble de la plateforme
          </p>
        </div>
      </div>

      {/* Statistiques principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Clients Actifs"
          value={stats?.stats?.clients_actifs || 0}
          icon="🏢"
          color="bg-blue-500"
        />
        <StatCard
          title="Total Utilisateurs"
          value={stats?.stats?.total_users || 0}
          icon="👥"
          color="bg-green-500"
        />
        <StatCard
          title="Total Produits"
          value={stats?.stats?.total_produits || 0}
          icon="📦"
          color="bg-purple-500"
        />
        <StatCard
          title="CA Total"
          value={`${(stats?.stats?.ca_total || 0).toLocaleString()} €`}
          icon="💰"
          color="bg-yellow-500"
        />
      </div>

      {/* Alertes */}
      {stats?.stats?.clients_expires > 0 && (
        <div className="bg-orange-100 border-l-4 border-orange-500 text-orange-700 p-4 rounded">
          <div className="flex items-center">
            <span className="text-2xl mr-3">⚠️</span>
            <div>
              <p className="font-bold">Attention</p>
              <p>{stats.stats.clients_expires} client(s) ont un abonnement expiré</p>
            </div>
          </div>
        </div>
      )}

      {/* Statistiques secondaires */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
            Clients Inactifs
          </h3>
          <p className="text-3xl font-bold text-red-600">
            {stats?.stats?.clients_inactifs || 0}
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
            Total Ventes
          </h3>
          <p className="text-3xl font-bold text-green-600">
            {stats?.stats?.total_ventes || 0}
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
            Total Achats
          </h3>
          <p className="text-3xl font-bold text-blue-600">
            {stats?.stats?.total_achats || 0}
          </p>
        </div>
      </div>

      {/* Top 5 Clients */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            Top 5 Clients les Plus Actifs
          </h2>
        </div>
        <div className="overflow-x-auto">
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
                  Ventes
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                  Achats
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                  Utilisateurs
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                  Produits
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {stats?.topClients?.map((client) => (
                <tr key={client.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                    {client.nom_entreprise}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    {client.email}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-center text-gray-900 dark:text-white">
                    {client.nb_ventes}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-center text-gray-900 dark:text-white">
                    {client.nb_achats}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-center text-gray-900 dark:text-white">
                    {client.nb_users}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-center text-gray-900 dark:text-white">
                    {client.nb_produits}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Nouveaux clients par mois */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">
          Nouveaux Clients (6 derniers mois)
        </h2>
        <div className="space-y-3">
          {stats?.statsParMois?.map((stat) => (
            <div key={stat.mois} className="flex items-center justify-between">
              <span className="text-gray-600 dark:text-gray-400">{stat.mois}</span>
              <div className="flex items-center">
                <div className="w-48 bg-gray-200 dark:bg-gray-700 rounded-full h-4 mr-3">
                  <div
                    className="bg-blue-600 h-4 rounded-full"
                    style={{ width: `${(stat.nouveaux_clients / 10) * 100}%` }}
                  ></div>
                </div>
                <span className="font-semibold text-gray-900 dark:text-white w-8 text-right">
                  {stat.nouveaux_clients}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, icon, color }) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">{title}</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
        </div>
        <div className={`${color} w-12 h-12 rounded-lg flex items-center justify-center text-2xl`}>
          {icon}
        </div>
      </div>
    </div>
  );
}

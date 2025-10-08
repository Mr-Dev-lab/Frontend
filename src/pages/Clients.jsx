import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import Modal from '../components/Modal';
import Input from '../components/Input';
import Button from '../components/Button';
import SearchBar from '../components/SearchBar';
import Notification from '../components/Notification';

export default function Clients() {
  const { token, isSuperAdmin } = useAuth();
  const [clients, setClients] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingClient, setEditingClient] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [notification, setNotification] = useState(null);
  const [formData, setFormData] = useState({
    nom_entreprise: '',
    email: '',
    telephone: '',
    adresse: '',
    date_expiration: '',
    actif: true,
  });

  useEffect(() => {
    fetchClients();
  }, []);

  const fetchClients = async () => {
    try {
      const response = await fetch('http://localhost:3000/api/clients', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      
      if (!response.ok) {
        console.error('Erreur:', response.status);
        setClients([]);
        setNotification({
          type: 'error',
          message: 'Erreur lors du chargement des clients'
        });
        return;
      }
      
      const data = await response.json();
      setClients(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Erreur:', error);
      setClients([]);
      setNotification({
        type: 'error',
        message: 'Erreur de connexion au serveur'
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const url = editingClient
        ? `http://localhost:3000/api/clients/${editingClient.id}`
        : 'http://localhost:3000/api/clients';
      
      const method = editingClient ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message);
      }

      setNotification({
        type: 'success',
        message: editingClient ? 'Client modifié avec succès' : 'Client créé avec succès',
      });

      fetchClients();
      resetForm();
    } catch (error) {
      setNotification({
        type: 'error',
        message: error.message,
      });
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce client ? Tous ses utilisateurs seront également supprimés.')) return;

    try {
      const response = await fetch(`http://localhost:3000/api/clients/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message);
      }

      setNotification({
        type: 'success',
        message: 'Client supprimé avec succès',
      });

      fetchClients();
    } catch (error) {
      setNotification({
        type: 'error',
        message: error.message,
      });
    }
  };

  const handleEdit = (client) => {
    setEditingClient(client);
    setFormData({
      nom_entreprise: client.nom_entreprise,
      email: client.email,
      telephone: client.telephone || '',
      adresse: client.adresse || '',
      date_expiration: client.date_expiration ? client.date_expiration.split('T')[0] : '',
      actif: client.actif,
    });
    setIsModalOpen(true);
  };

  const resetForm = () => {
    setFormData({
      nom_entreprise: '',
      email: '',
      telephone: '',
      adresse: '',
      date_expiration: '',
      actif: true,
    });
    setEditingClient(null);
    setIsModalOpen(false);
  };

  const clientsFiltres = clients.filter(c =>
    c.nom_entreprise?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (!isSuperAdmin()) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-red-600">Accès refusé</h2>
        <p className="mt-4">Seul le super administrateur peut gérer les clients.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {notification && (
        <Notification
          message={notification.message}
          type={notification.type}
          onClose={() => setNotification(null)}
        />
      )}

      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Gestion des Clients</h1>
        <Button onClick={() => setIsModalOpen(true)}>
          + Nouveau Client
        </Button>
      </div>

      <SearchBar
        value={searchTerm}
        onChange={setSearchTerm}
        placeholder="Rechercher un client..."
      />

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Entreprise</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Email</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Téléphone</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Expiration</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Statut</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {clientsFiltres.length > 0 ? (
              clientsFiltres.map((client) => (
                <tr key={client.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="font-medium">{client.nom_entreprise}</div>
                    {client.adresse && (
                      <div className="text-sm text-gray-500">{client.adresse}</div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">{client.email}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{client.telephone || '-'}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {client.date_expiration 
                      ? new Date(client.date_expiration).toLocaleDateString('fr-FR')
                      : 'Illimité'
                    }
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 rounded text-xs ${
                      client.actif 
                        ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' 
                        : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                    }`}>
                      {client.actif ? 'Actif' : 'Inactif'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap space-x-2">
                    <Button variant="secondary" onClick={() => handleEdit(client)} className="text-sm">
                      Modifier
                    </Button>
                    <Button variant="danger" onClick={() => handleDelete(client.id)} className="text-sm">
                      Supprimer
                    </Button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6" className="px-6 py-8 text-center text-gray-500">
                  Aucun client trouvé
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={resetForm}
        title={editingClient ? 'Modifier le client' : 'Nouveau client'}
      >
        <form onSubmit={handleSubmit}>
          <Input
            label="Nom de l'entreprise"
            value={formData.nom_entreprise}
            onChange={(e) => setFormData({ ...formData, nom_entreprise: e.target.value })}
            required
          />
          <Input
            label="Email"
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            required
          />
          <Input
            label="Téléphone"
            type="tel"
            value={formData.telephone}
            onChange={(e) => setFormData({ ...formData, telephone: e.target.value })}
            placeholder="+237 6XX XX XX XX"
          />
          <Input
            label="Adresse"
            value={formData.adresse}
            onChange={(e) => setFormData({ ...formData, adresse: e.target.value })}
            placeholder="Adresse complète"
          />
          <Input
            label="Date d'expiration (optionnel)"
            type="date"
            value={formData.date_expiration}
            onChange={(e) => setFormData({ ...formData, date_expiration: e.target.value })}
          />
          {editingClient && (
            <div className="mb-4">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.actif}
                  onChange={(e) => setFormData({ ...formData, actif: e.target.checked })}
                  className="mr-2"
                />
                <span>Client actif</span>
              </label>
            </div>
          )}
          <div className="flex gap-3 mt-6">
            <Button type="submit" className="flex-1">
              {editingClient ? 'Modifier' : 'Créer'}
            </Button>
            <Button type="button" variant="secondary" onClick={resetForm} className="flex-1">
              Annuler
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

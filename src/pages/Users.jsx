import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import Modal from '../components/Modal';
import Input from '../components/Input';
import Select from '../components/Select';
import Button from '../components/Button';
import SearchBar from '../components/SearchBar';
import Notification from '../components/Notification';

export default function Users() {
  const { token, user, isAdmin, isSuperAdmin } = useAuth();
  const [users, setUsers] = useState([]);
  const [clients, setClients] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [notification, setNotification] = useState(null);
  const [formData, setFormData] = useState({
    nom: '',
    prenom: '',
    email: '',
    password: '',
    role: 'vendeur',
    client_id: '',
    actif: true,
  });

  useEffect(() => {
    fetchUsers();
    if (isSuperAdmin()) {
      fetchClients();
    }
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await fetch('http://localhost:3000/api/users', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      
      if (!response.ok) {
        console.error('Erreur:', response.status);
        setUsers([]);
        return;
      }
      
      const data = await response.json();
      setUsers(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Erreur:', error);
      setUsers([]);
    }
  };

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
        return;
      }
      
      const data = await response.json();
      setClients(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Erreur:', error);
      setClients([]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const url = editingUser
        ? `http://localhost:3000/api/users/${editingUser.id}`
        : 'http://localhost:3000/api/users';
      
      const method = editingUser ? 'PUT' : 'POST';
      const body = editingUser 
        ? { ...formData, password: undefined } // Ne pas envoyer le password lors de la modification
        : formData;

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message);
      }

      setNotification({
        type: 'success',
        message: editingUser ? 'Utilisateur modifié avec succès' : 'Utilisateur créé avec succès',
      });

      fetchUsers();
      resetForm();
    } catch (error) {
      setNotification({
        type: 'error',
        message: error.message,
      });
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cet utilisateur ?')) return;

    try {
      const response = await fetch(`http://localhost:3000/api/users/${id}`, {
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
        message: 'Utilisateur supprimé avec succès',
      });

      fetchUsers();
    } catch (error) {
      setNotification({
        type: 'error',
        message: error.message,
      });
    }
  };

  const handleEdit = (user) => {
    setEditingUser(user);
    setFormData({
      nom: user.nom,
      prenom: user.prenom,
      email: user.email,
      password: '',
      role: user.role,
      client_id: user.client_id || '',
      actif: user.actif,
    });
    setIsModalOpen(true);
  };

  const resetForm = () => {
    setFormData({
      nom: '',
      prenom: '',
      email: '',
      password: '',
      role: 'vendeur',
      client_id: '',
      actif: true,
    });
    setEditingUser(null);
    setIsModalOpen(false);
  };

  const usersFiltres = users.filter(u =>
    u.nom?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.prenom?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const roleOptions = isSuperAdmin()
    ? [
        { value: 'super_admin', label: 'Super Admin' },
        { value: 'admin', label: 'Admin Client' },
        { value: 'gestionnaire', label: 'Gestionnaire' },
        { value: 'vendeur', label: 'Vendeur' },
        { value: 'acheteur', label: 'Acheteur' },
      ]
    : [
        { value: 'gestionnaire', label: 'Gestionnaire' },
        { value: 'vendeur', label: 'Vendeur' },
        { value: 'acheteur', label: 'Acheteur' },
      ];

  const getRoleBadge = (role) => {
    const colors = {
      super_admin: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
      admin: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
      gestionnaire: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
      vendeur: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
      acheteur: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
    };
    return colors[role] || 'bg-gray-100 text-gray-800';
  };

  if (!isAdmin()) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-red-600">Accès refusé</h2>
        <p className="mt-4">Vous n'avez pas les permissions pour accéder à cette page.</p>
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
        <h1 className="text-3xl font-bold">Gestion des Utilisateurs</h1>
        <Button onClick={() => setIsModalOpen(true)}>
          + Nouvel Utilisateur
        </Button>
      </div>

      <SearchBar
        value={searchTerm}
        onChange={setSearchTerm}
        placeholder="Rechercher un utilisateur..."
      />

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Nom</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Email</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Rôle</th>
              {isSuperAdmin() && (
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Client</th>
              )}
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Statut</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {usersFiltres.length > 0 ? (
              usersFiltres.map((u) => (
                <tr key={u.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="font-medium">{u.prenom} {u.nom}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">{u.email}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 rounded text-xs ${getRoleBadge(u.role)}`}>
                      {roleOptions.find(r => r.value === u.role)?.label || u.role}
                    </span>
                  </td>
                  {isSuperAdmin() && (
                    <td className="px-6 py-4 whitespace-nowrap">{u.client_nom || '-'}</td>
                  )}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 rounded text-xs ${u.actif ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                      {u.actif ? 'Actif' : 'Inactif'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap space-x-2">
                    <Button variant="secondary" onClick={() => handleEdit(u)} className="text-sm">
                      Modifier
                    </Button>
                    {u.id !== user.id && (
                      <Button variant="danger" onClick={() => handleDelete(u.id)} className="text-sm">
                        Supprimer
                      </Button>
                    )}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={isSuperAdmin() ? "6" : "5"} className="px-6 py-8 text-center text-gray-500">
                  Aucun utilisateur trouvé
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={resetForm}
        title={editingUser ? 'Modifier l\'utilisateur' : 'Nouvel utilisateur'}
      >
        <form onSubmit={handleSubmit}>
          <Input
            label="Prénom"
            value={formData.prenom}
            onChange={(e) => setFormData({ ...formData, prenom: e.target.value })}
            required
          />
          <Input
            label="Nom"
            value={formData.nom}
            onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
            required
          />
          <Input
            label="Email"
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            required
          />
          {!editingUser && (
            <Input
              label="Mot de passe"
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              required
              placeholder="Minimum 6 caractères"
            />
          )}
          <Select
            label="Rôle"
            value={formData.role}
            onChange={(e) => setFormData({ ...formData, role: e.target.value })}
            options={roleOptions}
            required
          />
          {isSuperAdmin() && (
            <Select
              label="Client"
              value={formData.client_id}
              onChange={(e) => setFormData({ ...formData, client_id: e.target.value })}
              options={[
                { value: '', label: 'Aucun (Super Admin)' },
                ...clients.map(c => ({ value: c.id, label: c.nom_entreprise }))
              ]}
            />
          )}
          {editingUser && (
            <Select
              label="Statut"
              value={formData.actif ? '1' : '0'}
              onChange={(e) => setFormData({ ...formData, actif: e.target.value === '1' })}
              options={[
                { value: '1', label: 'Actif' },
                { value: '0', label: 'Inactif' },
              ]}
            />
          )}
          <div className="flex gap-3 mt-6">
            <Button type="submit" className="flex-1">
              {editingUser ? 'Modifier' : 'Créer'}
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

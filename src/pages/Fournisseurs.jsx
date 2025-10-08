import { useState } from 'react';
import { useApp } from '../context/AppContext';
import Modal from '../components/Modal';
import Input from '../components/Input';
import Button from '../components/Button';

export default function Fournisseurs() {
  const { fournisseurs, ajouterFournisseur, modifierFournisseur, supprimerFournisseur } = useApp();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingFournisseur, setEditingFournisseur] = useState(null);
  const [formData, setFormData] = useState({
    nom: '',
    email: '',
    telephone: '',
    adresse: '',
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editingFournisseur) {
      modifierFournisseur(editingFournisseur.id, formData);
    } else {
      ajouterFournisseur(formData);
    }
    resetForm();
  };

  const resetForm = () => {
    setFormData({
      nom: '',
      email: '',
      telephone: '',
      adresse: '',
    });
    setEditingFournisseur(null);
    setIsModalOpen(false);
  };

  const handleEdit = (fournisseur) => {
    setEditingFournisseur(fournisseur);
    setFormData(fournisseur);
    setIsModalOpen(true);
  };

  const handleDelete = (id) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce fournisseur ?')) {
      supprimerFournisseur(id);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Fournisseurs</h1>
        <Button onClick={() => setIsModalOpen(true)}>
          + Ajouter un Fournisseur
        </Button>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Nom
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Email
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Téléphone
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Adresse
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {fournisseurs.length > 0 ? (
              fournisseurs.map((fournisseur) => (
                <tr key={fournisseur.id}>
                  <td className="px-6 py-4 whitespace-nowrap font-medium">{fournisseur.nom}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{fournisseur.email}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{fournisseur.telephone}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{fournisseur.adresse}</td>
                  <td className="px-6 py-4 whitespace-nowrap space-x-2">
                    <Button variant="secondary" onClick={() => handleEdit(fournisseur)} className="text-sm">
                      Modifier
                    </Button>
                    <Button variant="danger" onClick={() => handleDelete(fournisseur.id)} className="text-sm">
                      Supprimer
                    </Button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" className="px-6 py-8 text-center text-gray-500 dark:text-gray-400">
                  Aucun fournisseur enregistré
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <Modal 
        isOpen={isModalOpen} 
        onClose={resetForm}
        title={editingFournisseur ? 'Modifier le Fournisseur' : 'Ajouter un Fournisseur'}
      >
        <form onSubmit={handleSubmit}>
          <Input
            label="Nom du fournisseur"
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
          <Input
            label="Téléphone"
            type="tel"
            value={formData.telephone}
            onChange={(e) => setFormData({ ...formData, telephone: e.target.value })}
            required
          />
          <Input
            label="Adresse"
            value={formData.adresse}
            onChange={(e) => setFormData({ ...formData, adresse: e.target.value })}
            required
          />
          <div className="flex gap-3 mt-6">
            <Button type="submit" className="flex-1">
              {editingFournisseur ? 'Modifier' : 'Ajouter'}
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

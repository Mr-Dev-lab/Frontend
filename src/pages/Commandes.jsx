import { useState } from 'react';
import { useApp } from '../context/AppContext';
import Modal from '../components/Modal';
import Input from '../components/Input';
import Select from '../components/Select';
import Button from '../components/Button';

export default function Commandes() {
  const { commandes, produits, fournisseurs, ajouterCommande, modifierCommande, supprimerCommande } = useApp();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    produitId: '',
    fournisseurId: '',
    quantite: '',
    statut: 'En attente',
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    const produit = produits.find(p => p.id === formData.produitId);
    const fournisseur = fournisseurs.find(f => f.id === formData.fournisseurId);
    
    ajouterCommande({
      ...formData,
      produitNom: produit?.nom || 'Inconnu',
      fournisseurNom: fournisseur?.nom || 'Inconnu',
    });
    resetForm();
  };

  const resetForm = () => {
    setFormData({
      produitId: '',
      fournisseurId: '',
      quantite: '',
      statut: 'En attente',
    });
    setIsModalOpen(false);
  };

  const handleStatutChange = (id, nouveauStatut) => {
    modifierCommande(id, { statut: nouveauStatut });
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const getStatutColor = (statut) => {
    switch (statut) {
      case 'En attente':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'En cours':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'Livrée':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'Annulée':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Commandes</h1>
        <Button onClick={() => setIsModalOpen(true)}>
          + Nouvelle Commande
        </Button>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Date
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Produit
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Fournisseur
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Quantité
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Statut
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {commandes.length > 0 ? (
              commandes.map((commande) => (
                <tr key={commande.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    {formatDate(commande.dateCommande)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">{commande.produitNom}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{commande.fournisseurNom}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{commande.quantite}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <select
                      value={commande.statut}
                      onChange={(e) => handleStatutChange(commande.id, e.target.value)}
                      className={`px-2 py-1 rounded text-sm ${getStatutColor(commande.statut)}`}
                    >
                      <option value="En attente">En attente</option>
                      <option value="En cours">En cours</option>
                      <option value="Livrée">Livrée</option>
                      <option value="Annulée">Annulée</option>
                    </select>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Button 
                      variant="danger" 
                      onClick={() => {
                        if (confirm('Supprimer cette commande ?')) supprimerCommande(commande.id);
                      }}
                      className="text-sm"
                    >
                      Supprimer
                    </Button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6" className="px-6 py-8 text-center text-gray-500 dark:text-gray-400">
                  Aucune commande enregistrée
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <Modal 
        isOpen={isModalOpen} 
        onClose={resetForm}
        title="Nouvelle Commande"
      >
        <form onSubmit={handleSubmit}>
          <Select
            label="Produit"
            value={formData.produitId}
            onChange={(e) => setFormData({ ...formData, produitId: e.target.value })}
            options={produits.map(p => ({ value: p.id, label: p.nom }))}
            required
          />
          <Select
            label="Fournisseur"
            value={formData.fournisseurId}
            onChange={(e) => setFormData({ ...formData, fournisseurId: e.target.value })}
            options={fournisseurs.map(f => ({ value: f.id, label: f.nom }))}
            required
          />
          <Input
            label="Quantité"
            type="number"
            value={formData.quantite}
            onChange={(e) => setFormData({ ...formData, quantite: e.target.value })}
            required
            min="1"
          />
          <div className="flex gap-3 mt-6">
            <Button type="submit" className="flex-1">
              Créer la Commande
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

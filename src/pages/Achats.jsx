import { useState } from 'react';
import { useApp } from '../context/AppContext';
import Modal from '../components/Modal';
import Input from '../components/Input';
import Select from '../components/Select';
import Button from '../components/Button';
import SearchBar from '../components/SearchBar';
import { formatPrice, formatDate } from '../utils/formatters';

export default function Achats() {
  const { achats, produits, fournisseurs, ajouterAchat, supprimerAchat } = useApp();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState({
    produitId: '',
    fournisseurId: '',
    quantite: '',
    prixUnitaire: '',
    prixTotal: '',
  });

  // Filtrer les achats selon la recherche
  const achatsFiltres = achats.filter(achat =>
    achat.produitNom?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    achat.fournisseurNom?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSubmit = (e) => {
    e.preventDefault();
    const produit = produits.find(p => p.id === formData.produitId);
    const fournisseur = fournisseurs.find(f => f.id === formData.fournisseurId);
    
    ajouterAchat({
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
      prixUnitaire: '',
      prixTotal: '',
    });
    setIsModalOpen(false);
  };

  const handleQuantiteChange = (quantite) => {
    const prixUnitaire = parseFloat(formData.prixUnitaire) || 0;
    const total = (parseFloat(quantite) || 0) * prixUnitaire;
    setFormData({ ...formData, quantite, prixTotal: total.toFixed(2) });
  };

  const handlePrixUnitaireChange = (prixUnitaire) => {
    const quantite = parseFloat(formData.quantite) || 0;
    const total = quantite * (parseFloat(prixUnitaire) || 0);
    setFormData({ ...formData, prixUnitaire, prixTotal: total.toFixed(2) });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Achats</h1>
        <Button onClick={() => setIsModalOpen(true)}>
          + Nouvel Achat
        </Button>
      </div>

      <SearchBar
        value={searchTerm}
        onChange={setSearchTerm}
        placeholder="Rechercher un achat par produit ou fournisseur..."
      />

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
                Prix Unitaire
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Total
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {achatsFiltres.length > 0 ? (
              achatsFiltres.map((achat) => (
                <tr key={achat.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    {formatDate(achat.dateAchat)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">{achat.produitNom}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{achat.fournisseurNom}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{achat.quantite}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{formatPrice(achat.prixUnitaire)}</td>
                  <td className="px-6 py-4 whitespace-nowrap font-semibold">{formatPrice(achat.prixTotal)}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Button 
                      variant="danger" 
                      onClick={() => {
                        if (confirm('Supprimer cet achat ?')) supprimerAchat(achat.id);
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
                <td colSpan="7" className="px-6 py-8 text-center text-gray-500 dark:text-gray-400">
                  {searchTerm ? 'Aucun achat trouvé pour cette recherche' : 'Aucun achat enregistré'}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <Modal 
        isOpen={isModalOpen} 
        onClose={resetForm}
        title="Nouvel Achat"
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
            onChange={(e) => handleQuantiteChange(e.target.value)}
            required
            min="1"
          />
          <Input
            label="Prix unitaire (FCFA)"
            type="number"
            step="0.01"
            value={formData.prixUnitaire}
            onChange={(e) => handlePrixUnitaireChange(e.target.value)}
            required
          />
          <Input
            label="Prix total (FCFA)"
            type="number"
            step="0.01"
            value={formData.prixTotal}
            onChange={(e) => setFormData({ ...formData, prixTotal: e.target.value })}
            required
          />
          <div className="flex gap-3 mt-6">
            <Button type="submit" className="flex-1">
              Enregistrer
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

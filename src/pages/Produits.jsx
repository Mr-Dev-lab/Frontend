import { useState } from 'react';
import { useApp } from '../context/AppContext';
import Modal from '../components/Modal';
import Input from '../components/Input';
import Button from '../components/Button';
import SearchBar from '../components/SearchBar';
import { formatPrice } from '../utils/formatters';
import BarcodeGenerator from '../components/BarcodeGenerator';
import ProductImport from '../components/ProductImport';
import { exportToExcel } from '../utils/importExportUtils';
import Notification from '../components/Notification';

export default function Produits() {
  const { produits, ajouterProduit, modifierProduit, supprimerProduit } = useApp();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduit, setEditingProduit] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showBarcodeModal, setShowBarcodeModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showImportModal, setShowImportModal] = useState(false);
  const [notification, setNotification] = useState(null);
  const [formData, setFormData] = useState({
    nom: '',
    categorie: '',
    prixAchat: '',
    prixVente: '',
    stock: '0',
    seuilAlerte: '10',
    description: '',
    codeBarre: ''
  });

  // Filtrer les produits selon la recherche
  const produitsFiltres = produits.filter(produit =>
    produit.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
    produit.categorie?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    produit.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editingProduit) {
      modifierProduit(editingProduit.id, formData);
    } else {
      ajouterProduit(formData);
    }
    resetForm();
  };

  const resetForm = () => {
    setFormData({
      nom: '',
      categorie: '',
      prixAchat: '',
      prixVente: '',
      stock: '0',
      seuilAlerte: '10',
      description: '',
      codeBarre: ''
    });
    setEditingProduit(null);
    setIsModalOpen(false);
  };

  const handleEdit = (produit) => {
    setEditingProduit(produit);
    setFormData(produit);
    setIsModalOpen(true);
  };

  const handleDelete = (id) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce produit ?')) {
      supprimerProduit(id);
    }
  };

  const handleShowBarcode = (produit) => {
    setSelectedProduct(produit);
    setShowBarcodeModal(true);
  };

  const handleExportExcel = () => {
    const dataToExport = produits.map(p => ({
      Nom: p.nom,
      Catégorie: p.categorie,
      Description: p.description,
      'Prix Achat': p.prixAchat,
      'Prix Vente': p.prixVente,
      Stock: p.stock,
      'Seuil Alerte': p.seuilAlerte,
      'Code-Barres': p.codeBarre || ''
    }));
    exportToExcel(dataToExport, 'produits', 'Liste des Produits');
    setNotification({ type: 'success', message: 'Export Excel réussi !' });
  };

  const handleImportProducts = async (products) => {
    try {
      let successCount = 0;
      for (const product of products) {
        await ajouterProduit(product);
        successCount++;
      }
      setNotification({
        type: 'success',
        message: `${successCount} produit(s) importé(s) avec succès !`
      });
      setShowImportModal(false);
    } catch (error) {
      setNotification({
        type: 'error',
        message: `Erreur lors de l'import: ${error.message}`
      });
    }
  };
  return (
    <div className="space-y-6">
      {notification && (
        <Notification
          message={notification.message}
          type={notification.type}
          onClose={() => setNotification(null)}
        />
      )}

      <div className="flex justify-between items-center flex-wrap gap-3">
        <h1 className="text-3xl font-bold">Produits</h1>
        <div className="flex gap-2">
          <Button variant="secondary" onClick={() => setShowImportModal(true)}>
            📥 Importer
          </Button>
          <Button variant="secondary" onClick={handleExportExcel}>
            📊 Export Excel
          </Button>
          <Button onClick={() => setIsModalOpen(true)}>
            + Nouveau Produit
          </Button>
        </div>
      </div>

      <SearchBar
        value={searchTerm}
        onChange={setSearchTerm}
        placeholder="Rechercher un produit par nom, catégorie ou description..."
      />

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Nom
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Catégorie
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Prix Achat
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Prix Vente
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Stock
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {produitsFiltres.length > 0 ? (
              produitsFiltres.map((produit) => (
                <tr key={produit.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="font-medium">{produit.nom}</div>
                    {produit.description && (
                      <div className="text-sm text-gray-500 dark:text-gray-400">{produit.description}</div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">{produit.categorie}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{formatPrice(produit.prixAchat)}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{formatPrice(produit.prixVente)}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 rounded text-sm ${
                      parseInt(produit.stock) <= parseInt(produit.seuilAlerte || 10) 
                        ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' 
                        : 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                    }`}>
                      {produit.stock}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap space-x-2">
                    <Button variant="secondary" onClick={() => handleShowBarcode(produit)} className="text-sm">
                      🏷️ Code-barres
                    </Button>
                    <Button variant="secondary" onClick={() => handleEdit(produit)} className="text-sm">
                      Modifier
                    </Button>
                    <Button variant="danger" onClick={() => handleDelete(produit.id)} className="text-sm">
                      Supprimer
                    </Button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6" className="px-6 py-8 text-center text-gray-500 dark:text-gray-400">
                  {searchTerm ? 'Aucun produit trouvé pour cette recherche' : 'Aucun produit enregistré'}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <Modal 
        isOpen={isModalOpen} 
        onClose={resetForm}
        title={editingProduit ? 'Modifier le Produit' : 'Ajouter un Produit'}
      >
        <form onSubmit={handleSubmit}>
          <Input
            label="Nom du produit"
            value={formData.nom}
            onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
            required
          />
          <Input
            label="Catégorie"
            value={formData.categorie}
            onChange={(e) => setFormData({ ...formData, categorie: e.target.value })}
            required
          />
          <Input
            label="Prix d'achat (FCFA)"
            type="number"
            step="0.01"
            value={formData.prixAchat}
            onChange={(e) => setFormData({ ...formData, prixAchat: e.target.value })}
            required
          />
          <Input
            label="Prix de vente (FCFA)"
            type="number"
            step="0.01"
            value={formData.prixVente}
            onChange={(e) => setFormData({ ...formData, prixVente: e.target.value })}
            required
          />
          <Input
            label="Stock initial"
            type="number"
            value={formData.stock}
            onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
            required
          />
          <Input
            label="Seuil d'alerte (stock minimum)"
            type="number"
            value={formData.seuilAlerte}
            onChange={(e) => setFormData({ ...formData, seuilAlerte: e.target.value })}
            required
            min="0"
            placeholder="Ex: 10"
          />
          <Input
            label="Description"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          />
          <Input
            label="Code-barres (optionnel)"
            value={formData.codeBarre}
            onChange={(e) => setFormData({ ...formData, codeBarre: e.target.value })}
            placeholder="Laissez vide pour génération automatique"
          />
          <div className="flex gap-3 mt-6">
            <Button type="submit" className="flex-1">
              {editingProduit ? 'Modifier' : 'Ajouter'}
            </Button>
            <Button type="button" variant="secondary" onClick={resetForm} className="flex-1">
              Annuler
            </Button>
          </div>
        </form>
      </Modal>

      {/* Modal Code-barres */}
      {showBarcodeModal && selectedProduct && (
        <Modal
          isOpen={showBarcodeModal}
          onClose={() => setShowBarcodeModal(false)}
          title={`Code-barres - ${selectedProduct.nom}`}
        >
          <BarcodeGenerator
            value={selectedProduct.codeBarre || selectedProduct.id.toString()}
            productName={selectedProduct.nom}
          />
        </Modal>
      )}

      {/* Modal Import */}
      {showImportModal && (
        <ProductImport
          onImport={handleImportProducts}
          onClose={() => setShowImportModal(false)}
        />
      )}
    </div>
  );
}

import { useState } from 'react';
import { useApp } from '../context/AppContext';
import Modal from '../components/Modal';
import Input from '../components/Input';
import Select from '../components/Select';
import Button from '../components/Button';
import SearchBar from '../components/SearchBar';
import Notification from '../components/Notification';
import BarcodeScanner from '../components/BarcodeScanner';
import { formatPrice, formatDate } from '../utils/formatters';
import { generateTicketReceipt, printReceipt } from '../utils/receiptGenerator';
import { downloadInvoice } from '../utils/invoiceGenerator';

export default function Ventes() {
  const { ventes, produits, ajouterVente, supprimerVente } = useApp();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [notification, setNotification] = useState(null);
  const [showScanner, setShowScanner] = useState(false);
  const [formData, setFormData] = useState({
    produitId: '',
    quantite: '',
    prixUnitaire: '',
    prixTotal: '',
    client: '',
  });

  // Debug désactivé
  // if (produits.length > 0 && !window.produitsLogged) {
  //   console.log('Premier produit complet:', produits[0]);
  //   window.produitsLogged = true;
  // }

  // Filtrer les ventes selon la recherche
  const ventesFiltrees = ventes.filter(vente =>
    vente.produitNom?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    vente.client?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    vente.clientNom?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    const produit = produits.find(p => p.id == formData.produitId);
    
    // Vérifier le stock
    if (produit && parseInt(produit.stock) < parseInt(formData.quantite)) {
      setNotification({
        type: 'error',
        message: `Stock insuffisant ! Stock disponible : ${produit.stock} unités. Vous essayez de vendre ${formData.quantite} unités.`
      });
      return;
    }
    
    try {
      const nouvelleVente = await ajouterVente({
        ...formData,
        produitNom: produit?.nom || 'Inconnu',
      });
      
      setNotification({
        type: 'success',
        message: 'Vente enregistrée avec succès !'
      });
      
      // Imprimer automatiquement le reçu
      handlePrintReceipt(nouvelleVente || formData, produit);
      
      resetForm();
    } catch (error) {
      setNotification({
        type: 'error',
        message: error.message || 'Erreur lors de l\'enregistrement de la vente'
      });
    }
  };

  const handlePrintReceipt = (vente, produit) => {
    // Récupérer les infos entreprise depuis localStorage (ou utiliser des valeurs par défaut)
    const entreprise = JSON.parse(localStorage.getItem('entreprise_info') || '{}');
    
    const { html } = generateTicketReceipt(vente, produit, entreprise);
    printReceipt(html);
  };

  const handleDownloadInvoice = (vente, produit) => {
    const entreprise = JSON.parse(localStorage.getItem('entreprise_info') || '{}');
    const client = { nom: vente.client || vente.clientNom };
    downloadInvoice(vente, produit, client, entreprise);
  };

  const handleBarcodeScanned = (barcode) => {
    // Chercher le produit par code-barres
    const produit = produits.find(p => 
      p.codeBarre === barcode || 
      p.code_barre === barcode ||
      p.id.toString() === barcode
    );

    if (produit) {
      setShowScanner(false);
      setIsModalOpen(true);
      
      // Pré-remplir le formulaire avec le produit scanné
      const prixUnitaire = parseFloat(produit.prixVente || produit.prix_vente || 0);
      setFormData({
        ...formData,
        produitId: produit.id,
        prixUnitaire: prixUnitaire.toFixed(2),
        quantite: '1',
        prixTotal: prixUnitaire.toFixed(2)
      });

      setNotification({
        type: 'success',
        message: `Produit trouvé : ${produit.nom}`
      });
    } else {
      setNotification({
        type: 'error',
        message: `Aucun produit trouvé avec le code-barres : ${barcode}`
      });
    }
  };

  const resetForm = () => {
    setFormData({
      produitId: '',
      quantite: '',
      prixUnitaire: '',
      prixTotal: '',
      client: '',
    });
    setIsModalOpen(false);
  };

  const handleProduitChange = (produitId) => {
    const produit = produits.find(p => p.id == produitId);
    
    if (produit) {
      const prixUnitaire = parseFloat(
        produit.prixVente || 
        produit.prix_vente || 
        0
      );
      const quantite = parseFloat(formData.quantite) || 0;
      const total = quantite * prixUnitaire;
      
      setFormData({ 
        ...formData,
        produitId, 
        prixUnitaire: prixUnitaire.toFixed(2),
        prixTotal: total.toFixed(2)
      });
    } else {
      setFormData({ ...formData, produitId, prixUnitaire: '', prixTotal: '' });
    }
  };

  const handleQuantiteChange = (quantite) => {
    const prixUnitaire = parseFloat(formData.prixUnitaire) || 0;
    const total = (parseFloat(quantite) || 0) * prixUnitaire;
    setFormData({ ...formData, quantite, prixTotal: total.toFixed(2) });
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
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Ventes</h1>
        <div className="flex gap-2">
          <Button variant="secondary" onClick={() => setShowScanner(true)}>
            📷 Scanner Code-Barres
          </Button>
          <Button onClick={() => setIsModalOpen(true)}>
            + Nouvelle Vente
          </Button>
        </div>
      </div>

      <SearchBar
        value={searchTerm}
        onChange={setSearchTerm}
        placeholder="Rechercher une vente par produit ou client..."
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
                Client
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
            {ventesFiltrees.length > 0 ? (
              ventesFiltrees.map((vente) => (
                <tr key={vente.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    {formatDate(vente.dateVente)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">{vente.produitNom}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{vente.client || 'N/A'}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{vente.quantite}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{formatPrice(vente.prixUnitaire)}</td>
                  <td className="px-6 py-4 whitespace-nowrap font-semibold text-green-600">{formatPrice(vente.prixTotal)}</td>
                  <td className="px-6 py-4 whitespace-nowrap space-x-2">
                    <Button 
                      variant="secondary"
                      onClick={() => {
                        const produit = produits.find(p => p.id === vente.produitId);
                        if (produit) handlePrintReceipt(vente, produit);
                      }}
                      className="text-sm"
                    >
                      🖨️ Reçu
                    </Button>
                    <Button 
                      variant="primary"
                      onClick={() => {
                        const produit = produits.find(p => p.id === vente.produitId);
                        if (produit) handleDownloadInvoice(vente, produit);
                      }}
                      className="text-sm"
                    >
                      📄 Facture PDF
                    </Button>
                    <Button 
                      variant="danger" 
                      onClick={() => {
                        if (confirm('Supprimer cette vente ?')) supprimerVente(vente.id);
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
                  {searchTerm ? 'Aucune vente trouvée pour cette recherche' : 'Aucune vente enregistrée'}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <Modal 
        isOpen={isModalOpen} 
        onClose={resetForm}
        title="Nouvelle Vente"
      >
        <form onSubmit={handleSubmit}>
          <Select
            label="Produit"
            value={formData.produitId}
            onChange={(e) => handleProduitChange(e.target.value)}
            options={produits.map(p => ({ 
              value: p.id, 
              label: `${p.nom} (Stock: ${p.stock})` 
            }))}
            required
          />
          <Input
            label="Client"
            value={formData.client}
            onChange={(e) => setFormData({ ...formData, client: e.target.value })}
            placeholder="Nom du client (optionnel)"
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
            onChange={(e) => setFormData({ ...formData, prixUnitaire: e.target.value })}
            readOnly
          />
          <Input
            label="Prix total (FCFA)"
            type="number"
            step="0.01"
            value={formData.prixTotal}
            onChange={(e) => setFormData({ ...formData, prixTotal: e.target.value })}
            required
            readOnly
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

      {/* Modal Scanner Code-Barres */}
      {showScanner && (
        <Modal
          isOpen={showScanner}
          onClose={() => setShowScanner(false)}
          title="Scanner un Code-Barres"
        >
          <BarcodeScanner
            onScan={handleBarcodeScanned}
            onClose={() => setShowScanner(false)}
          />
        </Modal>
      )}
    </div>
  );
}

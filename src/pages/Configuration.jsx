import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import Input from '../components/Input';
import Button from '../components/Button';
import Notification from '../components/Notification';

export default function Configuration() {
  const { isAdmin } = useAuth();
  const [notification, setNotification] = useState(null);
  const [formData, setFormData] = useState({
    nom_entreprise: '',
    adresse: '',
    telephone: '',
    email: '',
    nif: '',
    rccm: '',
    tva: '19',
  });

  useEffect(() => {
    // Charger les infos depuis localStorage
    const savedInfo = localStorage.getItem('entreprise_info');
    if (savedInfo) {
      setFormData(JSON.parse(savedInfo));
    }
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    
    try {
      // Sauvegarder dans localStorage
      localStorage.setItem('entreprise_info', JSON.stringify(formData));
      
      setNotification({
        type: 'success',
        message: 'Configuration enregistrée avec succès !'
      });
    } catch (error) {
      setNotification({
        type: 'error',
        message: 'Erreur lors de l\'enregistrement'
      });
    }
  };

  const handleReset = () => {
    if (confirm('Êtes-vous sûr de vouloir réinitialiser la configuration ?')) {
      localStorage.removeItem('entreprise_info');
      setFormData({
        nom_entreprise: '',
        adresse: '',
        telephone: '',
        email: '',
        nif: '',
        rccm: '',
        tva: '19',
      });
      setNotification({
        type: 'success',
        message: 'Configuration réinitialisée'
      });
    }
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
    <div className="space-y-6 max-w-4xl mx-auto">
      {notification && (
        <Notification
          message={notification.message}
          type={notification.type}
          onClose={() => setNotification(null)}
        />
      )}

      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Configuration Entreprise</h1>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          Ces informations apparaîtront sur les reçus imprimés lors des ventes.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <Input
                label="Nom de l'entreprise"
                value={formData.nom_entreprise}
                onChange={(e) => setFormData({ ...formData, nom_entreprise: e.target.value })}
                placeholder="Ex: PHARMACIE CENTRALE"
                required
              />
            </div>

            <div className="md:col-span-2">
              <Input
                label="Adresse complète"
                value={formData.adresse}
                onChange={(e) => setFormData({ ...formData, adresse: e.target.value })}
                placeholder="Ex: 123 Avenue de la République, Yaoundé"
              />
            </div>

            <Input
              label="Téléphone"
              type="tel"
              value={formData.telephone}
              onChange={(e) => setFormData({ ...formData, telephone: e.target.value })}
              placeholder="Ex: +237 6XX XX XX XX"
            />

            <Input
              label="Email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="Ex: contact@entreprise.com"
            />

            <Input
              label="NIF (Numéro d'Identification Fiscale)"
              value={formData.nif}
              onChange={(e) => setFormData({ ...formData, nif: e.target.value })}
              placeholder="Ex: M012345678901X"
            />

            <Input
              label="RCCM (Registre du Commerce)"
              value={formData.rccm}
              onChange={(e) => setFormData({ ...formData, rccm: e.target.value })}
              placeholder="Ex: RC/YAO/2024/B/1234"
            />

            <Input
              label="Taux de TVA (%)"
              type="number"
              step="0.01"
              value={formData.tva}
              onChange={(e) => setFormData({ ...formData, tva: e.target.value })}
              placeholder="Ex: 19"
            />
          </div>

          <div className="flex gap-3 mt-6 pt-6 border-t">
            <Button type="submit" className="flex-1">
              💾 Enregistrer la Configuration
            </Button>
            <Button type="button" variant="danger" onClick={handleReset}>
              🔄 Réinitialiser
            </Button>
          </div>
        </form>
      </div>

      {/* Aperçu du reçu */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h2 className="text-xl font-bold mb-4">Aperçu du Reçu</h2>
        <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded border-2 border-dashed border-gray-300 dark:border-gray-700">
          <div className="font-mono text-sm space-y-1 text-center">
            <div className="font-bold text-lg">{formData.nom_entreprise || '[NOM ENTREPRISE]'}</div>
            {formData.adresse && <div className="text-xs">{formData.adresse}</div>}
            {formData.telephone && <div className="text-xs">Tél: {formData.telephone}</div>}
            {formData.email && <div className="text-xs">{formData.email}</div>}
            {formData.nif && <div className="text-xs">NIF: {formData.nif}</div>}
            {formData.rccm && <div className="text-xs">RCCM: {formData.rccm}</div>}
            <div className="border-t border-dashed border-gray-400 my-2"></div>
            <div className="text-xs">Reçu N°: REC241004-0001</div>
            <div className="text-xs">Date: 04/10/2025 18:30</div>
            <div className="border-t border-dashed border-gray-400 my-2"></div>
            <div className="text-left">
              <div className="font-bold">Produit Exemple</div>
              <div className="flex justify-between text-xs">
                <span>2 x 1,000 FCFA</span>
                <span>2,000 FCFA</span>
              </div>
            </div>
            <div className="border-t border-dashed border-gray-400 my-2"></div>
            <div className="flex justify-between text-xs">
              <span>Sous-total HT:</span>
              <span>2,000 FCFA</span>
            </div>
            <div className="flex justify-between text-xs">
              <span>TVA ({formData.tva}%):</span>
              <span>{(2000 * parseFloat(formData.tva || 0) / 100).toFixed(0)} FCFA</span>
            </div>
            <div className="flex justify-between font-bold border-t border-gray-400 pt-1">
              <span>TOTAL TTC:</span>
              <span>{(2000 * (1 + parseFloat(formData.tva || 0) / 100)).toFixed(0)} FCFA</span>
            </div>
            <div className="border-t border-dashed border-gray-400 my-2"></div>
            <div className="font-bold">MERCI DE VOTRE VISITE !</div>
            <div className="text-xs">À bientôt</div>
          </div>
        </div>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-4">
          ℹ️ Ceci est un aperçu. Le reçu réel sera imprimé lors des ventes.
        </p>
      </div>
    </div>
  );
}

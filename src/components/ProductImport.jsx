import { useState } from 'react';
import Button from './Button';
import Modal from './Modal';
import { importFromCSV, importFromExcel, validateProductData, downloadTemplate } from '../utils/importExportUtils';

export default function ProductImport({ onImport, onClose }) {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState(null);
  const [errors, setErrors] = useState([]);

  const handleFileChange = async (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) return;

    setFile(selectedFile);
    setErrors([]);
    setPreview(null);

    try {
      setLoading(true);
      let data;

      if (selectedFile.name.endsWith('.csv')) {
        data = await importFromCSV(selectedFile);
      } else if (selectedFile.name.endsWith('.xlsx') || selectedFile.name.endsWith('.xls')) {
        data = await importFromExcel(selectedFile);
      } else {
        throw new Error('Format de fichier non supporté. Utilisez CSV ou Excel.');
      }

      const { validProducts, errors: validationErrors } = validateProductData(data);
      
      setPreview(validProducts);
      setErrors(validationErrors);
    } catch (error) {
      setErrors([{ row: 0, product: 'Fichier', errors: [error.message] }]);
    } finally {
      setLoading(false);
    }
  };

  const handleImport = () => {
    if (preview && preview.length > 0) {
      onImport(preview);
    }
  };

  return (
    <Modal isOpen={true} onClose={onClose} title="Importer des produits">
      <div className="space-y-4">
        {/* Télécharger le template */}
        <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded">
          <p className="text-sm mb-2">
            Besoin d'un modèle ? Téléchargez le template CSV :
          </p>
          <Button 
            variant="secondary" 
            onClick={() => downloadTemplate('produits')}
            className="text-sm"
          >
            📥 Télécharger le template
          </Button>
        </div>

        {/* Sélection du fichier */}
        <div>
          <label className="block text-sm font-medium mb-2">
            Sélectionner un fichier (CSV ou Excel)
          </label>
          <input
            type="file"
            accept=".csv,.xlsx,.xls"
            onChange={handleFileChange}
            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
          />
        </div>

        {/* Chargement */}
        {loading && (
          <div className="text-center py-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-sm text-gray-600">Analyse du fichier...</p>
          </div>
        )}

        {/* Erreurs */}
        {errors.length > 0 && (
          <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded max-h-60 overflow-y-auto">
            <h4 className="font-semibold text-red-800 dark:text-red-200 mb-2">
              ⚠️ Erreurs détectées ({errors.length})
            </h4>
            <ul className="text-sm space-y-2">
              {errors.map((error, index) => (
                <li key={index} className="text-red-700 dark:text-red-300">
                  <strong>Ligne {error.row}</strong> - {error.product}: {error.errors.join(', ')}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Aperçu */}
        {preview && preview.length > 0 && (
          <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded">
            <h4 className="font-semibold text-green-800 dark:text-green-200 mb-2">
              ✅ {preview.length} produit(s) prêt(s) à être importé(s)
            </h4>
            <div className="max-h-40 overflow-y-auto">
              <ul className="text-sm space-y-1">
                {preview.slice(0, 5).map((product, index) => (
                  <li key={index} className="text-green-700 dark:text-green-300">
                    • {product.nom} - {product.categorie} - Stock: {product.stock}
                  </li>
                ))}
                {preview.length > 5 && (
                  <li className="text-green-600 dark:text-green-400 italic">
                    ... et {preview.length - 5} autre(s)
                  </li>
                )}
              </ul>
            </div>
          </div>
        )}

        {/* Boutons d'action */}
        <div className="flex gap-3 mt-6">
          <Button
            onClick={handleImport}
            disabled={!preview || preview.length === 0 || loading}
            className="flex-1"
          >
            Importer {preview ? `(${preview.length})` : ''}
          </Button>
          <Button
            variant="secondary"
            onClick={onClose}
            className="flex-1"
          >
            Annuler
          </Button>
        </div>

        {/* Instructions */}
        <div className="text-xs text-gray-600 dark:text-gray-400 mt-4">
          <p className="font-semibold mb-1">Format attendu :</p>
          <ul className="list-disc list-inside space-y-1">
            <li>nom, categorie, description, prix_achat, prix_vente, stock, seuil_alerte, code_barre</li>
            <li>Les prix doivent être en FCFA (nombres uniquement)</li>
            <li>Le stock doit être un nombre entier positif</li>
          </ul>
        </div>
      </div>
    </Modal>
  );
}

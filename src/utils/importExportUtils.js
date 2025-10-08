import * as XLSX from 'xlsx';
import Papa from 'papaparse';

/**
 * Export vers Excel avec formatage avancé
 */
export const exportToExcel = (data, filename, sheetName = 'Données') => {
  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  
  // Ajuster la largeur des colonnes
  const maxWidth = 50;
  const colWidths = Object.keys(data[0] || {}).map(key => ({
    wch: Math.min(
      Math.max(
        key.length,
        ...data.map(row => String(row[key] || '').length)
      ),
      maxWidth
    )
  }));
  worksheet['!cols'] = colWidths;
  
  XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
  XLSX.writeFile(workbook, `${filename}_${new Date().toISOString().split('T')[0]}.xlsx`);
};

/**
 * Import depuis CSV avec validation
 */
export const importFromCSV = (file) => {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        if (results.errors.length > 0) {
          reject(new Error(`Erreurs dans le fichier: ${results.errors[0].message}`));
          return;
        }
        resolve(results.data);
      },
      error: (error) => {
        reject(error);
      }
    });
  });
};

/**
 * Import depuis Excel
 */
export const importFromExcel = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
        const jsonData = XLSX.utils.sheet_to_json(firstSheet);
        resolve(jsonData);
      } catch (error) {
        reject(error);
      }
    };
    
    reader.onerror = () => reject(new Error('Erreur de lecture du fichier'));
    reader.readAsArrayBuffer(file);
  });
};

/**
 * Valider les données de produits importés
 */
export const validateProductData = (products) => {
  const errors = [];
  const validProducts = [];
  
  products.forEach((product, index) => {
    const rowErrors = [];
    
    // Validation des champs obligatoires
    if (!product.nom || product.nom.trim() === '') {
      rowErrors.push('Nom manquant');
    }
    
    if (!product.categorie || product.categorie.trim() === '') {
      rowErrors.push('Catégorie manquante');
    }
    
    // Validation des nombres
    const prixAchat = parseFloat(product.prix_achat || product.prixAchat);
    const prixVente = parseFloat(product.prix_vente || product.prixVente);
    const stock = parseInt(product.stock);
    
    if (isNaN(prixAchat) || prixAchat < 0) {
      rowErrors.push('Prix d\'achat invalide');
    }
    
    if (isNaN(prixVente) || prixVente < 0) {
      rowErrors.push('Prix de vente invalide');
    }
    
    if (isNaN(stock) || stock < 0) {
      rowErrors.push('Stock invalide');
    }
    
    if (prixVente < prixAchat) {
      rowErrors.push('Prix de vente inférieur au prix d\'achat');
    }
    
    if (rowErrors.length > 0) {
      errors.push({
        row: index + 2, // +2 car ligne 1 = en-têtes
        product: product.nom || 'Sans nom',
        errors: rowErrors
      });
    } else {
      validProducts.push({
        nom: product.nom.trim(),
        categorie: product.categorie.trim(),
        description: product.description || '',
        prix_achat: prixAchat,
        prix_vente: prixVente,
        stock: stock,
        seuil_alerte: parseInt(product.seuil_alerte || 10),
        code_barre: product.code_barre || product.codeBarre || '',
      });
    }
  });
  
  return { validProducts, errors };
};

/**
 * Télécharger un template CSV pour l'import
 */
export const downloadTemplate = (type = 'produits') => {
  let headers = [];
  let exampleData = [];
  
  if (type === 'produits') {
    headers = ['nom', 'categorie', 'description', 'prix_achat', 'prix_vente', 'stock', 'seuil_alerte', 'code_barre'];
    exampleData = [
      {
        nom: 'Exemple Produit 1',
        categorie: 'Électronique',
        description: 'Description du produit',
        prix_achat: 5000,
        prix_vente: 7500,
        stock: 50,
        seuil_alerte: 10,
        code_barre: '1234567890123'
      },
      {
        nom: 'Exemple Produit 2',
        categorie: 'Alimentaire',
        description: 'Autre description',
        prix_achat: 1000,
        prix_vente: 1500,
        stock: 100,
        seuil_alerte: 20,
        code_barre: '9876543210987'
      }
    ];
  }
  
  const csv = Papa.unparse(exampleData, { header: true });
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', `template_${type}_${Date.now()}.csv`);
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

/**
 * Générer un code-barres unique
 */
export const generateUniqueBarcode = () => {
  const timestamp = Date.now().toString().slice(-10);
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  return `${timestamp}${random}`;
};

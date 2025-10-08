// Générateur de reçus/tickets de caisse

import { formatPrice, formatDate } from './formatters';

/**
 * Génère un numéro de reçu unique
 */
export const generateReceiptNumber = () => {
  const date = new Date();
  const year = date.getFullYear().toString().slice(-2);
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  
  return `REC${year}${month}${day}-${random}`;
};

/**
 * Génère un reçu au format ticket de caisse (80mm)
 */
export const generateTicketReceipt = (vente, produit, entreprise = {}) => {
  const {
    nom_entreprise = 'GESTION DE STOCK',
    adresse = '',
    telephone = '',
    email = '',
    nif = '',
    rccm = ''
  } = entreprise;

  const receiptNumber = generateReceiptNumber();
  const now = new Date();
  const dateStr = now.toLocaleDateString('fr-FR');
  const timeStr = now.toLocaleTimeString('fr-FR');

  // Calcul des totaux
  const sousTotal = parseFloat(vente.prixTotal || 0);
  const tauxTVAPourcentage = parseFloat(entreprise.tva || 19);
  const tauxTVA = tauxTVAPourcentage / 100;
  const tva = sousTotal * tauxTVA;
  const totalTTC = sousTotal + tva;

  // Générer le HTML du ticket
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>Reçu ${receiptNumber}</title>
      <style>
        @page {
          size: 80mm auto;
          margin: 0;
        }
        
        body {
          font-family: 'Courier New', monospace;
          font-size: 12px;
          line-height: 1.4;
          margin: 0;
          padding: 10px;
          width: 80mm;
        }
        
        .header {
          text-align: center;
          border-bottom: 2px dashed #000;
          padding-bottom: 10px;
          margin-bottom: 10px;
        }
        
        .company-name {
          font-size: 16px;
          font-weight: bold;
          margin-bottom: 5px;
        }
        
        .company-info {
          font-size: 10px;
          margin: 2px 0;
        }
        
        .receipt-number {
          font-weight: bold;
          margin: 10px 0;
        }
        
        .date-time {
          font-size: 11px;
          margin: 5px 0;
        }
        
        .items {
          border-top: 1px dashed #000;
          border-bottom: 1px dashed #000;
          padding: 10px 0;
          margin: 10px 0;
        }
        
        .item {
          margin: 5px 0;
        }
        
        .item-name {
          font-weight: bold;
        }
        
        .item-details {
          display: flex;
          justify-content: space-between;
          font-size: 11px;
        }
        
        .totals {
          margin: 10px 0;
        }
        
        .total-line {
          display: flex;
          justify-content: space-between;
          margin: 5px 0;
        }
        
        .total-line.grand-total {
          font-size: 14px;
          font-weight: bold;
          border-top: 2px solid #000;
          padding-top: 5px;
          margin-top: 10px;
        }
        
        .footer {
          text-align: center;
          border-top: 2px dashed #000;
          padding-top: 10px;
          margin-top: 10px;
          font-size: 10px;
        }
        
        .thank-you {
          font-weight: bold;
          margin: 10px 0;
        }
        
        @media print {
          body {
            width: 80mm;
          }
        }
      </style>
    </head>
    <body>
      <div class="header">
        <div class="company-name">${nom_entreprise}</div>
        ${adresse ? `<div class="company-info">${adresse}</div>` : ''}
        ${telephone ? `<div class="company-info">Tél: ${telephone}</div>` : ''}
        ${email ? `<div class="company-info">${email}</div>` : ''}
        ${nif ? `<div class="company-info">NIF: ${nif}</div>` : ''}
        ${rccm ? `<div class="company-info">RCCM: ${rccm}</div>` : ''}
      </div>
      
      <div class="receipt-number">Reçu N°: ${receiptNumber}</div>
      <div class="date-time">Date: ${dateStr} ${timeStr}</div>
      ${vente.clientNom ? `<div class="date-time">Client: ${vente.clientNom}</div>` : ''}
      
      <div class="items">
        <div class="item">
          <div class="item-name">${produit.nom}</div>
          <div class="item-details">
            <span>${vente.quantite} x ${formatPrice(vente.prixUnitaire)}</span>
            <span>${formatPrice(vente.prixTotal)}</span>
          </div>
        </div>
      </div>
      
      <div class="totals">
        <div class="total-line">
          <span>Sous-total HT:</span>
          <span>${formatPrice(sousTotal)}</span>
        </div>
        <div class="total-line">
          <span>TVA (${tauxTVAPourcentage}%):</span>
          <span>${formatPrice(tva)}</span>
        </div>
        <div class="total-line grand-total">
          <span>TOTAL TTC:</span>
          <span>${formatPrice(totalTTC)}</span>
        </div>
      </div>
      
      <div class="footer">
        <div class="thank-you">MERCI DE VOTRE VISITE !</div>
        <div>À bientôt</div>
        <div style="margin-top: 10px;">================================</div>
      </div>
    </body>
    </html>
  `;

  return { html, receiptNumber };
};

/**
 * Génère un reçu pour plusieurs articles (panier)
 */
export const generateMultiItemReceipt = (ventes, produits, entreprise = {}) => {
  const {
    nom_entreprise = 'GESTION DE STOCK',
    adresse = '',
    telephone = '',
    email = '',
    nif = '',
    rccm = ''
  } = entreprise;

  const receiptNumber = generateReceiptNumber();
  const now = new Date();
  const dateStr = now.toLocaleDateString('fr-FR');
  const timeStr = now.toLocaleTimeString('fr-FR');

  // Calculer les totaux
  const sousTotal = ventes.reduce((sum, v) => sum + parseFloat(v.prixTotal || 0), 0);
  const tauxTVAPourcentage = parseFloat(entreprise.tva || 19);
  const tauxTVA = tauxTVAPourcentage / 100;
  const tva = sousTotal * tauxTVA;
  const totalTTC = sousTotal + tva;

  // Générer les lignes d'articles
  const itemsHTML = ventes.map(vente => {
    const produit = produits.find(p => p.id === vente.produitId);
    if (!produit) return '';
    
    return `
      <div class="item">
        <div class="item-name">${produit.nom}</div>
        <div class="item-details">
          <span>${vente.quantite} x ${formatPrice(vente.prixUnitaire)}</span>
          <span>${formatPrice(vente.prixTotal)}</span>
        </div>
      </div>
    `;
  }).join('');

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>Reçu ${receiptNumber}</title>
      <style>
        @page { size: 80mm auto; margin: 0; }
        body { font-family: 'Courier New', monospace; font-size: 12px; line-height: 1.4; margin: 0; padding: 10px; width: 80mm; }
        .header { text-align: center; border-bottom: 2px dashed #000; padding-bottom: 10px; margin-bottom: 10px; }
        .company-name { font-size: 16px; font-weight: bold; margin-bottom: 5px; }
        .company-info { font-size: 10px; margin: 2px 0; }
        .receipt-number { font-weight: bold; margin: 10px 0; }
        .date-time { font-size: 11px; margin: 5px 0; }
        .items { border-top: 1px dashed #000; border-bottom: 1px dashed #000; padding: 10px 0; margin: 10px 0; }
        .item { margin: 5px 0; }
        .item-name { font-weight: bold; }
        .item-details { display: flex; justify-content: space-between; font-size: 11px; }
        .totals { margin: 10px 0; }
        .total-line { display: flex; justify-content: space-between; margin: 5px 0; }
        .total-line.grand-total { font-size: 14px; font-weight: bold; border-top: 2px solid #000; padding-top: 5px; margin-top: 10px; }
        .footer { text-align: center; border-top: 2px dashed #000; padding-top: 10px; margin-top: 10px; font-size: 10px; }
        .thank-you { font-weight: bold; margin: 10px 0; }
        @media print { body { width: 80mm; } }
      </style>
    </head>
    <body>
      <div class="header">
        <div class="company-name">${nom_entreprise}</div>
        ${adresse ? `<div class="company-info">${adresse}</div>` : ''}
        ${telephone ? `<div class="company-info">Tél: ${telephone}</div>` : ''}
        ${email ? `<div class="company-info">${email}</div>` : ''}
        ${nif ? `<div class="company-info">NIF: ${nif}</div>` : ''}
        ${rccm ? `<div class="company-info">RCCM: ${rccm}</div>` : ''}
      </div>
      
      <div class="receipt-number">Reçu N°: ${receiptNumber}</div>
      <div class="date-time">Date: ${dateStr} ${timeStr}</div>
      
      <div class="items">
        ${itemsHTML}
      </div>
      
      <div class="totals">
        <div class="total-line">
          <span>Sous-total HT:</span>
          <span>${formatPrice(sousTotal)}</span>
        </div>
        <div class="total-line">
          <span>TVA (${tauxTVAPourcentage}%):</span>
          <span>${formatPrice(tva)}</span>
        </div>
        <div class="total-line grand-total">
          <span>TOTAL TTC:</span>
          <span>${formatPrice(totalTTC)}</span>
        </div>
      </div>
      
      <div class="footer">
        <div class="thank-you">MERCI DE VOTRE VISITE !</div>
        <div>À bientôt</div>
        <div style="margin-top: 10px;">================================</div>
      </div>
    </body>
    </html>
  `;

  return { html, receiptNumber };
};

/**
 * Imprime un reçu
 */
export const printReceipt = (html) => {
  const printWindow = window.open('', '', 'height=600,width=400');
  printWindow.document.write(html);
  printWindow.document.close();
  
  // Attendre que le contenu soit chargé avant d'imprimer
  printWindow.onload = () => {
    printWindow.focus();
    printWindow.print();
    // Fermer après impression (optionnel)
    // printWindow.close();
  };
};

/**
 * Télécharge un reçu en HTML
 */
export const downloadReceipt = (html, receiptNumber) => {
  const blob = new Blob([html], { type: 'text/html' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', `recu_${receiptNumber}.html`);
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

/**
 * Génère un reçu avec paiement et rendu de monnaie
 */
export const generateReceiptWithPayment = (vente, produit, montantPaye, entreprise = {}) => {
  const receipt = generateTicketReceipt(vente, produit, entreprise);
  
  // Calculer le rendu
  const tauxTVAPourcentage = parseFloat(entreprise.tva || 19);
  const tauxTVA = tauxTVAPourcentage / 100;
  const total = parseFloat(vente.prixTotal || 0) * (1 + tauxTVA); // Avec TVA
  const rendu = montantPaye - total;
  
  // Ajouter les informations de paiement au HTML
  const paymentHTML = `
    <div class="totals" style="border-top: 1px dashed #000; padding-top: 10px; margin-top: 10px;">
      <div class="total-line">
        <span>Montant payé:</span>
        <span>${formatPrice(montantPaye)}</span>
      </div>
      ${rendu > 0 ? `
        <div class="total-line" style="font-weight: bold;">
          <span>Rendu:</span>
          <span>${formatPrice(rendu)}</span>
        </div>
      ` : ''}
    </div>
  `;
  
  // Insérer avant le footer
  receipt.html = receipt.html.replace('<div class="footer">', paymentHTML + '<div class="footer">');
  
  return receipt;
};

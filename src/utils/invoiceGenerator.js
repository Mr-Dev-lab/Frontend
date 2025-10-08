import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { formatPrice, formatDate } from './formatters';

export const generateInvoice = (vente, produit, client, entreprise = {}) => {
  const doc = new jsPDF();
  
  // En-tête entreprise
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.text(entreprise.nom_entreprise || 'GESTION DE STOCK', 105, 20, { align: 'center' });
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  if (entreprise.adresse) doc.text(entreprise.adresse, 105, 28, { align: 'center' });
  if (entreprise.telephone) doc.text(`Tél: ${entreprise.telephone}`, 105, 34, { align: 'center' });
  if (entreprise.email) doc.text(entreprise.email, 105, 40, { align: 'center' });
  
  // Ligne de séparation
  doc.setLineWidth(0.5);
  doc.line(20, 45, 190, 45);
  
  // Titre FACTURE
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('FACTURE', 105, 55, { align: 'center' });
  
  // Informations facture
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`N° Facture: ${vente.id || 'N/A'}`, 20, 65);
  doc.text(`Date: ${formatDate(vente.dateVente || new Date())}`, 20, 71);
  
  // Informations client
  if (client) {
    doc.setFont('helvetica', 'bold');
    doc.text('Client:', 130, 65);
    doc.setFont('helvetica', 'normal');
    doc.text(client.nom || vente.client || 'N/A', 130, 71);
    if (client.telephone) doc.text(`Tél: ${client.telephone}`, 130, 77);
  }
  
  // Tableau des produits
  const tableData = [[
    produit.nom,
    vente.quantite,
    formatPrice(vente.prixUnitaire),
    formatPrice(vente.prixTotal)
  ]];
  
  doc.autoTable({
    startY: 85,
    head: [['Produit', 'Quantité', 'Prix Unitaire', 'Total']],
    body: tableData,
    theme: 'grid',
    headStyles: { fillColor: [59, 130, 246] },
  });
  
  // Calculs TVA
  const sousTotal = parseFloat(vente.prixTotal || 0);
  const tauxTVA = parseFloat(entreprise.tva || 19) / 100;
  const montantTVA = sousTotal * tauxTVA;
  const totalTTC = sousTotal + montantTVA;
  
  const finalY = doc.lastAutoTable.finalY + 10;
  
  // Totaux
  doc.setFont('helvetica', 'normal');
  doc.text('Sous-total HT:', 130, finalY);
  doc.text(formatPrice(sousTotal), 180, finalY, { align: 'right' });
  
  doc.text(`TVA (${entreprise.tva || 19}%):`, 130, finalY + 6);
  doc.text(formatPrice(montantTVA), 180, finalY + 6, { align: 'right' });
  
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.text('Total TTC:', 130, finalY + 14);
  doc.text(formatPrice(totalTTC), 180, finalY + 14, { align: 'right' });
  
  // Pied de page
  doc.setFontSize(8);
  doc.setFont('helvetica', 'italic');
  doc.text('Merci pour votre confiance !', 105, 280, { align: 'center' });
  
  return doc;
};

export const downloadInvoice = (vente, produit, client, entreprise) => {
  const doc = generateInvoice(vente, produit, client, entreprise);
  doc.save(`facture_${vente.id}_${Date.now()}.pdf`);
};

export const printInvoice = (vente, produit, client, entreprise) => {
  const doc = generateInvoice(vente, produit, client, entreprise);
  doc.autoPrint();
  window.open(doc.output('bloburl'), '_blank');
};

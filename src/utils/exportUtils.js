// Utilitaires pour exporter les données

// Exporter en CSV
export const exportToCSV = (data, filename) => {
  if (!data || data.length === 0) {
    alert('Aucune donnée à exporter');
    return;
  }

  // Obtenir les en-têtes
  const headers = Object.keys(data[0]);
  
  // Créer le contenu CSV
  let csvContent = headers.join(',') + '\n';
  
  data.forEach(row => {
    const values = headers.map(header => {
      const value = row[header];
      // Échapper les virgules et guillemets
      if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
        return `"${value.replace(/"/g, '""')}"`;
      }
      return value ?? '';
    });
    csvContent += values.join(',') + '\n';
  });

  // Télécharger le fichier
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}_${new Date().toISOString().split('T')[0]}.csv`);
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

// Exporter en JSON
export const exportToJSON = (data, filename) => {
  if (!data) {
    alert('Aucune donnée à exporter');
    return;
  }

  const jsonContent = JSON.stringify(data, null, 2);
  const blob = new Blob([jsonContent], { type: 'application/json' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}_${new Date().toISOString().split('T')[0]}.json`);
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

// Imprimer un rapport
export const printReport = (title, data) => {
  const printWindow = window.open('', '', 'height=600,width=800');
  
  printWindow.document.write('<html><head><title>' + title + '</title>');
  printWindow.document.write('<style>');
  printWindow.document.write('body { font-family: Arial, sans-serif; padding: 20px; }');
  printWindow.document.write('h1 { color: #333; border-bottom: 2px solid #333; padding-bottom: 10px; }');
  printWindow.document.write('table { width: 100%; border-collapse: collapse; margin-top: 20px; }');
  printWindow.document.write('th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }');
  printWindow.document.write('th { background-color: #4CAF50; color: white; }');
  printWindow.document.write('tr:nth-child(even) { background-color: #f2f2f2; }');
  printWindow.document.write('.footer { margin-top: 30px; text-align: center; font-size: 12px; color: #666; }');
  printWindow.document.write('</style></head><body>');
  
  printWindow.document.write('<h1>' + title + '</h1>');
  printWindow.document.write('<p>Date: ' + new Date().toLocaleDateString('fr-FR') + '</p>');
  printWindow.document.write(data);
  printWindow.document.write('<div class="footer">Généré par Gestion de Stock - ' + new Date().toLocaleString('fr-FR') + '</div>');
  printWindow.document.write('</body></html>');
  
  printWindow.document.close();
  printWindow.print();
};

// Générer un tableau HTML pour l'impression
export const generateTableHTML = (headers, rows) => {
  let html = '<table><thead><tr>';
  
  headers.forEach(header => {
    html += `<th>${header}</th>`;
  });
  
  html += '</tr></thead><tbody>';
  
  rows.forEach(row => {
    html += '<tr>';
    row.forEach(cell => {
      html += `<td>${cell}</td>`;
    });
    html += '</tr>';
  });
  
  html += '</tbody></table>';
  return html;
};

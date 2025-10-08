import { useEffect, useRef } from 'react';
import JsBarcode from 'jsbarcode';
import Button from './Button';

export default function BarcodeGenerator({ value, productName }) {
  const barcodeRef = useRef(null);
  const canvasRef = useRef(null);

  useEffect(() => {
    if (barcodeRef.current && value) {
      try {
        JsBarcode(barcodeRef.current, value, {
          format: 'CODE128',
          width: 2,
          height: 60,
          displayValue: true,
          fontSize: 14,
          margin: 10,
        });
      } catch (error) {
        console.error('Erreur génération code-barres:', error);
      }
    }
  }, [value]);

  const handlePrint = () => {
    const printWindow = window.open('', '', 'width=400,height=300');
    const barcodeHTML = barcodeRef.current.outerHTML;
    
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Étiquette - ${productName}</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            padding: 20px;
          }
          .product-name {
            font-size: 16px;
            font-weight: bold;
            margin-bottom: 10px;
            text-align: center;
          }
          svg {
            margin: 10px 0;
          }
        </style>
      </head>
      <body>
        <div class="product-name">${productName}</div>
        ${barcodeHTML}
      </body>
      </html>
    `);
    
    printWindow.document.close();
    printWindow.onload = () => {
      printWindow.focus();
      printWindow.print();
    };
  };

  const handleDownload = () => {
    if (!barcodeRef.current) return;
    
    const svg = barcodeRef.current;
    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    
    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.fillStyle = 'white';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0);
      
      const link = document.createElement('a');
      link.download = `barcode_${value}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    };
    
    img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgData)));
  };

  if (!value) {
    return (
      <div className="text-center text-gray-500 py-4">
        Aucun code-barres disponible
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-center bg-white p-4 rounded border">
        <svg ref={barcodeRef}></svg>
      </div>
      <div className="flex gap-2 justify-center">
        <Button variant="secondary" onClick={handlePrint} className="text-sm">
          🖨️ Imprimer
        </Button>
        <Button variant="secondary" onClick={handleDownload} className="text-sm">
          💾 Télécharger
        </Button>
      </div>
    </div>
  );
}

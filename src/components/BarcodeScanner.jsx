import { useEffect, useRef, useState } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import Button from './Button';

export default function BarcodeScanner({ onScan, onClose }) {
  const scannerRef = useRef(null);
  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!scannerRef.current) return;

    const scanner = new Html5QrcodeScanner(
      'barcode-scanner',
      { 
        fps: 10,
        qrbox: { width: 250, height: 150 },
        aspectRatio: 1.777778,
        formatsToSupport: [
          Html5QrcodeScanner.SCAN_TYPE_CAMERA,
        ]
      },
      false
    );

    scanner.render(
      (decodedText) => {
        console.log('Code scanné:', decodedText);
        onScan(decodedText);
        scanner.clear();
        setIsScanning(false);
      },
      (errorMessage) => {
        // Ignorer les erreurs de scan en cours
        if (!errorMessage.includes('NotFoundException')) {
          console.warn('Erreur scan:', errorMessage);
        }
      }
    );

    setIsScanning(true);

    return () => {
      scanner.clear().catch(console.error);
    };
  }, [onScan]);

  return (
    <div className="space-y-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-4">
        <h3 className="text-lg font-semibold mb-4">Scanner un code-barres</h3>
        
        {error && (
          <div className="bg-red-100 text-red-800 p-3 rounded mb-4">
            {error}
          </div>
        )}
        
        <div id="barcode-scanner" ref={scannerRef}></div>
        
        <div className="mt-4 text-sm text-gray-600 dark:text-gray-400">
          <p>• Positionnez le code-barres devant la caméra</p>
          <p>• Assurez-vous d'avoir un bon éclairage</p>
          <p>• Le scan se fera automatiquement</p>
        </div>
      </div>

      <div className="flex justify-end">
        <Button variant="secondary" onClick={onClose}>
          Fermer
        </Button>
      </div>
    </div>
  );
}

import { useApp } from '../context/AppContext';
import { formatPrice } from '../utils/formatters';

export default function Benefices() {
  const { ventes, achats, getStatistiques } = useApp();
  const stats = getStatistiques();

  // Calculer les bénéfices par mois
  const getBeneficesMois = () => {
    const moisActuel = new Date().getMonth();
    const anneeActuelle = new Date().getFullYear();
    
    const ventesMois = ventes.filter(v => {
      const date = new Date(v.dateVente);
      return date.getMonth() === moisActuel && date.getFullYear() === anneeActuelle;
    });
    
    const achatsMois = achats.filter(a => {
      const date = new Date(a.dateAchat);
      return date.getMonth() === moisActuel && date.getFullYear() === anneeActuelle;
    });
    
    const totalVentes = ventesMois.reduce((acc, v) => acc + parseFloat(v.prixTotal), 0);
    const totalAchats = achatsMois.reduce((acc, a) => acc + parseFloat(a.prixTotal), 0);
    
    return {
      ventes: totalVentes,
      achats: totalAchats,
      benefice: totalVentes - totalAchats,
      marge: totalVentes > 0 ? ((totalVentes - totalAchats) / totalVentes * 100) : 0
    };
  };

  const beneficesMois = getBeneficesMois();

  // Calculer les bénéfices totaux
  const totalVentes = ventes.reduce((acc, v) => acc + parseFloat(v.prixTotal || 0), 0);
  const totalAchats = achats.reduce((acc, a) => acc + parseFloat(a.prixTotal || 0), 0);
  const beneficeTotal = totalVentes - totalAchats;

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Analyse des Bénéfices</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <h3 className="text-gray-500 dark:text-gray-400 text-sm font-medium">Ventes du Mois</h3>
          <p className="text-3xl font-bold mt-2 text-green-600">{formatPrice(beneficesMois.ventes)}</p>
        </div>
        
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <h3 className="text-gray-500 dark:text-gray-400 text-sm font-medium">Achats du Mois</h3>
          <p className="text-3xl font-bold mt-2 text-red-600">{formatPrice(beneficesMois.achats)}</p>
        </div>
        
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <h3 className="text-gray-500 dark:text-gray-400 text-sm font-medium">Bénéfice du Mois</h3>
          <p className={`text-3xl font-bold mt-2 ${beneficesMois.benefice >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {formatPrice(beneficesMois.benefice)}
          </p>
        </div>
        
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <h3 className="text-gray-500 dark:text-gray-400 text-sm font-medium">Marge Bénéficiaire</h3>
          <p className={`text-3xl font-bold mt-2 ${beneficesMois.marge >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {beneficesMois.marge.toFixed(1)} %
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Résumé Global</h2>
          <div className="space-y-4">
            <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700 rounded">
              <span className="font-medium">Total des Ventes</span>
              <span className="text-green-600 font-bold">{formatPrice(totalVentes)}</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700 rounded">
              <span className="font-medium">Total des Achats</span>
              <span className="text-red-600 font-bold">{formatPrice(totalAchats)}</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700 rounded">
              <span className="font-medium">Bénéfice Total</span>
              <span className={`font-bold ${beneficeTotal >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {formatPrice(beneficeTotal)}
              </span>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Statistiques</h2>
          <div className="space-y-4">
            <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700 rounded">
              <span className="font-medium">Nombre de Ventes</span>
              <span className="font-bold">{ventes.length}</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700 rounded">
              <span className="font-medium">Nombre d'Achats</span>
              <span className="font-bold">{achats.length}</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700 rounded">
              <span className="font-medium">Vente Moyenne</span>
              <span className="font-bold">
                {ventes.length > 0 ? formatPrice(totalVentes / ventes.length) : formatPrice(0)}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

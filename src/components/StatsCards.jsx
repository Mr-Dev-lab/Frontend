import { formatPrice } from '../utils/formatters';

export default function StatsCards({ stats }) {
  const cards = [
    {
      title: 'Total Produits',
      value: stats.totalProduits || 0,
      icon: '📦',
      color: 'blue',
      trend: null
    },
    {
      title: 'Stock Total',
      value: stats.stockTotal || 0,
      icon: '📊',
      color: 'purple',
      suffix: ' unités'
    },
    {
      title: 'Ventes du Mois',
      value: formatPrice(stats.totalVentesMois || 0),
      icon: '💰',
      color: 'green',
      trend: stats.tendanceVentes
    },
    {
      title: 'Achats du Mois',
      value: formatPrice(stats.totalAchatsMois || 0),
      icon: '🛒',
      color: 'orange',
      trend: stats.tendanceAchats
    },
    {
      title: 'Bénéfices du Mois',
      value: formatPrice(stats.beneficesMois || 0),
      icon: '📈',
      color: stats.beneficesMois >= 0 ? 'green' : 'red',
      trend: stats.tendanceBenefices
    },
    {
      title: 'Marge Moyenne',
      value: `${(stats.margemoyenne || 0).toFixed(1)}%`,
      icon: '💹',
      color: 'indigo',
      trend: null
    },
    {
      title: 'Produits en Alerte',
      value: stats.produitsEnAlerte || 0,
      icon: '⚠️',
      color: 'red',
      alert: stats.produitsEnAlerte > 0
    },
    {
      title: 'Valeur du Stock',
      value: formatPrice(stats.valeurStock || 0),
      icon: '💎',
      color: 'cyan',
      trend: null
    }
  ];

  const getColorClasses = (color) => {
    const colors = {
      blue: 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400',
      purple: 'bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400',
      green: 'bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400',
      orange: 'bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400',
      red: 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400',
      indigo: 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400',
      cyan: 'bg-cyan-50 dark:bg-cyan-900/20 text-cyan-600 dark:text-cyan-400',
    };
    return colors[color] || colors.blue;
  };

  const getTrendIcon = (trend) => {
    if (!trend) return null;
    if (trend > 0) return <span className="text-green-500">↗ +{trend}%</span>;
    if (trend < 0) return <span className="text-red-500">↘ {trend}%</span>;
    return <span className="text-gray-500">→ 0%</span>;
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card, index) => (
        <div
          key={index}
          className={`${getColorClasses(card.color)} rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow ${
            card.alert ? 'ring-2 ring-red-500 animate-pulse' : ''
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-600 dark:text-gray-300">
              {card.title}
            </h3>
            <span className="text-2xl">{card.icon}</span>
          </div>
          <div className="flex items-end justify-between">
            <p className="text-2xl font-bold">
              {card.value}
              {card.suffix && <span className="text-sm font-normal ml-1">{card.suffix}</span>}
            </p>
            {card.trend !== null && card.trend !== undefined && (
              <div className="text-xs font-semibold">
                {getTrendIcon(card.trend)}
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

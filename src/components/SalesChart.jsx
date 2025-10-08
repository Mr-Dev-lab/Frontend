import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

export default function SalesChart({ ventes = [], achats = [] }) {
  // Préparer les données par mois
  const monthlyData = {};

  // Initialiser les 12 derniers mois
  for (let i = 11; i >= 0; i--) {
    const date = new Date();
    date.setMonth(date.getMonth() - i);
    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    monthlyData[key] = { ventes: 0, achats: 0 };
  }

  // Calculer les ventes par mois
  ventes.forEach(vente => {
    const date = new Date(vente.dateVente || vente.date_vente);
    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    if (monthlyData[key]) {
      monthlyData[key].ventes += parseFloat(vente.prixTotal || vente.prix_total || 0);
    }
  });

  // Calculer les achats par mois
  achats.forEach(achat => {
    const date = new Date(achat.dateAchat || achat.date_achat);
    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    if (monthlyData[key]) {
      monthlyData[key].achats += parseFloat(achat.prixTotal || achat.prix_total || 0);
    }
  });

  const labels = Object.keys(monthlyData).map(key => {
    const [year, month] = key.split('-');
    const date = new Date(year, month - 1);
    return date.toLocaleDateString('fr-FR', { month: 'short', year: '2-digit' });
  });

  const ventesData = Object.values(monthlyData).map(d => d.ventes);
  const achatsData = Object.values(monthlyData).map(d => d.achats);

  const data = {
    labels,
    datasets: [
      {
        label: 'Ventes',
        data: ventesData,
        borderColor: 'rgb(34, 197, 94)',
        backgroundColor: 'rgba(34, 197, 94, 0.1)',
        tension: 0.4,
        fill: true,
      },
      {
        label: 'Achats',
        data: achatsData,
        borderColor: 'rgb(239, 68, 68)',
        backgroundColor: 'rgba(239, 68, 68, 0.1)',
        tension: 0.4,
        fill: true,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Évolution des Ventes et Achats (12 derniers mois)',
        font: {
          size: 16,
        },
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            let label = context.dataset.label || '';
            if (label) {
              label += ': ';
            }
            label += new Intl.NumberFormat('fr-FR', {
              style: 'currency',
              currency: 'XAF',
              minimumFractionDigits: 0,
            }).format(context.parsed.y);
            return label;
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: function(value) {
            return new Intl.NumberFormat('fr-FR', {
              style: 'currency',
              currency: 'XAF',
              minimumFractionDigits: 0,
            }).format(value);
          }
        }
      }
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6" style={{ height: '400px' }}>
      <Line data={data} options={options} />
    </div>
  );
}

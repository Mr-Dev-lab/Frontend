import { useState } from 'react';
import Button from './Button';
import Input from './Input';
import Select from './Select';

export default function AdvancedSearch({ onSearch, onReset, categories = [] }) {
  const [filters, setFilters] = useState({
    nom: '',
    categorie: '',
    prixMin: '',
    prixMax: '',
    stockMin: '',
    stockMax: '',
    enAlerte: false,
  });

  const handleSearch = () => {
    onSearch(filters);
  };

  const handleReset = () => {
    const resetFilters = {
      nom: '',
      categorie: '',
      prixMin: '',
      prixMax: '',
      stockMin: '',
      stockMax: '',
      enAlerte: false,
    };
    setFilters(resetFilters);
    onReset();
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 space-y-4">
      <h3 className="text-lg font-semibold mb-4">🔍 Recherche Avancée</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <Input
          label="Nom du produit"
          value={filters.nom}
          onChange={(e) => setFilters({ ...filters, nom: e.target.value })}
          placeholder="Rechercher..."
        />

        <Select
          label="Catégorie"
          value={filters.categorie}
          onChange={(e) => setFilters({ ...filters, categorie: e.target.value })}
          options={[
            { value: '', label: 'Toutes les catégories' },
            ...categories.map(cat => ({ value: cat, label: cat }))
          ]}
        />

        <div className="flex items-center pt-6">
          <label className="flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={filters.enAlerte}
              onChange={(e) => setFilters({ ...filters, enAlerte: e.target.checked })}
              className="mr-2 w-4 h-4 text-red-600 rounded focus:ring-red-500"
            />
            <span className="text-sm font-medium">⚠️ Stock en alerte uniquement</span>
          </label>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="block text-sm font-medium">Prix de vente (FCFA)</label>
          <div className="flex gap-2">
            <Input
              value={filters.prixMin}
              onChange={(e) => setFilters({ ...filters, prixMin: e.target.value })}
              placeholder="Min"
              type="number"
              min="0"
            />
            <Input
              value={filters.prixMax}
              onChange={(e) => setFilters({ ...filters, prixMax: e.target.value })}
              placeholder="Max"
              type="number"
              min="0"
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium">Stock</label>
          <div className="flex gap-2">
            <Input
              value={filters.stockMin}
              onChange={(e) => setFilters({ ...filters, stockMin: e.target.value })}
              placeholder="Min"
              type="number"
              min="0"
            />
            <Input
              value={filters.stockMax}
              onChange={(e) => setFilters({ ...filters, stockMax: e.target.value })}
              placeholder="Max"
              type="number"
              min="0"
            />
          </div>
        </div>
      </div>

      <div className="flex gap-3 pt-4">
        <Button onClick={handleSearch} className="flex-1">
          🔍 Rechercher
        </Button>
        <Button variant="secondary" onClick={handleReset} className="flex-1">
          🔄 Réinitialiser
        </Button>
      </div>
    </div>
  );
}

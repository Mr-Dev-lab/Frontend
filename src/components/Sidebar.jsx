import React from "react";
import { useAuth } from "../context/AuthContext";
import ThemeToggle from "./ThemeToggle";

export default function Sidebar({ setPage, activePage }) {
  const { user, logout, isSuperAdmin, isAdmin, canManage, canSell, canBuy } = useAuth();

  const allMenus = [
    { id: "dashboard", label: "📊 Tableau de bord", roles: ['all'] },
    { id: "produits", label: "📦 Produits", roles: ['super_admin', 'admin', 'gestionnaire'] },
    { id: "achats", label: "🛒 Achats", roles: ['super_admin', 'admin', 'gestionnaire', 'acheteur'] },
    { id: "ventes", label: "💰 Ventes", roles: ['super_admin', 'admin', 'gestionnaire', 'vendeur'] },
    { id: "stocks", label: "📋 Stocks", roles: ['super_admin', 'admin', 'gestionnaire'] },
    { id: "fournisseurs", label: "🏢 Fournisseurs", roles: ['super_admin', 'admin', 'gestionnaire'] },
    { id: "commandes", label: "📝 Commandes", roles: ['super_admin', 'admin', 'gestionnaire'] },
    { id: "benefices", label: "💵 Bénéfices", roles: ['super_admin', 'admin', 'gestionnaire'] },
    { id: "rapports", label: "📈 Rapports", roles: ['super_admin', 'admin', 'gestionnaire'] },
    { id: "users", label: "👥 Utilisateurs", roles: ['super_admin', 'admin'] },
    { id: "clients", label: "🏪 Clients", roles: ['super_admin'] },
    { id: "configuration", label: "⚙️ Configuration", roles: ['super_admin', 'admin'] },
  ];

  // Filtrer les menus selon le rôle
  const menus = allMenus.filter(menu => {
    if (menu.roles.includes('all')) return true;
    return menu.roles.includes(user?.role);
  });

  const handleLogout = () => {
    if (confirm('Voulez-vous vraiment vous déconnecter ?')) {
      logout();
    }
  };

  return (
    <aside className="w-64 bg-slate-900 text-white flex flex-col justify-between shadow-xl">
      <div>
        <div className="p-6 border-b border-slate-700">
          <div className="text-2xl font-bold text-center mb-2">📦 G-Stock</div>
          <div className="text-xs text-center text-gray-400">
            <div className="font-semibold">{user?.prenom} {user?.nom}</div>
            <div className="text-gray-500">{user?.email}</div>
          </div>
        </div>
        <nav className="mt-6 flex flex-col gap-1">
          {menus.map((menu) => (
            <button
              key={menu.id}
              onClick={() => setPage(menu.id)}
              className={`text-left px-6 py-3 transition-all rounded-r-full ${
                activePage === menu.id
                  ? "bg-slate-700 text-blue-400"
                  : "hover:bg-slate-800"
              }`}
            >
              {menu.label}
            </button>
          ))}
        </nav>
      </div>
      <div className="p-4 border-t border-slate-700">
        <div className="flex justify-center mb-3">
          <ThemeToggle />
        </div>
        <button
          onClick={handleLogout}
          className="w-full px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg transition-colors text-sm font-medium"
        >
          🚪 Déconnexion
        </button>
      </div>
    </aside>
  );
}

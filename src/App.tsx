import { useState } from "react";
import { AppProvider } from "./context/AppContext";
import { AuthProvider, useAuth } from "./context/AuthContext";
import Sidebar from "./components/Sidebar";
import StockAlerts from "./components/StockAlerts";
import Login from "./pages/Login";
import Dashboard from "./pages/Accueil";
import Produits from "./pages/Produits";
import Achats from "./pages/Achats";
import Ventes from "./pages/Ventes";
import Stocks from "./pages/Stocks";
import Fournisseurs from "./pages/Fournisseurs";
import Commandes from "./pages/Commandes";
import Benefices from "./pages/Benefices";
import Rapports from "./pages/Rapports";
import Users from "./pages/Users";
import Clients from "./pages/Clients";
import Configuration from "./pages/Configuration";

type Page = 
  | "dashboard"
  | "produits"
  | "achats"
  | "ventes"
  | "stocks"
  | "fournisseurs"
  | "commandes"
  | "benefices"
  | "rapports"
  | "users"
  | "clients"
  | "configuration";

function AppContent() {
  const { isAuthenticated, loading } = useAuth();
  const [page, setPage] = useState<Page>("dashboard");

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-2xl">Chargement...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Login />;
  }

  const renderPage = () => {
    switch (page) {
      case "produits": return <Produits />;
      case "achats": return <Achats />;
      case "ventes": return <Ventes />;
      case "stocks": return <Stocks />;
      case "fournisseurs": return <Fournisseurs />;
      case "commandes": return <Commandes />;
      case "benefices": return <Benefices />;
      case "rapports": return <Rapports />;
      case "users": return <Users />;
      case "clients": return <Clients />;
      case "configuration": return <Configuration />;
      default: return <Dashboard />;
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-gray-100">
      <Sidebar setPage={setPage} activePage={page} />
      <main className="flex-1 p-6 transition-all">{renderPage()}</main>
      <StockAlerts />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppProvider>
        <AppContent />
      </AppProvider>
    </AuthProvider>
  );
}

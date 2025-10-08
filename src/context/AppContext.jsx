import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { 
  produitsAPI, 
  fournisseursAPI, 
  achatsAPI, 
  ventesAPI, 
  commandesAPI,
  statistiquesAPI 
} from '../services/api';

const AppContext = createContext();

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within AppProvider');
  }
  return context;
};

export const AppProvider = ({ children }) => {
  const { isAuthenticated, token } = useAuth();
  
  // États pour toutes les données
  const [produits, setProduits] = useState([]);
  const [achats, setAchats] = useState([]);
  const [ventes, setVentes] = useState([]);
  const [fournisseurs, setFournisseurs] = useState([]);
  const [commandes, setCommandes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Charger les données uniquement si l'utilisateur est connecté
  useEffect(() => {
    // Vérifier que le token est bien dans localStorage
    const storedToken = localStorage.getItem('token');
    if (isAuthenticated && token && storedToken) {
      loadAllData();
    } else if (isAuthenticated && !storedToken) {
      // Si isAuthenticated est true mais pas de token dans localStorage, il y a un problème
      console.error('Incohérence: utilisateur authentifié mais pas de token dans localStorage');
      setError('Erreur d\'authentification. Veuillez vous reconnecter.');
    }
  }, [isAuthenticated, token]);

  const loadAllData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [produitsData, fournisseursData, achatsData, ventesData, commandesData] = 
        await Promise.all([
          produitsAPI.getAll(),
          fournisseursAPI.getAll(),
          achatsAPI.getAll(),
          ventesAPI.getAll(),
          commandesAPI.getAll(),
        ]);
      
      setProduits(produitsData);
      setFournisseurs(fournisseursData);
      setAchats(achatsData);
      setVentes(ventesData);
      setCommandes(commandesData);
    } catch (err) {
      setError(err.message);
      console.error('Erreur lors du chargement des données:', err);
    } finally {
      setLoading(false);
    }
  };

  // Fonctions CRUD pour Produits
  const ajouterProduit = async (produit) => {
    try {
      const nouveauProduit = await produitsAPI.create({
        nom: produit.nom,
        description: produit.description,
        prix_achat: parseFloat(produit.prixAchat || produit.prix_achat),
        prix_vente: parseFloat(produit.prixVente || produit.prix_vente),
        stock: parseInt(produit.stock || 0),
        seuil_alerte: parseInt(produit.seuilAlerte || produit.seuil_alerte || 10),
        categorie: produit.categorie
      });
      setProduits([...produits, nouveauProduit]);
      return nouveauProduit;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const modifierProduit = async (id, produitModifie) => {
    try {
      const produitMisAJour = await produitsAPI.update(id, {
        nom: produitModifie.nom,
        description: produitModifie.description,
        prix_achat: parseFloat(produitModifie.prixAchat || produitModifie.prix_achat),
        prix_vente: parseFloat(produitModifie.prixVente || produitModifie.prix_vente),
        stock: parseInt(produitModifie.stock),
        seuil_alerte: parseInt(produitModifie.seuilAlerte || produitModifie.seuil_alerte),
        categorie: produitModifie.categorie
      });
      setProduits(produits.map(p => p.id === id ? produitMisAJour : p));
      return produitMisAJour;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const supprimerProduit = async (id) => {
    try {
      await produitsAPI.delete(id);
      setProduits(produits.filter(p => p.id !== id));
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  // Fonctions CRUD pour Achats
  const ajouterAchat = async (achat) => {
    try {
      const nouvelAchat = await achatsAPI.create({
        produit_id: parseInt(achat.produitId || achat.produit_id),
        fournisseur_id: parseInt(achat.fournisseurId || achat.fournisseur_id),
        quantite: parseInt(achat.quantite),
        prix_unitaire: parseFloat(achat.prixUnitaire || achat.prix_unitaire)
      });
      setAchats([...achats, nouvelAchat]);
      // Recharger les produits pour mettre à jour le stock
      const produitsData = await produitsAPI.getAll();
      setProduits(produitsData);
      return nouvelAchat;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const supprimerAchat = async (id) => {
    try {
      await achatsAPI.delete(id);
      setAchats(achats.filter(a => a.id !== id));
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  // Fonctions CRUD pour Ventes
  const ajouterVente = async (vente) => {
    try {
      const nouvelleVente = await ventesAPI.create({
        produit_id: parseInt(vente.produitId || vente.produit_id),
        quantite: parseInt(vente.quantite),
        prix_unitaire: parseFloat(vente.prixUnitaire || vente.prix_unitaire),
        client_nom: vente.client || vente.clientNom || vente.client_nom || ''
      });
      setVentes([...ventes, nouvelleVente]);
      // Recharger les produits pour mettre à jour le stock
      const produitsData = await produitsAPI.getAll();
      setProduits(produitsData);
      return nouvelleVente;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const supprimerVente = async (id) => {
    try {
      await ventesAPI.delete(id);
      setVentes(ventes.filter(v => v.id !== id));
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  // Fonctions CRUD pour Fournisseurs
  const ajouterFournisseur = async (fournisseur) => {
    try {
      const nouveauFournisseur = await fournisseursAPI.create(fournisseur);
      setFournisseurs([...fournisseurs, nouveauFournisseur]);
      return nouveauFournisseur;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const modifierFournisseur = async (id, fournisseurModifie) => {
    try {
      const fournisseurMisAJour = await fournisseursAPI.update(id, fournisseurModifie);
      setFournisseurs(fournisseurs.map(f => f.id === id ? fournisseurMisAJour : f));
      return fournisseurMisAJour;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const supprimerFournisseur = async (id) => {
    try {
      await fournisseursAPI.delete(id);
      setFournisseurs(fournisseurs.filter(f => f.id !== id));
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  // Fonctions CRUD pour Commandes
  const ajouterCommande = async (commande) => {
    try {
      const nouvelleCommande = await commandesAPI.create({
        produit_id: parseInt(commande.produitId || commande.produit_id),
        fournisseur_id: parseInt(commande.fournisseurId || commande.fournisseur_id),
        quantite: parseInt(commande.quantite),
        statut: commande.statut || 'En attente'
      });
      setCommandes([...commandes, nouvelleCommande]);
      return nouvelleCommande;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const modifierCommande = async (id, commandeModifiee) => {
    try {
      const commandeMiseAJour = await commandesAPI.update(id, commandeModifiee);
      setCommandes(commandes.map(c => c.id === id ? commandeMiseAJour : c));
      return commandeMiseAJour;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const supprimerCommande = async (id) => {
    try {
      await commandesAPI.delete(id);
      setCommandes(commandes.filter(c => c.id !== id));
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  // Calculer les statistiques
  const getStatistiques = () => {
    const totalProduits = produits.length;
    const stockTotal = produits.reduce((acc, p) => acc + (parseInt(p.stock) || 0), 0);
    
    const ventesMoisActuel = ventes.filter(v => {
      const dateVente = new Date(v.dateVente);
      const maintenant = new Date();
      return dateVente.getMonth() === maintenant.getMonth() && 
             dateVente.getFullYear() === maintenant.getFullYear();
    });
    
    const totalVentesMois = ventesMoisActuel.reduce((acc, v) => 
      acc + (parseFloat(v.prixTotal) || 0), 0
    );

    const achatsMoisActuel = achats.filter(a => {
      const dateAchat = new Date(a.dateAchat);
      const maintenant = new Date();
      return dateAchat.getMonth() === maintenant.getMonth() && 
             dateAchat.getFullYear() === maintenant.getFullYear();
    });
    
    const totalAchatsMois = achatsMoisActuel.reduce((acc, a) => 
      acc + (parseFloat(a.prixTotal) || 0), 0
    );

    const beneficesMois = totalVentesMois - totalAchatsMois;

    return {
      totalProduits,
      stockTotal,
      totalVentesMois,
      totalAchatsMois,
      beneficesMois,
    };
  };

  const value = {
    // États
    produits,
    achats,
    ventes,
    fournisseurs,
    commandes,
    loading,
    error,
    
    // Fonctions Produits
    ajouterProduit,
    modifierProduit,
    supprimerProduit,
    
    // Fonctions Achats
    ajouterAchat,
    supprimerAchat,
    
    // Fonctions Ventes
    ajouterVente,
    supprimerVente,
    
    // Fonctions Fournisseurs
    ajouterFournisseur,
    modifierFournisseur,
    supprimerFournisseur,
    
    // Fonctions Commandes
    ajouterCommande,
    modifierCommande,
    supprimerCommande,
    
    // Statistiques
    getStatistiques,
    loadAllData,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

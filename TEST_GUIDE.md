# 🧪 Guide de Test - Historique des Commandes

## ✅ Pré-requis
- Backend démarré (port 5000)
- Frontend démarré (port 5173)
- Migration SQL exécutée avec succès

---

## 📝 Scénario de Test #1: Première Commande

### Étape 1: Passer une commande
1. Ouvrir http://localhost:5173
2. Ajouter 1-2 plats au panier
3. Cliquer sur le panier
4. Remplir le formulaire:
   - Nom: `Test User`
   - Téléphone: `0600000000`
   - Table: `5`
5. Confirmer la commande

**Résultat attendu**: ✅ Commande créée, redirection vers page de confirmation

---

## 📝 Scénario de Test #2: Voir l'Historique

### Étape 1: Accéder à l'historique
1. Cliquer sur **"Mes commandes"** dans le header
2. URL devrait être: `http://localhost:5173/mes-commandes`

**Résultat attendu**: ✅ Page d'historique s'affiche

### Étape 2: Rechercher les commandes
1. Entrer le téléphone: `0600000000`
2. Cliquer sur **"Rechercher"**

**Résultat attendu**: ✅ 
- La commande du test #1 apparaît
- Statut correct (ex: "En attente")
- Total affiché correctement
- Bouton "Voir détails" présent

---

## 📝 Scénario de Test #3: Deuxième Commande

### Étape 1: Commander à nouveau
1. Retourner au menu (← Retour au menu)
2. Ajouter d'autres plats
3. Commander avec le **même téléphone**: `0600000000`

### Étape 2: Vérifier l'historique
1. Retourner à "Mes commandes"
2. Rechercher avec `0600000000`

**Résultat attendu**: ✅ 
- Les 2 commandes apparaissent
- La plus récente en premier
- Statuts différents si modifiés

---

## 📝 Scénario de Test #4: Détails d'une Commande

### Étape 1: Voir les détails
1. Dans l'historique, cliquer sur **"Voir détails →"**
2. URL: `http://localhost:5173/commande/:id`

**Résultat attendu**: ✅
- Tous les détails de la commande
- Liste des plats
- Statut avec icône
- Informations client

---

## 📝 Scénario de Test #5: Téléphone Inconnu

### Étape 1: Rechercher un téléphone inexistant
1. Aller à "Mes commandes"
2. Entrer: `0999999999` (qui n'existe pas)
3. Rechercher

**Résultat attendu**: ✅
- Message: "Aucune commande trouvée"
- Icône 📦
- Bouton "Commander maintenant"

---

## 📝 Scénario de Test #6: Format de Téléphone

### Tester différents formats:
1. `06 00 00 00 00` (avec espaces)
2. `0600000000` (sans espaces)
3. `06.00.00.00.00` (avec points)

**⚠️ Important**: Le format doit correspondre **exactement** à celui sauvegardé

**Résultat attendu**: 
- Si format différent → Aucune commande trouvée
- Si format identique → Commandes affichées

---

## 🐛 Bugs à Vérifier

### [ ] Bug: Page blanche
- Ouvrir console (F12)
- Vérifier erreurs JavaScript
- Solution: Redémarrer frontend

### [ ] Bug: Erreur API 400
- Vérifier backend tourne
- Vérifier logs backend
- Solution: `npm start` dans backend

### [ ] Bug: Chargement infini
- Vérifier connexion Supabase
- Vérifier indexes SQL créés
- Solution: Re-exécuter migration

---

## ✅ Checklist de Validation

- [ ] Bouton "Mes commandes" visible dans header
- [ ] Page d'historique s'affiche correctement
- [ ] Formulaire de recherche fonctionne
- [ ] Commandes existantes affichées
- [ ] Statuts des commandes corrects
- [ ] Détails d'une commande accessibles
- [ ] Message "Aucune commande" fonctionne
- [ ] Navigation entre pages fonctionne
- [ ] Design responsive (mobile/desktop)
- [ ] Pas d'erreurs dans la console

---

## 🎯 Critères d'Acceptation

La fonctionnalité est considérée comme **opérationnelle** si:

1. ✅ Un client peut voir ses commandes sans login
2. ✅ La recherche par téléphone fonctionne
3. ✅ L'historique affiche toutes les commandes
4. ✅ Les statuts sont à jour en temps réel
5. ✅ Aucun bug bloquant identifié
6. ✅ Interface utilisateur intuitive

---

## 📊 Données de Test Exemples

### Créer plusieurs commandes pour tester:
```
Téléphone: 0600000000
- Commande #1: 2 plats · 25.00 GNF · En attente
- Commande #2: 1 plat · 12.50 GNF · Acceptée
- Commande #3: 3 plats · 37.00 GNF · En préparation

Téléphone: 0700000000
- Commande #4: 1 plat · 15.00 GNF · Terminée
```

---

## 🔍 Points de Vigilance

### Performance:
- Temps de chargement < 2 secondes
- Requêtes SQL optimisées grâce aux index

### UX (Expérience Utilisateur):
- Placeholder clair dans le formulaire
- Messages d'erreur compréhensibles
- Navigation fluide entre les pages

### Sécurité:
- Ne montre pas les infos sensibles
- Pas de données de paiement
- Respect de la vie privée

---

## 📸 Captures d'Écran Recommandées

Prendre des screenshots de:
1. Bouton "Mes commandes" dans header
2. Page de recherche avec formulaire
3. Résultats de recherche avec commandes
4. Détail d'une commande individuelle
5. Message "Aucune commande trouvée"

---

**Prochaine étape**: Si tous les tests sont ✅, la fonctionnalité est prête pour production !

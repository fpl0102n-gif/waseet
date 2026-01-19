# Système d'Approbation Al-Khayr

## Vue d'ensemble

Le système Al-Khayr inclut maintenant un processus d'approbation par l'administrateur pour toutes les demandes médicales et les inscriptions de bénévoles.

## Fonctionnalités

### 1. **Approbation des Demandes Médicales**
- Les demandes locales et étrangères nécessitent l'approbation de l'admin
- Les demandes non approuvées ne sont **pas visibles** aux bénévoles
- Les patients ne voient que leurs demandes approuvées dans "Mes Demandes"

### 2. **Approbation des Bénévoles**
- Les bénévoles doivent être approuvés avant d'être actifs
- Seuls les bénévoles approuvés peuvent être associés aux demandes

### 3. **Interface Admin**
- Page dédiée: `/admin/alkhayr`
- Accessible depuis le Dashboard Admin (bouton rouge "❤️ Al-Khayr")
- Vue d'ensemble avec compteurs de demandes en attente
- 3 onglets: Demandes Locales, Demandes Étrangères, Bénévoles

## Migration Base de Données

### Fichier: `20251119_add_approval_system.sql`

Cette migration ajoute les colonnes suivantes aux tables:
- `approved` (BOOLEAN, default: false)
- `approved_at` (TIMESTAMPTZ)
- `approved_by` (TEXT)

**Tables affectées:**
- `local_medicine_requests`
- `foreign_medicine_requests`
- `diaspora_volunteers`

### Comment exécuter la migration

1. Ouvrez Supabase Dashboard → SQL Editor
2. Copiez le contenu de `20251119_add_approval_system.sql`
3. Exécutez la requête
4. Vérifiez que les colonnes ont été ajoutées

## Workflow

### Pour les Patients

1. Patient soumet une demande (locale ou étrangère)
2. Notification: "Votre demande sera examinée par notre équipe avant d'être approuvée"
3. Demande créée avec `approved = false`
4. Patient **PEUT VOIR** sa demande dans "Mes Demandes" avec badge "⏳ En attente d'approbation"
5. Une fois approuvée par l'admin, le badge devient "✓ Approuvé"
6. Seules les demandes approuvées sont visibles aux bénévoles

### Pour les Bénévoles

1. Bénévole s'inscrit via "Inscription Bénévole"
2. Notification: "Votre inscription sera examinée par notre équipe avant d'être approuvée"
3. Inscription créée avec `approved = false`
4. Une fois approuvé par l'admin, le bénévole peut être associé aux demandes

### Pour les Admins

1. Connexion au Dashboard Admin
2. Clic sur le bouton "❤️ Al-Khayr"
3. Affichage des demandes et bénévoles en attente
4. Actions possibles:
   - **Approuver**: Met `approved = true`, enregistre la date et l'admin
   - **Rejeter**: Met `approved = false` et `status = cancelled` (pour les demandes)

## Statistiques Admin

L'interface affiche:
- Nombre de demandes locales en attente
- Nombre de demandes étrangères en attente
- Nombre de bénévoles en attente

## Sécurité

- Seuls les utilisateurs avec le rôle `admin` peuvent accéder à `/admin/alkhayr`
- Les demandes non approuvées ne sont **jamais exposées aux bénévoles**
- Les patients voient **toutes** leurs propres demandes (approuvées ou en attente)
- Badge visuel pour distinguer les demandes approuvées des demandes en attente

## Notes Techniques

### Requêtes Supabase Modifiées

**MyMedicalRequests.tsx**:
```typescript
// Les patients voient TOUTES leurs demandes
.eq('contact_type', contactType)
.eq('contact_value', contactValue)
// PAS de filtre .eq('approved', true)
```

### Nouveaux Champs dans les Tables

```sql
approved BOOLEAN NOT NULL DEFAULT false
approved_at TIMESTAMPTZ
approved_by TEXT
```

### Index Créés

```sql
CREATE INDEX idx_local_medicine_approved ON local_medicine_requests(approved);
CREATE INDEX idx_foreign_medicine_approved ON foreign_medicine_requests(approved);
CREATE INDEX idx_diaspora_volunteers_approved ON diaspora_volunteers(approved);
```

## Prochaines Étapes

1. ✅ Exécuter la migration `20251119_add_approval_system.sql`
2. ✅ Tester l'interface admin `/admin/alkhayr`
3. ✅ Soumettre des demandes test et les approuver
4. ⏳ Ajouter des notifications email (optionnel)
5. ⏳ Implémenter un système de commentaires admin (optionnel)

## Support

Pour toute question ou problème:
- Vérifier que la migration a été exécutée correctement
- Vérifier les logs dans la console du navigateur
- Vérifier les politiques RLS dans Supabase

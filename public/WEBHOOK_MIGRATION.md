# Migration: Passer au Webhook Unifié

Ce guide vous aide à migrer de votre webhook actuel (commandes uniquement) vers le webhook unifié (commandes + Al-Khayr).

## 🎯 Objectif

Utiliser le **même bot Telegram** pour:
- ✅ Notifications de commandes (existant)
- ✅ Notifications Al-Khayr (nouveau)
- ✅ Approbation/Rejet des deux systèmes
- ✅ Notes Al-Khayr

---

## 📋 Ce qui Change

### Ancien Système
```
Bot Telegram → telegram-webhook → Gère uniquement les commandes
```

### Nouveau Système
```
Bot Telegram → unified-telegram-webhook → Gère commandes + Al-Khayr
```

---

## 🚀 Migration en 3 Étapes

### ÉTAPE 1: Déployer le Nouveau Webhook

```powershell
cd c:\Users\Administrator\Downloads\test-waseet\test-waseet\public\supabase\functions

# Déployer le webhook unifié
supabase functions deploy unified-telegram-webhook
```

**Résultat:** Vous obtenez l'URL: `https://YOUR_PROJECT_REF.supabase.co/functions/v1/unified-telegram-webhook`

### ÉTAPE 2: Mettre à Jour le Webhook Telegram

```powershell
# Votre bot existant
$botToken = "VOTRE_BOT_TOKEN"
$newWebhookUrl = "https://YOUR_PROJECT_REF.supabase.co/functions/v1/unified-telegram-webhook"

# Changer le webhook
Invoke-WebRequest -Uri "https://api.telegram.org/bot$botToken/setWebhook?url=$newWebhookUrl" -Method GET

# Vérifier
Invoke-WebRequest -Uri "https://api.telegram.org/bot$botToken/getWebhookInfo" -Method GET
```

**✅ Succès si vous voyez:**
```json
{
  "ok": true,
  "result": {
    "url": "https://your-project.supabase.co/functions/v1/unified-telegram-webhook",
    "pending_update_count": 0
  }
}
```

### ÉTAPE 3: Tester les Deux Systèmes

#### Test 1: Commandes (Ancien Système)
1. Créez une nouvelle commande sur votre site
2. Vérifiez que vous recevez la notification Telegram
3. Cliquez sur les boutons ✅/❌
4. Vérifiez que la commande est mise à jour

**✅ Si ça marche:** Ancien système fonctionne toujours!

#### Test 2: Al-Khayr (Nouveau Système)
1. Soumettez une demande de médicament local
2. Vérifiez que vous recevez la notification Telegram
3. Cliquez sur ✅ Approuver
4. Vérifiez que la demande est approuvée

**✅ Si ça marche:** Nouveau système fonctionne!

---

## 🔍 Différences Techniques

### Format des Callback Data

**Commandes (Ancien):**
```
approve_order_123456
reject_order_789012
```

**Al-Khayr (Nouveau):**
```
approve_local_abc123
reject_foreign_def456
note_volunteer_ghi789
```

Le webhook unifié **détecte automatiquement** le type en fonction du préfixe!

### Tables Database

**Commandes:**
- Table: `orders`
- Colonnes: `status`, `approved_at`, `rejected_at`

**Al-Khayr:**
- Tables: `local_medicine_requests`, `foreign_medicine_requests`, `diaspora_volunteers`
- Colonnes: `approved`, `approved_at`, `approved_by`, `admin_notes`

---

## 🛠️ Dépannage

### Erreur: "webhook already set to this URL"
**Solution:** C'est normal! Le webhook est déjà configuré. Continuez avec les tests.

### Commandes ne fonctionnent plus
**Vérifications:**
1. Le webhook est bien configuré?
   ```powershell
   Invoke-WebRequest -Uri "https://api.telegram.org/bot$botToken/getWebhookInfo"
   ```
2. L'ancienne fonction `telegram-webhook` est toujours active?
   - Dashboard → Functions → Vérifier que `unified-telegram-webhook` est déployé

3. Les logs montrent des erreurs?
   - Dashboard → Functions → unified-telegram-webhook → Logs

### Al-Khayr notifications ne s'envoient pas
**Vérifications:**
1. La migration database est exécutée?
   ```sql
   SELECT * FROM pg_trigger WHERE tgname LIKE 'trigger_notify%';
   ```
2. L'URL dans settings est correcte?
   ```sql
   SELECT * FROM alkhayr_settings WHERE key = 'telegram_notification_url';
   ```
3. La fonction `alkhayr-telegram-notifications` est déployée?

---

## 📊 Comparaison

| Fonctionnalité | Ancien Webhook | Nouveau Webhook Unifié |
|---|---|---|
| Notifications commandes | ✅ | ✅ |
| Approbation commandes | ✅ | ✅ |
| Notifications Al-Khayr | ❌ | ✅ |
| Approbation Al-Khayr | ❌ | ✅ |
| Notes Al-Khayr | ❌ | ✅ |
| Un seul bot | ✅ | ✅ |
| Maintenance | Deux webhooks | Un webhook |

---

## ✅ Checklist Migration

- [ ] `unified-telegram-webhook` déployé
- [ ] Webhook Telegram mis à jour (setWebhook)
- [ ] Webhook vérifié (getWebhookInfo)
- [ ] Test: Créer commande → notification reçue
- [ ] Test: Approuver commande → status mis à jour
- [ ] Test: Créer demande Al-Khayr → notification reçue
- [ ] Test: Approuver demande Al-Khayr → approved=true
- [ ] Test: Ajouter note → admin_notes sauvegardée
- [ ] Ancien webhook `telegram-webhook` désactivé (optionnel)

---

## 🎉 C'est Fait!

Votre bot Telegram gère maintenant:
- 🛒 **Toutes vos commandes** (comme avant)
- ❤️ **Tout le système Al-Khayr** (nouveau)

Avec un seul bot, un seul webhook, zéro changement pour l'utilisateur!

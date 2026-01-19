# Configuration des Database Webhooks - Al-Khayr

## ✅ La fonction fonctionne!

Si vous avez reçu le message test, suivez ces étapes pour activer les notifications automatiques:

---

## 📌 Étape 1: Accéder aux Webhooks

1. Allez sur: https://supabase.com/dashboard/project/ocwlkljrjhgqejetgfgw/database/hooks
2. Cliquez sur **"Create a new hook"**

---

## 📌 Étape 2: Webhook pour Demandes Locales

### Configuration:
- **Name**: `alkhayr-local-notifications`
- **Table**: `local_medicine_requests`
- **Events**: Cochez **INSERT** uniquement
- **Type**: **HTTP Request**
- **Method**: **POST**
- **URL**: `https://ocwlkljrjhgqejetgfgw.supabase.co/functions/v1/alkhayr-telegram-notifications`

### HTTP Headers:
Cliquez sur "Add header" et ajoutez:
```
Content-Type: application/json
```

### HTTP Params (optionnel):
Laissez vide

### Cliquez sur **"Create webhook"**

---

## 📌 Étape 3: Webhook pour Demandes Étrangères

### Configuration:
- **Name**: `alkhayr-foreign-notifications`
- **Table**: `foreign_medicine_requests`
- **Events**: Cochez **INSERT** uniquement
- **Type**: **HTTP Request**
- **Method**: **POST**
- **URL**: `https://ocwlkljrjhgqejetgfgw.supabase.co/functions/v1/alkhayr-telegram-notifications`

### HTTP Headers:
```
Content-Type: application/json
```

### Cliquez sur **"Create webhook"**

---

## 📌 Étape 4: Webhook pour Volontaires

### Configuration:
- **Name**: `alkhayr-volunteer-notifications`
- **Table**: `diaspora_volunteers`
- **Events**: Cochez **INSERT** uniquement
- **Type**: **HTTP Request**
- **Method**: **POST**
- **URL**: `https://ocwlkljrjhgqejetgfgw.supabase.co/functions/v1/alkhayr-telegram-notifications`

### HTTP Headers:
```
Content-Type: application/json
```

### Cliquez sur **"Create webhook"**

---

## 🧪 Test

1. Allez sur votre site: http://localhost:8080/local-medicine-request
2. Remplissez le formulaire:
   - Nom: Test Patient
   - Ville: Alger
   - Médicament: Doliprane
   - Contact WhatsApp: +213555000000
   - Urgence: Urgent
3. Soumettez

**Vous devriez recevoir un message Telegram immédiatement!**

---

## 🔍 Dépannage

### Webhook ne se déclenche pas?

1. **Vérifiez les logs du webhook:**
   - Dashboard → Database → Webhooks
   - Cliquez sur votre webhook
   - Onglet "Logs"

2. **Vérifiez les logs de la fonction:**
   - https://supabase.com/dashboard/project/ocwlkljrjhgqejetgfgw/functions/alkhayr-telegram-notifications/logs

3. **Testez manuellement:**
   ```sql
   -- Dans SQL Editor
   INSERT INTO local_medicine_requests (
     full_name, city, contact_type, contact_value,
     medicine_name, financial_ability, urgency, need_delivery
   ) VALUES (
     'Test Manual', 'Alger', 'whatsapp', '+213555999999',
     'Test Medicine', 'can_pay', 'normal', 'paid'
   );
   ```

### Format du Payload

Le webhook Supabase envoie ce format:
```json
{
  "type": "INSERT",
  "table": "local_medicine_requests",
  "record": {
    "id": 123,
    "full_name": "Patient Name",
    ...
  },
  "schema": "public",
  "old_record": null
}
```

Notre fonction le convertit automatiquement! ✅

---

## ✅ Checklist

- [ ] Webhook créé pour `local_medicine_requests`
- [ ] Webhook créé pour `foreign_medicine_requests`
- [ ] Webhook créé pour `diaspora_volunteers`
- [ ] Test réussi: formulaire → notification reçue
- [ ] Boutons Telegram fonctionnent (Approuver/Rejeter/Notes)

---

## 🎉 C'est Fait!

Une fois les 3 webhooks créés, chaque nouvelle demande ou inscription de volontaire déclenchera automatiquement une notification Telegram avec des boutons interactifs!

**Profitez de votre système Al-Khayr complet!** ❤️

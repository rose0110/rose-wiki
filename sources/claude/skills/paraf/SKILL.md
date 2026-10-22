---
name: paraf
description: Met un document en signature électronique via Paraf (paraf.digital) SANS ouvrir l'interface web — tout se fait depuis Claude Code. À utiliser dès que Rose a un document (PDF, ou fichier à convertir en PDF) et veut le « faire signer », le « mettre en signature », l'« envoyer à signer », « signer électroniquement », placer signature/paraphe/date, récupérer un « document signé » ou suivre l'avancement d'une signature — y compris PLUSIEURS documents à faire signer ensemble en un seul e-mail (enveloppe, sans fusion des PDF). Appelle l'API d'intégration Paraf + la détection IA (Gemini) pour placer les champs.
---

# Paraf — signature électronique depuis Claude Code

Rose a un document à faire signer et **ne veut PAS aller sur l'interface**. Ce skill fait tout via l'API : créer, **placer les champs (signature, paraphe, date, mention) avec la détection IA**, valider avec Rose, envoyer, suivre, télécharger le signé.

Outil : `node paraf.mjs` (dossier du skill). Node 18+. Deps déjà installées (`pdf-to-img`, `pdf-lib`).

## Étape 0 — Clé API (une seule fois)
`node paraf.mjs config` → si `apiKey : [MASQUÉ], générer une clé (repo `paraf-signature`, demander l'email du compte Paraf actif) :
```bash
npx tsx scripts/create-integration-key.ts <email-compte-paraf> "Signature depuis Claude Code"
```
Coller la clé (`pk_live_…`, **la plus longue occurrence** — pas le prefix) dans `apiKey` de `config.json`. Ne jamais l'afficher ni la committer.

## Trois façons de procéder — choisir selon le document

### A) Signature simple → `send` (rapide, 1 signature auto en bas)
Pour un document simple où une signature en bas suffit :
```bash
node paraf.mjs send "doc.pdf" --signer "Nom|email|role" --title "Titre" [--message "..."]
```
Paraf pose une signature par signataire en bas de la dernière page **et envoie les emails**. Retourne un `id` + les liens directs.

**Option code SMS (payante, 0,10 € HT par signataire)** : ajouter `--sms` à `send` ou `prepare-create`, et le mobile en 4e champ du signataire : `--signer "Nom|email|role|06…"`. Le signataire reçoit un code à saisir avant de signer ; la preuve figure sur le certificat. Ne la proposer que si Rose la demande (jamais par défaut). Éprouvé en prod le 26/09/2026.

### B) Placement précis des champs → détection IA + validation (recommandé pour contrats)
Pour un contrat / doc riche (paraphe par page, dates, mentions, placement au bon endroit). Enchaîner :

1. **Créer le brouillon** (rien n'est envoyé) :
   ```bash
   node paraf.mjs prepare-create "contrat.pdf" --signer "Marie|marie@x.fr|Salarié" --signer "Acme|rh@x.fr|Employeur" --title "Contrat"
   ```
   → note le **`token`** (et le `signatureRequestId`) dans le JSON de sortie.

2. **Détecter les champs** (`detect`) :
   ```bash
   node paraf.mjs detect "<token>" "contrat.pdf"
   ```
   Deux moteurs combinés : **(a) ancrage sur le texte du PDF** (`anchor.mjs`, positions exactes — pose la signature pile sur le trait `____` sous « Le salarié », la date sur « Fait à … le … », etc.) = prioritaire et précis ; **(b) détection IA Gemini** en complément/fallback (docs scannés sans couche texte). Sortie JSON : `signatories` (id+nom), `fields`, `previewPath`, `source` (combien d'ancrés vs IA).

   **Options utiles :**
   - `--anchor-only` : pas d'IA (plus rapide/gratuit) ; `--no-anchor` : IA seule.
   - `--initials-skip-pages "7"` : **ne pas parapher ces pages** — indispensable pour une **annexe** jointe (RIB, pièce justificative) : on ne paraphe pas un RIB. Plusieurs pages : `"6,7"`.
   - `--no-initials` : aucun paraphe (juste signatures/dates).
   - `--mentions` : ajoute la mention « Lu et approuvé » (**opt-in, désactivée par défaut**) — en signature électronique elle n'apporte rien, et elle se déclenchait à tort sur une simple instruction du document (« précédée de la mention *Bon pour accord* »).

3. **Relecture visuelle par Claude (obligatoire)** : rends l'aperçu en PNG et **REGARDE-LE toi-même** (Read) avant de le montrer à Rose :
   ```bash
   node -e 'import("pdf-to-img").then(async({pdf})=>{const fs=await import("node:fs");const d=await pdf(process.argv[1],{scale:1.6});let n=0;for await(const p of d){n++;fs.writeFileSync(process.argv[2].replace("%d",n),p)}})' "<previewPath>" "apercu-p%d.png"
   ```
   Vérifie chaque champ : la signature couvre-t-elle un texte important ? la date est-elle sur la ligne ? un champ déborde-t-il ? Si oui, **corrige les coordonnées** dans le tableau `fields` (écris-le en `.json`), régénère avec `preview`, re-regarde. Puis montre l'aperçu final à Rose avec **SendUserFile** + résumé en clair.

4. **Ajuster avec Rose en langage naturel.** Modifier le tableau `fields` (JSON) selon ses retours (« enlève la date », « remonte la signature », « ajoute un paraphe p.3 »). Écrire le tableau ajusté dans un fichier `.json`, puis **régénérer l'aperçu sans recoût IA** :
   ```bash
   node paraf.mjs preview "<token>" "contrat.pdf" --fields-file champs.json
   ```
   Re-montrer l'aperçu ; répéter jusqu'à validation de Rose.

5. **Enregistrer puis envoyer** (⚠️ `send-prepared` **envoie les emails** — ne le faire qu'après le OK explicite de Rose) :
   ```bash
   node paraf.mjs save-fields "<token>" --fields-file champs.json
   node paraf.mjs send-prepared "<token>"
   ```

**Champs** (schéma d'un élément de `fields`) : `{ signatoryId, type, page, posX, posY, width, height, label?, value?, required? }`.
- `type` : `signature` | `initials` (paraphe) | `date` | `text` (mention) | `checkbox` | `attachment`.
- `posX/posY/width/height` : **entiers**, en **% de la page**, origine coin **haut-gauche**. (Le CLI arrondit/clampe tout seul.)
- `signatoryId` : l'`id` d'un signataire (issu de `detect`/`getByToken`). Chaque champ appartient à UN signataire.

### C) Plusieurs documents à signer ensemble → enveloppe (un seul e-mail, un seul lien)

Quand plusieurs PDF partent aux mêmes signataires (solde de tout compte : reçu, certificat,
attestation, dernier bulletin…), **ne pas fusionner les PDF** : passer tous les fichiers à
`send` ou `prepare-create`. Chaque signataire reçoit **un seul e-mail** et **un seul lien**
pour tout signer ; chaque document garde son propre PDF signé. 1 à 15 documents.
```bash
# Envoi direct (une signature en bas de la dernière page de CHAQUE document, par signataire)
node paraf.mjs send recu.pdf certificat.pdf attestation.pdf \
  --title "Solde de tout compte — Nom du salarié" --titles "Reçu|Certificat de travail|Attestation" \
  --signer "Nom|email|Salarié"

# Placement précis : brouillon, puis detect / preview / save-fields DOCUMENT PAR DOCUMENT
node paraf.mjs prepare-create recu.pdf certificat.pdf --title "…" --signer "…"   # affiche les documentId
node paraf.mjs detect "<token>" recu.pdf --document <id_recu>
node paraf.mjs save-fields "<token>" --document <id_recu> --fields-file champs-recu.json
node paraf.mjs detect "<token>" certificat.pdf --document <id_certificat>
node paraf.mjs save-fields "<token>" --document <id_certificat> --fields-file champs-certificat.json
node paraf.mjs send-prepared "<token>"          # une seule fois ; refusé si un document n'a pas de signature
```
- `--document <id>` est **obligatoire** dès que l'enveloppe a plusieurs documents, et le PDF
  passé à `detect`/`preview` doit être **celui de ce document**.
- `status <id>` liste les documents (`documentId`, statut) ; `download <id> <dossier>`
  télécharge **un PDF signé par document** ; `--document <id>` pour un seul.
- `remind` / `cancel` s'appliquent à l'enveloppe entière.
- Plus besoin d'un script ad hoc pour une enveloppe.

## Recettes éprouvées

**Document avec une annexe jointe (RIB, pièce justificative).** On ne paraphe pas une annexe. Fusionner l'annexe à la fin du PDF (`pdf-lib` : `copyPages` + `addPage`), puis exclure sa/ses page(s) du paraphe : `detect … --initials-skip-pages "7"` (7 = page du RIB).

**Proposition commerciale / bon de commande à 2 colonnes (client à gauche, prestataire à droite).** L'ancrage auto associe mal les colonnes : un intitulé de colonne long (« POUR SMART DATA PAY — LE PRESTATAIRE », > 34 car.) est ignoré, et la signature du 2ᵉ signataire se cale du mauvais côté. → **Placer les 4 champs à la main** (date + signature par partie) avec ce `champs.json` type, puis `preview` pour vérifier et ajuster `posY` selon le layout réel :
```json
[
  {"signatoryId":"<ID_CLIENT>","type":"date","page":6,"posX":15,"posY":70,"width":19,"height":3},
  {"signatoryId":"<ID_CLIENT>","type":"signature","page":6,"posX":9,"posY":79,"width":26,"height":4},
  {"signatoryId":"<ID_PRESTATAIRE>","type":"date","page":6,"posX":61,"posY":70,"width":19,"height":3},
  {"signatoryId":"<ID_PRESTATAIRE>","type":"signature","page":6,"posX":55,"posY":79,"width":26,"height":4}
]
```
Colonne gauche = client (x ≈ 9–34), colonne droite = prestataire (x ≈ 55–80) ; `signatoryId` = entiers issus de `detect`. Astuce **côté document source** : prévoir un vrai cadre « Signature » (~4,5 rem de haut) + une ligne « Date » séparée et aérés — l'ancrage comme l'œil s'y retrouvent bien mieux qu'avec un simple trait compact.

## Étape 3 — Suivre / relancer / annuler / récupérer
```bash
node paraf.mjs status <id>                   # avancement (id = signatureRequestId)
node paraf.mjs remind <id>                   # relance TOUS les signataires en attente
node paraf.mjs remind <id> --email "x@y.fr"  # ne relance que celui-là
node paraf.mjs cancel <id>                   # annule : le lien de signature ne marche plus
node paraf.mjs cancel <id> --reason "envoyée par erreur"   # la raison va au journal d'audit
node paraf.mjs download <id> "signe.pdf"     # PDF signé + certificat (409 tant que non signé)
```

**Relance.** Le lien de signature n'est renvoyé qu'UNE fois, à la création : `remind` est
le seul moyen, depuis le CLI, de remettre un signataire sur son parcours. Un même
signataire ne peut pas être relancé deux fois en moins d'une heure (motif `too_soon` dans
`skipped` — c'est un garde-fou, pas une panne).

**Annulation.** À utiliser dès qu'une demande part par erreur (mauvais document, mauvais
signataire) : `cancel` coupe le lien — le signataire qui l'ouvre ensuite lit « Cette demande
de signature a été annulée par son expéditeur » et ne peut plus rien signer ni déposer.
- Un document **déjà signé ne s'annule pas** (`409 already_completed`) : c'est une preuve.
  Pour revenir dessus, il faut un autre document, pas une annulation.
- Rejouable sans dégât : ré-annuler renvoie `alreadyCancelled: true`, pas une erreur.
- **Aucun email n'est envoyé au signataire.** Si quelqu'un attendait le document, il faut le
  prévenir soi-même — le CLI rappelle qui n'avait pas encore signé.

**Un `viewed` qui ne passe pas à `signed` : ce n'est pas le lien.** Le signataire a ouvert
le document ; il lui manque le bouton violet **« Signer le document »** (« Signer
l'enveloppe » pour plusieurs documents), dans la barre collée en bas de l'écran (en haut à droite tant que la PR #87 de Paraf n'est pas en ligne). Tant qu'il
n'est pas cliqué, la signature est dessinée à l'écran mais rien n'est enregistré, et elle
n'est pas gardée : en rouvrant le lien, il faut la poser à nouveau. Le test qui tranche : a-t-il vu l'écran vert « Document signé ! » ? Si
oui, c'est un vrai bug ; si non, c'est le bouton — et relancer sans le lui dire ne sert à rien.

## Rappels
- Réponses en **français**. Adresse prioritaire de Rose si elle signe : `rose.yemeli@yso-conseils.com`.
- La détection pose un **paraphe par page** et (avec `--mentions`) une mention ; elle **suggère**, Rose **valide**. Limiter avec `--initials-skip-pages` / `--no-initials` (cf. Recettes) ; la mention « Lu et approuvé » est **opt-in**.
- `detect` consomme un peu d'IA côté Paraf (1 appel/page) ; `preview` n'en consomme pas → l'utiliser pour toutes les itérations d'ajustement.
- Ne jamais afficher la clé `pk_live_` ; ne pas committer `config.json`.
- Détail API : `docs/INTEGRATION-API.md` dans le repo `paraf-signature`. Endpoints `prepare.*` (par jeton) = tRPC superjson sur `/api/trpc`.

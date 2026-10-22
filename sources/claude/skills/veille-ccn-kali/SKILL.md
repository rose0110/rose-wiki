---
name: veille-ccn-kali
description: >-
  Met en place une veille quotidienne et automatique sur les conventions
  collectives nationales (CCN) françaises, à partir des données KALI publiées
  chaque jour par la DILA (data.gouv.fr). Détecte quelles CCN ont été modifiées,
  si elles sont étendues ou non, et écrit la veille dans une table Airtable
  réutilisable. À utiliser pour tout nouveau projet qui a besoin des mises à
  jour quotidiennes des conventions collectives — sans la logique métier
  spécifique (sections, extraction LLM, PR) du projet OpenPaye.
---

# Veille CCN / KALI — composant réutilisable

## Quand utiliser cette compétence

Dès qu'une application a besoin de **savoir, chaque jour, quelles conventions
collectives ont changé**. La compétence fournit le cœur générique de veille :
détection des modifications KALI → écriture dans Airtable. Toute application
peut ensuite lire la table Airtable.

**Ce qui est dans cette compétence (réutilisable partout) :**
- `watcher_kali.py` — détecte les CCN modifiées chez la DILA.
- `airtable_veille.py` — pousse la veille brute dans Airtable.
- `veille-kali.yml` — workflow GitHub Actions (cron quotidien).

**Ce qui n'est PAS ici (spécifique au projet OpenPaye, non réutilisable) :**
- Classification en 8 macro-sections (`gate_section.py`).
- Extraction de contenu par Gemini/DeepSeek (`extractor.py`).
- Création de pull requests (`pr_creator.py`).
Ces scripts restent dans le dépôt `CCN_OPENPAYE` et ne concernent que cette
application précise.

## Origine

Extrait du pipeline complet construit pour l'app **CCN-OPENPAYE**
(dépôt `rose0110/ccn-openpaye-app`). Le pipeline OpenPaye complet fait
7 phases ; cette compétence n'en garde que les 2 premières + le push Airtable,
qui sont indépendantes de tout métier.

Dossier autonome de référence : `C:\Users\roses\Downloads\Python\CCN_OPENPAYE\kali-watcher\`.

## Concepts KALI essentiels

- **KALI** = base des conventions collectives. Archives quotidiennes :
  `https://echanges.dila.gouv.fr/OPENDATA/KALI/`, format
  `KALI_YYYYMMDD-HHMMSS.tar.gz`, publiées vers 21h-22h UTC.
- **IDCC** = identifiant d'une convention collective (entier).
- Fichiers XML :
  - `KALICONT` = conteneur d'une convention ; IDCC dans `META_CONTENEUR/NUM`.
  - `KALIARTI` = article ; IDCC dans `CONTEXTE/CONTENEUR/@num`.
  - `KALITEXT` = texte/version ; pas d'IDCC direct → ignoré.

## ⚠️ Règle métier — ÉTENDU vs NON ÉTENDU

Toujours préserver et afficher cette distinction, **jamais filtrer dessus** :

- **`VIGUEUR_ETEN`** — étendu par arrêté → applicable à **toutes** les
  entreprises du champ (adhérents et non-adhérents). Erga omnes.
- **`VIGUEUR_NON_ETEN`** — non étendu → applicable **uniquement** aux
  entreprises adhérentes d'une organisation patronale signataire.

Le watcher capture `est_etendu` (booléen) et `a_articles_non_etendus`. Une
application qui consomme la veille doit rendre cette distinction visible à
l'utilisateur.

## Procédure de mise en place pour un nouveau projet

1. **Copier les scripts** `scripts/watcher_kali.py` et
   `scripts/airtable_veille.py` dans le nouveau projet (ou utiliser le dépôt
   autonome `kali-watcher`).

2. **Créer la table Airtable** (nom par défaut `veille_ccn`) avec ces colonnes
   — l'upsert se fait par **nom** de champ, respecter les noms exacts :

   | Colonne | Type |
   |---|---|
   | `id_event` | Single line text (clé d'upsert) |
   | `idcc` | Single line text |
   | `titre` | Single line text |
   | `etat` | Single line text |
   | `est_etendu` | Checkbox |
   | `a_articles_non_etendus` | Checkbox |
   | `date_detection` | Date (avec heure) |
   | `date_publi_kali` | Single line text |
   | `nature` | Single line text |
   | `titres_textes` | Long text |
   | `source_archive` | Single line text |
   | `nb_fichiers_kali` | Number (entier) |

3. **Configurer** un `.env` (ou des secrets GitHub) :
   - `AIRTABLE_PAT` — Personal Access Token (scopes `data.records:read` +
     `data.records:write`).
   - `AIRTABLE_BASE_ID` — id de la base (commence par `app`).
   - `AIRTABLE_TABLE` — optionnel, défaut `veille_ccn`.

4. **Tester** :
   ```bash
   python watcher_kali.py --dry-run        # liste les archives
   python watcher_kali.py                  # produit kali_delta_*.json
   python airtable_veille.py --dry-run     # aperçu sans écrire
   python airtable_veille.py               # pousse dans Airtable
   ```

5. **Automatiser** : déposer `scripts/veille-kali.yml` dans
   `.github/workflows/` du dépôt et y configurer les secrets. Cron 06:00 UTC.

## Filtrer sur un sous-ensemble de CCN

Par défaut `airtable_veille.py` pousse **toutes** les CCN modifiées. Pour ne
suivre qu'une liste précise, fournir `--idcc-file liste.json` où `liste.json`
est un tableau d'IDCC, ex. `["16","1486","2420"]`.

## Mutualiser entre plusieurs applications

Une seule instance du watcher peut alimenter plusieurs applications : la faire
écrire dans une base Airtable partagée ; chaque application lit la table, avec
son propre filtre IDCC si besoin. Inutile de dupliquer le cron par projet.

## Pièges connus

- **Windows** : pas de `/tmp` ; utiliser `os.path.join`. Les chemins avec `\b`
  sont interprétés comme backspace — préférer les chemins bruts.
- **IDCC aberrants** : le watcher filtre les IDCC hors plage `[1, 99999]`.
- **DILA publie tard** : un run à 06:00 UTC capture l'archive de la veille au
  soir. Pour rattraper plusieurs jours : `--since YYYY-MM-DD`.
- **Idempotence** : `id_event` est déterministe (`idcc|kalicont_id|archive`) ;
  re-lancer le pipeline ne crée pas de doublons.

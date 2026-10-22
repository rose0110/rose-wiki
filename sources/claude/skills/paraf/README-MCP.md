# Serveur MCP Paraf — POC « signature électronique native IA »

Expose Paraf comme des **outils MCP** appelables depuis n'importe quel client IA
(Claude Code, Claude Desktop, ChatGPT, agents…). Le différenciateur : `paraf_detect_fields`
place signature / paraphe / date **tout seul** sur un PDF quelconque (ancrage texte + IA),
sans template — ce que DocuSign/Yousign ne font pas via leur MCP.

## Outils exposés (7)

| Outil | Effet | Rôle |
|---|---|---|
| `paraf_create_signature_request` | écrit | Crée une demande depuis un PDF (`mode: prepare` = brouillon, `auto` = signature en bas + envoi) |
| `paraf_detect_fields` | lecture | **Place les champs automatiquement** + renvoie un aperçu image |
| `paraf_save_fields` | écrit | Enregistre les champs (après validation/ajustement) |
| `paraf_send` | ⚠️ réel | Envoie les emails d'invitation (confirmation humaine requise) |
| `paraf_get_status` | lecture | Avancement d'une demande |
| `paraf_cancel` | ⚠️ réel | Annule une demande partie par erreur (confirmation humaine requise ; un document déjà signé n'est pas annulable, et aucun email n'est envoyé aux signataires) |
| `paraf_download_signed` | lecture | Récupère le PDF signé + preuve |

Workflow type : `create (prepare)` → `detect_fields` → *l'humain valide l'aperçu* → `save_fields` → `send` → `get_status` → `download_signed`.

## Prérequis

- Node 18+ et les dépendances installées (`npm install` dans ce dossier).
- Clé API dans `config.json` (`apiKey`) ou variable d'env `PARAF_API_KEY`.

## Installer dans Claude Code (local, stdio)

```bash
claude mcp add paraf -s user -- node "C:\Users\roses\.claude\skills\paraf\mcp-server.mjs"
```
Puis redémarrer Claude Code. Vérifier avec `/mcp` (le serveur `paraf` doit lister 6 outils).

## Installer dans Claude Desktop

Ajouter à `claude_desktop_config.json` (menu Développeur → Modifier la config) :
```json
{
  "mcpServers": {
    "paraf": {
      "command": "node",
      "args": ["C:\\Users\\roses\\.claude\\skills\\paraf\\mcp-server.mjs"]
    }
  }
}
```
Redémarrer l'application.

## De ce POC vers le produit commercial

Ce POC est **local (stdio)** et utilise **une** clé API (celle de config.json). Pour vendre Paraf
comme connecteur MCP grand public, il faudra :

1. **Héberger le serveur en remote** (HTTP streamable) — comme `mcp-d.docusign.com` chez DocuSign —
   pour que n'importe qui l'ajoute par une simple URL, sans installer Node.
2. **OAuth « Se connecter avec Paraf »** : chaque utilisateur s'authentifie sur SON compte Paraf →
   isolation des données + chaque signature facturée sur son compte (modèle éco préservé).
3. **Garde-fous acte légal** : `paraf_send` ne doit jamais partir sans confirmation humaine
   (déjà signalé via `destructiveHint: true` dans les annotations d'outil).
4. Reprendre le cœur (`paraf-core.mjs`) tel quel : la logique métier ne change pas, seule la
   couche transport (stdio → HTTP+OAuth) évolue. Idéalement, héberger `mcp-server` dans le repo
   `paraf-signature` (déployable sur Vercel) plutôt que dans ce dossier skill.

Positionnement : ne pas vendre « on a un MCP » (DocuSign/Yousign l'ont déjà) mais
**« la signature où tu n'as rien à préparer : l'IA lit le document et place tout »**.

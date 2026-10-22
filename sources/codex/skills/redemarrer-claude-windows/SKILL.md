---
name: redemarrer-claude-windows
description: Diagnostiquer, réparer et relancer Claude Desktop ou Claude Code sous Windows, notamment après une mise à jour bloquée, le message « Ce fichier est utilisé par une autre application », l’erreur AppX 0x80070020, un CoworkVMService orphelin, une fenêtre qui ne s’ouvre plus, ou lorsque Rose demande de redémarrer Claude sans redémarrer le PC. Préserver les sessions locales, distinguer MSIX et installateur classique, appliquer d’abord la réparation légère puis basculer vers l’EXE officiel si nécessaire.
---

# Redémarrer Claude sous Windows

Réparer Claude sans fermer les autres programmes. Protéger les sessions Claude Code/Cowork et prouver le redémarrage réel par une fenêtre active, pas seulement par un statut d’installation.

## Garde-fous impératifs

- Ne jamais exécuter `Reset-AppxPackage` : cette commande peut effacer l’état local.
- Ne jamais supprimer `%USERPROFILE%\.claude`, `%APPDATA%\Claude` ni des fichiers `LOCK` en masse.
- Ne jamais tuer tous les processus nommés `claude.exe`. Filtrer leur `ExecutablePath` sur le dossier exact de Claude Desktop afin de ne pas interrompre une CLI Claude Code.
- Ne jamais modifier directement le registre ou la DACL de `CoworkVMService`.
- Ne jamais retirer le package MSIX avant d’avoir une sauvegarde dont le manifeste porte `verification_status: VERIFIED`.
- Ne jamais annoncer « réparé » avant d’avoir observé une fenêtre Claude et contrôlé l’absence de nouveau crash après le lancement final.
- Conserver la sauvegarde. Ne la supprimer que sur demande explicite de Rose.
- Consulter la documentation Anthropic et les signalements actuels avant une bascule d’installateur : le support de Cowork et les formats distribués peuvent changer.

## Procédure

### 1. Diagnostiquer sans modifier l’état

Exécuter :

```powershell
pwsh -File scripts/diagnose-claude.ps1 -Minutes 30
```

Lire le JSON. La signature connue est `KNOWN_MSIX_LOCK_0x80070020` : package `Claude_*__pzs8sxrjxfjjc`, événements AppModel 208/215, erreur `0x80070020` et souvent `CoworkVMService` actif.

Si seule l’installation classique existe, exécuter d’abord `restart-claude-classic.ps1 -PlanOnly`, relire les chemins ciblés, puis relancer sans `-PlanOnly`. Le script ne cible que les processus sous `%LOCALAPPDATA%\AnthropicClaude\` et protège donc les CLI Claude Code externes. Ne pas suivre le chemin MSIX.

### 2. Essayer la réparation légère MSIX

Exécuter d’abord en simulation :

```powershell
pwsh -File scripts/repair-claude-msix.ps1 -Reregister -PlanOnly
```

Puis exécuter sans `-PlanOnly`. Le script arrête seulement le service Claude, les processus Desktop appartenant au package et le pont Chrome de Claude, puis réenregistre le manifeste. Il ne touche ni aux sessions ni aux autres applications.

Relancer Claude et attendre jusqu’à 20 secondes. Un lancement peut dépasser le délai de l’outil : rafraîchir la liste des fenêtres avant de conclure à un échec. Si `0x80070020` réapparaît, passer à l’étape 3.

### 3. Sauvegarder avant la bascule sans redémarrage

Utiliser un dossier local persistant et privé, de préférence `%LOCALAPPDATA%\ClaudeRecoveryBackups` :

```powershell
pwsh -File scripts/backup-claude-data.ps1 -DestinationRoot "$env:LOCALAPPDATA\ClaudeRecoveryBackups"
```

Le script sauvegarde les sessions, extensions et réglages importants, exclut les caches/VM régénérables et les points de liaison temporaires, puis compare automatiquement chemins et tailles. Continuer uniquement si le JSON indique `verification_status: VERIFIED`.

Préciser honnêtement que ce contrôle est automatique ; il ne constitue pas une lecture manuelle du contenu de chaque session.

### 4. Remplacer MSIX par l’installateur classique officiel

Cette bascule est autorisée lorsque Rose demande explicitement de réparer/redémarrer Claude sans redémarrer Windows et que la réparation légère a échoué. Avertir que Cowork peut dépendre du MSIX selon la version actuelle ; Claude Code doit rester disponible.

Prévisualiser :

```powershell
pwsh -File scripts/switch-claude-to-classic.ps1 -VerifiedBackupPath "<dossier de sauvegarde>" -PlanOnly
```

Exécuter ensuite avec `-ConfirmSwitch`. Le script vérifie la sauvegarde et la disponibilité du paquet WinGet `Anthropic.Claude`, installe d’abord l’EXE via WinGet, puis valide la signature Authenticode Anthropic avant de retirer MSIX. L’utilisateur conserve ainsi une installation Claude valide même si le retrait MSIX échoue ensuite.

```powershell
pwsh -File scripts/switch-claude-to-classic.ps1 -VerifiedBackupPath "<dossier de sauvegarde>" -ConfirmSwitch
```

Si un contrôle préalable ou l’installation classique échoue, ne rien désinstaller. Si le retrait MSIX échoue ensuite, conserver l’installation classique et la sauvegarde, puis rapporter exactement l’erreur ; ne réinitialiser aucune donnée.

### 5. Relancer et vérifier réellement

1. Repérer l’application avec le contrôle Windows ; préférer `com.squirrel.AnthropicClaude.claude` pour l’installation classique.
2. Lancer Claude, attendre 5 à 20 secondes, puis rafraîchir `list_apps`/`list_windows`.
3. Exiger une fenêtre unique intitulée `Claude` et inspecter son état.
4. Vérifier le chemin du processus principal, la version utilisée et les nouveaux événements `Application Error`/`Windows Error Reporting` depuis le dernier lancement.
5. Lire le journal `main.log` pour confirmer le chargement des sessions persistantes lorsque cette ligne existe.
6. Signaler séparément les alertes de connecteurs comme `Android-MCP: Server disconnected` ; ne pas les confondre avec l’échec de démarrage.

Considérer la réparation réussie seulement si la fenêtre Claude est visible et stable, avec aucun nouvel événement de crash pendant le contrôle final.

## Rapport final

Indiquer :

- redémarrage Windows effectué : oui/non ;
- variante installée : MSIX/classique et version ;
- fenêtre Claude observée : oui/non ;
- sessions persistantes chargées : nombre si le journal le fournit ;
- nouveaux événements de crash après le lancement final : nombre ;
- sauvegarde : chemin et statut `VERIFIED` ;
- avertissements non bloquants restant visibles ;
- éléments non vérifiés.

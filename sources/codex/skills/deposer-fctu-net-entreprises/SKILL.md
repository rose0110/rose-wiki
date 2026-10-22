---
name: deposer-fctu-net-entreprises
description: Déposer un signalement DSN de fin de contrat unique (FCTU) sur Net-entreprises, contrôler le compte rendu, diagnostiquer un rejet et préparer une copie corrigée sans altérer l'original. À utiliser lorsque Rose demande d'envoyer, tester, redéposer ou suivre un fichier FCTU sur Net-entreprises.
---

# Dépôt FCTU Net-entreprises

Consulter [references/procedure.md](references/procedure.md) pour exécuter le parcours complet. Pour le suivi d'un flux connu et la récupération de l'AER, utiliser en priorité l'API DSN officielle lorsqu'elle est configurée. Utiliser `browser:control-in-app-browser` comme secours ou pour les étapes interactives qui ne sont pas encore raccordées à l'API.

## Règles impératives

- Ne jamais demander, lire ni mémoriser le mot de passe. Laisser Rose se connecter elle-même si la session n'est pas ouverte.
- Traiter le fichier DSN comme une donnée sociale sensible. Ne pas afficher son contenu complet et ne restituer que les informations nécessaires au contrôle.
- Préserver le fichier d'origine. Toute correction se fait dans une copie au nom explicite, avec un diff minimal et un nouveau contrôle du compteur `S90.G00.90.001`.
- Obtenir la confirmation explicite de Rose immédiatement avant chaque clic final sur `Envoyer`. Un redépôt corrigé exige une nouvelle confirmation.
- La même confirmation immédiate est obligatoire avant une requête API de dépôt réel. Une autorisation ancienne ou générale ne vaut pas confirmation d'un nouveau fichier.
- Dès qu'un clic ou une requête de dépôt a pu partir, interdire toute relance automatique et rechercher d'abord le flux/AEE existant afin d'éviter un doublon.
- Utiliser par défaut `rose.yemeli@yso-conseils.com` pour les notifications, sauf consigne explicite contraire.
- Ne jamais appeler un dépôt « accepté par les organismes » sur la seule base d'un contrôle conforme. Distinguer la conformité technique Net-entreprises des comptes rendus métier France Travail, CRM et AER.
- Conserver l'onglet du reçu ou du tableau de bord comme livrable dans le navigateur à la fin.

## Résultat attendu

Fournir un bilan court avec : fichier réellement envoyé, nature `07`, essai/réel, heure et référence de dépôt, statut technique, anomalies exactes le cas échéant, correction appliquée, et éléments encore attendus des organismes.

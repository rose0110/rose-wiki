# Procédure reproductible — signalement FCTU Net-entreprises

## 1. Précontrôle local en lecture seule

1. Vérifier le chemin exact et l'existence du fichier.
2. Lire seulement les rubriques nécessaires :
   - `S10.G00.00.005` : `01` essai ou `02` réel ;
   - `S10.G00.00.006` : version de norme ;
   - `S20.G00.05.001` : doit valoir `07` pour une FCTU ;
   - SIRET de l'établissement, salarié concerné et date de fin ;
   - `S90.G00.90.001` : nombre total de lignes annoncé.
3. Compter les lignes non vides et vérifier l'égalité avec `S90.G00.90.001`.
4. Signaler toute incohérence avant le dépôt. Ne jamais transformer silencieusement un fichier d'essai en fichier réel.

## 2. Voie autonome prioritaire : API DSN officielle

L'API DSN est la voie machine-to-machine officielle. La préférer au clic sur la
loupe dès que le compte déclarant est configuré, car elle couvre le dépôt et la
gestion des retours sans dépendre de l'interface historique.

1. Authentifier le déclarant par `POST https://services.net-entreprises.fr/authentifier/1.0/`
   avec le service `25`. Le mot de passe doit rester chiffré au repos et ne doit
   jamais apparaître dans les journaux.
2. Pour un dépôt autorisé, transmettre les octets ISO-8859-1 du fichier unitaire
   à `https://depot.dsnrg.net-entreprises.fr/deposer-dsn/1.0/`. Ne jamais
   réencoder ni archiver le fichier. Pour un envoi réel, conserver la confirmation
   explicite de Rose dans la tâche et verrouiller toute nouvelle soumission dès
   que la requête a pu partir.
3. Conserver l'identifiant de flux renvoyé dans l'AEE synchrone. Un HTTP 422 est
   un avis de rejet ; il n'autorise pas une relance aveugle.
4. Rechercher les retours par l'identifiant du flux avec
   `GET https://consultation.dsnrg.net-entreprises.fr/lister-retours-flux/2.0/{idflux}`.
   Après un HTTP 401, renouveler le jeton une seule fois. Respecter l'en-tête
   `Expires` avant chaque nouvelle interrogation.
5. Pour le FCTU, traiter notamment les natures `40` (accusé France Travail), `44`
   (AER PDF ou CRM FCTU) et `135` (CRM FCTU NEOReS). Télécharger uniquement l'URL
   dynamique fournie par l'API, avec le même jeton et sans suivre de redirection
   vers un domaine non autorisé.
6. Ne reconnaître une AER que si la nature `44` au statut `OK` restitue réellement
   un PDF valide. Le serveur peut annoncer `text/plain` : contrôler les octets
   `%PDF-`, la taille bornée et le marqueur `%%EOF`, puis calculer le SHA-256.
7. Ranger l'AER dans le dossier du bon salarié/contrat. Une nature `135` au statut
   `ANO` signifie « accepté avec anomalie non bloquante » ; une nature `44` ou
   `135` au statut `KO` reste bloquante. Ne jamais confondre CCO et AER.

Source de référence : guide officiel d'implémentation de l'API DSN, version 6.9
du 4 septembre 2026, disponible depuis
https://www.net-entreprises.fr/declaration/api-dsn/.

## 3. Dépôt dans le navigateur — secours

1. Réutiliser la session Net-entreprises déjà authentifiée. Si elle ne l'est pas, demander uniquement à Rose de se connecter, puis reprendre.
2. Ouvrir la DSN du régime général, choisir le dépôt de fichier et sélectionner le fichier exact contrôlé.
3. Renseigner l'adresse de notification principale `rose.yemeli@yso-conseils.com`, sauf instruction contraire.
4. Contrôler visuellement le nom du fichier et le récapitulatif affichés.
5. Demander à Rose une confirmation explicite pour l'action finale `Envoyer`.
6. Après confirmation seulement, cliquer sur `Envoyer` et relever le reçu : nom du fichier, date/heure et référence de dépôt.

## 4. Lecture du résultat dans le navigateur — secours

1. Revenir au tableau de bord DSN et attendre l'apparition du contrôle.
2. Ouvrir l'historique du dépôt, puis cliquer sur la loupe de la déclaration.
3. Dans le détail de la déclaration, utiliser `Accéder à l'AER` lorsque France
   Travail indique `Compte-rendu disponible`. Ce bouton ouvre normalement une URL
   officielle sous `teledeclarants.francetravail.fr/ex016-dsnpe/V1/`.
4. Si un clic automatisé sélectionne visuellement la loupe sans changer l'URL,
   ne pas le répéter en boucle et ne pas conclure à un succès. Basculer sur la
   recherche API par `idflux`; l'interface historique et ses liens opaques peuvent
   refuser une navigation qui n'est pas reconnue comme geste utilisateur.
5. Lire réellement le bilan : catégorie, caractère bloquant, code, numéro de ligne, rubrique et message exact.
6. Télécharger le bilan d'anomalies lorsqu'il est proposé et conserver son chemin local.

## 5. Correction d'un rejet

1. Copier l'original vers un fichier suffixé `-CORRIGE`; ne jamais modifier l'original.
2. Appliquer uniquement la correction justifiée par le bilan.
3. Recompter les lignes et mettre à jour `S90.G00.90.001` si une ligne a été ajoutée ou supprimée.
4. Comparer original et copie ; documenter exactement les différences.
5. Refaire le précontrôle local, sélectionner la copie corrigée, puis demander une nouvelle confirmation avant le second clic `Envoyer`.

### Cas connu P26V01 : CST-04 sur S21.G00.30.025

Un contrôle de réception réel Net-entreprises du 4 septembre 2026 a renvoyé : `CST-04 — Présence de la rubrique interdite S21.G00.30.025` dans une FCTU d'apprentissage. Le même fichier, après suppression de cette seule rubrique et décrément du compteur `S90`, a été contrôlé conforme.

Pour ce cas précis :

- supprimer `S21.G00.30.025` de la copie FCTU ;
- décrémenter `S90.G00.90.001` d'une ligne ;
- ne pas supprimer la donnée du dossier salarié ni de la DSN mensuelle ;
- ne pas généraliser cette correction à une autre rubrique ou à un autre profil DSN sans preuve du bilan correspondant.

Le cahier technique peut décrire cette rubrique comme conditionnelle pour l'apprentissage ; le contrôle réellement appliqué au point de dépôt FCTU reste la preuve opérationnelle à suivre pour ce profil. Vérifier la documentation officielle correspondant à la version portée en `S10.G00.00.006` lors d'un prochain millésime.

## 6. Clôture du dépôt

1. Si le statut est conforme, relever la référence et télécharger le certificat de conformité s'il est proposé.
2. Dire précisément : « contrôle technique conforme ».
3. Ne déclarer France Travail traité qu'après lecture du compte rendu métier ou de l'AER correspondante.
4. Laisser ouvert et livrable l'onglet du reçu, du détail conforme ou du tableau de bord.
5. Résumer ce qui a été contrôlé automatiquement, ce qui a été lu manuellement et ce qui reste non vérifié.

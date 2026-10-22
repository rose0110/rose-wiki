---
name: assistant-a-jour
description: Garder l'assistant IA d'une application (chat de support, assistant métier) toujours au courant de ce que l'application sait réellement faire, sans que Rose ait jamais à y penser — faits calculés en direct à chaque question, fiche produit régénérée à chaque mise en ligne depuis le code, et test qui bloque la livraison si une fonctionnalité visible manque à l'assistant. À charger dès qu'on AJOUTE, MODIFIE ou RETIRE une fonctionnalité visible (option, écran, prix, formule, parcours) dans une application qui a un assistant ou un chat ; dès qu'un assistant répond faux sur le produit (« ce n'est pas possible » alors que ça l'est, mauvais prix) ; dès qu'on crée un assistant dans une nouvelle application ; ou quand Rose dit « l'assistant doit savoir ce que l'application fait ». Vaut pour TOUTES les applications (Paraf, SmartDataPay, DataPaie, HUP-RH, Innov'Paie, verticales).
---

# Assistant à jour — l'assistant sait ce que l'application sait faire

Décision de Rose du 26/09/2026 : « Je ne veux pas à chaque fois venir modifier l'application. Je ne
veux pas penser à chaque fois à modifier le chat assistant quand l'application change. »

Incident fondateur (Paraf, 26/09/2026) : à « puis-je imposer un ordre de signature ? », le chat a
répondu **non**, alors que l'option « Signer un par un, dans l'ordre » était en production depuis la
PR #27. Sa fiche produit ne décrivait aucune option de l'écran d'envoi : faute d'information, le
modèle a inventé une réponse négative. Un assistant qui nie une fonctionnalité fait perdre une vente
et la confiance ; un assistant qui donne un vieux prix crée un litige.

## La règle (vérifiable)

Quand une session ajoute, modifie ou retire quelque chose que l'utilisateur voit, **elle met
l'assistant à jour dans le même commit**, et un test l'y oblige. Rose n'a jamais à le demander.

## Les trois couches

### 1. Faits en direct — calculés à CHAQUE question
Tout ce qui dépend de la configuration, de l'abonnement ou d'un réglage (prix, option disponible ou
non, quota, formule) est calculé au moment de la question **par les mêmes fonctions que l'écran**,
puis ajouté au prompt système dans un bloc « FAITS EN DIRECT ». Jamais de chiffre recopié dans un
prompt.

Référence Paraf (`server/routers.ts`) :
```ts
export function supportLiveFacts(user) {
  const smsPrice = formatEuros(smsOptionPriceCents());           // même fonction que l'écran
  const smsForUser = !canUseSmsOption(user) ? "non disponible : abonnement payant requis"
    : !smsServiceConfigured() ? "momentanément indisponible" : "disponible pour cet utilisateur";
  return ["=== FAITS EN DIRECT ===", `- « Avec code SMS » : … ${smsPrice} HT par signataire ; ${smsForUser}.`].join("\n");
}
// dans la route du chat :
systemInstruction: { parts: [{ text: `${SYSTEM_PROMPT}\n\n${supportLiveFacts(ctx.user)}` }] }
```
Test : simuler un changement de prix (`mockReturnValueOnce`) et vérifier que le bloc suit
(`server/support-live-facts.test.ts`).

### 2. Fiche produit régénérée à chaque mise en ligne — depuis le code
Un script lancé par la commande de build relit le code et réécrit la fiche de l'assistant : options
des écrans (libellés réels de l'interface), tarifs, FAQ, types de documents, pages. Personne ne la
maintient à la main.

Référence Paraf : `scripts/generate-chatbot-context.ts` (lancé par `pnpm chatbot:context`, lui-même
dans `build` et `build:client`) → `server/_data/chatbot-context.ts`. La fonction
`extractSendOptions()` relève chaque `<Switch id="X">` et le `<Label htmlFor="X">` associé dans
`NewDocument.tsx` et `EnvelopesNew.tsx`.

Pour une nouvelle application : identifier les « lieux de capacité » (écran de création, réglages,
page tarifs, menu) et écrire l'extracteur correspondant. Préférer un repère stable dans le code
(composant d'option, tableau de configuration, registre de fonctionnalités) à une recherche fragile
dans le texte.

### 3. Garde-fou — un test bloque la livraison
Un test échoue si une option visible à l'écran n'apparaît pas dans la fiche de l'assistant. C'est lui
qui oblige la session qui ajoute la fonctionnalité à compléter l'assistant avant de livrer.

Référence Paraf (`server/support-chat.test.ts`, « connaît chaque option d'envoi de l'éditeur ») :
pour chaque `<Switch id>` des écrans, le libellé doit figurer dans `chatbot-context.ts`.

Toute option d'une autre forme (choix à boutons, case, liste) : soit l'extracteur la couvre, soit elle
passe par les faits en direct (couche 1), soit un test dédié l'exige. L'option SMS de Paraf (boutons
« Simple / Avec code SMS ») est couverte par la couche 1.

## Deux consignes qui vont toujours dans le prompt
1. **Ne jamais nier** : « N'affirme JAMAIS qu'une fonctionnalité n'existe pas si elle n'est pas
   décrite ci-dessous : dis que tu n'es pas certain et oriente vers le support. »
2. **Ton factuel** (règle 13) : interdits « Bonne nouvelle », « Excellente question/suggestion »,
   « Super », « Parfait », « Ravi de… », « Tout à fait ! », points d'exclamation. Le fait directement
   (« Oui : activez l'option … »). Un test vérifie la présence de la consigne.

## Quand l'appliquer (déclencheurs)
- Une PR ajoute/modifie/retire une option, un écran, un prix, une formule, un parcours visible →
  vérifier les trois couches **avant** d'ouvrir la PR ; le compte rendu dit « assistant : à jour
  (couche n) ».
- Une nouvelle application reçoit un assistant → poser les trois couches dès le départ.
- Un assistant répond faux sur le produit → c'est un défaut de couche (fiche incomplète ou fait
  recopié) : corriger la couche, pas seulement la phrase, et ajouter le cas au test.

## Preuve (règles 1 et 12F)
Après mise en ligne : poser à l'assistant de production la question qui correspond au changement
(ex. « puis-je imposer un ordre de signature ? », « combien coûte l'option SMS ? ») et citer sa
réponse dans le compte rendu. Les tests prouvent la fiche ; seule la question réelle prouve la
réponse.

## Plus tard (pas encore construit)
Couche 4 — l'assistant interroge lui-même l'application par des outils (« quelles options pour ce
document ? », « où en est ma signature ? ») : réponses propres à l'utilisateur, en temps réel. Plus
puissant, plus de travail et de sécurité (droits, cloisonnement) : à proposer à Rose quand un besoin
précis le justifie.

## Applications
| Application | Assistant | État |
|---|---|---|
| Paraf | chat du support (`server/routers.ts` supportRouter.chat) | Couches 1-2-3 en prod le 26/09/2026 (PR #39, #43) |
| SmartDataPay, DataPaie, HUP-RH, Innov'Paie | à inventorier | à appliquer au prochain chantier touchant l'assistant |

# Sources officielles consultées — chantier « IA en Europe » (11/09/2026)

Extraits relevés le 11/09/2026 dans le navigateur (pages rendues) ou par lecture directe. Chaque extrait
porte la date de dernière mise à jour affichée par la page. Ce fichier est l'archive exigée par la
relecture juridique : aucune phrase des pages légales ne s'appuie sur une source qui n'y figure pas.

## 1. Google Cloud — « Emplacements des points de terminaison » (Gemini Enterprise Agent Platform)

URL : https://docs.cloud.google.com/vertex-ai/generative-ai/docs/learn/locations — « Dernière mise à jour le 2026/09/11 (UTC) ».

Tableau des modèles Google (cellules « Compatible » lues dans le DOM, classe `compare-yes`) :
- `gemini-2.5-flash` : europe-west2, **europe-west1**, europe-west4, europe-west3, europe-north1, europe-central2, europe-west8, europe-southwest1, europe-west9
- `gemini-2.5-pro` : **europe-west1**, europe-west4, europe-north1, europe-central2, europe-west8, europe-southwest1, europe-west9
- `gemini-embedding-001` : toutes les régions européennes listées, dont **europe-west1**
- `gemini-2.5-flash-tts` : **europe-west1**, europe-west4, europe-north1, europe-central2, europe-southwest1

Tableau des modèles partenaires : « Claude Sonnet 4.5 sur Google Cloud » → **europe-west1** uniquement (de même Sonnet 4.6, Opus 4.5, Haiku 4.5 ; Sonnet 5 : aucune région UE).

Mention de la page : « Les points de terminaison ne garantissent pas la résidence des données ni le traitement ML dans la région. Pour en savoir plus sur la résidence des données, consultez Résidence des données. » (renvoi à la source 2).

## 2. Google Cloud — « Data residency »

URL : https://docs.cloud.google.com/vertex-ai/generative-ai/docs/learn/data-residency — « Last updated 2026-09-09 UTC ».

Citation : « Locational endpoints: These endpoints (like us-central1, europe-west1) ensure that ML processing remains entirely within the broader multi-regional or country jurisdiction associated with that region (for example, requests to us-central1 are processed within the United States). »

Citation : « Data stored at rest in the customer selected location remains at rest in that location, independent of the Agent Platform endpoint called by that customer's request. »

Tableau (cellules « Supported ») : Gemini 2.5 Flash (128k et 1M) → US multi-region, **EU multi-region** ; Gemini 2.5 Pro → **EU multi-region** ; Gemini Embeddings (gemini-embedding-001) → **EU multi-region** ; Claude Sonnet 4.5 → **EU multi-region, Belgium (europe-west1)**, Singapore ; Claude Sonnet 4.6 → EU multi-region, Belgium. `gemini-2.5-flash-tts` : absent du tableau (non vérifié).

## 3. Google Cloud — « Gemini Enterprise Agent Platform and zero data retention »

URL : https://docs.cloud.google.com/vertex-ai/generative-ai/docs/data-governance — « Last updated 2026-09-09 UTC ».

- Entraînement : « As outlined in "Training Restriction" in the Service Terms section of the Service Specific Terms, Google won't use your data to train or fine-tune any AI/ML models without your prior permission or instruction. This applies to all managed models on Gemini Enterprise Agent Platform, including GA and pre-GA models. »
- Journalisation anti-abus : « Google may log prompts to detect potential abuse and violations of its Acceptable Use Policy and Prohibited Use Policy as part of providing generative AI services to customers. Only customers whose use of Google Cloud is governed by the Google Cloud Platform Terms of Service are subject to prompt logging for abuse monitoring. If you are in scope for prompt logging for abuse monitoring and want zero data retention, you can request an exception for abuse monitoring. »
- Grounding with Google Search : « Google collects and stores logs, which contains the following Customer Data: queries derived from End User prompts and contextual information […] for up to three (3) days […] There is no way to disable the storage of this information if you use Grounding with Google Search. If you require zero data retention, we recommend using Web Grounding for Enterprise. »
- Cache mémoire : « By default, Google's published Gemini models cache Customer Data (inputs, outputs, and derived data) in-memory to reduce latency […] is stored only in-memory (not at-rest), is isolated at the project level, and has a 24-hour TTL. […] adheres to all Data Residency requirements for the selected location […] This feature can be disabled at the project level. »
- Journalisation requêtes/réponses (BigQuery) : « This feature is disabled by default. »

## 4. Google Cloud — « Service Specific Terms » (conditions contractuelles)

URL : https://cloud.google.com/terms/service-terms — « Last modified July 29, 2026 ».

- § 18 : « Training Restriction. Google will not use Customer Data to train or fine-tune any AI/ML models without Customer's prior permission or instruction. »
- § 20(h) : « Handling of Prompts and Generated Output. Absent Customer's prior permission or instruction, Google will not store outside Customer's Account (i) Customer Data prompted to a Generative AI Service for longer than is reasonably necessary to create the Generated Output, or (ii) the Generated Output. »
- § 20(l) : « Web Grounding for Enterprise. Section 20(k) (Grounding with Google Search) also applies to Web Grounding for Enterprise, except that: (i) all references to 'Grounding with Google Search' are replaced with 'Web Grounding for Enterprise', (ii) in the "Grounded Results" definition, the phrase 'Google's search engine' is replaced with 'GCP's web index', and; (iii) subsection 20k(ii) is deleted. »
- Aucune clause spécifique aux modèles partenaires (Anthropic) trouvée dans ce document (recherches « Third-Party Model », « Partner Model », « Anthropic », « Claude » : aucune occurrence).

## 5. Google Cloud — « Anthropic's Claude on Google Cloud models »

URL : https://docs.cloud.google.com/vertex-ai/generative-ai/docs/partner-models/claude — « Last updated 2026-09-03 UTC ».

- « The Anthropic Claude models on Google Cloud offer fully managed and serverless models as APIs. To use a Claude model on Agent Platform, send a request directly to the Agent Platform API endpoint. »
- « Claude Sonnet 4.5 on Google Cloud […] Retirement Date: Not sooner than Sept 29, 2026. » ⚠️ (voir récap : bascule vers `claude-sonnet-4-6` = une ligne dans `gateway-config.js`, décision de Rose).
- La page ne dit pas si Anthropic reçoit des données : **non vérifié**.

## 6. Anthropic — « Claude on Google Cloud »

URL : https://platform.claude.com/docs/en/build-with-claude/claude-on-vertex-ai (date non affichée ; lu le 11/09/2026).

- « Data retention: Data handling for this offering is governed by Google Cloud. For details, see Agent Platform and zero data retention. »
- « Regional endpoints: Guaranteed data routing through specific geographic regions […] Required for single-region data residency, strict compliance mandates ». « Specific regional endpoints support Claude Sonnet 4.6 and earlier ».
- Identifiant : « Claude Sonnet 4.5 | claude-sonnet-4-5@20250929 ».
- Note sur le service de journalisation requêtes/réponses : « Turning on this service does not give Google or Anthropic any access to your content. » (porte sur ce service de journalisation, pas sur l'inférence).

## 7. Vercel — « Connect to Google Cloud Platform (GCP) » (fédération OIDC)

URL : https://vercel.com/docs/oidc/gcp — « last_updated: 2026-09-01 ». Décrit la fédération d'identité sans clé longue durée (Workload Identity Pool + `@vercel/oidc` + `ExternalAccountClient`). Non retenue pour ce chantier (voir récap, décision documentée), possible plus tard.

## 8. Ce qui n'a PAS été lu (à faire avant toute mention contractuelle)

- Cloud Data Processing Addendum de Google Cloud : lu PARTIELLEMENT le 11/09/2026 (§ 10 ci-dessous) ; texte intégral non archivé, numérotation des sections non confirmée (le juriste a obtenu un rendu qui place les « Restricted European Transfers » en § 10.2/10.3) → aucune référence de paragraphe n'est citée dans les textes légaux.
- Page « Abuse monitoring » : https://docs.cloud.google.com/vertex-ai/generative-ai/docs/learn/abuse-monitoring — non lue en intégralité (citée par la source 3).
- Liste des sous-traitants Google Cloud : https://cloud.google.com/terms/subprocessors — non lue.
- Entité contractante : voir § 9 — **Google Cloud France** pour une adresse de facturation en France (pas Google Cloud EMEA Limited, réservée au reste de l'EMEA). Adresse de facturation du compte « ROSE YEMELI » : à confirmer par Rose sur la première facture (page Facturation, non lisible sans sa session).

## 9. Google Cloud — « Google contracting entity » (lu le 11/09/2026)

URL : https://cloud.google.com/terms/google-entity — « Previous versions (Last modified June 30, 2026) ».
Tableau « Customer's or Partner's billing address → Google contracting entity » pour les accords Google Cloud Platform :
« EMEA except France, Italy and Poland → Google Cloud EMEA Limited » ; « **France → Google Cloud France** » ;
« United States and any other location not covered above → Google LLC ».
Conséquence : pour un compte facturé en France, le sous-traitant ultérieur à inscrire est **Google Cloud France**
(société établie en France), et non Google Cloud EMEA Limited (Irlande) comme le supposaient les brouillons v1/v2.

## 10. Google Cloud — « Cloud Data Processing Addendum » (lu partiellement le 11/09/2026)

URL : https://cloud.google.com/terms/data-processing-addendum — version courante datée « June 8, 2026 ».
§ 4.1 « Restricted Transfers » : « If Customer Personal Data is transferred to any other country and European Data Protection
Law applies to the transfers […] then: a. if Google has adopted an Alternative Transfer Solution […] ; b. […] the SCCs […] apply ».
Définitions : « Customer SCCs » = SCCs (Controller-to-Processor), (Processor-to-Processor) ou (Processor-to-Controller).
§ 10.1 : « Customer Data may be processed in any country where Google or its Subprocessors maintain facilities » — sous
réserve des instructions du client (sélection d'emplacement) ; § 10.2 renvoie à l'Appendix 4 pour les emplacements.
Non lu : Appendix 4 (Specific Products), liste des sous-traitants Google (https://cloud.google.com/terms/subprocessors).

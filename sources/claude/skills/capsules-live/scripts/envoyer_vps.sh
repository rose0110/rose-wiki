#!/usr/bin/env bash
# Envoie des fichiers vers l'atelier de montage du VPS (par défaut ~/capsules/sources/), avec REPRISE :
# la connexion depuis le PC de Rose coupe parfois en plein transfert (« lost connection ») ;
# on reprend là où on en était (sftp reput) jusqu'à ce que la taille distante = taille locale.
#
#   bash envoyer_vps.sh "nom-court.mp4|chemin/local/de la video.mp4" ...
#   DEST=capsules/archives bash envoyer_vps.sh "archive.tar|chemin/local.tar"     (autre dossier distant)
#
# Sortie : une ligne « OK nom » par fichier arrivé entier, « ECHEC nom » après 20 tentatives.
HOTE=${HOTE:-codex-vps}
DEST=${DEST:-capsules/sources}
ssh -o BatchMode=yes "$HOTE" "mkdir -p $DEST" < /dev/null
taille_distante() { ssh -o BatchMode=yes "$HOTE" "stat -c %s $DEST/$1 2>/dev/null || echo 0" < /dev/null; }
for p in "$@"; do
  n="${p%%|*}"; f="${p#*|}"
  taille=$(stat -c %s "$f")
  for essai in $(seq 1 20); do
    dist=$(taille_distante "$n")
    [ "$dist" = "$taille" ] && break
    if [ "$dist" -gt 0 ] 2>/dev/null; then cmd="reput"; else cmd="put"; fi
    printf '%s "%s" "%s/%s"\n' "$cmd" "$f" "$DEST" "$n" > /tmp/_sftp_$$.txt
    sftp -q -o BatchMode=yes -b /tmp/_sftp_$$.txt "$HOTE" > /dev/null 2>&1
  done
  rm -f /tmp/_sftp_$$.txt
  dist=$(taille_distante "$n")
  if [ "$dist" = "$taille" ]; then echo "OK $n $(date +%H:%M:%S)"; else echo "ECHEC $n ($dist / $taille octets)"; fi
done

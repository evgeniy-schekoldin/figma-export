#!/bin/sh

: "${LIMIT:=50}"
: "${INTERVAL_SECONDS:=108000}"   # 30 часов

LIST=/app/files.json
SYNCED_UNTIL="${DOWNLOAD_PATH:-/downloads}/.synced-until"

log() { echo "$(date '+%F %T') | $1"; }

while true; do
  
  if [ "$(node /app/pending.js)" = "0" ]; then

    if [ -s "${SYNCED_UNTIL}" ]; then
      SINCE=$(cat "${SYNCED_UNTIL}")
      npm run get-team-files -- "${FIGMA_TEAM_ID}" -last-modified-after "${SINCE}"

    elif ! grep -q '"key"' "${LIST}" 2>/dev/null; then
      # Первый запуск
      npm run get-team-files -- "${FIGMA_TEAM_ID}"


    fi

  fi

  log "Начало скачивания, лимит ${LIMIT}"
  npm run start -- -limit "${LIMIT}" || true
  log "Завершение, пауза ${INTERVAL_SECONDS}с"

  sleep "${INTERVAL_SECONDS}"
done
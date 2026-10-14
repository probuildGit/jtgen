#!/bin/bash
# Double-click in Finder to start JTGen locally (proxy 3001 + app 3002, per MILESTONES.md)
cd "$(dirname "$0")" || exit 1
./scripts/start-local-app.sh
STATUS=$?
if [ $STATUS -eq 0 ]; then
  open "http://localhost:3002"
fi
echo ""
read -n 1 -s -r -p "Press any key to close this window..."

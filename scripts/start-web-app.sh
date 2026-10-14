#!/bin/bash
# Local preview of JTGenWeb. React on 3003, proxy on 3004. Never use port 3000.
echo "Starting JTGenWeb at http://localhost:3003 (proxy http://localhost:3004)"
BROWSER=none npm start

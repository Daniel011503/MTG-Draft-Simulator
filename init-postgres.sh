#!/bin/bash
set -e

# Add trust authentication for all external connections
echo "host all all 0.0.0.0/0 trust" >> "$PGDATA/pg_hba.conf"

# Reload configuration
pg_ctl reload

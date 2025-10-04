#!/bin/bash
cd /home/kavia/workspace/code-generation/admin-dashboard-and-data-insights-4332-4341/express_backend
npm run lint
LINT_EXIT_CODE=$?
if [ $LINT_EXIT_CODE -ne 0 ]; then
  exit 1
fi


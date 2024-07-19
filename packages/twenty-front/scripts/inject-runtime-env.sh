#!/bin/sh
echo "Generating env in index.html from runtime environment variables..."

BASE_FILENAME="build/index.html"
orig_line="{{env_replaced_by_script}}"
rep="window._env_ = { REACT_APP_SERVER_BASE_URL: \"$REACT_APP_SERVER_BASE_URL\" }"

sed -i '' "s/${orig_line}/${rep}/g" "./$BASE_FILENAME"

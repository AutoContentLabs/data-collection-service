#!/bin/sh

# It is used to perform configuration or additional initialization operations after the container has been created.

# pre create launch commands.
echo $LOCAL_WORKSPACE_FOLDER_BASE_NAME $LOCAL_WORKSPACE_FOLDER

# environment
echo APP_ENV=$APP_ENV

npm ci

# /bin/shA
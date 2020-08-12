#!/bin/bash

content=$2
username=$3
avatar_url=$4

generate_post_data()
{
  cat <<EOF
{
    "content": "$content",
    "username": "$username",
    "avatar_url": "$avatar_url"
}
EOF
}

curl --location --request POST $1 \
    --header 'Content-Type: application/json' \
    --data-raw "$(generate_post_data)"


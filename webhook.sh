#!/bin/bash

content=''
avatar_url=''
username=''
raw_data=''

print_usage() {
  printf "Usage: webhook -w <webhook_url> -a <avatar_url> -u <username> -c <content> -d <raw_data>\n"
}

while getopts 'a:c:d:u:w:f:' flag; do
  case "${flag}" in
    a) avatar_url="${OPTARG}" ;;
    c) content="${OPTARG}" ;;
    d) raw_data="${OPTARG}" ;;
    u) username="${OPTARG}" ;;
    w) webhook="${OPTARG}" ;;
    f) filename="${OPTARG}" ;;
    *) print_usage
       exit 1 ;;
  esac
done

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

if [ "$raw_data" ]
then
  echo sending raw data
  curl --location --request POST "$webhook" \
    --header 'Content-Type: application/json' \
    -d "@$raw_data"
elif [ "$filename" ]
then
  echo sending file
  curl --location --request POST "$webhook" -F "file=@$filename"
else
  echo sending simple body
  curl --location --request POST "$webhook" \
    --header 'Content-Type: application/json' \
    --data-raw "$(generate_post_data)"
fi


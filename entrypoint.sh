#!/bin/bash

curl --location --request POST $1 \
--header 'Content-Type: application/json' \
--header 'Cookie: __cfduid=d6fe830db915d18fc740fd4eaf00e01081597171427; __cfruid=9ab0050629c3deec47f5134ab6adaf6620b16d72-1597173154' \
--data-raw '{
    "content": "${2}",
    "username": "${3}",
    "avatar_url": "${4}"
}'
#!/bin/bash

if [ "$#" -ne 1 ]; then
    echo "Illegal number of parameters"
fi

DISCORD_WEBHOOK_URL=$1

python3 webhook.py -w "$DISCORD_WEBHOOK_URL" -c "Just Content"
python3 webhook.py -w "$DISCORD_WEBHOOK_URL" -c "With User" -u "User"
python3 webhook.py -w "$DISCORD_WEBHOOK_URL" -c "Test" -u "User with Avatar" -a https://github.com/tsickert.png
python3 webhook.py -w "$DISCORD_WEBHOOK_URL" -c "Test" -u "User with File" -f test/test.json
python3 webhook.py -w "$DISCORD_WEBHOOK_URL" -c "Test" -u "User with File and Embed (multi-message behavior)" -f test/test.json --embed-title "Test"
python3 webhook.py -w "$DISCORD_WEBHOOK_URL" -u "User with File and Embed with Color (multi-message behavior)" -f test/test.json --embed-color 1752220 --embed-title "Yay"
python3 webhook.py -w "$DISCORD_WEBHOOK_URL" -d test/test.json

#python3 webhook.py -w "$DISCORD_WEBHOOK_URL" -u "User with File and Embed with Color (multi-message behavior)" -f test/test.json --embed-color 1752220


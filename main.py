import requests
import argparse
import json


def call_webhook(args):
    if args.raw_data is not None or args.raw_data == "":
        data_file = open(args.raw_data)
        data = json.load(data_file)
    else:
        data = {
            'content': args.content,
            'avatar_url': args.avatar_url,
            'username': args.username
        }
    response = requests.post(args.url, json=data)
    print(response.text)


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description='Call Discord Webhooks.')
    parser.add_argument('--url', type=str, required=True)
    parser.add_argument('--content', type=str, required=False)
    parser.add_argument('--avatar-url', type=str, required=False)
    parser.add_argument('--username', type=str, required=False)
    parser.add_argument('--raw-data', type=str, required=False)
    args = parser.parse_args()
    call_webhook(args)



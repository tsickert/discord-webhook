import requests
import argparse
import json

DISCORD_EMBED_LIMIT = 1

DISCORD_INFORMATION = """
This action executes discord webhooks. Discord has a lot of conditions on the proper structure of webhooks. For a full
list of those conditions, please see: https://discord.com/developers/docs/resources/webhook#execute-webhook. 

When debugging this workflow, please be sure to check the status code and the message and check for answers from discord
initially. If you believe that this action failed because of a bug, or you would like to add functionality,
please feel free to open an issue in https://github.com/tsickert/discord-webhook/issues.

Thanks for using this action!
"""


def has_values(obj: dict):
    # Check if
    values = list(obj.values())
    for value in values:
        if value is not None:
            return obj

    return None


def construct_author(args, index):
    return {
        'name': args[f'embed_{index}author_name'],
        'url': args[f'embed_{index}author_url'],
        'icon_url': args[f'embed_{index}author_icon_url']
    }


def construct_footer(args, index):
    return {
        'text': args[f'embed_{index}footer_text'],
        'icon_url': args[f'embed_{index}footer_icon_url']
    }


def construct_payload(args):
    if args['raw_data'] is not None or args['raw_data'] == "":
        data_file = open(args['raw_data'])
        payload = json.load(data_file)
    else:
        payload = {}
        if args['content'] is not None:
            payload['content'] = args['content']
        if args['username'] is not None:
            payload['username'] = args['username']
        if args['avatar_url'] is not None:
            payload['avatar_url'] = args['avatar_url']
        if args['tts'] is not None:
            payload['tts'] = args['tts']

        for i in range(DISCORD_EMBED_LIMIT):
            index = ''
            if i > 0:
                index = f'{i + 1}_'
            embed = {}
            title = args[f'embed_{index}title']
            if title is not None:
                embed['title'] = title

            footer = construct_footer(args, index)
            if has_values(footer):
                embed['footer'] = footer

            description = args[f'embed_{index}description']
            if description is not None:
                embed['description'] = description

            timestamp = args[f'embed_{index}timestamp']
            if timestamp is not None:
                embed['timestamp'] = timestamp

            color = args[f'embed_{index}color']
            if color is not None:
                embed['color'] = color

            image_url = args[f'embed_{index}image_url']
            if image_url is not None:
                embed['image']['url'] = image_url

            thumbnail_url = args[f'embed_{index}thumbnail_url']
            if thumbnail_url is not None:
                embed['thumbnail']['url'] = thumbnail_url

            author = construct_author(args, index)
            if has_values(author):
                embed['author'] = author

            if has_values(embed):
                if 'embeds' not in payload:
                    payload['embeds'] = []
                payload['embeds'].append(embed)

    return payload


def split_payload_for_multi_message(payload: dict):
    embed_payload = {'embeds': payload.pop('embeds')}
    if 'username' in payload:
        embed_payload['username'] = payload['username']
    if 'avatar_url' in payload:
        embed_payload['avatar_url'] = payload['avatar_url']
    # TODO: Not sure if embed only messages will be read with text to speech, find out
    if 'tts' in payload:
        embed_payload['tts'] = payload['tts']
    return payload, embed_payload


def execute_webhook(payload, filename=None):
    print(payload)

    # Use multipart/form-data
    if filename is not None:
        embeds_payload = None
        if 'embeds' in payload:
            payload, embeds_payload = split_payload_for_multi_message(payload)

        response = requests.post(args['webhook'], data=payload, files={'upload_file': open(filename, 'rb')})

        if embeds_payload is not None:
            execute_webhook(embeds_payload)

    # Use application/json
    else:
        response = requests.post(args['webhook'], json=payload)
    handle_response(response)


def handle_response(response):
    print(f'Webhook returned {response.status_code} with message: {response.content}. '
          f'Please see discord documentation at https://discord.com/developers/docs/resources/webhook#execute-webhook '
          f'for more information')
    if response.status_code >= 400:
        print('Discord Webhook Action failed to execute webhook. Please see logs above for details.')
        exit(1)


def add_embed_arguments(p: argparse.ArgumentParser, num: int = DISCORD_EMBED_LIMIT):
    for i in range(num):
        index = ''
        if i > 0:
            index = f'{i + 1}-'
        p.add_argument(f'--embed-{index}title')
        p.add_argument(f'--embed-{index}description')
        p.add_argument(f'--embed-{index}timestamp')
        p.add_argument(f'--embed-{index}color')
        p.add_argument(f'--embed-{index}footer-text')
        p.add_argument(f'--embed-{index}footer-icon-url')
        p.add_argument(f'--embed-{index}image-url')
        p.add_argument(f'--embed-{index}thumbnail-url')
        p.add_argument(f'--embed-{index}author-name')
        p.add_argument(f'--embed-{index}author-url')
        p.add_argument(f'--embed-{index}author-icon-url')
        # TODO: fields
        # p.add_argument(f'--embed-{index}fields')


if __name__ == "__main__":
    print(DISCORD_INFORMATION)

    # Register arguments
    parser = argparse.ArgumentParser(description='Call Discord Webhooks.')
    parser.add_argument('-w', '--webhook', type=str, required=True)
    parser.add_argument('-c', '--content', type=str, required=False)
    parser.add_argument('-u', '--username', type=str, required=False)
    parser.add_argument('-a', '--avatar-url', type=str, required=False)
    parser.add_argument('-t', '--tts', type=bool, required=False)
    parser.add_argument('-f', '--filename', type=str, required=False)
    add_embed_arguments(parser)
    # TODO: allowed mentions
    # TODO: rename raw-data to something less curl-y and more discord-y
    parser.add_argument('-d', '--raw-data', type=str, required=False)

    args = vars(parser.parse_args())
    payload = construct_payload(args)
    execute_webhook(payload, args['filename'])

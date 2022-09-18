# Discord Webhook Action

[![Runs on All Action Runners](https://github.com/tsickert/discord-webhook/actions/workflows/os-test.yml/badge.svg)](https://github.com/tsickert/discord-webhook/actions/workflows/os-test.yml)

This action allows users to set up a GitHub Action that calls Discord webhooks with content message and, optionally, a custom username and avatar url.

Want to know more about Discord Webhooks? Check out the [intro](https://support.discord.com/hc/en-us/articles/228383668-Intro-to-Webhooks) and [documentation](https://discord.com/developers/docs/resources/webhook#execute-webhook) from Discord.

## Recent Updates

- Add Description Character limit truncation (v5.2.0)
- Support for embed URL (v5.1.0)
- Support for multiple operating systems (v5.0.0)
- Improved performance (v5.0.0)
- Changed to TypeScript Action (v5.0.0)
- Support for embeds (v4.0.0)
- Support for file uploads (v3.0.0)

## Inputs

| Name                  | Required | Description                                                                                                                                       |
|-----------------------|----------|---------------------------------------------------------------------------------------------------------------------------------------------------|
| webhook-url           | `true`   | Webhook URL from discord. See: the [intro to webhook docs](https://support.discord.com/hc/en-us/articles/228383668-Intro-to-Webhooks) for details |
| content               | `false`  | Message that is sent via the webhook                                                                                                              |
| username              | `false`  | The username that should appear to send the message. Note: username will have the "bot" badge next to their name                                  |
| avatar-url            | `false`  | URL for the avatar that should appear with the message                                                                                            |
| tts                   | `false`  | Whether the message is text-to-speech                                                                                                             |
| raw-data              | `false`  | Filename of raw JSON body to send. **If this is provided, all other inputs (except `webhook-url`) are ignored**                                   |
| filename              | `false`  | Filename of file to upload. **This input is overridden by `raw-data`. If this is provided, `username` and `avatar-url` are still honored**        |
| embed-title           | `false`  | Title for embed                                                                                                                                   |
| embed-url             | `false`  | URL for embed                                                                                                                                     |
| embed-description     | `false`  | Description for embed                                                                                                                             |
| embed-timestamp       | `false`  | Timestamp for embed (ISO8601 format)                                                                                                              |
| embed-color           | `false`  | Color for embed (integer)                                                                                                                         |
| embed-footer-text     | `false`  | Text content for embed footer                                                                                                                     |
| embed-footer-icon-url | `false`  | Icon URL for embed footer                                                                                                                         |
| embed-image-url       | `false`  | Embed image URL.                                                                                                                                  |
| embed-thumbnail-url   | `false`  | Embed Thumbnail URL                                                                                                                               |
| embed-author-name     | `false`  | Embed Author Name                                                                                                                                 |
| embed-author-url      | `false`  | Embed Author URL                                                                                                                                  |
| embed-author-icon-url | `false`  | Embed Author Icon URL                                                                                                                             |

## Usage

### Secrets

_PSA_: Do not commit your webhook URL to a public repository. Webhooks do not require authentication, so anyone who has the webhook can use it.
GitHub repositories support [secrets](https://docs.github.com/en/actions/configuring-and-managing-workflows/creating-and-storing-encrypted-secrets) (under `settings->secrets`). Encrypt your webhook URLs.

### Scheduling

GitHub Actions allow users to set up various triggers. One of the triggers is `schedule`. This allows users to set a POSIX cron timer to run the action.

Below is an example that sends the message `"Test"` to the provided webhook.

```yaml
on:
  schedule:
    - cron:  '0 12 * * *'

jobs:
  message:
    runs-on: ubuntu-latest
    steps:
    - name: Discord Webhook Action
      uses: tsickert/discord-webhook@v5.2.0
      with:
        webhook-url: ${{ secrets.WEBHOOK_URL }}
        content: "Test"
```

_Disclaimer_: GitHub Actions don't seem to always respect the cron job precisely. My experience has been that crons run about 15 minutes after they're scheduled to and crons that should run per minute will likely only run once every 7-10 minutes.

### Manual Trigger

```yaml
on:
  workflow_dispatch:

jobs:
  message:
    runs-on: ubuntu-latest
    steps:
    - name: Discord Webhook Action
      uses: tsickert/discord-webhook@v5.2.0
      with:
        webhook-url: ${{ secrets.WEBHOOK_URL }}
        content: "Test"
```

#### Note

Multiple triggers are allowed for actions, so the action can have a manual trigger and a cron trigger:

```yaml
on:
  workflow_dispatch:
  schedule:
    - cron:  '0 12 * * *'
```

### Advanced Use Cases

#### Sending Raw JSON

Do you need to send more than just some basic content? Things like embeds, for example? That's supported in `v2.0.0` and above.

Instead of providing content inputs, you can override the
`raw-data` input with the path to a JSON file in your repository that contains your webhook message.

_(Note that all inputs except for `webhook-url` are ignored when `raw-data` is provided)_

##### Example

Let's say we want to send a message with an embed.

Add a JSON file to your repository with the content you want (for this example, this file is called `hi.json`).

```json
{
  "content": "See greeting below",
  "embeds": [{"title":"Hello","description":"World"}]
}
```

**IMPORTANT**: Then, in the yaml where you define this action, you need to do one very important step, and that's adding a step
to pull in the files from your repository.

```
  - uses: actions/checkout@v2
```

This will allow the action to read the JSON that we added to the repository.

The final action will look something like this:

```yaml
name: Hi

on:
  workflow_dispatch:

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Discord Webhook Action
        uses: tsickert/discord-webhook@v5.2.0
        with:
          webhook-url: ${{ secrets.WEBHOOK_URL }}
          raw-data: hi.json
```

#### Uploading Files

Do you need to upload a file? Maybe you have a build artifact that you want to share or a daily update on progress
that's tracked in a file. That's supported in `v3.0.0` and above.

Instead of providing content inputs, you can override the `filename` input with the path to file in your workspace.

_(Note that all inputs except for `webhook-url` are ignored when `raw-data` is provided)_
_(Note `raw-data` overrides this input if it also provided)_

##### Example

Let's say we want upload a file.

Add file to your repository or workspace via an action (for this example, this file is called `test.txt`).

**IMPORTANT**: If you added the file to your respoitory, don't forget to pull in the files from your repository.

```
  - uses: actions/checkout@v2
```

This will allow the action see any files from the repository in the workspace.

The final action will look something like this:

```yaml
name: Hi

on:
  workflow_dispatch:

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Discord Webhook Action
        uses: tsickert/discord-webhook@v5.2.0
        with:
          webhook-url: ${{ secrets.WEBHOOK_URL }}
          filename: test.txt
```

## FAQ

#### Can I use `@` pings with this? They just show up as plain text.

Yes! Plaintext discord messages use the following syntax for `@`s: `<@{user-id}>` for users (example: `<@123456790>`) and `<#{channel-id}>` for channels  (example: `<#123456790>`). The easiest way to find your user ID or channel ID is to enable developer mode and then right click on a user or channel and select `Copy ID`. To enable developer mode, go to `settings(cog wheel)` -> `Advanced (under App Settings header)` -> `Developer Mode`.

#### Help, something is wrong, my webhook isn't sending!

Sorry to hear that! The discord webhook API is complicated and has a long list of conditions and restrictions.
The implementation of the webhook provides a few guard rails against misuse, but does not protect against them all.
Restrictions are set by Discord and may change--therefore the Discord API should ultimately be the source of truth for
those restrictions. If you run into issues, please be sure to check the action outputs. The payload is printed there,
so feel free to use it with curl or postman to first validate that the issue is not with the payload. If it's not,
please open an issue in this repository and I'll take a look!

#### What does "Near-full" support of the webhook API mean?

The Discord API supports up to 10 embeds per webhook and also offers additional `fields` in the embed. Due to the input format for actions, I decided to limit it to one embed and I decided not to support fields. (`fields` seem to be bold text above non-bold text, so they seem reproducable without the explicit field). If you need to have multiple embeds, I would suggest invoking the action multiple times. If requested, I can explore providing the additional embeds and fields, but based on feedback I was getting during dev, the fields provided currently suited most needs. 

The action also doesn't support threads. Support coming soon. 


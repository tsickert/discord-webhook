# Discord Webhook Action

This action allows users to set up a GitHub Action that calls Discord webhooks with content message and, optionally, a custom username and avatar url.

## Inputs

| Name | Required | Description |
|------|----------|-------------|
| webhook-url | `true`        |  Webhook URL from discord. See: the [intro to webhook docs](https://support.discord.com/hc/en-us/articles/228383668-Intro-to-Webhooks) for details           |
| content    | `true`       | Message that is send via the webhook.            |
| username    | `false`       |  The username that should appear to send the message. Note: username will have the "bot" badge next to their name.           |
| avatar-url | `false` | URL for the avatar that should appear with the message. |
| raw-data | `false` | Filename of raw JSON body to send. **If this is provided, all other inputs (except `webhook-url`) are ignored**. |

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
      uses: tsickert/discord-webhook@v0.0.7
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
      uses: tsickert/discord-webhook@v0.0.7
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

Do you need to send more than just some basic content? Things like embeds, for example? That's supported in `v2.0.0` and above.

That's supported. Instead of providing content inputs, you can override the
`raw-data` input with the path to a JSON file in your repository that contains your webhook message.

_(Note that all inputs except for `webhook-url` are ignored when `raw-data` is provided)_

#### Example

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
        uses: tsickert/discord-webhook@v2.0.0
        with:
          webhook-url: ${{ secrets.WEBHOOK_URL }}
          raw-data: hi.json
```
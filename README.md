# Discord Webhook Action

This action allows users to set up a GitHub Action that calls Discord webhooks with content message and, optionally, a custom username and avatar url.

## Inputs

| Name | Required | Description |
|------|----------|-------------|
| webhook-url | `true`        |  Webhook URL from discord. See: the [intro to webhook docs](https://support.discord.com/hc/en-us/articles/228383668-Intro-to-Webhooks) for details           |
| content    | `true`       | Message that is send via the webhook.            |
| username    | `false`       |  The username that should appear to send the message. Note: username will have the "bot" badge next to their name.           |
| avatar-url | `false` | URL for the avatar that should appear with the message. |
| raw-data | `false` | Filename of raw JSON body to send. **If this is provided, all other non-URL inputs are ignored**. |

## Usage

### Secrets

PSA: Do not commit your webhook URL to a public repository. Webhooks do not require authentication, so anyone who has the webhook can use it.
GitHub repositories support [secrets](https://docs.github.com/en/actions/configuring-and-managing-workflows/creating-and-storing-encrypted-secrets) (under `settings->secrets`). Encrypt your webhooks. 

### Scheduled

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

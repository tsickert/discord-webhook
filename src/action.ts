import * as core from '@actions/core'
import {executeWebhook} from '../lib/discord/webhook'
import {readFileSync} from 'fs'

const WEBHOOK_URL = 'webhook-url'
const CONTENT = 'content'
const USERNAME = 'username'
const AVATAR_URL = 'avatar-url'
const RAW_DATA = 'raw-data'
const TITLE = 'title'
const DESCRIPTION = 'description'
const TIMESTAMP = 'timestamp'
const COLOR = 'color'
const NAME = 'name'
const URL = 'url'
const ICON_URL = 'icon-url'
const TEXT = 'text'
const FILENAME = 'filename'
const THREAD_ID = 'thread-id'
const THREAD_NAME = 'thread-name'
const FLAGS = 'flags'
const WAIT = 'wait'

const TOP_LEVEL_WEBHOOK_KEYS = [
  CONTENT,
  USERNAME,
  AVATAR_URL,
  FLAGS,
  THREAD_NAME
]
const EMBED_KEYS = [TITLE, DESCRIPTION, TIMESTAMP, COLOR, URL]
const EMBED_AUTHOR_KEYS = [NAME, URL, ICON_URL]
const EMBED_FOOTER_KEYS = [TEXT, ICON_URL]
const EMBED_IMAGE_KEYS = [URL]
const EMBED_THUMBNAIL_KEYS = [URL]

const DESCRIPTION_LIMIT = 4096

function createPayload(): Record<string, unknown> {
  // If raw-data provided, load the file and ignore the other parameters
  const rawData = core.getInput(RAW_DATA)
  if (rawData.length > 0) {
    return JSON.parse(readFileSync(rawData, 'utf-8'))
  }

  const webhookPayloadMap = parseMapFromParameters(TOP_LEVEL_WEBHOOK_KEYS)
  const embedPayloadMap = createEmbedObject()
  if (embedPayloadMap.size > 0) {
    webhookPayloadMap.set('embeds', [Object.fromEntries(embedPayloadMap)])
  }
  const webhookPayload = Object.fromEntries(webhookPayloadMap)
  core.info(JSON.stringify(webhookPayload))
  return webhookPayload
}

function createEmbedObject(): Map<string, unknown> {
  const embedPayloadMap = parseMapFromParameters(EMBED_KEYS, 'embed')

  if (embedPayloadMap.size > 0) {
    const embedAuthorMap = parseMapFromParameters(
      EMBED_AUTHOR_KEYS,
      'embed-author'
    )
    if (embedAuthorMap.size > 0) {
      embedPayloadMap.set('author', Object.fromEntries(embedAuthorMap))
    }
    const embedFooterMap = parseMapFromParameters(
      EMBED_FOOTER_KEYS,
      'embed-footer'
    )
    if (embedFooterMap.size > 0) {
      embedPayloadMap.set('footer', Object.fromEntries(embedFooterMap))
    }
    const embedImageMap = parseMapFromParameters(
      EMBED_IMAGE_KEYS,
      'embed-image'
    )
    if (embedImageMap.size > 0) {
      embedPayloadMap.set('image', Object.fromEntries(embedImageMap))
    }
    const embedThumbnailMap = parseMapFromParameters(
      EMBED_THUMBNAIL_KEYS,
      'embed-thumbnail'
    )
    if (embedThumbnailMap.size > 0) {
      embedPayloadMap.set('thumbnail', Object.fromEntries(embedThumbnailMap))
    }
  }

  return embedPayloadMap
}

function parseMapFromParameters(
  parameters: string[],
  inputObjectKey = ''
): Map<string, unknown> {
  // Parse action inputs into discord webhook execute payload
  const parameterMap = new Map<string, unknown>()
  core.info(`inputObjectKey: ${inputObjectKey}`)

  for (const parameter of parameters) {
    const inputKey =
      inputObjectKey !== '' ? `${inputObjectKey}-${parameter}` : parameter
    let value = core.getInput(inputKey)
    if (value === '') {
      continue
    }

    if (parameter === TIMESTAMP) {
      const parsedDate = new Date(value)
      value = parsedDate.toISOString()
    }

    if (parameter === DESCRIPTION) {
      if (value.length > DESCRIPTION_LIMIT) {
        value = value.substring(0, DESCRIPTION_LIMIT)
      }
    }

    core.info(`${inputKey}: ${value}`)
    if (value.length > 0) parameterMap.set(parameter.replace('-', '_'), value)
  }

  return parameterMap
}

async function run(): Promise<void> {
  const webhookUrl = core.getInput(WEBHOOK_URL)
  const filename = core.getInput(FILENAME)
  const threadId = core.getInput(THREAD_ID)
  const wait = core.getBooleanInput(WAIT)
  const payload = createPayload()
  try {
    core.info('Running discord webhook action...')
    await executeWebhook(webhookUrl, threadId, filename, wait, payload)
  } catch (error) {
    if (error instanceof Error) core.setFailed(error.message)
  }
}

run()

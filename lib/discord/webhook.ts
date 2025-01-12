import {blob} from 'node:stream/consumers'
import {createReadStream} from 'fs'
import axios from 'axios'
import * as core from '@actions/core'
import {TypedResponse} from '@actions/http-client/lib/interfaces'
import {HttpClient} from '@actions/http-client'
import path from 'node:path'

const client = new HttpClient()

async function handleResponse(response: TypedResponse<unknown>): Promise<void> {
  core.info(
    `Webhook returned ${response.statusCode} with message: ${response.result}. Please see discord documentation at https://discord.com/developers/docs/resources/webhook#execute-webhook for more information`
  )
  if (response.statusCode >= 400) {
    core.error(
      'Discord Webhook Action failed to execute webhook. Please see logs above for details. Error printed below:'
    )
    core.error(JSON.stringify(response))
  }
}

export async function executeWebhook(
  webhookUrl: string,
  threadId: string,
  filePath: string,
  wait: boolean,
  payload: unknown): Promise<void> {

  if (threadId !== '') {
    webhookUrl = `${webhookUrl}?thread_id=${threadId}`
  }

  if (wait) {
    if (webhookUrl.includes('?')) {
      webhookUrl = `${webhookUrl}&wait=true`
    } else {
      webhookUrl = `${webhookUrl}?wait=true`
    }
  }

  if (filePath !== '') {
    const formData = new FormData()
    const fileName = path.basename(filePath);
    formData.append('upload-file', await blob(createReadStream(filePath)), fileName)
    formData.append('payload_json', JSON.stringify(payload))

    const response = await axios({
      method: 'POST',
      url: webhookUrl,
      data: formData,
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })

    if (response.status !== 200) {
      if (filePath !== '') {
        core.error(`failed to upload file: ${response.statusText}`)
      }
    } else if (filePath !== '') {
      core.info(
        `successfully uploaded file with status code: ${response.status}`
      )
    }
  } else {
    const response = await client.postJson(webhookUrl, payload)
    await handleResponse(response)
  }
}

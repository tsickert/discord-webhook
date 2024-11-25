import {readFileSync} from 'fs'
import axios from 'axios'
import * as core from '@actions/core'
import {TypedResponse} from '@actions/http-client/lib/interfaces'
import {HttpClient} from '@actions/http-client'
import path from 'node:path'
import {detect as detectCharset} from 'chardet';
import {Buffer} from 'node:buffer'

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
  threadName: string,
  flags: string,
  wait: boolean,
  payload: unknown): Promise<void>{

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

  if (filePath !== '' || threadName !== '' || flags !== '') {
    const formData = new FormData()
    if (filePath !== '') {
      const file = readFileSync(filePath)
      const fileName = path.basename(filePath);
      const fileBuffer = Buffer.from(file);
      const utf8Bom = Buffer.from([0xEF, 0xBB, 0xBF]);
      const fileEncoding = detectCharset(fileBuffer);
      // Discord has issues with detecting specific utf8 files, so explicitly add the BOM
      const blobContent = (fileEncoding === 'UTF-8') ? new Blob([utf8Bom, fileBuffer]) : new Blob([fileBuffer]);
      formData.append('upload-file', blobContent, fileName);
      formData.append('payload_json', JSON.stringify(payload));
    }
    if (threadName !== '') {
      formData.append('thread_name', threadName)
    }
    if (flags !== '') {
      formData.append('flags', flags)
    }

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
      if (threadName !== '') {
        core.error(`failed to create thread: ${threadName}`)
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

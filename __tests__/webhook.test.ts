import {executeWebhook} from '../src/webhook'
import {expect, test} from '@jest/globals'

test('fails with missing URL', async () => {
  await expect(executeWebhook()).rejects.toThrow('Invalid URL')
})

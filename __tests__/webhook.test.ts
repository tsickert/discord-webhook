import {executeWebhook} from '../src/webhook'

test('fails with missing URL', async () => {
  await expect(executeWebhook()).rejects.toThrow('Invalid URL')
})

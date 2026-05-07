 
import { API_KEY, API_SECRET, CLOUD_NAME } from '@/utils/Constants'
import crypto from 'crypto'

export async function GET() {
  const timestamp = Math.round(Date.now() / 1000)

  const signature = crypto
    .createHash('sha1')
    .update(
      `timestamp=${timestamp}${API_SECRET}`
    )
    .digest('hex')

  return Response.json({
    timestamp,
    signature,
    cloudName: CLOUD_NAME,
    apiKey: API_KEY,
  })
}

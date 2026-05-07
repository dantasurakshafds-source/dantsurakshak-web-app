import { v2 as cloudinary } from 'cloudinary'
import { API_KEY, API_SECRET, CLOUD_NAME } from '@/utils/Constants'

cloudinary.config({
  cloud_name: CLOUD_NAME,
  api_key: API_KEY,
  api_secret: API_SECRET,
})

export async function GET() {
  const timestamp = Math.round(Date.now() / 1000)

  const signature = cloudinary.utils.api_sign_request(
    {
      folder: 'slider_uploads',
      timestamp,
    },
    API_SECRET
  )

  return Response.json({
    timestamp,
    signature,
    cloudName: CLOUD_NAME,
    apiKey: API_KEY,
  })
}
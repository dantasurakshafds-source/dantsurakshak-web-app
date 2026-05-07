export async function uploadToCloudinary(
  file: File,
  resourceType: 'image' | 'video'
) {
   
  const sigRes = await fetch('/api/cloudinary-signature')
  const { timestamp, signature, cloudName, apiKey } = await sigRes.json()

  
  const formData = new FormData()
  formData.append('file', file)
  formData.append('api_key', apiKey)
  formData.append('timestamp', timestamp)
  formData.append('signature', signature)
  formData.append('folder', 'slider_uploads') 

  
  const uploadRes = await fetch(
    `https://api.cloudinary.com/v1_1/${cloudName}/${resourceType}/upload`,
    {
      method: 'POST',
      body: formData,
    }
  )

  if (!uploadRes.ok) {
    throw new Error('Cloudinary upload failed')
  }

  return uploadRes.json()  
}

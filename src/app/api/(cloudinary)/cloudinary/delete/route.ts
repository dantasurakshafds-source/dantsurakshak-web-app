import { v2 as cloudinary } from 'cloudinary'
import { API_KEY, API_SECRET, CLOUD_NAME } from '@/utils/Constants'
import { NextRequest, NextResponse } from 'next/server'

cloudinary.config({
  cloud_name: CLOUD_NAME,
  api_key: API_KEY,
  api_secret: API_SECRET,
})

export async function DELETE(req: NextRequest) {
  try {
    const { publicIds, resourceType = 'image' } = await req.json()

    if (!publicIds || publicIds.length === 0) {
      return NextResponse.json(
        { success: false, message: 'No public IDs provided' },
        { status: 400 }
      )
    }

    const results: Array<{
      publicId: string
      success: boolean
      result?: string
      error?: string
    }> = []
    
    for (const publicId of publicIds) {
      try {
        let extractedPublicId: string = publicId
        
     
        if (publicId.includes('cloudinary.com')) {
          const urlParts: string[] = publicId.split('/')
          
       
          const uploadIndex: number = urlParts.findIndex((part: string) => part === 'upload')
          
          if (uploadIndex !== -1) {
       
            const afterUpload: string[] = urlParts.slice(uploadIndex + 2)
            
          
            const lastPart: string = afterUpload[afterUpload.length - 1]
            const withoutExtension: string = lastPart.split('.')[0]
            afterUpload[afterUpload.length - 1] = withoutExtension
            
            extractedPublicId = afterUpload.join('/')
          }
        }
        
        const result = await cloudinary.uploader.destroy(extractedPublicId, {
          resource_type: resourceType,
        })
        
        results.push({
          publicId: extractedPublicId,
          success: result.result === 'ok',
          result: result.result,
        })
      } catch (error) {
        results.push({
          publicId,
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error',
        })
      }
    }

    const allSuccess: boolean = results.every(r => r.success)

    return NextResponse.json(
      {
        success: allSuccess,
        message: allSuccess ? 'All files deleted successfully' : 'Some files failed to delete',
        results,
      },
      { status: allSuccess ? 200 : 207 }
    )
  } catch (err) {
    console.error('Cloudinary delete error:', err)
    return NextResponse.json(
      { success: false, message: 'Failed to delete from Cloudinary' },
      { status: 500 }
    )
  }
}
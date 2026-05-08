import { useCallback } from 'react'
import { toast } from 'sonner'

interface DeleteOptions {
  resourceType?: 'image' | 'video' | 'raw'
  onSuccess?: () => void
  onError?: (error: unknown) => void
}

interface DeleteResult {
  success: boolean
  results?: Array<{
    publicId: string
    success: boolean
    result?: string
    error?: string
  }>
  message?: string
}

export const useCloudinaryDelete = () => {
  const deleteFromCloudinary = useCallback(
    async (publicIds: string | string[], options: DeleteOptions = {}) => {
      const { resourceType = 'image', onSuccess, onError } = options
      
      const ids = Array.isArray(publicIds) ? publicIds : [publicIds]
      
      if (ids.length === 0) {
        toast.error('No files to delete')
        return false
      }

      try {
        const response = await fetch('/api/cloudinary/delete', {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            publicIds: ids,
            resourceType,
          }),
        })

        const data: DeleteResult = await response.json()

        if (data.success) {
          toast.success(`Deleted ${ids.length} file(s) successfully`)
          onSuccess?.()
          return true
        } else {
          const failedCount = data.results?.filter((r: { success: boolean }) => !r.success).length || 0
          toast.error(`Failed to delete ${failedCount} file(s)`)
          onError?.(data)
          return false
        }
      } catch (error) {
        console.error('Delete error:', error)
        toast.error('Failed to delete from Cloudinary')
        onError?.(error)
        return false
      }
    },
    []
  )

  return { deleteFromCloudinary }
}
'use client'

import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import {
  useGetSingleSliderQuery,
  useUpdateSliderMutation,
} from '@/(store)/services/slider/sliderApi'
import Loader from '@/(common)/Loader'
import { BeatLoader } from 'react-spinners'
import { uploadToCloudinary } from '@/utils/uploadToCloudinary'
import { useCloudinaryDelete } from '@/utils/useCloudinaryDelete'
import { SBody } from '@/utils/Types'

interface UpdateSliderProps {
  id: string
}

interface BodyItem {
  image: File | null
  imagePreview?: string
  existingImage?: string
  text: { en: string; kn: string }
  description: { en: string; kn: string }
}

const UpdateSlider: React.FC<UpdateSliderProps> = ({ id }) => {
  const { data, isLoading } = useGetSingleSliderQuery({ id })
  const [updateSlider, { isLoading: loading }] = useUpdateSliderMutation()
  const { deleteFromCloudinary } = useCloudinaryDelete()
  const router = useRouter()

  // Loading states for deletions
  const [isDeletingSliderImage, setIsDeletingSliderImage] = useState(false)
  const [isDeletingSliderVideo, setIsDeletingSliderVideo] = useState(false)
  const [isDeletingBodyImage, setIsDeletingBodyImage] = useState<number | null>(null)

  const [sliderImage, setSliderImage] = useState<File | null>(null)
  const [sliderImagePreview, setSliderImagePreview] = useState<string>('')
  const [sliderVideo, setSliderVideo] = useState<File | null>(null)
  const [sliderVideoPreview, setSliderVideoPreview] = useState<string>('')
  const [existingSliderImage, setExistingSliderImage] = useState<string | null>(null)
  const [existingSliderVideo, setExistingSliderVideo] = useState<string | null>(null)

  const [text, setText] = useState({ en: '', kn: '' })
  const [description, setDescription] = useState({ en: '', kn: '' })
  const [bodyItems, setBodyItems] = useState<BodyItem[]>([])

  // @ts-expect-error legacy api shape
  const response = data?.result ?? data

  useEffect(() => {
    if (!response) return

    setText(response.text || { en: '', kn: '' })
    setDescription(response.description || { en: '', kn: '' })
    setExistingSliderImage(response.sliderImage || null)
    setExistingSliderVideo(response.sliderVideo || null)

    const arr = Array.isArray(response.body) ? response.body : []
    setBodyItems(
      arr.map((item: SBody) => ({
        image: null,
        imagePreview: '',
        existingImage: item.image,
        text: item.text,
        description: item.description,
      }))
    )
  }, [response])

  // Delete slider image with loader
  const handleDeleteSliderImage = async () => {
    setIsDeletingSliderImage(true)
    try {
      if (existingSliderImage) {
        await deleteFromCloudinary(existingSliderImage, { resourceType: 'image' })
        setExistingSliderImage(null)
      }
      if (sliderImagePreview) {
        URL.revokeObjectURL(sliderImagePreview)
        setSliderImagePreview('')
      }
      setSliderImage(null)
      toast.success('Slider image deleted successfully')
    } catch (error) {
      if(error instanceof Error){
        toast.error('Failed to delete slider image')
      }
    } finally {
      setIsDeletingSliderImage(false)
    }
  }

  // Delete slider video with loader
  const handleDeleteSliderVideo = async () => {
    setIsDeletingSliderVideo(true)
    try {
      if (existingSliderVideo) {
        await deleteFromCloudinary(existingSliderVideo, { resourceType: 'video' })
        setExistingSliderVideo(null)
      }
      if (sliderVideoPreview) {
        URL.revokeObjectURL(sliderVideoPreview)
        setSliderVideoPreview('')
      }
      setSliderVideo(null)
      toast.success('Slider video deleted successfully')
    } catch (error) {
      if(error instanceof Error){
        toast.error('Failed to delete slider video')
      }
    } finally {
      setIsDeletingSliderVideo(false)
    }
  }

  // Delete body image with loader
  const handleDeleteBodyImage = async (index: number) => {
    setIsDeletingBodyImage(index)
    try {
      const item = bodyItems[index]
      if (item.existingImage) {
        await deleteFromCloudinary(item.existingImage, { resourceType: 'image' })
        setBodyItems(prev =>
          prev.map((it, i) => 
            i === index ? { ...it, existingImage: undefined, imagePreview: '', image: null } : it
          )
        )
      }
      if (item.imagePreview) {
        URL.revokeObjectURL(item.imagePreview)
        setBodyItems(prev =>
          prev.map((it, i) => 
            i === index ? { ...it, imagePreview: '', image: null } : it
          )
        )
      }
      toast.success('Body image deleted successfully')
    } catch (error) {
      if(error instanceof Error){
        toast.error('Failed to delete body image')
      }
    } finally {
      setIsDeletingBodyImage(null)
    }
  }

  const handleBodyChange = (
    index: number,
    field: 'text' | 'description',
    lang: 'en' | 'kn',
    value: string
  ) => {
    setBodyItems(prev =>
      prev.map((it, i) =>
        i === index
          ? { ...it, [field]: { ...it[field], [lang]: value } }
          : it
      )
    )
  }

  const handleBodyImageChange = (index: number, file: File | null) => {
    if (file) {
      const previewUrl = URL.createObjectURL(file)
      setBodyItems(prev =>
        prev.map((it, i) => 
          i === index 
            ? { ...it, image: file, imagePreview: previewUrl, existingImage: undefined } 
            : it
        )
      )
    }
  }

  const addBodyItem = () => {
    setBodyItems(prev => [
      ...prev,
      { 
        image: null, 
        imagePreview: '',
        text: { en: '', kn: '' }, 
        description: { en: '', kn: '' } 
      },
    ])
  }

  const removeBodyItem = (index: number) => {
    const item = bodyItems[index]
    if (item.imagePreview) {
      URL.revokeObjectURL(item.imagePreview)
    }
    setBodyItems(prev => prev.filter((_, i) => i !== index))
  }

  const handleSliderImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setSliderImage(file)
      const previewUrl = URL.createObjectURL(file)
      setSliderImagePreview(previewUrl)
      setExistingSliderImage(null)  
    }
  }

  const handleSliderVideoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setSliderVideo(file)
      const previewUrl = URL.createObjectURL(file)
      setSliderVideoPreview(previewUrl)
      setExistingSliderVideo(null)  
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      const payload = new FormData()

      // Slider Image
      if (sliderImage) {
        const img = await uploadToCloudinary(sliderImage, 'image')
        payload.append('sliderImage', img.secure_url)
      } else if (existingSliderImage) {
        payload.append('sliderImage', existingSliderImage)
      }

      // Slider Video
      if (sliderVideo) {
        const vid = await uploadToCloudinary(sliderVideo, 'video')
        payload.append('sliderVideo', vid.secure_url)
      } else if (existingSliderVideo) {
        payload.append('sliderVideo', existingSliderVideo)
      }

      // Body images
      const body: SBody[] = await Promise.all(
        bodyItems.map(async item => {
          let imageUrl = item.existingImage || ''

          if (item.image) {
            const img = await uploadToCloudinary(item.image, 'image')
            imageUrl = img.secure_url
          }

          return {
            image: imageUrl,
            text: item.text,
            description: item.description,
          }
        })
      )

      payload.append('text', JSON.stringify(text))
      payload.append('description', JSON.stringify(description))
      payload.append('body', JSON.stringify(body))

      await updateSlider({ id, formData: payload }).unwrap()

      toast.success('Slider updated successfully')
      router.push('/super-admin/slider')
    } catch (err) {
      console.error(err)
      toast.error('Failed to update slider')
    }
  }

  if (isLoading) return <Loader />

  return (
    <form onSubmit={handleSubmit}>
      <h2>Update Slider</h2>

      {/* Slider Image */}
      <div>
        <label>Slider Image:</label>
        
        {/* Show existing image with delete button and loader */}
        {existingSliderImage && !sliderImage && !sliderImagePreview && (
          <div>
            <img src={existingSliderImage} width={100} alt="Current" />
            <button 
              type="button" 
              onClick={handleDeleteSliderImage}
              disabled={isDeletingSliderImage}
            >
              {isDeletingSliderImage ? <BeatLoader size={8} color="#fff" /> : '✕ Delete Image'}
            </button>
          </div>
        )}
        
        {/* Show preview of new image with remove button and loader */}
        {sliderImagePreview && (
          <div>
            <img src={sliderImagePreview} width={100} alt="Preview" />
            <button 
              type="button" 
              onClick={handleDeleteSliderImage}
              disabled={isDeletingSliderImage}
            >
              {isDeletingSliderImage ? <BeatLoader size={8} color="#fff" /> : '✕ Remove'}
            </button>
          </div>
        )}
        
        <input
          type="file"
          accept="image/*"
          onChange={handleSliderImageChange}
          disabled={!!sliderImagePreview || isDeletingSliderImage}
        />
      </div>

      {/* Slider Video */}
      <div>
        <label>Slider Video:</label>
        
        {/* Show existing video with delete button and loader */}
        {existingSliderVideo && !sliderVideo && !sliderVideoPreview && (
          <div>
            <video src={existingSliderVideo} width={200} controls />
            <button 
              type="button" 
              onClick={handleDeleteSliderVideo}
              disabled={isDeletingSliderVideo}
            >
              {isDeletingSliderVideo ? <BeatLoader size={8} color="#fff" /> : '✕ Delete Video'}
            </button>
          </div>
        )}
        
        {/* Show preview of new video with remove button and loader */}
        {sliderVideoPreview && (
          <div>
            <video src={sliderVideoPreview} width={200} controls />
            <button 
              type="button" 
              onClick={handleDeleteSliderVideo}
              disabled={isDeletingSliderVideo}
            >
              {isDeletingSliderVideo ? <BeatLoader size={8} color="#fff" /> : '✕ Remove'}
            </button>
          </div>
        )}
        
        <input
          type="file"
          accept="video/mp4"
          onChange={handleSliderVideoChange}
          disabled={!!sliderVideoPreview || isDeletingSliderVideo}
        />
      </div>

      {/* Text Fields */}
      <div>
        <input 
          placeholder="Text EN"
          value={text.en} 
          onChange={e => setText({ ...text, en: e.target.value })} 
        />
        <input 
          placeholder="Text KN"
          value={text.kn} 
          onChange={e => setText({ ...text, kn: e.target.value })} 
        />
      </div>

      {/* Description Fields */}
      <div>
        <textarea
          placeholder="Description EN"
          value={description.en}
          onChange={e => setDescription({ ...description, en: e.target.value })}
        />
        <textarea
          placeholder="Description KN"
          value={description.kn}
          onChange={e => setDescription({ ...description, kn: e.target.value })}
        />
      </div>

      <hr />

      <h3>Body Items</h3>
      <button type="button" onClick={addBodyItem}>+ Add Body Item</button>

      {bodyItems.map((item, index) => (
        <div key={index}>
          <h4>Body Item {index + 1}</h4>
          <button type="button" onClick={() => removeBodyItem(index)}>Delete Item</button>
          
          <div>
            <input
              placeholder="Body Text EN"
              value={item.text.en}
              onChange={e => handleBodyChange(index, 'text', 'en', e.target.value)}
            />
            <input
              placeholder="Body Text KN"
              value={item.text.kn}
              onChange={e => handleBodyChange(index, 'text', 'kn', e.target.value)}
            />
          </div>
          
          <div>
            <input
              placeholder="Body Description EN"
              value={item.description.en}
              onChange={e => handleBodyChange(index, 'description', 'en', e.target.value)}
            />
            <input
              placeholder="Body Description KN"
              value={item.description.kn}
              onChange={e => handleBodyChange(index, 'description', 'kn', e.target.value)}
            />
          </div>

          {/* Body Image */}
          <div>
            <label>Body Image:</label>
            
            {/* Show existing body image with delete button and loader */}
            {item.existingImage && !item.image && !item.imagePreview && (
              <div>
                <img src={item.existingImage} width={80} alt="Current" />
                <button 
                  type="button" 
                  onClick={() => handleDeleteBodyImage(index)}
                  disabled={isDeletingBodyImage === index}
                >
                  {isDeletingBodyImage === index ? <BeatLoader size={8} color="#fff" /> : '✕ Delete Image'}
                </button>
              </div>
            )}
            
            {/* Show preview of new body image with remove button and loader */}
            {item.imagePreview && (
              <div>
                <img src={item.imagePreview} width={80} alt="Preview" />
                <button 
                  type="button" 
                  onClick={() => handleDeleteBodyImage(index)}
                  disabled={isDeletingBodyImage === index}
                >
                  {isDeletingBodyImage === index ? <BeatLoader size={8} color="#fff" /> : '✕ Remove'}
                </button>
              </div>
            )}
            
            <input
              type="file"
              accept="image/*"
              onChange={e => handleBodyImageChange(index, e.target.files?.[0] || null)}
              disabled={!!item.imagePreview || isDeletingBodyImage === index}
            />
          </div>
        </div>
      ))}

      <button type="submit" disabled={loading}>
        {loading ? (
          <>
            Updating… <BeatLoader color="#fff" size={8} />
          </>
        ) : (
          'Update'
        )}
      </button>
    </form>
  )
}

export default UpdateSlider
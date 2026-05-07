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
import { SBody } from '@/utils/Types'

interface UpdateSliderProps {
  id: string
}

interface BodyItem {
  image: File | null
  existingImage?: string
  text: { en: string; kn: string }
  description: { en: string; kn: string }
}

const UpdateSlider: React.FC<UpdateSliderProps> = ({ id }) => {
  const { data, isLoading } = useGetSingleSliderQuery({ id })
  const [updateSlider, { isLoading: loading }] = useUpdateSliderMutation()
  const router = useRouter()

  const [sliderImage, setSliderImage] = useState<File | null>(null)
  const [sliderVideo, setSliderVideo] = useState<File | null>(null)
  const [existingSliderImage, setExistingSliderImage] = useState<string | null>(null)
  const [existingSliderVideo, setExistingSliderVideo] = useState<string | null>(null)

  const [text, setText] = useState({ en: '', kn: '' })
  const [description, setDescription] = useState({ en: '', kn: '' })
  const [bodyItems, setBodyItems] = useState<BodyItem[]>([])

  // normalize API response
  // @ts-expect-error legacy api shape
  const response = data?.result ?? data

  /* ---------------- LOAD DATA ---------------- */

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
        existingImage: item.image,
        text: item.text,
        description: item.description,
      }))
    )
  }, [response])

  /* ---------------- BODY HANDLERS ---------------- */

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
    setBodyItems(prev =>
      prev.map((it, i) => (i === index ? { ...it, image: file } : it))
    )
  }

  // const deleteBodyImage = (index: number) => {
  //   setBodyItems(prev =>
  //     prev.map((it, i) =>
  //       i === index ? { ...it, existingImage: undefined } : it
  //     )
  //   )
  // }

  const addBodyItem = () => {
    setBodyItems(prev => [
      ...prev,
      { image: null, text: { en: '', kn: '' }, description: { en: '', kn: '' } },
    ])
  }

  const removeBodyItem = (index: number) => {
    setBodyItems(prev => prev.filter((_, i) => i !== index))
  }

  /* ---------------- SUBMIT ---------------- */

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      const payload = new FormData()

      // Slider Image
      if (sliderImage) {
        const img = await uploadToCloudinary(sliderImage, 'image')
        payload.append('sliderImage', img.secure_url)
      }

      // Slider Video
      if (sliderVideo) {
        const vid = await uploadToCloudinary(sliderVideo, 'video')
        payload.append('sliderVideo', vid.secure_url)
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

  /* ---------------- UI ---------------- */

  if (isLoading) return <Loader />

  return (
    <form onSubmit={handleSubmit} className="form-container">
      <h2 className="form-title">Update Slider</h2>

      {/* Slider Image */}
      {existingSliderImage && !sliderImage && (
        <div className="preview">
          <img src={existingSliderImage} className="preview-image" />
        </div>
      )}
      <input
        type="file"
        accept="image/*"
        onChange={e => setSliderImage(e.target.files?.[0] || null)}
      />

      {/* Slider Video */}
      {existingSliderVideo && !sliderVideo && (
        <div className="preview">
          <video src={existingSliderVideo} controls />
        </div>
      )}
      <input
        type="file"
        accept="video/mp4"
        onChange={e => setSliderVideo(e.target.files?.[0] || null)}
      />

      {/* Text */}
      <input value={text.en} onChange={e => setText({ ...text, en: e.target.value })} />
      <input value={text.kn} onChange={e => setText({ ...text, kn: e.target.value })} />

      {/* Description */}
      <textarea
        value={description.en}
        onChange={e => setDescription({ ...description, en: e.target.value })}
      />
      <textarea
        value={description.kn}
        onChange={e => setDescription({ ...description, kn: e.target.value })}
      />

      <hr />

      {bodyItems.map((item, index) => (
        <div key={index} className="repeater">
          <input
            value={item.text.en}
            onChange={e => handleBodyChange(index, 'text', 'en', e.target.value)}
          />
          <input
            value={item.text.kn}
            onChange={e => handleBodyChange(index, 'text', 'kn', e.target.value)}
          />
          <input
            value={item.description.en}
            onChange={e =>
              handleBodyChange(index, 'description', 'en', e.target.value)
            }
          />
          <input
            value={item.description.kn}
            onChange={e =>
              handleBodyChange(index, 'description', 'kn', e.target.value)
            }
          />

          {item.existingImage && !item.image && (
            <img src={item.existingImage} className="preview-image" />
          )}

          <input
            type="file"
            accept="image/*"
            onChange={e => handleBodyImageChange(index, e.target.files?.[0] || null)}
          />

          <button type="button" onClick={() => removeBodyItem(index)}>
            Remove
          </button>
        </div>
      ))}

      <button type="button" onClick={addBodyItem}>
        Add Body Item
      </button>

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

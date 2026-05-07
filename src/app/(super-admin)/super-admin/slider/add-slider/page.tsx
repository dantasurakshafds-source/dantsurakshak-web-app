'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { useCreateSliderMutation } from '@/(store)/services/slider/sliderApi'
import { BeatLoader } from 'react-spinners'
import { uploadToCloudinary } from '@/utils/uploadToCloudinary'

export type SBody = {
  image: string
  text: { en: string; kn: string }
  description: { en: string; kn: string }
}

const AddSlider: React.FC = () => {
  const [createSlider, { isLoading: loading }] = useCreateSliderMutation()
  const router = useRouter()

  const [sliderImage, setSliderImage] = useState<File | null>(null)
  const [sliderVideo, setSliderVideo] = useState<File | null>(null)
  const [text, setText] = useState({ en: '', kn: '' })
  const [description, setDescription] = useState({ en: '', kn: '' })

  const [bodyItems, setBodyItems] = useState<
    { image: File | null; text: { en: string; kn: string }; description: { en: string; kn: string } }[]
  >([{ image: null, text: { en: '', kn: '' }, description: { en: '', kn: '' } }])

  /* ---------------- BODY HANDLERS ---------------- */

  const handleBodyChange = (
    idx: number,
    field: 'text' | 'description',
    lang: 'en' | 'kn',
    val: string
  ) => {
    setBodyItems(prev => {
      const updated = [...prev]
      updated[idx][field][lang] = val
      return updated
    })
  }

  const handleBodyImageChange = (idx: number, file: File | null) => {
    setBodyItems(prev => {
      const updated = [...prev]
      updated[idx].image = file
      return updated
    })
  }

  const addBodyItem = () => {
    setBodyItems(prev => [
      ...prev,
      { image: null, text: { en: '', kn: '' }, description: { en: '', kn: '' } },
    ])
  }

  const removeBodyItem = (idx: number) => {
    setBodyItems(prev => prev.filter((_, i) => i !== idx))
  }
 
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!sliderImage) {
      toast.error('Slider image is required')
      return
    }

    try {
 
      const sliderImageRes = await uploadToCloudinary(sliderImage, 'image')
      const sliderImageUrl = sliderImageRes.secure_url
 
      let sliderVideoUrl: string | undefined
      if (sliderVideo) {
        const sliderVideoRes = await uploadToCloudinary(sliderVideo, 'video')
        sliderVideoUrl = sliderVideoRes.secure_url
      }

 
      const body: SBody[] = await Promise.all(
        bodyItems.map(async item => {
          let imageUrl = ''
          if (item.image) {
            const imgRes = await uploadToCloudinary(item.image, 'image')
            imageUrl = imgRes.secure_url
          }

          return {
            image: imageUrl,
            text: item.text,
            description: item.description,
          }
        })
      )

 
      const payload = new FormData()
      payload.append('sliderImage', sliderImageUrl)
      if (sliderVideoUrl) payload.append('sliderVideo', sliderVideoUrl)
      payload.append('text', JSON.stringify(text))
      payload.append('description', JSON.stringify(description))
      payload.append('body', JSON.stringify(body))

      await createSlider(payload).unwrap()

      toast.success('Slider created successfully')
      router.push('/super-admin/slider')
    } catch (err) {
      console.error(err)
      toast.error('Failed to create slider')
    }
  }
 
 
  return (
    <form onSubmit={handleSubmit} className="home_slider">
      <h2>Add Slider</h2>

      <div className="input_data">
        <label>Slider Image:</label>
        <input
          type="file"
          accept="image/*"
          onChange={e => setSliderImage(e.target.files?.[0] || null)}
        />
      </div>

      <div className="input_data">
        <label>Slider Video (mp4):</label>
        <input
          type="file"
          accept="video/mp4"
          onChange={e => setSliderVideo(e.target.files?.[0] || null)}
        />
      </div>

      <div className="input_data">
        <label>Text EN:</label>
        <input value={text.en} onChange={e => setText({ ...text, en: e.target.value })} />
      </div>

      <div className="input_data">
        <label>Text KN:</label>
        <input value={text.kn} onChange={e => setText({ ...text, kn: e.target.value })} />
      </div>

      <div className="input_data">
        <label>Description EN:</label>
        <textarea
          value={description.en}
          onChange={e => setDescription({ ...description, en: e.target.value })}
        />
      </div>

      <div className="input_data">
        <label>Description KN:</label>
        <textarea
          value={description.kn}
          onChange={e => setDescription({ ...description, kn: e.target.value })}
        />
      </div>

      <hr />

      <h3>Slider Body Items</h3>

      {bodyItems.map((item, idx) => (
        <div key={idx} className="slider_repeater">
          <input
            placeholder="Body Text EN"
            value={item.text.en}
            onChange={e => handleBodyChange(idx, 'text', 'en', e.target.value)}
          />
          <input
            placeholder="Body Text KN"
            value={item.text.kn}
            onChange={e => handleBodyChange(idx, 'text', 'kn', e.target.value)}
          />
          <input
            placeholder="Body Desc EN"
            value={item.description.en}
            onChange={e => handleBodyChange(idx, 'description', 'en', e.target.value)}
          />
          <input
            placeholder="Body Desc KN"
            value={item.description.kn}
            onChange={e => handleBodyChange(idx, 'description', 'kn', e.target.value)}
          />
          <input
            type="file"
            accept="image/*"
            onChange={e => handleBodyImageChange(idx, e.target.files?.[0] || null)}
          />
          <button type="button" onClick={() => removeBodyItem(idx)}>
            Remove
          </button>
        </div>
      ))}

      <button type="button" onClick={addBodyItem}>
        + Add Body Item
      </button>

      <button type="submit" disabled={loading}>
        {loading ? (
          <>
            Creating… <BeatLoader color="#fff" size={8} />
          </>
        ) : (
          'Create'
        )}
      </button>
    </form>
  )
}

export default AddSlider

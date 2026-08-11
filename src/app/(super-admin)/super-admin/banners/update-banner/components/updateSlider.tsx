'use client'

import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { useGetSingleSliderQuery, useUpdateSliderMutation } from '@/(store)/services/slider/sliderApi'
import Loader from '@/(common)/Loader'
import { BeatLoader } from 'react-spinners'
import OvalLoader from '@/(common)/OvalLoader'
import { uploadToCloudinary } from '@/utils/uploadToCloudinary'
import { useCloudinaryDelete } from '@/utils/useCloudinaryDelete'
import { SBody } from '@/utils/Types'
import { MdImage, MdVideoLibrary, MdTextFields, MdDescription, MdAddCircleOutline, MdDelete, MdClose, MdCloudUpload, MdViewList, } from "react-icons/md";
import Image from 'next/image'

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
      if (error instanceof Error) {
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
      if (error instanceof Error) {
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
      if (error instanceof Error) {
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

      toast.success('Banner updated successfully')
      router.back()
    } catch (err) {
      console.error(err)
      toast.error('Failed to update banner')
    }
  }

  /* ── UI helpers ──────────────────────────────────────────── */
  const SectionHeader = ({
    title,
    icon,
    open,
    onToggle,
  }: {
    title: string;
    icon: React.ReactNode;
    open: boolean;
    onToggle: () => void;
  }) => (
    <div className="banner-section__header">
      <h2 className="banner-section__title">
        {icon} {title}
      </h2>
      <button
        type="button"
        className="banner-section__toggle"
        onClick={onToggle}
      >
        {open ? "−" : "+"}
      </button>
    </div>
  );

  if (isLoading) return <Loader />

  return (
    <form onSubmit={handleSubmit} className="banners-form">
      <div className="banners-layout">

        {/* LEFT SIDE */}
        <div className="banners-main">

          {/* Text & Description */}
          <div className="banner-section">
            <SectionHeader
              title="Text & Description"
              icon={<MdTextFields />}
              open={true}
              onToggle={() => { }}
            />

            <div className="banner-section__body">

              <div className="banner-form-row">
                <div className="banner-form-group">
                  <label className="banner-label">
                    <MdTextFields />
                    Text (English)
                    <span className="banner-label__required">*</span>
                  </label>

                  <input
                    className="banner-input"
                    placeholder="Enter text in English"
                    value={text.en}
                    onChange={(e) =>
                      setText({ ...text, en: e.target.value })
                    }
                  />
                </div>

                <div className="banner-form-group">
                  <label className="banner-label">
                    <MdTextFields />
                    Text (Kannada)
                    <span className="banner-label__required">*</span>
                  </label>

                  <input
                    className="banner-input"
                    placeholder="Enter text in Kannada"
                    value={text.kn}
                    onChange={(e) =>
                      setText({ ...text, kn: e.target.value })
                    }
                  />
                </div>
              </div>

              <div className="banner-form-row">
                <div className="banner-form-group">
                  <label className="banner-label">
                    <MdDescription />
                    Description (English)
                    <span className="banner-label__required">*</span>
                  </label>

                  <textarea
                    className="banner-textarea"
                    placeholder="Description EN"
                    value={description.en}
                    onChange={(e) =>
                      setDescription({
                        ...description,
                        en: e.target.value,
                      })
                    }
                  />
                </div>

                <div className="banner-form-group">
                  <label className="banner-label">
                    <MdDescription />
                    Description (Kannada)
                    <span className="banner-label__required">*</span>
                  </label>

                  <textarea
                    className="banner-textarea"
                    placeholder="Description KN"
                    value={description.kn}
                    onChange={(e) =>
                      setDescription({
                        ...description,
                        kn: e.target.value,
                      })
                    }
                  />
                </div>
              </div>
            </div>
          </div>

          {/* BODY ITEMS */}
          <div className="banner-section">
            <SectionHeader
              title="Body Items"
              icon={<MdViewList />}
              open={true}
              onToggle={() => { }}
            />

            <div className="banner-section__body">

              {bodyItems.map((item, index) => (
                <div
                  key={index}
                  className="banner-body-item"
                >
                  <div className="banner-body-item__header">
                    <h4 className="banner-body-item__title">
                      <MdViewList />
                      Body Item {index + 1}
                    </h4>

                    <button
                      type="button"
                      className="banner-btn-danger"
                      onClick={() => removeBodyItem(index)}
                    >
                      <MdDelete />
                      Remove
                    </button>
                  </div>

                  <div className="banner-form-row">
                    <div className="banner-form-group">
                      <label className="banner-label">
                        <MdTextFields />
                        Text (English)
                        <span className="banner-label__required">*</span>
                      </label>

                      <input
                        className="banner-input"
                        placeholder="Body Text EN"
                        value={item.text.en}
                        onChange={(e) =>
                          handleBodyChange(
                            index,
                            'text',
                            'en',
                            e.target.value
                          )
                        }
                      />
                    </div>

                    <div className="banner-form-group">
                      <label className="banner-label">
                        <MdTextFields />
                        Text (Kannada)
                        <span className="banner-label__required">*</span>
                      </label>

                      <input
                        className="banner-input"
                        placeholder="Body Text KN"
                        value={item.text.kn}
                        onChange={(e) =>
                          handleBodyChange(
                            index,
                            'text',
                            'kn',
                            e.target.value
                          )
                        }
                      />
                    </div>
                  </div>

                  <div className="banner-form-row">
                    <div className="banner-form-group">
                      <label className="banner-label">
                        <MdDescription />
                        Description (English)
                        <span className="banner-label__required">*</span>
                      </label>

                      <textarea
                        className="banner-textarea"
                        placeholder="Description EN"
                        value={item.description.en}
                        onChange={(e) =>
                          handleBodyChange(
                            index,
                            'description',
                            'en',
                            e.target.value
                          )
                        }
                      />
                    </div>

                    <div className="banner-form-group">
                      <label className="banner-label">
                        <MdDescription />
                        Description (Kannada)
                        <span className="banner-label__required">*</span>
                      </label>

                      <textarea
                        className="banner-textarea"
                        placeholder="Description KN"
                        value={item.description.kn}
                        onChange={(e) =>
                          handleBodyChange(
                            index,
                            'description',
                            'kn',
                            e.target.value
                          )
                        }
                      />
                    </div>
                  </div>

                  {/* BODY IMAGE */}
                  <div className="banner-form-group">
                    <label className="banner-label">
                      <MdImage />
                      Body Image
                      <span className="banner-label__optional">
                        (optional)
                      </span>
                    </label>

                    {(item.existingImage || item.imagePreview) ? (
                      <div
                        style={{
                          display: "inline-flex",
                          position: "relative",
                          width: 'fit-content',
                        }}
                      >
                        <Image
                          src={
                            item.imagePreview ||
                            item.existingImage || ''
                          }
                          alt="Body"
                          className="banner-preview__img banner-preview__img--small"
                          style={{
                            width: 100,
                            height: 80,
                            objectFit: "cover",
                            borderRadius: 5,
                          }}
                          width={100}
                          height={80}
                        />

                        <button
                          type="button"
                          className="banner-preview__remove"
                          onClick={() =>
                            handleDeleteBodyImage(index)
                          }
                          disabled={
                            isDeletingBodyImage === index
                          }
                        >
                          {isDeletingBodyImage === index ? (
                            <BeatLoader
                              size={5}
                              color="#fff"
                            />
                          ) : (
                            <MdClose />
                          )}
                        </button>
                      </div>
                    ) : (
                      <div
                        className="banner-upload-zone"
                        style={{ padding: "16px" }}
                      >
                        <div
                          className="banner-upload-zone__icon"
                          style={{ fontSize: 20 }}
                        >
                          <MdImage />
                        </div>

                        <p className="banner-upload-zone__text">
                          Click to upload body image
                        </p>

                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) =>
                            handleBodyImageChange(
                              index,
                              e.target.files?.[0] || null
                            )
                          }
                        />
                      </div>
                    )}
                  </div>
                </div>
              ))}

              <button
                type="button"
                className="banner-add-btn"
                onClick={addBodyItem}
              >
                <MdAddCircleOutline />
                Add Body Item
              </button>

            </div>
          </div>
        </div>

        {/* RIGHT SIDEBAR */}
        <div className="banners-sidebar">

          {/* BANNER IMAGE */}
          <div className="banner-section">
            <div className="banner-section__header">
              <h2 className="banner-section__title">
                <MdImage />
                &nbsp;Banner Image
              </h2>
            </div>

            <div className="banner-section__body">

              {(existingSliderImage || sliderImagePreview) ? (
                <div style={{ position: "relative" }}>
                  <Image
                    src={
                      sliderImagePreview ||
                      existingSliderImage ||
                      ""
                    }
                    alt="Banner"
                    style={{
                      width: "100%",
                      height: 180,
                      objectFit: "cover",
                      borderRadius: 8,
                    }}
                    width={400}
                    height={180}
                  />

                  <button
                    type="button"
                    className="banner-preview__remove"
                    onClick={handleDeleteSliderImage}
                    disabled={isDeletingSliderImage}
                  >
                    {isDeletingSliderImage ? (
                      <BeatLoader
                        size={5}
                        color="#fff"
                      />
                    ) : (
                      <MdClose />
                    )}
                  </button>
                </div>
              ) : (
                <div className="banner-featured-zone">
                  <div className="banner-featured-zone__icon">
                    <MdCloudUpload />
                  </div>

                  <p className="banner-featured-zone__text">
                    Click or Drag to Upload Banner Image
                  </p>

                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleSliderImageChange}
                  />
                </div>
              )}
            </div>
          </div>

          {/* BANNER VIDEO */}
          <div className="banner-section">
            <SectionHeader
              title="Banner Video"
              icon={<MdVideoLibrary />}
              open={true}
              onToggle={() => { }}
            />

            <div className="banner-section__body">

              {(existingSliderVideo || sliderVideoPreview) ? (
                <div
                  className="banner-preview"
                  style={{ display: "block", marginBottom: 10 }}
                >
                  <video
                    controls
                    className="banner-preview__video"
                    src={
                      sliderVideoPreview ||
                      existingSliderVideo ||
                      ""
                    }
                  />

                  <button
                    type="button"
                    className="banner-preview__remove"
                    onClick={handleDeleteSliderVideo}
                    disabled={isDeletingSliderVideo}
                  >
                    {isDeletingSliderVideo ? (
                      <BeatLoader
                        size={5}
                        color="#fff"
                      />
                    ) : (
                      <MdClose />
                    )}
                  </button>
                </div>
              ) : (
                <div className="banner-upload-zone">
                  <div className="banner-upload-zone__icon">
                    <MdVideoLibrary />
                  </div>

                  <p className="banner-upload-zone__text">
                    Click or Drag to Upload Video
                  </p>

                  <p className="banner-upload-zone__hint">
                    MP4, WEBM up to 50MB · Optional
                  </p>

                  <input
                    type="file"
                    accept="video/mp4,video/webm"
                    onChange={handleSliderVideoChange}
                  />
                </div>
              )}
            </div>
          </div>

          {/* ACTIONS */}
          <div className="banners-footer">
            <button
              type="button"
              className="banner-btn-cancel"
              onClick={() =>
                router.back()
              }
            >
              Cancel
            </button>

            <button
              type="submit"
              className="banner-btn-submit"
              disabled={loading}
              style={{ fontWeight: 600 }}
            >
              {loading ? (
                <>
                  <span style={{ fontWeight: 600 }}>Updating...</span>
                  <OvalLoader height="20" width="20" color="#ffffff" strokeWidth={5} strokeWidthSecondary={5} ariaLabel="oval-loading" />
                </>
              ) : (
                "Update Banner"
              )}
            </button>
          </div>
        </div>
      </div>
    </form>
  )
}

export default UpdateSlider
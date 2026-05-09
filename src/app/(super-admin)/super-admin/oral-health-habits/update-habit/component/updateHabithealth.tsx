"use client"

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import Image from 'next/image'
import { BeatLoader } from 'react-spinners'
import { useGetSingleHabitHealthQuery, useUpdateHabitHealthMutation } from '@/(store)/services/habit-health/habitHealthApi'
import { uploadToCloudinary } from '@/utils/uploadToCloudinary'
import { useCloudinaryDelete } from '@/utils/useCloudinaryDelete'
import Loader from '@/(common)/Loader'
import { HabitHealthRepeaterItem } from '@/utils/Types'
import CKEditorWrapper from '@/app/(super-admin)/(common)/editor/CKEditorWrapper'
import {
  MdImage,
  MdTextFields,
  MdDescription,
  MdAddCircleOutline,
  MdDelete,
  MdClose,
  MdCloudUpload,
  MdHealthAndSafety
} from "react-icons/md"

// Types
interface BilingualField { en: string; kn: string }
interface RepeaterItem {
  description: BilingualField[]
}

interface UpdateDiseaseProps {
  id: string
}

export default function EditHabit({ id }: UpdateDiseaseProps) {
  const router = useRouter()

  // API Hooks
  const { data: habitData, isLoading: isFetching } = useGetSingleHabitHealthQuery({ id })
  const [updateHabit, { isLoading: isUpdating }] = useUpdateHabitHealthMutation()
  const { deleteFromCloudinary } = useCloudinaryDelete()

  // Section collapse states
  const [mainInfoOpen, setMainInfoOpen] = useState(true)
  const [contentOpen, setContentOpen] = useState(true)

  // Deletion loading states
  const [isDeletingMainImage, setIsDeletingMainImage] = useState(false)

  // State
  const [mainTitle, setMainTitle] = useState<BilingualField>({ en: '', kn: '' })
  const [mainImage, setMainImage] = useState<File | null>(null)
  const [mainImagePreview, setMainImagePreview] = useState<string>('')
  const [mainImageUrl, setMainImageUrl] = useState<string>('')
  const [repeater, setRepeater] = useState<RepeaterItem[]>([])

  const response = habitData?.result || {}

  useEffect(() => {
    if (habitData) {
      setMainTitle(response.habit_health_main_title || { en: '', kn: '' })
      setMainImageUrl(response.habit_health_main_image || '')
      const formattedRepeater = response.habit_health_repeater?.map((item: HabitHealthRepeaterItem) => ({
        description: item.description || [{ en: '', kn: '' }]
      })) || []
      setRepeater(formattedRepeater)
    }
  }, [habitData])

  // Delete handler
  const handleDeleteMainImage = async () => {
    setIsDeletingMainImage(true)
    try {
      if (mainImageUrl) {
        await deleteFromCloudinary(mainImageUrl, { resourceType: 'image' })
      }
      if (mainImagePreview) {
        URL.revokeObjectURL(mainImagePreview)
      }
      setMainImageUrl('')
      setMainImagePreview('')
      setMainImage(null)
      toast.success('Main image removed')
    } catch {
      toast.error('Failed to delete main image')
    } finally {
      setIsDeletingMainImage(false)
    }
  }

  // Image handler
  const handleMainImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image must be under 5MB')
      return
    }
    if (!file.type.startsWith('image/')) {
      toast.error('Please upload a valid image')
      return
    }
    setMainImage(file)
    setMainImagePreview(URL.createObjectURL(file))
    setMainImageUrl('')
  }

  // Repeater handlers
  const addRepeater = () =>
    setRepeater(prev => [...prev, {
      description: [{ en: '', kn: '' }]
    }])

  const removeRepeater = (index: number) =>
    setRepeater(prev => prev.filter((_, i) => i !== index))

  const updateRepeaterDescription = (
    index: number,
    lang: keyof BilingualField,
    value: string
  ) => setRepeater(prev =>
    prev.map((item, i) =>
      i === index
        ? {
          ...item,
          description: [{
            ...item.description[0],
            [lang]: value
          }]
        }
        : item
    )
  )

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!mainTitle.en.trim() || !mainTitle.kn.trim()) {
      toast.error('Main title in both languages is required')
      return
    }
    if (!mainImageUrl && !mainImage) {
      toast.error('Main image is required')
      return
    }

    try {
      let finalImageUrl = mainImageUrl
      if (mainImage) {
        const res = await uploadToCloudinary(mainImage, 'image')
        finalImageUrl = res.secure_url
      }

      const formData = new FormData()
      formData.append('habit_health_main_title', JSON.stringify(mainTitle))
      formData.append('habit_health_repeater', JSON.stringify(repeater))
      if (finalImageUrl) {
        formData.append('habit_health_main_image', finalImageUrl)
      }

      const result = await updateHabit({ id, formData }).unwrap()
      if (result.success) {
        toast.success('Habit health updated successfully!')
        router.back()
      } else {
        throw new Error(result.message || 'Update failed')
      }
    } catch (err) {
      if (err instanceof Error) {
        toast.error(err.message || 'Failed to update habit health')
      }
    }
  }

  const SectionHeader = ({
    title,
    icon,
    open,
    onToggle,
  }: {
    title: string
    icon: React.ReactNode
    open: boolean
    onToggle: () => void
  }) => (
    <div className="habit-section__header">
      <h2 className="habit-section__title">
        {icon} {title}
      </h2>
      <button
        type="button"
        className="habit-section__toggle"
        onClick={onToggle}
      >
        {open ? "−" : "+"}
      </button>
    </div>
  )

  if (isFetching) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader />
      </div>
    )
  }

  const hasMainImage = mainImageUrl || mainImagePreview

  return (
    <form onSubmit={handleSubmit} className="habit-form">
      <div className="habit-layout">
        {/* ── Left column ─────────────────────────────── */}
        <div className="habit-main">

          {/* Main Information Section */}
          <div className="habit-section">
            <SectionHeader
              title="Main Information"
              icon={<MdHealthAndSafety />}
              open={mainInfoOpen}
              onToggle={() => setMainInfoOpen((p) => !p)}
            />
            {mainInfoOpen && (
              <div className="habit-section__body">
                <div className="habit-form-row">
                  <div className="habit-form-group">
                    <label className="habit-label">
                      <MdTextFields />
                      Main Title (English)
                      <span className="habit-label__required">*</span>
                    </label>
                    <input
                      className="habit-input"
                      type="text"
                      placeholder="Enter main title in English"
                      value={mainTitle.en}
                      onChange={e => setMainTitle(prev => ({ ...prev, en: e.target.value }))}
                      required
                    />
                  </div>
                  <div className="habit-form-group">
                    <label className="habit-label">
                      <MdTextFields />
                      Main Title (Kannada)
                      <span className="habit-label__required">*</span>
                    </label>
                    <input
                      className="habit-input"
                      type="text"
                      placeholder="ಮುಖ್ಯ ಶೀರ್ಷಿಕೆ ನಮೂದಿಸಿ"
                      value={mainTitle.kn}
                      onChange={e => setMainTitle(prev => ({ ...prev, kn: e.target.value }))}
                      required
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Content Section */}
          <div className="habit-section">
            <SectionHeader
              title="Content"
              icon={<MdDescription />}
              open={contentOpen}
              onToggle={() => setContentOpen((p) => !p)}
            />
            {contentOpen && (
              <div className="habit-section__body">
                {repeater.map((item, idx) => (
                  <div key={idx} className="habit-body-item">
                    <div className="habit-body-item__header">
                      <h4 className="habit-body-item__title">
                        <MdDescription /> Content {idx + 1}
                      </h4>
                      <button
                        type="button"
                        className="habit-btn-danger"
                        onClick={() => removeRepeater(idx)}
                      >
                        <MdDelete /> Remove
                      </button>
                    </div>

                    <div className="habit-form-row">
                      <div className="habit-form-group">
                        <label className="habit-label">
                          <MdDescription />
                          Description (English)
                          <span className="habit-label__required">*</span>
                        </label>
                        <CKEditorWrapper
                          data={item.description[0]?.en || ''}
                          onChange={(data: string) => updateRepeaterDescription(idx, 'en', data)}
                        />
                      </div>
                      <div className="habit-form-group">
                        <label className="habit-label">
                          <MdDescription />
                          Description (Kannada)
                          <span className="habit-label__required">*</span>
                        </label>
                        <CKEditorWrapper
                          data={item.description[0]?.kn || ''}
                          onChange={(data: string) => updateRepeaterDescription(idx, 'kn', data)}
                        />
                      </div>
                    </div>
                  </div>
                ))}

                <button
                  type="button"
                  className="habit-add-btn"
                  onClick={addRepeater}
                >
                  <MdAddCircleOutline /> Add Content
                </button>
              </div>
            )}
          </div>
        </div>

        {/* ── Right sidebar ────────────────────────────── */}
        <div className="habit-sidebar">

          {/* Main Image */}
          <div className="habit-section">
            <div className="habit-section__header">
              <h2 className="habit-section__title">
                <MdImage />
                &nbsp;Main Image
              </h2>
            </div>
            <div className="habit-section__body">
              {hasMainImage ? (
                <div style={{ position: 'relative' }}>
                  <Image
                    src={mainImagePreview || mainImageUrl}
                    alt="Main"
                    width={280}
                    height={160}
                    style={{
                      width: '100%',
                      height: 160,
                      objectFit: 'cover',
                      borderRadius: 5,
                      display: 'block',
                    }}
                  />
                  <button
                    type="button"
                    className="habit-preview__remove"
                    onClick={handleDeleteMainImage}
                    disabled={isDeletingMainImage}
                  >
                    {isDeletingMainImage ? (
                      <BeatLoader size={5} color="#fff" />
                    ) : (
                      <MdClose />
                    )}
                  </button>
                </div>
              ) : (
                <div className="habit-featured-zone">
                  <div className="habit-featured-zone__icon">
                    <MdCloudUpload />
                  </div>
                  <p className="habit-featured-zone__text">
                    Click or Drag to Upload Main Image
                  </p>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleMainImageChange}
                  />
                </div>
              )}
            </div>
          </div>

          {/* Footer actions */}
          <div className="habit-footer">
            <button
              type="button"
              className="habit-btn-cancel"
              onClick={() => router.back()}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="habit-btn-submit"
              disabled={isUpdating}
            >
              {isUpdating ? (
                <>
                  <span>Updating...</span>
                  <BeatLoader color="#fff" size={8} />
                </>
              ) : (
                'Update Habit'
              )}
            </button>
          </div>
        </div>
      </div>
    </form>
  )
}
'use client'

import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import Image from 'next/image'
import { useGetSingleMythFactsQuery, useUpdateMythFactMutation } from '@/(store)/services/myth-facts/mythFactsApi'
import { uploadToCloudinary } from '@/utils/uploadToCloudinary'
import { useCloudinaryDelete } from '@/utils/useCloudinaryDelete'
import Loader from '@/(common)/Loader'
import { BeatLoader } from 'react-spinners'
import {
  MdImage,
  MdTextFields,
  MdDescription,
  MdAddCircleOutline,
  MdDelete,
  MdClose,
  MdCloudUpload,
  MdInfo,
  MdFactCheck,
  MdWarningAmber,
  MdCheckCircle
} from "react-icons/md"

export type MythFactBody = { en: string; kn: string }

// Matches your server-side IFactsSection
export interface FactsSection {
  heading: MythFactBody
  myths_facts_wrong_fact: MythFactBody[]
  myths_facts_right_fact: MythFactBody[]
}

interface UpdateMythFactProps {
  id: string
}

export default function UpdateMythFact({ id }: UpdateMythFactProps) {
  const { data, isLoading, isError } = useGetSingleMythFactsQuery({ id })
  const [updateMythFact, { isLoading: isUpdating }] = useUpdateMythFactMutation()
  const { deleteFromCloudinary } = useCloudinaryDelete()
  const router = useRouter()

  // Section collapse states
  const [mainInfoOpen, setMainInfoOpen] = useState(true)
  const [sectionsOpen, setSectionsOpen] = useState(true)

  // Deletion loading state
  const [isDeletingImage, setIsDeletingImage] = useState(false)

  // Image
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string>('')
  const [imageUrl, setImageUrl] = useState<string>('')

  // Top-level localized fields
  const [title, setTitle] = useState<MythFactBody>({ en: '', kn: '' })
  const [body, setBody] = useState<MythFactBody>({ en: '', kn: '' })
  const [heading, setHeading] = useState<MythFactBody>({ en: '', kn: '' })
  const [description, setDescription] = useState<MythFactBody>({ en: '', kn: '' })

  const [sections, setSections] = useState<FactsSection[]>([])

  useEffect(() => {
    if (!data) return
    const payload = (data).data ?? (data).result ?? data

    setImageUrl(payload.myth_fact_image || '')
    setTitle(payload.myth_fact_title || { en: '', kn: '' })
    setBody(payload.myth_fact_body || { en: '', kn: '' })
    setHeading(payload.myth_fact_heading || { en: '', kn: '' })
    setDescription(payload.myth_fact_description || { en: '', kn: '' })

    if (Array.isArray(payload.facts)) {
      setSections(payload.facts)
    } else {
      setSections(payload.facts ? [payload.facts] : [])
    }
  }, [data])

  // Delete image handler
  const handleDeleteImage = async () => {
    setIsDeletingImage(true)
    try {
      if (imageUrl) {
        await deleteFromCloudinary(imageUrl, { resourceType: 'image' })
        setImageUrl('')
      }
      if (imagePreview) {
        URL.revokeObjectURL(imagePreview)
        setImagePreview('')
      }
      setImageFile(null)
      toast.success('Image removed')
    } catch {
      toast.error('Failed to delete image')
    } finally {
      setIsDeletingImage(false)
    }
  }

  // Image handler
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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
    setImageFile(file)
    setImagePreview(URL.createObjectURL(file))
    setImageUrl('')
  }

  // Section-level helpers
  const updateSection = (idx: number, newSection: Partial<FactsSection>) => {
    setSections(secs =>
      secs.map((s, i) => (i === idx ? { ...s, ...newSection } : s))
    )
  }

  const addSection = () => {
    setSections(secs => [
      ...secs,
      { heading: { en: '', kn: '' }, myths_facts_wrong_fact: [], myths_facts_right_fact: [] }
    ])
  }

  const removeSection = (idx: number) => {
    setSections(secs => secs.filter((_, i) => i !== idx))
  }

  // Fact-level helpers
  const handleFactChange = (
    idx: number,
    listKey: 'myths_facts_wrong_fact' | 'myths_facts_right_fact',
    factIdx: number,
    field: 'en' | 'kn',
    value: string
  ) => {
    setSections(secs =>
      secs.map((s, i) => {
        if (i !== idx) return s
        const updatedList = s[listKey].map((f, j) =>
          j === factIdx ? { ...f, [field]: value } : f
        )
        return { ...s, [listKey]: updatedList }
      })
    )
  }

  const addFact = (
    idx: number,
    listKey: 'myths_facts_wrong_fact' | 'myths_facts_right_fact'
  ) => {
    setSections(secs =>
      secs.map((s, i) =>
        i === idx
          ? { ...s, [listKey]: [...s[listKey], { en: '', kn: '' }] }
          : s
      )
    )
  }

  const removeFact = (
    idx: number,
    listKey: 'myths_facts_wrong_fact' | 'myths_facts_right_fact',
    factIdx: number
  ) => {
    setSections(secs =>
      secs.map((s, i) =>
        i === idx
          ? { ...s, [listKey]: s[listKey].filter((_, j) => j !== factIdx) }
          : s
      )
    )
  }

  // Submit handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!title.en || !title.kn) {
      toast.error('Title is required in both languages')
      return
    }

    try {
      let finalImageUrl = imageUrl
      if (imageFile) {
        const res = await uploadToCloudinary(imageFile, 'image')
        finalImageUrl = res.secure_url
      }

      const formData = new FormData()

      if (finalImageUrl) formData.append('myth_fact_image', finalImageUrl)

      // Top-level
      formData.append('myth_fact_title', JSON.stringify(title))
      formData.append('myth_fact_body', JSON.stringify(body))
      formData.append('myth_fact_heading', JSON.stringify(heading))
      formData.append('myth_fact_description', JSON.stringify(description))

      // All sections as an array
      formData.append('facts', JSON.stringify(sections))

      await updateMythFact({ id, formData }).unwrap()
      toast.success('Myth & Fact updated successfully')
      router.back()
    } catch {
      toast.error('Failed to update Myth & Fact')
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
    <div className="myth-section__header">
      <h2 className="myth-section__title">
        {icon} {title}
      </h2>
      <button
        type="button"
        className="myth-section__toggle"
        onClick={onToggle}
      >
        {open ? "−" : "+"}
      </button>
    </div>
  )

  if (isLoading) return <Loader />
  if (isError) return <p>Error loading Myth & Fact.</p>

  const hasImage = imageUrl || imagePreview

  return (
    <form onSubmit={handleSubmit} className="myth-form">
      <div className="myth-layout">
        {/* ── Left column ─────────────────────────────── */}
        <div className="myth-main">

          {/* Main Information Section */}
          <div className="myth-section">
            <SectionHeader
              title="Main Information"
              icon={<MdInfo />}
              open={mainInfoOpen}
              onToggle={() => setMainInfoOpen((p) => !p)}
            />
            {mainInfoOpen && (
              <div className="myth-section__body">
                {/* Title */}
                <div className="myth-form-row">
                  <div className="myth-form-group">
                    <label className="myth-label">
                      <MdTextFields />
                      Title (English)
                      <span className="myth-label__required">*</span>
                    </label>
                    <input
                      className="myth-input"
                      type="text"
                      placeholder="Enter title in English"
                      value={title.en}
                      onChange={e => setTitle(prev => ({ ...prev, en: e.target.value }))}
                      required
                    />
                  </div>
                  <div className="myth-form-group">
                    <label className="myth-label">
                      <MdTextFields />
                      Title (Kannada)
                      <span className="myth-label__required">*</span>
                    </label>
                    <input
                      className="myth-input"
                      type="text"
                      placeholder="ಶೀರ್ಷಿಕೆ ನಮೂದಿಸಿ"
                      value={title.kn}
                      onChange={e => setTitle(prev => ({ ...prev, kn: e.target.value }))}
                      required
                    />
                  </div>
                </div>

                {/* Body */}
                <div className="myth-form-row">
                  <div className="myth-form-group">
                    <label className="myth-label">
                      <MdDescription />
                      Body (English)
                      <span className="myth-label__required">*</span>
                    </label>
                    <textarea
                      className="myth-textarea"
                      placeholder="Enter body in English"
                      value={body.en}
                      onChange={e => setBody(prev => ({ ...prev, en: e.target.value }))}
                      required
                    />
                  </div>
                  <div className="myth-form-group">
                    <label className="myth-label">
                      <MdDescription />
                      Body (Kannada)
                      <span className="myth-label__required">*</span>
                    </label>
                    <textarea
                      className="myth-textarea"
                      placeholder="ದೇಹ ನಮೂದಿಸಿ"
                      value={body.kn}
                      onChange={e => setBody(prev => ({ ...prev, kn: e.target.value }))}
                      required
                    />
                  </div>
                </div>

                {/* Heading */}
                <div className="myth-form-row">
                  <div className="myth-form-group">
                    <label className="myth-label">
                      <MdTextFields />
                      Heading (English)
                      <span className="myth-label__required">*</span>
                    </label>
                    <input
                      className="myth-input"
                      type="text"
                      placeholder="Enter heading in English"
                      value={heading.en}
                      onChange={e => setHeading(prev => ({ ...prev, en: e.target.value }))}
                      required
                    />
                  </div>
                  <div className="myth-form-group">
                    <label className="myth-label">
                      <MdTextFields />
                      Heading (Kannada)
                      <span className="myth-label__required">*</span>
                    </label>
                    <input
                      className="myth-input"
                      type="text"
                      placeholder="ಶೀರ್ಷಿಕೆ ನಮೂದಿಸಿ"
                      value={heading.kn}
                      onChange={e => setHeading(prev => ({ ...prev, kn: e.target.value }))}
                      required
                    />
                  </div>
                </div>

                {/* Description */}
                <div className="myth-form-row">
                  <div className="myth-form-group">
                    <label className="myth-label">
                      <MdDescription />
                      Description (English)
                      <span className="myth-label__required">*</span>
                    </label>
                    <textarea
                      className="myth-textarea"
                      placeholder="Enter description in English"
                      value={description.en}
                      onChange={e => setDescription(prev => ({ ...prev, en: e.target.value }))}
                      required
                    />
                  </div>
                  <div className="myth-form-group">
                    <label className="myth-label">
                      <MdDescription />
                      Description (Kannada)
                      <span className="myth-label__required">*</span>
                    </label>
                    <textarea
                      className="myth-textarea"
                      placeholder="ವಿವರಣೆ ನಮೂದಿಸಿ"
                      value={description.kn}
                      onChange={e => setDescription(prev => ({ ...prev, kn: e.target.value }))}
                      required
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Myth & Facts Sections */}
          <div className="myth-section">
            <SectionHeader
              title="Myth & Facts Sections"
              icon={<MdFactCheck />}
              open={sectionsOpen}
              onToggle={() => setSectionsOpen((p) => !p)}
            />
            {sectionsOpen && (
              <div className="myth-section__body">
                {sections.map((sec, idx) => (
                  <div key={idx} className="myth-body-item">
                    <div className="myth-body-item__header">
                      <h4 className="myth-body-item__title">
                        <MdFactCheck /> Section {idx + 1}
                      </h4>
                      <button
                        type="button"
                        className="myth-btn-danger"
                        onClick={() => removeSection(idx)}
                      >
                        <MdDelete /> Remove Section
                      </button>
                    </div>

                    {/* Section Heading */}
                    <div className="myth-form-row">
                      <div className="myth-form-group">
                        <label className="myth-label">
                          <MdTextFields />
                          Section Heading (EN)
                          <span className="myth-label__required">*</span>
                        </label>
                        <input
                          className="myth-input"
                          type="text"
                          placeholder="Enter section heading in English"
                          value={sec.heading.en}
                          onChange={e =>
                            updateSection(idx, {
                              heading: { ...sec.heading, en: e.target.value }
                            })
                          }
                          required
                        />
                      </div>
                      <div className="myth-form-group">
                        <label className="myth-label">
                          <MdTextFields />
                          Section Heading (KN)
                          <span className="myth-label__required">*</span>
                        </label>
                        <input
                          className="myth-input"
                          type="text"
                          placeholder="ವಿಭಾಗ ಶೀರ್ಷಿಕೆ ನಮೂದಿಸಿ"
                          value={sec.heading.kn}
                          onChange={e =>
                            updateSection(idx, {
                              heading: { ...sec.heading, kn: e.target.value }
                            })
                          }
                          required
                        />
                      </div>
                    </div>

                    {/* Myths (Wrong Facts) */}
                    <div className="myth-sub-section">
                      <h4 className="myth-sub-section__title">
                        <MdWarningAmber /> Myths
                      </h4>
                      {sec.myths_facts_wrong_fact.map((f, j) => (
                        <div key={j} className="myth-fact-item">
                          <div className="myth-fact-item__header">
                            <span>Myth {j + 1}</span>
                            <button
                              type="button"
                              className="myth-btn-danger"
                              onClick={() => removeFact(idx, 'myths_facts_wrong_fact', j)}
                            >
                              <MdDelete /> Remove
                            </button>
                          </div>
                          <div className="myth-form-row">
                            <div className="myth-form-group">
                              <label className="myth-label">English</label>
                              <input
                                className="myth-input"
                                type="text"
                                placeholder="Enter myth in English"
                                value={f.en}
                                onChange={e =>
                                  handleFactChange(idx, 'myths_facts_wrong_fact', j, 'en', e.target.value)
                                }
                              />
                            </div>
                            <div className="myth-form-group">
                              <label className="myth-label">Kannada</label>
                              <input
                                className="myth-input"
                                type="text"
                                placeholder="ಮಿಥ್ಯೆ ನಮೂದಿಸಿ"
                                value={f.kn}
                                onChange={e =>
                                  handleFactChange(idx, 'myths_facts_wrong_fact', j, 'kn', e.target.value)
                                }
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                      <button
                        type="button"
                        className="myth-add-btn"
                        onClick={() => addFact(idx, 'myths_facts_wrong_fact')}
                      >
                        <MdAddCircleOutline /> Add Myth
                      </button>
                    </div>

                    {/* Facts (Right Facts) */}
                    <div className="myth-sub-section">
                      <h4 className="myth-sub-section__title">
                        <MdCheckCircle /> Facts
                      </h4>
                      {sec.myths_facts_right_fact.map((f, j) => (
                        <div key={j} className="myth-fact-item myth-fact-item--right">
                          <div className="myth-fact-item__header">
                            <span>Fact {j + 1}</span>
                            <button
                              type="button"
                              className="myth-btn-danger"
                              onClick={() => removeFact(idx, 'myths_facts_right_fact', j)}
                            >
                              <MdDelete /> Remove
                            </button>
                          </div>
                          <div className="myth-form-row">
                            <div className="myth-form-group">
                              <label className="myth-label">English</label>
                              <input
                                className="myth-input"
                                type="text"
                                placeholder="Enter fact in English"
                                value={f.en}
                                onChange={e =>
                                  handleFactChange(idx, 'myths_facts_right_fact', j, 'en', e.target.value)
                                }
                              />
                            </div>
                            <div className="myth-form-group">
                              <label className="myth-label">Kannada</label>
                              <input
                                className="myth-input"
                                type="text"
                                placeholder="ಸತ್ಯ ನಮೂದಿಸಿ"
                                value={f.kn}
                                onChange={e =>
                                  handleFactChange(idx, 'myths_facts_right_fact', j, 'kn', e.target.value)
                                }
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                      <button
                        type="button"
                        className="myth-add-btn"
                        onClick={() => addFact(idx, 'myths_facts_right_fact')}
                      >
                        <MdAddCircleOutline /> Add Fact
                      </button>
                    </div>
                  </div>
                ))}

                <button
                  type="button"
                  className="myth-add-btn"
                  onClick={addSection}
                >
                  <MdAddCircleOutline /> Add New Section
                </button>
              </div>
            )}
          </div>
        </div>

        {/* ── Right sidebar ────────────────────────────── */}
        <div className="myth-sidebar">

          {/* Image */}
          <div className="myth-section">
            <div className="myth-section__header">
              <h2 className="myth-section__title">
                <MdImage />
                &nbsp;Image
              </h2>
            </div>
            <div className="myth-section__body">
              {hasImage ? (
                <div style={{ position: 'relative' }}>
                  <Image
                    src={imagePreview || imageUrl}
                    alt="Myth & Fact"
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
                    className="myth-preview__remove"
                    onClick={handleDeleteImage}
                    disabled={isDeletingImage}
                  >
                    {isDeletingImage ? (
                      <BeatLoader size={5} color="#fff" />
                    ) : (
                      <MdClose />
                    )}
                  </button>
                </div>
              ) : (
                <div className="myth-featured-zone">
                  <div className="myth-featured-zone__icon">
                    <MdCloudUpload />
                  </div>
                  <p className="myth-featured-zone__text">
                    Click or Drag to Upload Image
                  </p>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                  />
                </div>
              )}
            </div>
          </div>

          {/* Footer actions */}
          <div className="myth-footer">
            <button
              type="button"
              className="myth-btn-cancel"
              onClick={() => router.back()}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="myth-btn-submit"
              disabled={isUpdating}
            >
              {isUpdating ? (
                <>
                  <span>Updating...</span>
                  <BeatLoader color="#fff" size={8} />
                </>
              ) : (
                'Update Myth & Fact'
              )}
            </button>
          </div>
        </div>
      </div>
    </form>
  )
}
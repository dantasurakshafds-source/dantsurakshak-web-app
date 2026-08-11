'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { BeatLoader } from 'react-spinners'
import OvalLoader from '@/(common)/OvalLoader'
import { useGetSingleTermsQuery, useUpdateTermMutation } from '@/(store)/services/terms/termAndConditionsApi'
import Loader from '@/(common)/Loader'
import CKEditorWrapper from '@/app/(super-admin)/(common)/editor/CKEditorWrapper'
import {
  MdTextFields,
  MdDescription,
  MdAddCircleOutline,
  MdDelete,
  MdGavel,
  MdArticle
} from "react-icons/md"

interface UpdateTermsAndConditionsProps {
  id: string;
}

export default function UpdateTerm({ id }: UpdateTermsAndConditionsProps) {
  const router = useRouter()
  const { data, isLoading: isFetching, error } = useGetSingleTermsQuery({ id })
  const [updateTerms, { isLoading: isUpdating }] = useUpdateTermMutation()

  // Section collapse state
  const [sectionsOpen, setSectionsOpen] = useState(true)

  const [termsRepeater, setTermsRepeater] = useState([
    { term_heading: { en: '', kn: '' }, term_description: { en: '', kn: '' } }
  ])

  useEffect(() => {
    if (data?.result) {
      setTermsRepeater(data.result.terms_repeater || [
        { term_heading: { en: '', kn: '' }, term_description: { en: '', kn: '' } }
      ])
    }
  }, [data])

  const handleHeadingChange = (index: number, lang: 'en' | 'kn', value: string) => {
    const newArr = [...termsRepeater]
    newArr[index] = {
      ...newArr[index],
      term_heading: {
        ...newArr[index].term_heading,
        [lang]: value,
      },
    }
    setTermsRepeater(newArr)
  }

  //@ts-expect-error ignore this
  const handleDescriptionChange = (index: number, lang: 'en' | 'kn', editor) => {
    const newArr = [...termsRepeater]
    newArr[index] = {
      ...newArr[index],
      term_description: {
        ...newArr[index].term_description,
        [lang]: editor,
      },
    }
    setTermsRepeater(newArr)
  }

  const addItem = () => {
    setTermsRepeater([
      ...termsRepeater,
      { term_heading: { en: '', kn: '' }, term_description: { en: '', kn: '' } }
    ])
  }

  const deleteItem = (index: number) => {
    if (termsRepeater.length > 1) {
      setTermsRepeater(termsRepeater.filter((_, i) => i !== index))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      const formData = new FormData()
      formData.append('terms_repeater', JSON.stringify(termsRepeater))
      await updateTerms({ id, formData }).unwrap()
      toast.success('Term updated successfully')
      router.back()
    } catch (err) {
      if (err instanceof Error) {
        console.error('Update error:', err)
        toast.error('Failed to update term')
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
    <div className="terms-section__header">
      <h2 className="terms-section__title">
        {icon} {title}
      </h2>
      <button
        type="button"
        className="terms-section__toggle"
        onClick={onToggle}
      >
        {open ? "−" : "+"}
      </button>
    </div>
  )

  if (isFetching) return <Loader />
  if (error) return <div className="text-center text-red-500 p-8">Error loading terms and conditions</div>

  return (
    <form onSubmit={handleSubmit} className="terms-form">
      <div className="terms-layout">
        {/* ── Left column ─────────────────────────────── */}
        <div className="terms-main">

          {/* Terms Sections */}
          <div className="terms-section">
            <SectionHeader
              title="Terms & Conditions Sections"
              icon={<MdGavel />}
              open={sectionsOpen}
              onToggle={() => setSectionsOpen((p) => !p)}
            />
            {sectionsOpen && (
              <div className="terms-section__body">
                {termsRepeater.map((item, index) => (
                  <div key={index} className="terms-body-item">
                    <div className="terms-body-item__header">
                      <h4 className="terms-body-item__title">
                        <MdArticle /> Section {index + 1}
                      </h4>
                      {termsRepeater.length > 1 && (
                        <button
                          type="button"
                          className="terms-btn-danger"
                          onClick={() => deleteItem(index)}
                        >
                          <MdDelete /> Remove
                        </button>
                      )}
                    </div>

                    {/* Heading */}
                    <div className="terms-form-row">
                      <div className="terms-form-group">
                        <label className="terms-label">
                          <MdTextFields />
                          Heading (English)
                          <span className="terms-label__required">*</span>
                        </label>
                        <input
                          className="terms-input"
                          type="text"
                          placeholder="Enter heading in English"
                          value={item.term_heading.en}
                          onChange={(e) => handleHeadingChange(index, 'en', e.target.value)}
                          required
                        />
                      </div>
                      <div className="terms-form-group">
                        <label className="terms-label">
                          <MdTextFields />
                          Heading (Kannada)
                          <span className="terms-label__required">*</span>
                        </label>
                        <input
                          className="terms-input"
                          type="text"
                          placeholder="ಶೀರ್ಷಿಕೆ ನಮೂದಿಸಿ"
                          value={item.term_heading.kn}
                          onChange={(e) => handleHeadingChange(index, 'kn', e.target.value)}
                          required
                        />
                      </div>
                    </div>

                    {/* Description */}
                    <div className="terms-form-row">
                      <div className="terms-form-group">
                        <label className="terms-label">
                          <MdDescription />
                          Description (English)
                          <span className="terms-label__required">*</span>
                        </label>
                        <CKEditorWrapper
                          data={item.term_description.en}
                          onChange={(data) => handleDescriptionChange(index, 'en', data)}
                        />
                      </div>
                      <div className="terms-form-group">
                        <label className="terms-label">
                          <MdDescription />
                          Description (Kannada)
                          <span className="terms-label__required">*</span>
                        </label>
                        <CKEditorWrapper
                          data={item.term_description.kn}
                          onChange={(data) => handleDescriptionChange(index, 'kn', data)}
                        />
                      </div>
                    </div>
                  </div>
                ))}

                <button
                  type="button"
                  className="terms-add-btn"
                  onClick={addItem}
                >
                  <MdAddCircleOutline /> Add Section
                </button>
              </div>
            )}
          </div>
        </div>

        {/* ── Right sidebar ────────────────────────────── */}
        <div className="terms-sidebar">
          {/* Info Card */}
          <div className="terms-section">
            <div className="terms-section__header">
              <h2 className="terms-section__title">
                <MdGavel />
                &nbsp;Information
              </h2>
            </div>
            <div className="terms-section__body">
              <p style={{ fontSize: '14px', color: '#666', lineHeight: 1.6, margin: 0 }}>
                Update terms and conditions sections with bilingual support.
                Each section requires both English and Kannada headings and descriptions.
                Use the rich text editor for detailed descriptions.
              </p>
            </div>
          </div>

          {/* Footer actions */}
          <div className="terms-footer">
            <button
              type="button"
              className="terms-btn-cancel"
              onClick={() => router.back()}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="terms-btn-submit"
              disabled={isUpdating}
              style={{ fontWeight: 600 }}
            >
              {isUpdating ? (
                <>
                  <span style={{ fontWeight: 600 }}>Updating...</span>
                  <OvalLoader height="20" width="20" color="#ffffff" strokeWidth={5} strokeWidthSecondary={5} ariaLabel="oval-loading" />
                </>
              ) : (
                'Update Terms'
              )}
            </button>
          </div>
        </div>
      </div>
    </form>
  )
}
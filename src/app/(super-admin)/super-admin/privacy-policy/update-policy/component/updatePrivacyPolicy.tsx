'use client'
import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { BeatLoader } from 'react-spinners'
import OvalLoader from '@/(common)/OvalLoader'
import { useGetSinglePrivacyPolicyQuery, useUpdatePrivacyPolicyMutation } from '@/(store)/services/privacy-policy/privacyPolicyApi'
import Loader from '@/(common)/Loader'
import CKEditorWrapper from '@/app/(super-admin)/(common)/editor/CKEditorWrapper'
import {
  MdTextFields,
  MdDescription,
  MdAddCircleOutline,
  MdDelete,
  MdPolicy,
  MdSecurity
} from "react-icons/md"

interface UpdatePrivacyPolicyProps {
  id: string;
}

export default function UpdatePolicy({ id }: UpdatePrivacyPolicyProps) {
  const router = useRouter()
  const { data, isLoading: isFetching, error } = useGetSinglePrivacyPolicyQuery({ id })
  const [updatePolicy, { isLoading: isUpdating }] = useUpdatePrivacyPolicyMutation()

  // Section collapse state
  const [sectionsOpen, setSectionsOpen] = useState(true)

  const [privacyPolicyRepeater, setPrivacyPolicyRepeater] = useState([
    { privacy_heading: { en: '', kn: '' }, privacy_description: { en: '', kn: '' } }
  ])

  useEffect(() => {
    if (data?.result) {
      setPrivacyPolicyRepeater(data.result.privacy_policy_repeater || [
        { privacy_heading: { en: '', kn: '' }, privacy_description: { en: '', kn: '' } }
      ])
    }
  }, [data])

  const handleHeadingChange = (index: number, lang: 'en' | 'kn', value: string) => {
    const newArr = [...privacyPolicyRepeater]
    newArr[index] = {
      ...newArr[index],
      privacy_heading: {
        ...newArr[index].privacy_heading,
        [lang]: value,
      },
    }
    setPrivacyPolicyRepeater(newArr)
  }

  //@ts-expect-error ignore this message
  const handleDescriptionChange = (index: number, lang: 'en' | 'kn', editor) => {
    const newArr = [...privacyPolicyRepeater]
    newArr[index] = {
      ...newArr[index],
      privacy_description: {
        ...newArr[index].privacy_description,
        [lang]: editor,
      },
    }
    setPrivacyPolicyRepeater(newArr)
  }

  const addItem = () => {
    setPrivacyPolicyRepeater([
      ...privacyPolicyRepeater,
      { privacy_heading: { en: '', kn: '' }, privacy_description: { en: '', kn: '' } }
    ])
  }

  const deleteItem = (index: number) => {
    if (privacyPolicyRepeater.length > 1) {
      setPrivacyPolicyRepeater(privacyPolicyRepeater.filter((_, i) => i !== index))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      const formData = new FormData()
      formData.append('privacy_policy_repeater', JSON.stringify(privacyPolicyRepeater))

      await updatePolicy({ id, formData }).unwrap()
      toast.success('Privacy policy updated successfully')
      router.back()
    } catch (err) {
      if (err instanceof Error) {
        console.error('Update error:', err)
        toast.error('Failed to update privacy policy')
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
    <div className="policy-section__header">
      <h2 className="policy-section__title">
        {icon} {title}
      </h2>
      <button
        type="button"
        className="policy-section__toggle"
        onClick={onToggle}
      >
        {open ? "−" : "+"}
      </button>
    </div>
  )

  if (isFetching) return <Loader />
  if (error) return <div className="text-center text-red-500 p-8">Error loading privacy policy</div>

  return (
    <form onSubmit={handleSubmit} className="policy-form">
      <div className="policy-layout">
        {/* ── Left column ─────────────────────────────── */}
        <div className="policy-main">

          {/* Privacy Policy Sections */}
          <div className="policy-section">
            <SectionHeader
              title="Privacy Policy Sections"
              icon={<MdPolicy />}
              open={sectionsOpen}
              onToggle={() => setSectionsOpen((p) => !p)}
            />
            {sectionsOpen && (
              <div className="policy-section__body">
                {privacyPolicyRepeater.map((item, index) => (
                  <div key={index} className="policy-body-item">
                    <div className="policy-body-item__header">
                      <h4 className="policy-body-item__title">
                        <MdPolicy /> Section {index + 1}
                      </h4>
                      {privacyPolicyRepeater.length > 1 && (
                        <button
                          type="button"
                          className="policy-btn-danger"
                          onClick={() => deleteItem(index)}
                        >
                          <MdDelete /> Remove
                        </button>
                      )}
                    </div>

                    {/* Heading */}
                    <div className="policy-form-row">
                      <div className="policy-form-group">
                        <label className="policy-label">
                          <MdTextFields />
                          Heading (English)
                          <span className="policy-label__required">*</span>
                        </label>
                        <input
                          className="policy-input"
                          type="text"
                          placeholder="Enter heading in English"
                          value={item.privacy_heading.en}
                          onChange={(e) => handleHeadingChange(index, 'en', e.target.value)}
                          required
                        />
                      </div>
                      <div className="policy-form-group">
                        <label className="policy-label">
                          <MdTextFields />
                          Heading (Kannada)
                          <span className="policy-label__required">*</span>
                        </label>
                        <input
                          className="policy-input"
                          type="text"
                          placeholder="ಶೀರ್ಷಿಕೆ ನಮೂದಿಸಿ"
                          value={item.privacy_heading.kn}
                          onChange={(e) => handleHeadingChange(index, 'kn', e.target.value)}
                          required
                        />
                      </div>
                    </div>

                    {/* Description */}
                    <div className="policy-form-row">
                      <div className="policy-form-group">
                        <label className="policy-label">
                          <MdDescription />
                          Description (English)
                          <span className="policy-label__required">*</span>
                        </label>
                        <CKEditorWrapper
                          data={item.privacy_description.en}
                          onChange={(data) => handleDescriptionChange(index, 'en', data)}
                        />
                      </div>
                      <div className="policy-form-group">
                        <label className="policy-label">
                          <MdDescription />
                          Description (Kannada)
                          <span className="policy-label__required">*</span>
                        </label>
                        <CKEditorWrapper
                          data={item.privacy_description.kn}
                          onChange={(data) => handleDescriptionChange(index, 'kn', data)}
                        />
                      </div>
                    </div>
                  </div>
                ))}

                <button
                  type="button"
                  className="policy-add-btn"
                  onClick={addItem}
                >
                  <MdAddCircleOutline /> Add Section
                </button>
              </div>
            )}
          </div>
        </div>

        {/* ── Right sidebar ────────────────────────────── */}
        <div className="policy-sidebar">
          {/* Info Card */}
          <div className="policy-section">
            <div className="policy-section__header">
              <h2 className="policy-section__title">
                <MdSecurity />
                &nbsp;Information
              </h2>
            </div>
            <div className="policy-section__body">
              <p style={{ fontSize: '14px', color: '#666', lineHeight: 1.6, margin: 0 }}>
                Update the privacy policy sections with bilingual support.
                Each section requires both English and Kannada headings and descriptions.
                Use the rich text editor for detailed descriptions.
              </p>
            </div>
          </div>

          {/* Footer actions */}
          <div className="policy-footer">
            <button
              type="button"
              className="policy-btn-cancel"
              onClick={() => router.back()}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="policy-btn-submit"
              disabled={isUpdating}
              style={{ fontWeight: 600 }}
            >
              {isUpdating ? (
                <>
                  <span style={{ fontWeight: 600 }}>Updating...</span>
                  <OvalLoader height="20" width="20" color="#ffffff" strokeWidth={5} strokeWidthSecondary={5} ariaLabel="oval-loading" />
                </>
              ) : (
                'Update Policy'
              )}
            </button>
          </div>
        </div>
      </div>
    </form>
  )
}
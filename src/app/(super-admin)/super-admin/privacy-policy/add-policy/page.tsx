'use client'

import React, { useState } from 'react'
import OvalLoader from '@/(common)/OvalLoader'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { useCreatePrivacyPolicyMutation } from '@/(store)/services/privacy-policy/privacyPolicyApi'
import CKEditorWrapper from '@/app/(super-admin)/(common)/editor/CKEditorWrapper'
import {
    MdTextFields,
    MdDescription,
    MdAddCircleOutline,
    MdDelete,
    MdPolicy,
    MdSecurity
} from "react-icons/md"

interface PrivacyPolicyItem {
    privacy_heading: {
        en: string;
        kn: string;
    };
    privacy_description: {
        en: string;
        kn: string;
    };
}

const AddPolicy = () => {
    const router = useRouter()
    const [createPrivacyPolicy, { isLoading }] = useCreatePrivacyPolicyMutation()

    // Section collapse state
    const [sectionsOpen, setSectionsOpen] = useState(true)

    const [privacyPolicies, setPrivacyPolicies] = useState<PrivacyPolicyItem[]>([{
        privacy_heading: { en: '', kn: '' },
        privacy_description: { en: '', kn: '' }
    }])

    const handlePolicyHeadingChange = (index: number, lang: 'en' | 'kn', value: string) => {
        const updatedPolicies = [...privacyPolicies]
        updatedPolicies[index].privacy_heading[lang] = value
        setPrivacyPolicies(updatedPolicies)
    }

    //@ts-expect-error ignore this message
    const handlePolicyDescriptionChange = (index: number, lang: 'en' | 'kn', editor) => {
        const updatedPolicies = [...privacyPolicies]
        updatedPolicies[index].privacy_description[lang] = editor
        setPrivacyPolicies(updatedPolicies)
    }

    const addNewPolicy = () => {
        setPrivacyPolicies([...privacyPolicies, {
            privacy_heading: { en: '', kn: '' },
            privacy_description: { en: '', kn: '' }
        }])
    }

    const removePolicy = (index: number) => {
        if (privacyPolicies.length > 1) {
            const updatedPolicies = [...privacyPolicies]
            updatedPolicies.splice(index, 1)
            setPrivacyPolicies(updatedPolicies)
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        try {
            const formData = new FormData()
            formData.append('privacy_policy_repeater', JSON.stringify(privacyPolicies))

            await createPrivacyPolicy(formData).unwrap()

            setPrivacyPolicies([{
                privacy_heading: { en: '', kn: '' },
                privacy_description: { en: '', kn: '' }
            }])

            toast.success('Privacy policy created successfully')
            router.back()
        } catch (error) {
            toast.error('Failed to create privacy policy')
            console.error('Submission error:', error)
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
                                {privacyPolicies.map((policy, index) => (
                                    <div key={index} className="policy-body-item">
                                        <div className="policy-body-item__header">
                                            <h4 className="policy-body-item__title">
                                                <MdPolicy /> Section {index + 1}
                                            </h4>
                                            {privacyPolicies.length > 1 && (
                                                <button
                                                    type="button"
                                                    className="policy-btn-danger"
                                                    onClick={() => removePolicy(index)}
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
                                                    value={policy.privacy_heading.en}
                                                    onChange={(e) => handlePolicyHeadingChange(index, 'en', e.target.value)}
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
                                                    value={policy.privacy_heading.kn}
                                                    onChange={(e) => handlePolicyHeadingChange(index, 'kn', e.target.value)}
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
                                                    data={policy.privacy_description.en}
                                                    onChange={(data) => handlePolicyDescriptionChange(index, 'en', data)}
                                                />
                                            </div>
                                            <div className="policy-form-group">
                                                <label className="policy-label">
                                                    <MdDescription />
                                                    Description (Kannada)
                                                    <span className="policy-label__required">*</span>
                                                </label>
                                                <CKEditorWrapper
                                                    data={policy.privacy_description.kn}
                                                    onChange={(data) => handlePolicyDescriptionChange(index, 'kn', data)}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                ))}

                                <button
                                    type="button"
                                    className="policy-add-btn"
                                    onClick={addNewPolicy}
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
                                Create privacy policy sections with bilingual support.
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
                            disabled={isLoading}
                            style={{ fontWeight: 600 }}
                        >
                            {isLoading ? (
                                <>
                                    <span style={{ fontWeight: 600 }}>Adding...</span>
                                    <OvalLoader height="20" width="20" color="#ffffff" strokeWidth={5} strokeWidthSecondary={5} ariaLabel="oval-loading" />
                                </>
                            ) : (
                                'Add Privacy Policy'
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </form>
    )
}

export default AddPolicy
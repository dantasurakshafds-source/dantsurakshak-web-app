"use client"

import React, { useState, useEffect } from 'react'
import { useGetSinglegetFaqQuery, useUpdategetFaqMutation } from '@/(store)/services/faqs/faqsApi'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import Loader from '@/(common)/Loader'
import { BeatLoader } from 'react-spinners'
import OvalLoader from '@/(common)/OvalLoader'
import { FaqRepeaterEntry } from '@/utils/Types'
import CKEditorWrapper from '@/app/(super-admin)/(common)/editor/CKEditorWrapper'
import {
    MdTextFields,
    MdQuestionAnswer,
    MdAddCircleOutline,
    MdDelete,
    MdHelp,
    MdDescription
} from "react-icons/md"

interface FAQItem {
    faqs_repeat_question: {
        en: string
        kn: string
    }
    faqs_repeat_answer: {
        en: string
        kn: string
    }
}

interface UpdateFaqFormCKEditorProps {
    id: string
}

export default function UpdateFaq({ id }: UpdateFaqFormCKEditorProps) {
    const { data: faqData, isLoading, isError } = useGetSinglegetFaqQuery({ id })
    const [updateFaq, { isLoading: isUpdating }] = useUpdategetFaqMutation()
    const router = useRouter()

    // Section collapse states
    const [titleOpen, setTitleOpen] = useState(true)
    const [faqsOpen, setFaqsOpen] = useState(true)

    const [faqsTitle, setFaqsTitle] = useState({ en: '', kn: '' })
    const [faqs, setFaqs] = useState<FAQItem[]>([])

    useEffect(() => {
        if (faqData?.result) {
            const data = faqData.result
            setFaqsTitle({
                en: data.faqs_title?.en || '',
                kn: data.faqs_title?.kn || ''
            })

            const copiedFaqs = (data.faqs_repeater || []).map((item: FaqRepeaterEntry) => ({
                faqs_repeat_question: {
                    en: item?.faqs_repeat_question?.en || '',
                    kn: item?.faqs_repeat_question?.kn || ''
                },
                faqs_repeat_answer: {
                    en: item?.faqs_repeat_answer?.en || '',
                    kn: item?.faqs_repeat_answer?.kn || ''
                }
            }))

            setFaqs(copiedFaqs.length > 0 ? copiedFaqs : [
                { faqs_repeat_question: { en: '', kn: '' }, faqs_repeat_answer: { en: '', kn: '' } }
            ])
        }
    }, [faqData])

    const handleTitleChange = (lang: 'en' | 'kn', value: string) => {
        setFaqsTitle(prev => ({ ...prev, [lang]: value }))
    }

    const handleQuestionChange = (index: number, lang: 'en' | 'kn', value: string) => {
        setFaqs(prev =>
            prev.map((item, i) =>
                i === index
                    ? {
                        ...item,
                        faqs_repeat_question: {
                            ...item.faqs_repeat_question,
                            [lang]: value
                        }
                    }
                    : item
            )
        )
    }

    const handleAnswerChange = (index: number, lang: 'en' | 'kn') => {
        return (content: string) => {
            setFaqs(prev =>
                prev.map((item, i) =>
                    i === index
                        ? {
                            ...item,
                            faqs_repeat_answer: {
                                ...item.faqs_repeat_answer,
                                [lang]: content
                            }
                        }
                        : item
                )
            )
        }
    }

    const addNewFaq = () => {
        setFaqs(prev => [
            ...prev,
            { faqs_repeat_question: { en: '', kn: '' }, faqs_repeat_answer: { en: '', kn: '' } }
        ])
    }

    const removeFaq = (index: number) => {
        setFaqs(prev => (prev.length > 1 ? prev.filter((_, i) => i !== index) : prev))
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!faqsTitle.en.trim() || !faqsTitle.kn.trim()) {
            toast.error('FAQ title is required in both languages')
            return
        }

        try {
            const formData = new FormData()
            formData.append('faqs_title', JSON.stringify(faqsTitle))
            formData.append('faqs_repeater', JSON.stringify(faqs))

            const resp = await updateFaq({ id, formData }).unwrap()
            if (resp) {
                toast.success('FAQ updated successfully')
                router.back()
            }
        } catch {
            toast.error('Failed to update FAQ')
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
        <div className="faq-section__header">
            <h2 className="faq-section__title">
                {icon} {title}
            </h2>
            <button
                type="button"
                className="faq-section__toggle"
                onClick={onToggle}
            >
                {open ? "−" : "+"}
            </button>
        </div>
    )

    if (isLoading) return <Loader />
    if (isError) return <div className="text-center text-red-500 p-8">Error loading FAQ</div>

    return (
        <form onSubmit={handleSubmit} className="faq-form">
            <div className="faq-layout">
                {/* ── Left column ─────────────────────────────── */}
                <div className="faq-main">

                    {/* FAQ Title Section */}
                    <div className="faq-section">
                        <SectionHeader
                            title="FAQ Title"
                            icon={<MdHelp />}
                            open={titleOpen}
                            onToggle={() => setTitleOpen((p) => !p)}
                        />
                        {titleOpen && (
                            <div className="faq-section__body">
                                <div className="faq-form-row">
                                    <div className="faq-form-group">
                                        <label className="faq-label">
                                            <MdTextFields />
                                            Title (English)
                                            <span className="faq-label__required">*</span>
                                        </label>
                                        <input
                                            className="faq-input"
                                            type="text"
                                            placeholder="Enter FAQ title in English"
                                            value={faqsTitle.en}
                                            onChange={(e) => handleTitleChange('en', e.target.value)}
                                            required
                                        />
                                    </div>
                                    <div className="faq-form-group">
                                        <label className="faq-label">
                                            <MdTextFields />
                                            Title (Kannada)
                                            <span className="faq-label__required">*</span>
                                        </label>
                                        <input
                                            className="faq-input"
                                            type="text"
                                            placeholder="FAQ ಶೀರ್ಷಿಕೆ ನಮೂದಿಸಿ"
                                            value={faqsTitle.kn}
                                            onChange={(e) => handleTitleChange('kn', e.target.value)}
                                            required
                                        />
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* FAQ Items Section */}
                    <div className="faq-section">
                        <SectionHeader
                            title="FAQ Items"
                            icon={<MdQuestionAnswer />}
                            open={faqsOpen}
                            onToggle={() => setFaqsOpen((p) => !p)}
                        />
                        {faqsOpen && (
                            <div className="faq-section__body">
                                {faqs.map((faq, index) => (
                                    <div key={index} className="faq-body-item">
                                        <div className="faq-body-item__header">
                                            <h4 className="faq-body-item__title">
                                                <MdQuestionAnswer /> FAQ {index + 1}
                                            </h4>
                                            {faqs.length > 1 && (
                                                <button
                                                    type="button"
                                                    className="faq-btn-danger"
                                                    onClick={() => removeFaq(index)}
                                                >
                                                    <MdDelete /> Remove
                                                </button>
                                            )}
                                        </div>

                                        {/* Question */}
                                        <div className="faq-form-row">
                                            <div className="faq-form-group">
                                                <label className="faq-label">
                                                    <MdTextFields />
                                                    Question (English)
                                                    <span className="faq-label__required">*</span>
                                                </label>
                                                <input
                                                    className="faq-input"
                                                    type="text"
                                                    placeholder="Enter question in English"
                                                    value={faq.faqs_repeat_question.en}
                                                    onChange={(e) => handleQuestionChange(index, 'en', e.target.value)}
                                                    required
                                                />
                                            </div>
                                            <div className="faq-form-group">
                                                <label className="faq-label">
                                                    <MdTextFields />
                                                    Question (Kannada)
                                                    <span className="faq-label__required">*</span>
                                                </label>
                                                <input
                                                    className="faq-input"
                                                    type="text"
                                                    placeholder="ಪ್ರಶ್ನೆ ನಮೂದಿಸಿ"
                                                    value={faq.faqs_repeat_question.kn}
                                                    onChange={(e) => handleQuestionChange(index, 'kn', e.target.value)}
                                                    required
                                                />
                                            </div>
                                        </div>

                                        {/* Answer */}
                                        <div className="faq-form-row">
                                            <div className="faq-form-group">
                                                <label className="faq-label">
                                                    <MdDescription />
                                                    Answer (English)
                                                    <span className="faq-label__required">*</span>
                                                </label>
                                                <CKEditorWrapper
                                                    data={faq.faqs_repeat_answer.en}
                                                    onChange={handleAnswerChange(index, 'en')}
                                                />
                                            </div>
                                            <div className="faq-form-group">
                                                <label className="faq-label">
                                                    <MdDescription />
                                                    Answer (Kannada)
                                                    <span className="faq-label__required">*</span>
                                                </label>
                                                <CKEditorWrapper
                                                    data={faq.faqs_repeat_answer.kn}
                                                    onChange={handleAnswerChange(index, 'kn')}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                ))}

                                <button
                                    type="button"
                                    className="faq-add-btn"
                                    onClick={addNewFaq}
                                >
                                    <MdAddCircleOutline /> Add FAQ Item
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                {/* ── Right sidebar ────────────────────────────── */}
                <div className="faq-sidebar">
                    {/* Info Card */}
                    <div className="faq-section">
                        <div className="faq-section__header">
                            <h2 className="faq-section__title">
                                <MdHelp />
                                &nbsp;Information
                            </h2>
                        </div>
                        <div className="faq-section__body">
                            <p style={{ fontSize: '14px', color: '#666', lineHeight: 1.6, margin: 0 }}>
                                Update the frequently asked questions.
                                Each FAQ item requires both English and Kannada questions and answers.
                                Use the rich text editor for detailed answers.
                            </p>
                        </div>
                    </div>

                    {/* Footer actions */}
                    <div className="faq-footer">
                        <button
                            type="button"
                            className="faq-btn-cancel"
                            onClick={() => router.back()}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="faq-btn-submit"
                            disabled={isUpdating}
                            style={{ fontWeight: 600 }}
                        >
                            {isUpdating ? (
                                <>
                                    <span style={{ fontWeight: 600 }}>Updating...</span>
                                    <OvalLoader height="20" width="20" color="#ffffff" strokeWidth={5} strokeWidthSecondary={5} ariaLabel="oval-loading" />
                                </>
                            ) : (
                                'Update FAQ'
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </form>
    )
}
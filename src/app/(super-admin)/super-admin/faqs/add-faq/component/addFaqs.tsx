'use client'

import React, { useState, useRef } from 'react'
import { BeatLoader } from 'react-spinners'
import OvalLoader from '@/(common)/OvalLoader'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { useCreategetFaqMutation } from '@/(store)/services/faqs/faqsApi'
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
    question: {
        en: string;
        kn: string;
    };
    answer: {
        en: string;
        kn: string;
    };
}

const AddFaq = () => {
    const router = useRouter()
    const [createFaq, { isLoading }] = useCreategetFaqMutation()

    // Section collapse states
    const [titleOpen, setTitleOpen] = useState(true)
    const [faqsOpen, setFaqsOpen] = useState(true)

    const [faqsTitle, setFaqsTitle] = useState({
        en: '',
        kn: ''
    })

    const [faqs, setFaqs] = useState<FAQItem[]>([{
        question: { en: '', kn: '' },
        answer: { en: '', kn: '' }
    }])

    const editorRefs = useRef<(HTMLDivElement | null)[]>([])

    const handleTitleChange = (lang: 'en' | 'kn', value: string) => {
        setFaqsTitle(prev => ({ ...prev, [lang]: value }))
    }

    const handleQuestionChange = (index: number, lang: 'en' | 'kn', value: string) => {
        const updatedFaqs = [...faqs]
        updatedFaqs[index].question[lang] = value
        setFaqs(updatedFaqs)
    }

    //@ts-expect-error ignore this message
    const handleAnswerChange = (index: number, lang: 'en' | 'kn', editor) => {
        const updatedFaqs = [...faqs]
        updatedFaqs[index].answer[lang] = editor
        setFaqs(updatedFaqs)
    }

    const addNewFaq = () => {
        setFaqs([...faqs, {
            question: { en: '', kn: '' },
            answer: { en: '', kn: '' }
        }])
    }

    const removeFaq = (index: number) => {
        if (faqs.length > 1) {
            const updatedFaqs = [...faqs]
            updatedFaqs.splice(index, 1)
            setFaqs(updatedFaqs)
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!faqsTitle.en.trim() || !faqsTitle.kn.trim()) {
            toast.error('FAQ title is required in both languages')
            return
        }

        try {
            const formData = new FormData()

            const faqs_repeater = faqs.map(faq => ({
                faqs_repeat_question: faq.question,
                faqs_repeat_answer: faq.answer
            }))

            formData.append('faqs_title', JSON.stringify(faqsTitle))
            formData.append('faqs_repeater', JSON.stringify(faqs_repeater))

            await createFaq(formData).unwrap()

            setFaqsTitle({ en: '', kn: '' })
            setFaqs([{ question: { en: '', kn: '' }, answer: { en: '', kn: '' } }])

            toast.success('FAQ created successfully')
            router.back()
        } catch (error) {
            toast.error('Failed to create FAQ')
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
                                    <div
                                        key={index}
                                        className="faq-body-item"
                                        ref={el => {
                                            editorRefs.current[index] = el
                                        }}
                                    >
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
                                                    value={faq.question.en}
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
                                                    value={faq.question.kn}
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
                                                    data={faq.answer.en}
                                                    onChange={(data) => handleAnswerChange(index, 'en', data)}
                                                />
                                            </div>
                                            <div className="faq-form-group">
                                                <label className="faq-label">
                                                    <MdDescription />
                                                    Answer (Kannada)
                                                    <span className="faq-label__required">*</span>
                                                </label>
                                                <CKEditorWrapper
                                                    data={faq.answer.kn}
                                                    onChange={(data) => handleAnswerChange(index, 'kn', data)}
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
                                Create frequently asked questions with bilingual support.
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
                            disabled={isLoading}
                            style={{ fontWeight: 600 }}
                        >
                            {isLoading ? (
                                <>
                                    <span style={{ fontWeight: 600 }}>Adding...</span>
                                    <OvalLoader height="20" width="20" color="#ffffff" strokeWidth={5} strokeWidthSecondary={5} ariaLabel="oval-loading" />
                                </>
                            ) : (
                                'Add FAQ'
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </form>
    )
}

export default AddFaq
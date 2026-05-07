"use client"

import React, { useState, useEffect } from 'react'

import { useGetSinglegetFaqQuery, useUpdategetFaqMutation } from '@/(store)/services/faqs/faqsApi'
import { useRouter } from 'next/navigation'
import Loader from '@/(common)/Loader'
import { BeatLoader } from 'react-spinners'
import { FaqRepeaterEntry } from '@/utils/Types'
import CKEditorWrapper from '@/app/(super-admin)/(common)/editor/CKEditorWrapper'

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

export default function UpdateFaqFormCKEditor({ id }: UpdateFaqFormCKEditorProps) {
    const { data: faqData, isLoading, isError } = useGetSinglegetFaqQuery({ id })
    const [updateFaq] = useUpdategetFaqMutation()
    const router = useRouter()

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
            );
        };
    };

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
        try {
            const formData = new FormData()
            formData.append('faqs_title', JSON.stringify(faqsTitle))
            formData.append('faqs_repeater', JSON.stringify(faqs))

            const resp = await updateFaq({ id, formData }).unwrap()
            if (resp) {
                router.push('/super-admin/faqs');
            }
        } catch (error) {
            if (error instanceof Error) {
                alert('Failed to update FAQ')
            }
        }
    }

    if (isLoading) return <Loader />
    if (isError) return <div>Error loading FAQ</div>

    return (
        <div className="max-w-4xl mx-auto p-6">
            <h1 className="text-2xl font-bold mb-6">Update FAQ</h1>
            <form onSubmit={handleSubmit} className="space-y-6">

                <div className="bg-white p-6 rounded-lg shadow">

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium mb-1">English Title</label>
                            <input
                                type="text"
                                value={faqsTitle.en}
                                onChange={e => handleTitleChange('en', e.target.value)}
                                className="w-full p-2 border rounded"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Kannada Title</label>
                            <input
                                type="text"
                                value={faqsTitle.kn}
                                onChange={e => handleTitleChange('kn', e.target.value)}
                                className="w-full p-2 border rounded"
                                required
                            />
                        </div>
                    </div>
                </div>

                {/* FAQ Items */}
                {faqs.map((faq, index) => (
                    <div key={index} className="bg-white p-6 rounded-lg shadow">
                        <div className="flex justify-between items-center mb-4">

                            {faqs.length > 1 && (
                                <button
                                    type="button"
                                    onClick={() => removeFaq(index)}
                                    className="text-red-500 hover:text-red-700"
                                >
                                    Remove
                                </button>
                            )}
                        </div>

                        {/* Question */}
                        <div className="mb-4">

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <input
                                    type="text"
                                    value={faq.faqs_repeat_question.en}
                                    onChange={e => handleQuestionChange(index, 'en', e.target.value)}
                                    placeholder="English question"
                                    className="w-full p-2 border rounded"
                                    required
                                />
                                <input
                                    type="text"
                                    value={faq.faqs_repeat_question.kn}
                                    onChange={e => handleQuestionChange(index, 'kn', e.target.value)}
                                    placeholder="Kannada question"
                                    className="w-full p-2 border rounded"
                                    required
                                />
                            </div>
                        </div>

                        {/* Answer */}
                        <div className="mb-4">

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <CKEditorWrapper
                                    data={faq.faqs_repeat_answer.en}


                                    onChange={handleAnswerChange(index, 'en')}

                                />
                                <CKEditorWrapper
                                    data={faq.faqs_repeat_answer.kn}


                                    onChange={handleAnswerChange(index, 'kn')}

                                />
                            </div>
                        </div>
                    </div>
                ))}


                <div className="flex justify-between">
                    <button
                        type="button"
                        onClick={addNewFaq}
                        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                    >
                        Add Another FAQ
                    </button>
                    <button
                        type="submit"
                        className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
                        disabled={isLoading}
                    >
                        {isLoading ? (
                            <>
                                Updating...
                                <BeatLoader color="#ffffff" size={10} />

                            </>
                        ) : (
                            'Update Faq'
                        )}
                    </button>
                </div>
            </form>
        </div>
    )
}

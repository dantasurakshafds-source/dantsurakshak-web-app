'use client'

import React, { useState, useRef } from 'react';


import { BeatLoader } from 'react-spinners';
import { useRouter } from 'next/navigation';
import { useCreategetFaqMutation } from '@/(store)/services/faqs/faqsApi';
import CKEditorWrapper from '@/app/(super-admin)/(common)/editor/CKEditorWrapper';

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

const FaqFormCKEditor = () => {
    const router = useRouter();
    const [createFaq, { isLoading }] = useCreategetFaqMutation();
    const [faqsTitle, setFaqsTitle] = useState({
        en: '',
        kn: ''
    });

    const [faqs, setFaqs] = useState<FAQItem[]>([{
        question: { en: '', kn: '' },
        answer: { en: '', kn: '' }
    }]);

    const editorRefs = useRef<(HTMLDivElement | null)[]>([]);

    const handleTitleChange = (lang: 'en' | 'kn', value: string) => {
        setFaqsTitle(prev => ({ ...prev, [lang]: value }));
    };

    const handleQuestionChange = (index: number, lang: 'en' | 'kn', value: string) => {
        const updatedFaqs = [...faqs];
        updatedFaqs[index].question[lang] = value;
        setFaqs(updatedFaqs);
    };

    //@ts-expect-error ignore this message
    const handleAnswerChange = (index: number, lang: 'en' | 'kn', editor) => {
        const updatedFaqs = [...faqs];
        updatedFaqs[index].answer[lang] = editor;
        setFaqs(updatedFaqs);
    };

    const addNewFaq = () => {
        setFaqs([...faqs, {
            question: { en: '', kn: '' },
            answer: { en: '', kn: '' }
        }]);
    };

    const removeFaq = (index: number) => {
        if (faqs.length > 1) {
            const updatedFaqs = [...faqs];
            updatedFaqs.splice(index, 1);
            setFaqs(updatedFaqs);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            const formData = new FormData();

            const faqs_repeater = faqs.map(faq => ({
                faqs_repeat_question: faq.question,
                faqs_repeat_answer: faq.answer
            }));

            formData.append('faqs_title', JSON.stringify(faqsTitle));
            formData.append('faqs_repeater', JSON.stringify(faqs_repeater));

            await createFaq(formData).unwrap();


            setFaqsTitle({ en: '', kn: '' });
            setFaqs([{ question: { en: '', kn: '' }, answer: { en: '', kn: '' } }]);


            router.push('/super-admin/faqs');
        } catch (error) {
            console.error('Submission error:', error);
            alert('Failed to submit FAQ');
        }
    };

    return (
        <div className="faq_wrapper">
            <h1 className="text-2xl font-bold mb-6">Create New FAQ  </h1>

            <form onSubmit={handleSubmit} className="space-y-6">

                <div className="bg-white p-6 rounded-lg shadow">

                    <div className="faq_col_wrapper">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">English Title</label>
                            <input
                                type="text"
                                value={faqsTitle.en}
                                onChange={(e) => handleTitleChange('en', e.target.value)}
                                className="w-full p-2 border rounded"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Kannada Title</label>
                            <input
                                type="text"
                                value={faqsTitle.kn}
                                onChange={(e) => handleTitleChange('kn', e.target.value)}
                                className="w-full p-2 border rounded"
                                required
                            />
                        </div>
                    </div>
                </div>

                {/* FAQ Items */}
                {faqs.map((faq, index) => (
                    <div
                        key={index}
                        className="faq_desc_repeater"
                        ref={el => {
                            editorRefs.current[index] = el;
                        }}
                    >
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


                        <div className="mb-4">

                            <div className="faq_col_wrapper mb-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">English</label>
                                    <input
                                        type="text"
                                        value={faq.question.en}
                                        onChange={(e) => handleQuestionChange(index, 'en', e.target.value)}
                                        className="w-full p-2 border rounded"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Kannada</label>
                                    <input
                                        type="text"
                                        value={faq.question.kn}
                                        onChange={(e) => handleQuestionChange(index, 'kn', e.target.value)}
                                        className="w-full p-2 border rounded"
                                        required
                                    />
                                </div>
                            </div>
                        </div>


                        <div className="mb-4">

                            <div className="faq_col_wrapper">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">English</label>
                                    <CKEditorWrapper
                                        data={faq.answer.en}
                                       

                                        onChange={(data) => handleAnswerChange(index, 'en', data)}

                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Kannada</label>
                                    <CKEditorWrapper
                                        data={faq.answer.kn}
                                     

                                        onChange={(data) => handleAnswerChange(index, 'kn', data)}

                                    />
                                </div>
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
                        Add New
                    </button>

                    <button
                        type="submit"
                        className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 flex items-center justify-center gap-2"
                        disabled={isLoading}
                    >
                        {isLoading ? (
                            <>
                                Submitting
                                <BeatLoader color="#ffffff" size={10} />
                            </>
                        ) : (
                            'Submit FAQ'
                        )}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default FaqFormCKEditor;
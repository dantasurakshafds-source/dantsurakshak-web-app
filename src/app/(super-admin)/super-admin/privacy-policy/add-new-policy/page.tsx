'use client'

import React, { useState } from 'react';

import { BeatLoader } from 'react-spinners';
import { useRouter } from 'next/navigation';
import { useCreatePrivacyPolicyMutation } from '@/(store)/services/privacy-policy/privacyPolicyApi';
import CKEditorWrapper from '@/app/(super-admin)/(common)/editor/CKEditorWrapper';


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

const PrivacyPolicyCreate = () => {
    const router = useRouter();
    const [createPrivacyPolicy, { isLoading }] = useCreatePrivacyPolicyMutation();

    const [privacyPolicies, setPrivacyPolicies] = useState<PrivacyPolicyItem[]>([{
        privacy_heading: { en: '', kn: '' },
        privacy_description: { en: '', kn: '' }
    }]);

    const handlePolicyHeadingChange = (index: number, lang: 'en' | 'kn', value: string) => {
        const updatedPolicies = [...privacyPolicies];
        updatedPolicies[index].privacy_heading[lang] = value;
        setPrivacyPolicies(updatedPolicies);
    };

    //@ts-expect-error ignore this message
    const handlePolicyDescriptionChange = (index: number, lang: 'en' | 'kn', editor) => {
        const updatedPolicies = [...privacyPolicies];
        updatedPolicies[index].privacy_description[lang] = editor;
        setPrivacyPolicies(updatedPolicies);
    };

    const addNewPolicy = () => {
        setPrivacyPolicies([...privacyPolicies, {
            privacy_heading: { en: '', kn: '' },
            privacy_description: { en: '', kn: '' }
        }]);
    };

    const removePolicy = (index: number) => {
        if (privacyPolicies.length > 1) {
            const updatedPolicies = [...privacyPolicies];
            updatedPolicies.splice(index, 1);
            setPrivacyPolicies(updatedPolicies);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            const formData = new FormData();

            formData.append('privacy_policy_repeater', JSON.stringify(privacyPolicies));

            await createPrivacyPolicy(formData).unwrap();

            // Reset form
            setPrivacyPolicies([{
                privacy_heading: { en: '', kn: '' },
                privacy_description: { en: '', kn: '' }
            }]);

            // Redirect
            router.push('/super-admin/privacy-policy');
        } catch (error) {
            console.error('Submission error:', error);
            alert('Failed to create privacy policy');
        }
    };

    return (
        <div className="privacy-policy-wrapper">
            <h1 className="text-2xl font-bold mb-6">Create New Privacy Policy</h1>

            <form onSubmit={handleSubmit} className="form_main_wr">
                {privacyPolicies.map((policy, index) => (
                    <div key={index} className="privacy-policy-item">


                        <div className="pri_main_o_wr">
                            <div className="grid_privacy_policy">
                                <div className="grid_inner">
                                    <div className='nested_wrapper'>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">English Heading</label>
                                        <input
                                            type="text"
                                            value={policy.privacy_heading.en}
                                            onChange={(e) => handlePolicyHeadingChange(index, 'en', e.target.value)}
                                            className="w-full p-2 border rounded"
                                            required
                                        />
                                    </div>
                                    <div className='nested_wrapper'>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Kannada Heading</label>
                                        <input
                                            type="text"
                                            value={policy.privacy_heading.kn}
                                            onChange={(e) => handlePolicyHeadingChange(index, 'kn', e.target.value)}
                                            className="w-full p-2 border rounded"
                                            required
                                        />
                                    </div>
                                </div>
                            </div>


                            <div className="grid_privacy_policy">
                                <div className="grid_inner">
                                    <div className='nested_wrapper'>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">English Description</label>
                                        <CKEditorWrapper

                                            data={policy.privacy_description.en}
                                            
                                            onChange={(data) => handlePolicyDescriptionChange(index, 'en', data)}

                                        />
                                    </div>
                                    <div className='nested_wrapper'>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Kannada Description</label>
                                        <CKEditorWrapper

                                            data={policy.privacy_description.kn}
                                         
                                            onChange={(data) => handlePolicyDescriptionChange(index, 'kn', data)}

                                        />
                                    </div>
                                </div>
                            </div>
                            <div className="delete_act">
                                {privacyPolicies.length > 1 && (
                                    <button
                                        type="button"
                                        onClick={() => removePolicy(index)}
                                        className="text-red-500 hover:text-red-700"
                                    >
                                        x
                                    </button>
                                )}

                            </div>


                        </div>
                    </div>
                ))}
                <div className="action_">


                    <button
                        type="button"
                        onClick={addNewPolicy}
                        className="add_new"
                    >
                        +
                    </button>


                </div>

                <div className="submit_action_b_wrap">


                    <button
                        type="submit"
                        className="submit_action_b"
                        disabled={isLoading}
                    >
                        {isLoading ? (
                            <>
                                Creating
                                <BeatLoader color="#ffffff" size={10} />
                            </>
                        ) : (
                            'Create Privacy Policy'
                        )}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default PrivacyPolicyCreate;
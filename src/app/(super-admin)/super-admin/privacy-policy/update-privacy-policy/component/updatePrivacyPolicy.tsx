'use client'
import React, { useState, useEffect } from 'react';

import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { BeatLoader } from 'react-spinners';
import {
  useGetSinglePrivacyPolicyQuery,
  useUpdatePrivacyPolicyMutation
} from '@/(store)/services/privacy-policy/privacyPolicyApi';
import Loader from '@/(common)/Loader';
import CKEditorWrapper from '@/app/(super-admin)/(common)/editor/CKEditorWrapper';
interface UpdatePrivacyPolicyProps {
  id: string;
}
export default function UpdatePrivacyPolicy({ id }: UpdatePrivacyPolicyProps) {
  const router = useRouter();
  const { data, isLoading: isFetching, error } = useGetSinglePrivacyPolicyQuery({ id });
  const [updatePolicy, { isLoading: isUpdating }] = useUpdatePrivacyPolicyMutation();
  const [privacyPolicyRepeater, setPrivacyPolicyRepeater] = useState([
    { privacy_heading: { en: '', kn: '' }, privacy_description: { en: '', kn: '' } }
  ]);
  useEffect(() => {
    if (data?.result) {
      setPrivacyPolicyRepeater(data.result.privacy_policy_repeater || [
        { privacy_heading: { en: '', kn: '' }, privacy_description: { en: '', kn: '' } }
      ]);
    }
  }, [data]);
  const handleHeadingChange = (index: number, lang: 'en' | 'kn', value: string) => {
    const newArr = [...privacyPolicyRepeater];
    newArr[index] = {
      ...newArr[index],
      privacy_heading: {
        ...newArr[index].privacy_heading,
        [lang]: value,
      },
    };
    setPrivacyPolicyRepeater(newArr);
  };
  //@ts-expect-error ignore this meessage
  const handleDescriptionChange = (index: number, lang: 'en' | 'kn', editor) => {
    const newArr = [...privacyPolicyRepeater];
    newArr[index] = {
      ...newArr[index],
      privacy_description: {
        ...newArr[index].privacy_description,
        [lang]: editor,
      },
    };
    setPrivacyPolicyRepeater(newArr);
  };
  const addItem = () => {
    setPrivacyPolicyRepeater([
      ...privacyPolicyRepeater,
      { privacy_heading: { en: '', kn: '' }, privacy_description: { en: '', kn: '' } }
    ]);
  };
  const deleteItem = (index: number) => {
    if (privacyPolicyRepeater.length > 1) {
      setPrivacyPolicyRepeater(privacyPolicyRepeater.filter((_, i) => i !== index));
    }
  };
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const formData = new FormData();
      formData.append('privacy_policy_repeater', JSON.stringify(privacyPolicyRepeater));

      await updatePolicy({ id, formData }).unwrap();
      toast.success('Privacy policy updated successfully');
      router.push('/super-admin/privacy-policy');
    } catch (err) {
      if (err instanceof Error) {
        console.error('Update error:', err);
        toast.error('Failed to update privacy policy');
      }
    }
  };
  if (isFetching) return <Loader />;
  if (error) return <div>Error loading privacy policy</div>;
  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Update Privacy Policy</h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        {privacyPolicyRepeater.map((item, index) => (
          <div key={index} className="bg-white p-6 rounded-lg shadow">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Section {index + 1}</h3>
              {privacyPolicyRepeater.length > 1 && (
                <button
                  type="button"
                  onClick={() => deleteItem(index)}
                  className="text-red-500 hover:text-red-700"
                >
                  Remove
                </button>
              )}
            </div>

            {/* Heading */}
            <div className="mb-4">
              <h3 className="text-md font-medium mb-2">Heading</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">English</label>
                  <input
                    type="text"
                    value={item.privacy_heading.en}
                    onChange={(e) => handleHeadingChange(index, 'en', e.target.value)}
                    className="w-full p-2 border rounded"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Kannada</label>
                  <input
                    type="text"
                    value={item.privacy_heading.kn}
                    onChange={(e) => handleHeadingChange(index, 'kn', e.target.value)}
                    className="w-full p-2 border rounded"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="mb-4">
              <h3 className="text-md font-medium mb-2">Description</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">English</label>
                  <CKEditorWrapper

                    data={item.privacy_description.en}
                  

                    onChange={(data) => handleDescriptionChange(index, 'en', data)}

                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Kannada</label>
                  <CKEditorWrapper

                    data={item.privacy_description.kn}
               

                    onChange={(data) => handleDescriptionChange(index, 'kn', data)}

                  />
                </div>
              </div>
            </div>
          </div>
        ))}

        <div className="flex justify-between">
          <button
            type="button"
            onClick={addItem}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Add New Section
          </button>

          <button
            type="submit"
            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 flex items-center justify-center gap-2"
            disabled={isUpdating}
          >
            {isUpdating ? (
              <>
                Updating
                <BeatLoader color="#ffffff" size={10} />
              </>
            ) : (
              'Update Privacy Policy'
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
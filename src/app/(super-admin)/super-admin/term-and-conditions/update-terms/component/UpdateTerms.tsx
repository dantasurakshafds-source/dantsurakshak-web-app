'use client'

import React, { useState, useEffect } from 'react';

import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { BeatLoader } from 'react-spinners';
import { useGetSingleTermsQuery, useUpdateTermMutation } from '@/(store)/services/terms/termAndConditionsApi';
import Loader from '@/(common)/Loader';
import CKEditorWrapper from '@/app/(super-admin)/(common)/editor/CKEditorWrapper';


interface UpdateTermsAndConditionsProps {
  id: string;
}

export default function UpdateTermsAndConditions({ id }: UpdateTermsAndConditionsProps) {
  const router = useRouter();
  const { data, isLoading: isFetching, error } = useGetSingleTermsQuery({ id });
  const [updateTerms, { isLoading: isUpdating }] = useUpdateTermMutation();

  const [termsRepeater, setTermsRepeater] = useState([
    { term_heading: { en: '', kn: '' }, term_description: { en: '', kn: '' } }
  ]);




  useEffect(() => {
    if (data?.result) {
      setTermsRepeater(data.result.terms_repeater || [
        { term_heading: { en: '', kn: '' }, term_description: { en: '', kn: '' } }
      ]);
    }
  }, [data]);

  const handleHeadingChange = (index: number, lang: 'en' | 'kn', value: string) => {
    const newArr = [...termsRepeater];
    newArr[index] = {
      ...newArr[index],
      term_heading: {
        ...newArr[index].term_heading,
        [lang]: value,
      },
    };
    setTermsRepeater(newArr);
  };

  //@ts-expect-error ignore this
  const handleDescriptionChange = (index: number, lang: 'en' | 'kn', editor) => {
    const newArr = [...termsRepeater];
    newArr[index] = {
      ...newArr[index],
      term_description: {
        ...newArr[index].term_description,
        [lang]: editor,
      },
    };
    setTermsRepeater(newArr);
  };

  const addItem = () => {
    setTermsRepeater([
      ...termsRepeater,
      { term_heading: { en: '', kn: '' }, term_description: { en: '', kn: '' } }
    ]);
  };

  const deleteItem = (index: number) => {
    if (termsRepeater.length > 1) {
      setTermsRepeater(termsRepeater.filter((_, i) => i !== index));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const formData = new FormData();
      formData.append('terms_repeater', JSON.stringify(termsRepeater));
      await updateTerms({ id, formData }).unwrap();
      toast.success('Terms and conditions updated successfully');
      router.push('/super-admin/term-and-conditions');
    } catch (err) {
      if (err instanceof Error) {
        console.error('Update error:', err);
        toast.error('Failed to update terms and conditions');
      }
    }
  };
  if (isFetching) return <Loader />;
  if (error) return <div>Error loading terms and conditions</div>;
  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Update Terms and Conditions</h1>
      <form onSubmit={handleSubmit} className="space-y-6">
        {termsRepeater.map((item, index) => (
          <div key={index} className="bg-white p-6 rounded-lg shadow">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Section {index + 1}</h3>
              {termsRepeater.length > 1 && (
                <button
                  type="button"
                  onClick={() => deleteItem(index)}
                  className="text-red-500 hover:text-red-700"
                >
                  Remove
                </button>
              )}
            </div>

            <div className="mb-4">
              <h3 className="text-md font-medium mb-2">Heading</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">English</label>
                  <input
                    type="text"
                    value={item.term_heading.en}
                    onChange={(e) => handleHeadingChange(index, 'en', e.target.value)}
                    className="w-full p-2 border rounded"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Kannada</label>
                  <input
                    type="text"
                    value={item.term_heading.kn}
                    onChange={(e) => handleHeadingChange(index, 'kn', e.target.value)}
                    className="w-full p-2 border rounded"
                    required
                  />
                </div>
              </div>
            </div>

            <div className="mb-4">
              <h3 className="text-md font-medium mb-2">Description</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">English</label>
                  <CKEditorWrapper
                    data={item.term_description.en}
               
                    onChange={(data) => handleDescriptionChange(index, 'en', data)}

                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Kannada</label>
                  <CKEditorWrapper
                    data={item.term_description.kn}
               
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
                Updating <BeatLoader color="#ffffff" size={10} />
              </>
            ) : (
              'Update Terms and Conditions'
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
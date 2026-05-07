'use client'

import React, { useState } from 'react';
 
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

import { BeatLoader } from 'react-spinners';
import { useCreateTermMutation } from '@/(store)/services/terms/termAndConditionsApi';
import CKEditorWrapper from '@/app/(super-admin)/(common)/editor/CKEditorWrapper';

export default function CreateTermsAndConditions() {
  const router = useRouter();
  const [createTerms, { isLoading: creating }] = useCreateTermMutation();
  const [termsRepeater, setTermsRepeater] = useState([
    { term_heading: { en: '', kn: '' }, term_description: { en: '', kn: '' } }
  ]);

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

    if (termsRepeater.length === 0) {
      toast.error('Add at least one section');
      return;
    }

    try {
      const formData = new FormData();
      formData.append('terms_repeater', JSON.stringify(termsRepeater));

      await createTerms(formData).unwrap();
      toast.success('Terms and conditions created successfully');
      router.push('/super-admin/terms-and-conditions');
    } catch (err) {
      if(err instanceof Error){
        toast.error('Failed to create terms and conditions');
      }
    }
  };

  return (
    <div className="privacy-policy-wrapper ">
      <h1 className="text-2xl font-bold mb-6">Create Terms and Conditions</h1>

      <form onSubmit={handleSubmit} className="form_main_wr">
        {termsRepeater.map((term, index) => (
          <div key={index} className="privacy-policy-item">




            <div className="pri_main_o_wr">
              <div className="grid_privacy_policy">
            
                <div className="grid_inner">
                  <div className='nested_wrapper'>
                    <label className="block text-sm font-medium text-gray-700 mb-1">English</label>
                    <input
                      type="text"
                      value={term.term_heading.en}
                      onChange={(e) => handleHeadingChange(index, 'en', e.target.value)}
                      className="w-full p-2 border rounded"
                      required
                    />
                  </div>
                  <div className='nested_wrapper'>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Kannada</label>
                    <input
                      type="text"
                      value={term.term_heading.kn}
                      onChange={(e) => handleHeadingChange(index, 'kn', e.target.value)}
                      className="w-full p-2 border rounded"
                      required
                    />
                  </div>
                </div>
              </div>


              <div className="grid_privacy_policy">
            
                  <div className="grid_inner">
                  <div className='nested_wrapper'>
                    <label className="block text-sm font-medium text-gray-700 mb-1">English</label>
                    <CKEditorWrapper
                  
                      data={term.term_description.en}
                  
                      onChange={(data) => handleDescriptionChange(index, 'en', data)}
                      
                    />
                  </div>
                  <div className='nested_wrapper'>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Kannada</label>
                    <CKEditorWrapper
                    
          
                      data={term.term_description.kn}
                   
                      onChange={(data) => handleDescriptionChange(index, 'kn', data)}
                      
                    />
                  </div>
                </div>
              </div>

              <div className="delete_act">
                {termsRepeater.length > 1 && (
                  <button
                    type="button"
                    onClick={() => deleteItem(index)}
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
            onClick={addItem}
            className="add_new"
          >
            +
          </button>


        </div>

        <div className="submit_action_b_wrap">


          <button
            type="submit"
            className="submit_action_b"
            disabled={creating}
          >
            {creating ? (
              <>
                Submitting
                <BeatLoader color="#ffffff" size={10} />
              </>
            ) : (
              'Create Terms and Conditions'
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
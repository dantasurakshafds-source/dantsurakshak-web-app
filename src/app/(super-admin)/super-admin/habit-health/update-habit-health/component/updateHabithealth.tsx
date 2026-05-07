"use client"

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
 
import { FaPlus } from 'react-icons/fa'
import { BeatLoader } from 'react-spinners'
import {

  useGetSingleHabitHealthQuery,
  useUpdateHabitHealthMutation
} from '@/(store)/services/habit-health/habitHealthApi'
import Loader from '@/(common)/Loader'
import { HabitHealthRepeaterItem } from '@/utils/Types'
import CKEditorWrapper from '@/app/(super-admin)/(common)/editor/CKEditorWrapper'

// Types
interface BilingualField { en: string; kn: string }
interface RepeaterItem {
  description: BilingualField[]
}

interface UpdateDiseaseProps {
  id: string;
}

export default function EditHabitsHealth({ id }: UpdateDiseaseProps) {

  const router = useRouter()

  console.log(id)

  // API Hooks
  const { data: habitData, isLoading: isFetching } = useGetSingleHabitHealthQuery({ id })
  const [updateHabit, { isLoading: isUpdating }] = useUpdateHabitHealthMutation()


 
  // State
  const [mainTitle, setMainTitle] = useState<BilingualField>({ en: '', kn: '' })
  const [mainImage, setMainImage] = useState<File | null>(null)
  const [existingImage, setExistingImage] = useState<string>('')
  const [repeater, setRepeater] = useState<RepeaterItem[]>([])

 
  const response = habitData?.result || {}

  



  useEffect(() => {
    if (habitData) {
      setMainTitle(response.habit_health_main_title)
      setExistingImage(response.habit_health_main_image)
      const formattedRepeater = response.habit_health_repeater.map((item:HabitHealthRepeaterItem) => ({
        description: item.description || [{ en: '', kn: '' }]
      }))
      setRepeater(formattedRepeater)
    }
  }, [habitData])

  const handleField = (
    setter: React.Dispatch<React.SetStateAction<BilingualField>>,
    lang: keyof BilingualField,
    value: string
  ) => setter(prev => ({ ...prev, [lang]: value }))

  const addRepeater = () =>
    setRepeater(prev => [...prev, {
      description: [{ en: '', kn: '' }]
    }])

  const removeRepeater = (index: number) =>
    setRepeater(prev => prev.filter((_, i) => i !== index))

  const updateRepeaterDescription = (
    index: number,
    lang: keyof BilingualField,
    value: string
  ) => setRepeater(prev =>
    prev.map((item, i) =>
      i === index
        ? {
          ...item,
          description: [{
            ...item.description[0],
            [lang]: value
          }]
        }
        : item
    )
  )

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (!mainTitle.en.trim() || !mainTitle.kn.trim()) {
        throw new Error('Main title in both languages is required');
      }
      if (!existingImage && !mainImage) {
        throw new Error('Main image is required');
      }
      const formData = new FormData();
      formData.append('habit_health_main_title', JSON.stringify(mainTitle));
      formData.append('habit_health_repeater', JSON.stringify(repeater));
      if (mainImage) {
        formData.append('habit_health_main_image', mainImage);
      } else if (existingImage) {
        formData.append('habit_health_main_image_url', existingImage);
      }
      const result = await updateHabit({
        id,
        formData
      }).unwrap();
      if (result.success) {
        toast.success('Habit health updated successfully!');
        router.push('/super-admin/habit-health');
      } else {
        throw new Error(result.message || 'Update failed');
      }
    } catch (err) {
      if(err instanceof Error){
        const errorMessage = err.message || 'Failed to update habit health';
        toast.error(errorMessage);
        console.error('Update error:', err);
      }
    }
  };

  if (isFetching) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader />
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 p-6 bg-white rounded-lg shadow">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Main Title (English)*</label>
          <input
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            type="text"
            value={mainTitle.en}
            onChange={e => handleField(setMainTitle, 'en', e.target.value)}
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Main Title (Kannada)*</label>
          <input
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            type="text"
            value={mainTitle.kn}
            onChange={e => handleField(setMainTitle, 'kn', e.target.value)}
            required
          />
        </div>
      </div>


      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {existingImage ? 'Update Main Image' : 'Upload Main Image*'}
        </label>

        {existingImage && (
          <div className="mb-4 h_image">
            <p className="text-sm text-gray-500 mb-2">Current Image:</p>
            <img
              src={existingImage}
              alt="Current habit health"
              className="h_img"
            />
          </div>
        )}

        <input
          type="file"
          accept="image/*"
          onChange={e => {
            const file = e.target.files?.[0]
            if (file) {
              setMainImage(file)
              setExistingImage('') // Clear existing image URL when new file is selected
            }
          }}
          className="block w-full text-sm text-gray-500
            file:mr-4 file:py-2 file:px-4
            file:rounded-md file:border-0
            file:text-sm file:font-semibold
            file:bg-blue-50 file:text-blue-700
            hover:file:bg-blue-100"
          required={!existingImage}
        />
      </div>

      <div className="border-t pt-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Content</h3>
        <button
          type="button"
          onClick={addRepeater}
          className="mb-4 inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          <FaPlus /> Add
        </button>

        {repeater.map((item, idx) => (
          <div key={idx} className="border border-gray-200 p-4 mb-4 rounded-lg bg-gray-50">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description (English)*</label>
                <div className="border border-gray-300 rounded-md overflow-hidden">
                  <CKEditorWrapper
                
                    
                data={item.description[0]?.en || ''}
                
                    onChange={(data) => {
                      
                      updateRepeaterDescription(idx, 'en', data)
                    }}
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description (Kannada)*</label>
                <div className="border border-gray-300 rounded-md overflow-hidden">
                  <CKEditorWrapper
                 
                    
                 data={item.description[0]?.kn || ''}
                
                    onChange={(data) => {
                      
                      updateRepeaterDescription(idx, 'kn', data)
                    }}
                  />
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                toast('Description removed', {
                  action: {
                    label: 'Undo',
                    onClick: () => {
                      setRepeater(prev => [...prev, item])
                      toast.success('Description restored')
                    }
                  }
                })
                removeRepeater(idx)
              }}
              className="mt-3 px-3 py-1 bg-red-100 text-red-700 rounded-md text-sm hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-1"
            >
              Remove
            </button>
          </div>
        ))}
      </div>

      <div className="flex justify-end pt-4">
        <button
          type="submit"
          disabled={isUpdating}
          className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isUpdating ? (
            <>
              Updating.. <BeatLoader size={8} color="#ffffff" />
            </>
          ) : 'Update'}
        </button>
      </div>
    </form>
  )
}
'use client'

import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

import {
  useGetSingleMythFactsQuery,
  useUpdateMythFactMutation
} from '@/(store)/services/myth-facts/mythFactsApi'
import Loader from '@/(common)/Loader'
import { BeatLoader } from 'react-spinners'

export type MythFactBody = { en: string; kn: string }

// Matches your server-side IFactsSection
export interface FactsSection {
  heading: MythFactBody
  myths_facts_wrong_fact: MythFactBody[]
  myths_facts_right_fact: MythFactBody[]
}

interface UpdateMythFactProps {
  id: string
}

export default function UpdateMythFact({ id }: UpdateMythFactProps) {
  const { data, isLoading, isError } = useGetSingleMythFactsQuery({ id })
  const [updateMythFact, { isLoading: isUpdating }] = useUpdateMythFactMutation()
  const router = useRouter()

  // Image
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [existingImage, setExistingImage] = useState<string>('')

  // Top-level localized fields
  const [title, setTitle] = useState<MythFactBody>({ en: '', kn: '' })
  const [body, setBody] = useState<MythFactBody>({ en: '', kn: '' })
  const [heading, setHeading] = useState<MythFactBody>({ en: '', kn: '' })
  const [description, setDescription] = useState<MythFactBody>({ en: '', kn: '' })


  const [sections, setSections] = useState<FactsSection[]>([])


  useEffect(() => {
    if (!data) return
    const payload = (data).data ?? (data).result ?? data


    setExistingImage(payload.myth_fact_image || '')
    setTitle(payload.myth_fact_title)
    setBody(payload.myth_fact_body)
    setHeading(payload.myth_fact_heading)
    setDescription(payload.myth_fact_description)


    if (Array.isArray(payload.facts)) {
      setSections(payload.facts)
    } else {

      setSections(payload.facts ? [payload.facts] : [])
    }
  }, [data])

  // Section-level helpers
  const updateSection = (idx: number, newSection: Partial<FactsSection>) => {
    setSections(secs =>
      secs.map((s, i) => (i === idx ? { ...s, ...newSection } : s))
    )
  }

  const addSection = () => {
    setSections(secs => [
      ...secs,
      { heading: { en: '', kn: '' }, myths_facts_wrong_fact: [], myths_facts_right_fact: [] }
    ])
  }

  const removeSection = (idx: number) => {
    setSections(secs => secs.filter((_, i) => i !== idx))
  }

  // Fact-level helpers
  const handleFactChange = (
    idx: number,
    listKey: 'myths_facts_wrong_fact' | 'myths_facts_right_fact',
    factIdx: number,
    field: 'en' | 'kn',
    value: string
  ) => {
    setSections(secs =>
      secs.map((s, i) => {
        if (i !== idx) return s
        const updatedList = s[listKey].map((f, j) =>
          j === factIdx ? { ...f, [field]: value } : f
        )
        return { ...s, [listKey]: updatedList }
      })
    )
  }

  const addFact = (
    idx: number,
    listKey: 'myths_facts_wrong_fact' | 'myths_facts_right_fact'
  ) => {
    setSections(secs =>
      secs.map((s, i) =>
        i === idx
          ? { ...s, [listKey]: [...s[listKey], { en: '', kn: '' }] }
          : s
      )
    )
  }

  const removeFact = (
    idx: number,
    listKey: 'myths_facts_wrong_fact' | 'myths_facts_right_fact',
    factIdx: number
  ) => {
    setSections(secs =>
      secs.map((s, i) =>
        i === idx
          ? { ...s, [listKey]: s[listKey].filter((_, j) => j !== factIdx) }
          : s
      )
    )
  }

  // Submit handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const formData = new FormData()

    if (imageFile) formData.append('myth_fact_image', imageFile)

    // Top-level
    formData.append('myth_fact_title', JSON.stringify(title))
    formData.append('myth_fact_body', JSON.stringify(body))
    formData.append('myth_fact_heading', JSON.stringify(heading))
    formData.append('myth_fact_description', JSON.stringify(description))

    // All sections as an array
    formData.append('facts', JSON.stringify(sections))

    try {
      await updateMythFact({ id, formData }).unwrap()
      toast.success('Myth & Fact updated successfully')
      router.push('/super-admin/myth-and-facts')
    } catch {
      toast.error('Failed to update Myth & Fact')
    }
  }

  if (isLoading) return <Loader />
  if (isError) return <p>Error loading Myth & Fact.</p>

  return (
    <form onSubmit={handleSubmit} className="form-container" id="myth_facts_wrapper">
      <h2 className="form-title">Update Myth & Fact</h2>

      {/* Image upload */}
      <div className="image_cust">
        <label>Upload Image:</label>
        <input
          type="file"
          accept="image/*"
          onChange={e => {
            setExistingImage('')
            setImageFile(e.target.files?.[0] || null)
          }}
        />
        {(existingImage || imageFile) && (
          <img
            src={imageFile ? URL.createObjectURL(imageFile) : existingImage}
            alt="Preview"
            style={{ width: 100, marginTop: 8 }}
          />
        )}
      </div>

      <hr />


      {[
        ['Title', title, setTitle],
        ['Body', body, setBody],
        ['Heading', heading, setHeading],
        ['Description', description, setDescription],
      ].map(([label, state, setter]) => (
        //@ts-expect-error ignore this
        <div key={label} className="set_groups mb-4">
          <div className="en_g">

            <label>{label as string} (EN):</label>
            <input
              type="text"
              className="input"
              value={(state as MythFactBody).en}
              //@ts-expect-error ignore this
              onChange={e => setter(prev => ({ ...prev, en: e.target.value }))}
            />
          </div>
          <div className="kn_g">

            <label>{label as string} (KN):</label>
            <input
              type="text"
              className="input"
              value={(state as MythFactBody).kn}
              //@ts-expect-error ignore this
              onChange={e => setter(prev => ({ ...prev, kn: e.target.value }))}
            />
          </div>
        </div>
      ))}

      <hr />


      <h3>Myth Facts section</h3>
      <div className="m_f_wrapper">
        {sections.map((sec, idx) => (
          <div key={idx} className="facts-section border p-4 mb-4">
            <div className="flex justify-between mb-2">

              <div className="r_s_button">
                <button
                  type="button"
                  className="text-red-600"
                  onClick={() => removeSection(idx)}
                >
                  remove
                </button>
              </div>

            </div>




            <div className="myth_fact_heading">
              <div className="en_g">
                <label>Heading (EN):</label>
                <input
                  type="text"
                  className="input"
                  value={sec.heading.en}
                  onChange={e =>
                    updateSection(idx, {
                      heading: { ...sec.heading, en: e.target.value }
                    })
                  }
                />
              </div>
              <div className="kn_g">
                <label>Heading (KN):</label>
                <input
                  type="text"
                  className="input"
                  value={sec.heading.kn}
                  onChange={e =>
                    updateSection(idx, {
                      heading: { ...sec.heading, kn: e.target.value }
                    })
                  }
                />
              </div>
            </div>
            <div className="facrs_section">
              <div className="myths_section">
                <h3>(Myth)</h3>
                {sec.myths_facts_wrong_fact.map((f, j) => (
                  <div key={j} className="repeater w_m_f_repeater mb-2 flex items-center">

                    <div className="">
                      <div className="en_g">
                        <label>EN:</label>
                        <input
                          type="text"
                          className="input"
                          value={f.en}
                          onChange={e =>
                            handleFactChange(idx, 'myths_facts_wrong_fact', j, 'en', e.target.value)
                          }
                        />
                      </div>
                      <div className="kn_g">
                        <label>KN:</label>
                        <input
                          type="text"
                          className="input"
                          value={f.kn}
                          onChange={e =>
                            handleFactChange(idx, 'myths_facts_wrong_fact', j, 'kn', e.target.value)
                          }
                        />
                      </div>
                    </div>
                    <button
                      type="button"
                      className="text-red-500 ml-4"
                      onClick={() => removeFact(idx, 'myths_facts_wrong_fact', j)}
                    >
                      x
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  className="text-blue-600 add_new_facts mb-4"
                  onClick={() => addFact(idx, 'myths_facts_wrong_fact')}
                >
                  + Add Myths
                </button>

              </div>


              <div className="fact_section">
                <h3>(Fact)</h3>
                {sec.myths_facts_right_fact.map((f, j) => (
                  <div key={j} className="repeater r_m_f_repeater mb-2 flex items-center">
                    <div className="">
                      <div className="en_g">
                        <label>EN:</label>
                        <input
                          type="text"
                          className="input"
                          value={f.en}
                          onChange={e =>
                            handleFactChange(idx, 'myths_facts_right_fact', j, 'en', e.target.value)
                          }
                        />
                      </div>
                      <div className="kn_g">
                        <label>KN:</label>
                        <input
                          type="text"
                          className="input"
                          value={f.kn}
                          onChange={e =>
                            handleFactChange(idx, 'myths_facts_right_fact', j, 'kn', e.target.value)
                          }
                        />
                      </div>
                    </div>
                    <button
                      type="button"
                      className="text-red-500 ml-4"
                      onClick={() => removeFact(idx, 'myths_facts_right_fact', j)}
                    >
                      x
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  className="text-blue-600 add_new_facts mb-4"
                  onClick={() => addFact(idx, 'myths_facts_right_fact')}
                >
                  + Add Facts
                </button>

              </div>

            </div>



          </div>
        ))}
      </div>


      <button
        type="button"
        className="add_new_facts"
        onClick={addSection}
      >
        + Add New Myth Fact
      </button>

      <button type="submit" className="submit-button" disabled={isUpdating}>
        {isUpdating ? (<>
          updating...  <BeatLoader size={8} color="#ffffff" />
        </>) :
          (<>
            update
          </>)
        }

      </button>
    </form>
  )
}

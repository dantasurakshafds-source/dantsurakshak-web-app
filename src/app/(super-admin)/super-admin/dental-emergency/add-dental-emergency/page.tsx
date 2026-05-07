'use client'
import React, { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { FaPlus } from 'react-icons/fa'
import { BeatLoader } from 'react-spinners'
import {
  useCreateDentalEmergencyMutation
} from '@/(store)/services/dental-emergency/dentalEmergencyApi'

interface DentalEmerTabDescription {
  denatl_emer_tab_heading: {
    en: string;
    kn: string;
  };
  denatl_emer_tab_paragraph: {
    en: string;
    kn: string;
  };
}

interface DentalEmerRepeaterItem {
  dental_emer_tab_title: {
    en: string;
    kn: string;
  };
  denatl_emer_description_repeater: DentalEmerTabDescription[];
}

export default function AddDentalEmergency() {
  const [createDentalEmergency, { isLoading }] = useCreateDentalEmergencyMutation()
  const router = useRouter()

  // Main bilingual fields
  const [title, setTitle] = useState({ en: '', kn: '' })
  const [titleImageFile, setTitleImageFile] = useState<File | null>(null)
  const [titleImageUrl, setTitleImageUrl] = useState<string>('')
  const [heading, setHeading] = useState({ en: '', kn: '' })
  const [para, setPara] = useState({ en: '', kn: '' })
  const [iconFile, setIconFile] = useState<File | null>(null)
  const [iconUrl, setIconUrl] = useState<string>('')

  // Inner section
  const [innerTitle, setInnerTitle] = useState({ en: '', kn: '' })
  const [innerPara, setInnerPara] = useState({ en: '', kn: '' })
  const [innerIconFile, setInnerIconFile] = useState<File | null>(null)
  const [innerIconUrl, setInnerIconUrl] = useState<string>('')

  // Emerge section
  const [emerTitle, setEmerTitle] = useState({ en: '', kn: '' })
  const [emerSubTitle, setEmerSubTitle] = useState({ en: '', kn: '' })

  // Repeater section
  const [repeater, setRepeater] = useState<DentalEmerRepeaterItem[]>([])
  const addCalled = useRef(false)
  
  const addRepeaterItem = () => {
    if (addCalled.current) return
    addCalled.current = true
    setRepeater(prev => [
      ...prev,
      { 
        dental_emer_tab_title: { en: '', kn: '' },
        denatl_emer_description_repeater: [
          {
            denatl_emer_tab_heading: { en: '', kn: '' },
            denatl_emer_tab_paragraph: { en: '', kn: '' }
          }
        ]
      }
    ])
    setTimeout(() => (addCalled.current = false), 300)
  }

  const removeRepeaterItem = (idx: number) =>
    setRepeater(r => r.filter((_, i) => i !== idx))

  const addDescriptionToRepeaterItem = (repeaterIndex: number) => {
    setRepeater(r =>
      r.map((item, i) =>
        i === repeaterIndex
          ? {
              ...item,
              denatl_emer_description_repeater: [
                ...item.denatl_emer_description_repeater,
                {
                  denatl_emer_tab_heading: { en: '', kn: '' },
                  denatl_emer_tab_paragraph: { en: '', kn: '' }
                }
              ]
            }
          : item
      )
    )
  }

  const removeDescriptionFromRepeaterItem = (repeaterIndex: number, descIndex: number) => {
    setRepeater(r =>
      r.map((item, i) =>
        i === repeaterIndex
          ? {
              ...item,
              denatl_emer_description_repeater: item.denatl_emer_description_repeater.filter(
                (_, j) => j !== descIndex
              )
            }
          : item
      )
    )
  }

  const updateRepeaterTitle = (idx: number, lang: 'en' | 'kn', value: string) => {
    setRepeater(r =>
      r.map((item, i) =>
        i === idx ? { 
          ...item, 
          dental_emer_tab_title: { 
            ...item.dental_emer_tab_title, 
            [lang]: value 
          } 
        } : item
      )
    )
  }

  const updateRepeaterDescription = (
    repeaterIndex: number,
    descIndex: number,
    field: 'denatl_emer_tab_heading' | 'denatl_emer_tab_paragraph',
    lang: 'en' | 'kn',
    value: string
  ) => {
    setRepeater(r =>
      r.map((item, i) =>
        i === repeaterIndex
          ? {
              ...item,
              denatl_emer_description_repeater: item.denatl_emer_description_repeater.map(
                (desc, j) =>
                  j === descIndex
                    ? {
                        ...desc,
                        [field]: {
                          ...desc[field],
                          [lang]: value
                        }
                      }
                    : desc
              )
            }
          : item
      )
    )
  }

  const handleFile = (
    file: File | null,
    setFile: React.Dispatch<React.SetStateAction<File | null>>,
    setUrl: React.Dispatch<React.SetStateAction<string>>
  ) => {
    setFile(file)
    setUrl(file ? URL.createObjectURL(file) : '')
  }

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const fd = new FormData()
      
      // Main section
      fd.append('dental_emergency_title', JSON.stringify(title))
      if (titleImageFile) fd.append('dental_emergency_image_file', titleImageFile)
      fd.append('dental_emergency_heading', JSON.stringify(heading))
      fd.append('dental_emergency_para', JSON.stringify(para))
      if (iconFile) fd.append('dental_emergency_icon_file', iconFile)

      // Inner section
      fd.append('dental_emergency_inner_title', JSON.stringify(innerTitle))
      fd.append('dental_emergency_inner_para', JSON.stringify(innerPara))
      if (innerIconFile) fd.append('dental_emergency_inner_icon_file', innerIconFile)

      // Emergency section
      fd.append('dental_emer_title', JSON.stringify(emerTitle))
      fd.append('dental_emer_sub_title', JSON.stringify(emerSubTitle))

      // Repeater section
      fd.append('dental_emer_repeater', JSON.stringify(repeater))
      
      await createDentalEmergency(fd).unwrap()
      toast.success('Dental Emergency created successfully!')
      router.push('/super-admin/dental-emergency')
    } catch (err) {
      toast.error('Failed to create Dental Emergency. Please check all required fields.')
      console.error(err)
    }
  }

  return (
    <form onSubmit={onSubmit} className="form-container" id='dental_eme_wrap'>
      <h2 className="form-title">Add Dental Emergency</h2>

      {/* Title Section */}
      <div className="set_groups">
        <div className="en_g">
          <label>Title (EN):</label>
          <input
            type="text"
            value={title.en}
            onChange={e => setTitle(prev => ({ ...prev, en: e.target.value }))}
            required
          />
        </div>
        <div className="kn_g">
          <label>Title (KN):</label>
          <input
            type="text"
            value={title.kn}
            onChange={e => setTitle(prev => ({ ...prev, kn: e.target.value }))}
            required
          />
        </div>
      </div>
      
      <div className="image_cust">
        <label>Upload Title Image:</label>
        <input
          type="file"
          accept="image/*"
          onChange={e => handleFile(
            e.target.files?.[0] || null,
            setTitleImageFile,
            setTitleImageUrl
          )}
        />
        {titleImageUrl && (
          <img src={titleImageUrl} style={{ width: 100 }} alt="title" />
        )}
      </div>
      
      <div className="set_groups">
        <div className="en_g">
          <label>Heading (EN):</label>
          <input
            type="text"
            value={heading.en}
            onChange={e => setHeading(prev => ({ ...prev, en: e.target.value }))}
            required
          />
        </div>
        <div className="kn_g">
          <label>Heading (KN):</label>
          <input
            type="text"
            value={heading.kn}
            onChange={e => setHeading(prev => ({ ...prev, kn: e.target.value }))}
            required
          />
        </div>
      </div>
      
      <div className="set_groups">
        <div className="en_g">
          <label>Paragraph (EN):</label>
          <textarea
            value={para.en}
            onChange={e => setPara(prev => ({ ...prev, en: e.target.value }))}
            required
          />
        </div>
        <div className="kn_g">
          <label>Paragraph (KN):</label>
          <textarea
            value={para.kn}
            onChange={e => setPara(prev => ({ ...prev, kn: e.target.value }))}
            required
          />
        </div>
      </div>
      
      <div className="image_cust">
        <label>Upload Icon:</label>
        <input
          type="file"
          accept="image/*"
          onChange={e => handleFile(
            e.target.files?.[0] || null,
            setIconFile,
            setIconUrl
          )}
        />
        {iconUrl && <img src={iconUrl} style={{ width: 100 }} alt="icon" />}
      </div>

      <hr />

      {/* Inner Section */}
      <h3>Inner Section</h3>
      <div className="set_groups">
        <div className="en_g">
          <label>Inner Title (EN):</label>
          <input
            type="text"
            value={innerTitle.en}
            onChange={e => setInnerTitle(prev => ({ ...prev, en: e.target.value }))}
            required
          />
        </div>
        <div className="kn_g">
          <label>Inner Title (KN):</label>
          <input
            type="text"
            value={innerTitle.kn}
            onChange={e => setInnerTitle(prev => ({ ...prev, kn: e.target.value }))}
            required
          />
        </div>
      </div>
      
      <div className="set_groups">
        <div className="en_g">
          <label>Inner Paragraph (EN):</label>
          <textarea
            value={innerPara.en}
            onChange={e => setInnerPara(prev => ({ ...prev, en: e.target.value }))}
            required
          />
        </div>
        <div className="kn_g">
          <label>Inner Paragraph (KN):</label>
          <textarea
            value={innerPara.kn}
            onChange={e => setInnerPara(prev => ({ ...prev, kn: e.target.value }))}
            required
          />
        </div>
      </div>
      
      <div className="image_cust">
        <label>Upload Inner Icon:</label>
        <input
          type="file"
          accept="image/*"
          onChange={e => handleFile(
            e.target.files?.[0] || null,
            setInnerIconFile,
            setInnerIconUrl
          )}
        />
        {innerIconUrl && (
          <img src={innerIconUrl} style={{ width: 100 }} alt="inner icon" />
        )}
      </div>

      <hr />

      {/* Emergency Titles */}
      <div className="set_groups">
        <div className="en_g">
          <label>Emergency Title (EN):</label>
          <input
            type="text"
            value={emerTitle.en}
            onChange={e => setEmerTitle(prev => ({ ...prev, en: e.target.value }))}
            required
          />
        </div>
        <div className="kn_g">
          <label>Emergency Title (KN):</label>
          <input
            type="text"
            value={emerTitle.kn}
            onChange={e => setEmerTitle(prev => ({ ...prev, kn: e.target.value }))}
            required
          />
        </div>
      </div>
      
      <div className="set_groups">
        <div className="en_g">
          <label>Sub-Title (EN):</label>
          <input
            type="text"
            value={emerSubTitle.en}
            onChange={e => setEmerSubTitle(prev => ({ ...prev, en: e.target.value }))}
            required
          />
        </div>
        <div className="kn_g">
          <label>Sub-Title (KN):</label>
          <input
            type="text"
            value={emerSubTitle.kn}
            onChange={e => setEmerSubTitle(prev => ({ ...prev, kn: e.target.value }))}
            required
          />
        </div>
      </div>

      <hr />

      
     
      
      {repeater.map((item, repeaterIndex) => (
        <div key={repeaterIndex} className="repeater">
          <div className="set_groups">
            <div className="en_g">
              <label>Step Title (EN):</label>
              <input
                type="text"
                value={item.dental_emer_tab_title.en}
                onChange={e => updateRepeaterTitle(repeaterIndex, 'en', e.target.value)}
                required
              />
            </div>
            <div className="kn_g">
              <label>Step Title (KN):</label>
              <input
                type="text"
                value={item.dental_emer_tab_title.kn}
                onChange={e => updateRepeaterTitle(repeaterIndex, 'kn', e.target.value)}
                required
              />
            </div>
          </div>

          <div className="description-container">
            <h4>Step Descriptions</h4>
            <button 
              type="button" 
              onClick={() => addDescriptionToRepeaterItem(repeaterIndex)}
              className="add-description-button"
            >
              <FaPlus /> Add Description
            </button>

            {item.denatl_emer_description_repeater.map((desc, descIndex) => (
              <div key={descIndex} className="description-item">
                <div className="set_groups">
                  <div className="en_g">
                    <label>Heading (EN):</label>
                    <input
                      type="text"
                      value={desc.denatl_emer_tab_heading.en}
                      onChange={e =>
                        updateRepeaterDescription(
                          repeaterIndex,
                          descIndex,
                          'denatl_emer_tab_heading',
                          'en',
                          e.target.value
                        )
                      }
                      required
                    />
                  </div>
                  <div className="kn_g">
                    <label>Heading (KN):</label>
                    <input
                      type="text"
                      value={desc.denatl_emer_tab_heading.kn}
                      onChange={e =>
                        updateRepeaterDescription(
                          repeaterIndex,
                          descIndex,
                          'denatl_emer_tab_heading',
                          'kn',
                          e.target.value
                        )
                      }
                      required
                    />
                  </div>
                </div>

                <div className="set_groups">
                  <div className="en_g">
                    <label>Paragraph (EN):</label>
                    <textarea
                      value={desc.denatl_emer_tab_paragraph.en}
                      onChange={e =>
                        updateRepeaterDescription(
                          repeaterIndex,
                          descIndex,
                          'denatl_emer_tab_paragraph',
                          'en',
                          e.target.value
                        )
                      }
                      required
                    />
                  </div>
                  <div className="kn_g">
                    <label>Paragraph (KN):</label>
                    <textarea
                      value={desc.denatl_emer_tab_paragraph.kn}
                      onChange={e =>
                        updateRepeaterDescription(
                          repeaterIndex,
                          descIndex,
                          'denatl_emer_tab_paragraph',
                          'kn',
                          e.target.value
                        )
                      }
                      required
                    />
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => removeDescriptionFromRepeaterItem(repeaterIndex, descIndex)}
                  className="remove-description-button"
                >
                  Remove Description
                </button>
              </div>
            ))}
          </div>
          
          <button 
            type="button" 
            onClick={() => removeRepeaterItem(repeaterIndex)}
            className="remove-button"
          >
            Remove Step
          </button>
        </div>
      ))}

       <div className="button-container">
        <h3>Emergency Steps</h3>
        <button type="button" onClick={addRepeaterItem}>
          <FaPlus /> Add Step
        </button>
      </div>

      <hr />

      <div className="button-container">
        <button 
          type="submit" 
          className="disease-form-submit-button" 
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              Creating.. <BeatLoader color="#fff" size={10} />
            </>
          ) : (
            'create Dental Emergency'
          )}
        </button>
      </div>
    </form>
  )
}
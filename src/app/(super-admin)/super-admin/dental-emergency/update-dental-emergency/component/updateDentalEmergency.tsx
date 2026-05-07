'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { FaPlus } from 'react-icons/fa';
import { BeatLoader } from 'react-spinners';
import Loader from '@/(common)/Loader';
import {
  useGetSingleDentalEmergencyQuery,
  useUpdateDentalEmergencyMutation
} from '@/(store)/services/dental-emergency/dentalEmergencyApi';
import { Language, DentalEmerRepeater, DentalEmerDescriptionRepeater,   } from '@/utils/Types';

interface UpdateDiseaseProps {
  id: string;
}
export default function EditDentalEmergency({id}:UpdateDiseaseProps) {
  
  const router = useRouter();
  const { data, isLoading: isFetching, error } = useGetSingleDentalEmergencyQuery({ id });
  const [updateDental, { isLoading }] = useUpdateDentalEmergencyMutation();

  // Main bilingual
  const [title, setTitle] = useState<Language>({ en: '', kn: '' });
  const [titleImageFile, setTitleImageFile] = useState<File | null>(null);
  const [titleImageUrl, setTitleImageUrl] = useState<string>('');
  const [heading, setHeading] = useState<Language>({ en: '', kn: '' });
  const [para, setPara] = useState<Language>({ en: '', kn: '' });
  const [iconFile, setIconFile] = useState<File | null>(null);
  const [iconUrl, setIconUrl] = useState<string>('');

  // Inner
  const [innerTitle, setInnerTitle] = useState<Language>({ en: '', kn: '' });
  const [innerPara, setInnerPara] = useState<Language>({ en: '', kn: '' });
  const [innerIconFile, setInnerIconFile] = useState<File | null>(null);
  const [innerIconUrl, setInnerIconUrl] = useState<string>('');

  // Emergency section
  const [emerTitle, setEmerTitle] = useState<Language>({ en: '', kn: '' });
  const [emerSubTitle, setEmerSubTitle] = useState<Language>({ en: '', kn: '' });

  // Repeater
  const [repeater, setRepeater] = useState<DentalEmerRepeater[]>([]);
  const addCalled = useRef(false);

  // Seed form
  useEffect(() => {
    if (!isFetching && data?.result) {
      const d = data.result;
      setTitle(d.dental_emergency_title);
      setHeading(d.dental_emergency_heading);
      setPara(d.dental_emergency_para);
      setTitleImageUrl(d.dental_emergency_image);
      setIconUrl(d.dental_emergency_icon);

      setInnerTitle(d.dental_emergency_inner_title);
      setInnerPara(d.dental_emergency_inner_para);
      setInnerIconUrl(d.dental_emergency_inner_icon);

      setEmerTitle(d.dental_emer_title);
      setEmerSubTitle(d.dental_emer_sub_title);

      setRepeater(d.dental_emer_repeater || []);
    }
  }, [data, isFetching]);

  if (isFetching) return <Loader />;
  if (error) return <p className="text-red-500">Error loading data.</p>;

  // Helpers
  const handleFile = (
    file: File | null,
    setFile: React.Dispatch<React.SetStateAction<File | null>>,
    setUrl: React.Dispatch<React.SetStateAction<string>>
  ) => {
    setFile(file);
    setUrl(file ? URL.createObjectURL(file) : '');
  };

  const addRepeaterItem = () => {
    if (addCalled.current) return;
    addCalled.current = true;
    setRepeater(prev => [
      ...prev,
      {
        dental_emer_tab_title: { en: '', kn: '' },
        denatl_emer_description_repeater: [
          { denatl_emer_tab_heading: { en: '', kn: '' }, denatl_emer_tab_paragraph: { en: '', kn: '' } }
        ]
      }
    ]);
    setTimeout(() => (addCalled.current = false), 300);
  };

  const removeRepeaterItem = (idx: number) =>
    setRepeater(r => r.filter((_, i) => i !== idx));

  const updateRepeaterTitle = (idx: number, lang: 'en' | 'kn', value: string) => {
    setRepeater(r =>
      r.map((item, i) =>
        i === idx
          ? {
            ...item,
            dental_emer_tab_title: { ...item.dental_emer_tab_title, [lang]: value }
          }
          : item
      )
    );
  };

  const addDescriptionToRepeaterItem = (idx: number) => {
    setRepeater(r =>
      r.map((item, i) =>
        i === idx
          ? {
            ...item,
            denatl_emer_description_repeater: [
              ...item.denatl_emer_description_repeater,
              { denatl_emer_tab_heading: { en: '', kn: '' }, denatl_emer_tab_paragraph: { en: '', kn: '' } }
            ]
          }
          : item
      )
    );
  };

  const removeDescriptionFromRepeaterItem = (ri: number, di: number) => {
    setRepeater(r =>
      r.map((item, i) =>
        i === ri
          ? {
            ...item,
            denatl_emer_description_repeater: item.denatl_emer_description_repeater.filter((_, j) => j !== di)
          }
          : item
      )
    );
  };

  const updateRepeaterDescription = (
    ri: number,
    di: number,
    field: keyof DentalEmerDescriptionRepeater,
    lang: 'en' | 'kn',
    val: string
  ) => {
    setRepeater(r =>
      r.map((item, i) =>
        i === ri
          ? {
            ...item,
            denatl_emer_description_repeater: item.denatl_emer_description_repeater.map((desc, j) =>
              j === di
                ? { ...desc, [field]: { ...desc[field], [lang]: val } }
                : desc
            )
          }
          : item
      )
    );
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const fd = new FormData();

      // Main
      fd.append('dental_emergency_title', JSON.stringify(title));
      if (titleImageFile) fd.append('dental_emergency_image_file', titleImageFile);
      fd.append('dental_emergency_heading', JSON.stringify(heading));
      fd.append('dental_emergency_para', JSON.stringify(para));
      if (iconFile) fd.append('dental_emergency_icon_file', iconFile);

      // Inner
      fd.append('dental_emergency_inner_title', JSON.stringify(innerTitle));
      fd.append('dental_emergency_inner_para', JSON.stringify(innerPara));
      if (innerIconFile) fd.append('dental_emergency_inner_icon_file', innerIconFile);

      // Emergency
      fd.append('dental_emer_title', JSON.stringify(emerTitle));
      fd.append('dental_emer_sub_title', JSON.stringify(emerSubTitle));

      // Repeater
      fd.append('dental_emer_repeater', JSON.stringify(repeater));

      await updateDental({ id, formData: fd }).unwrap();
      toast.success('Updated successfully!');
      router.push('/super-admin/dental-emergency');
    } catch {
      toast.error('Update failed.');
    }
  };

  return (
    <form onSubmit={onSubmit} className="form-container" id="dental_eme_wrap">
      <h2 className="form-title">Edit Dental Emergency</h2>

      {/* Title */}
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
          onChange={e =>
            handleFile(e.target.files?.[0] || null, setTitleImageFile, setTitleImageUrl)
          }
        />
        {titleImageUrl && <img src={titleImageUrl} style={{ width: 100 }} alt="title" />}
      </div>

      {/* Heading & Para */}
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
          onChange={e =>
            handleFile(e.target.files?.[0] || null, setIconFile, setIconUrl)
          }
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
          onChange={e =>
            handleFile(e.target.files?.[0] || null, setInnerIconFile, setInnerIconUrl)
          }
        />
        {innerIconUrl && <img src={innerIconUrl} style={{ width: 100 }} alt="inner icon" />}
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
          <label>Emergency Sub-Title (EN):</label>
          <input
            type="text"
            value={emerSubTitle.en}
            onChange={e => setEmerSubTitle(prev => ({ ...prev, en: e.target.value }))}
            required
          />
        </div>
        <div className="kn_g">
          <label>Emergency Sub-Title (KN):</label>
          <input
            type="text"
            value={emerSubTitle.kn}
            onChange={e => setEmerSubTitle(prev => ({ ...prev, kn: e.target.value }))}
            required
          />
        </div>
      </div>

      <hr />

      {/* Repeater */}
      {repeater.map((item, ri) => (
        <div key={ri} className="repeater">
          <div className="set_groups">
            <div className="en_g">
              <label>Step Title (EN):</label>
              <input
                type="text"
                value={item.dental_emer_tab_title.en}
                onChange={e => updateRepeaterTitle(ri, 'en', e.target.value)}
                required
              />
            </div>
            <div className="kn_g">
              <label>Step Title (KN):</label>
              <input
                type="text"
                value={item.dental_emer_tab_title.kn}
                onChange={e => updateRepeaterTitle(ri, 'kn', e.target.value)}
                required
              />
            </div>
          </div>

          <div className="description-container">
            <h4>Step Descriptions</h4>
            <button
              type="button"
              onClick={() => addDescriptionToRepeaterItem(ri)}
              className="add-description-button"
            >
              <FaPlus /> Add Description
            </button>

            {item.denatl_emer_description_repeater.map((desc, di) => (
              <div key={di} className="description-item">
                <div className="set_groups">
                  <div className="en_g">
                    <label>Heading (EN):</label>
                    <input
                      type="text"
                      value={desc.denatl_emer_tab_heading.en}
                      onChange={e =>
                        updateRepeaterDescription(
                          ri,
                          di,
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
                          ri,
                          di,
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
                          ri,
                          di,
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
                          ri,
                          di,
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
                  onClick={() => removeDescriptionFromRepeaterItem(ri, di)}
                  className="remove-description-button"
                >
                  Remove Description
                </button>
              </div>
            ))}
          </div>

          <button
            type="button"
            onClick={() => removeRepeaterItem(ri)}
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
        <button type="submit" className="disease-form-submit-button" disabled={isLoading}>
          {isLoading ? (
            <>
              Updating.. <BeatLoader color="#fff" size={10} />
            </>
          ) : (
            'Update Dental Emergency'
          )}
        </button>
      </div>
    </form>
  );
}

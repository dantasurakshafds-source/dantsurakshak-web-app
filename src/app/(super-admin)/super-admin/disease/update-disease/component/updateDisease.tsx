"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { useGetSingleDiseasesQuery, useUpdateDiseasesMutation } from '@/(store)/services/disease/diseaseApi';
import { useGetCategoriesQuery } from '@/(store)/services/category/categoryApi';
import { BeatLoader } from 'react-spinners';
 
import Loader from '@/(common)/Loader';
import { CauseItem,  CauseRepeater, PreventionTipsItem, PreventionTipsRepeater, SymptomsItem, SymptomsRepeater, TreatmentOptionItem, TreatmentOptionRepeater } from '@/utils/Types';
import CKEditorWrapper from '@/app/(super-admin)/(common)/editor/CKEditorWrapper';
import { FaPlus } from 'react-icons/fa';

interface RepeaterItem {
  description: {
    en: string;
    kn: string;
  };
}

interface SectionItem {
  title: {
    en: string;
    kn: string;
  };
  repeater: RepeaterItem[];
}

interface UpdateDiseaseProps {
  id: string;
}

const UpdateDisease = ({ id }: UpdateDiseaseProps) => {
  const router = useRouter();
  const { data, isLoading, error } = useGetSingleDiseasesQuery({ id });
  const [updateDisease, { isLoading: isUpdating }] = useUpdateDiseasesMutation();
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const { data: categoriesData } = useGetCategoriesQuery();
  const categories = categoriesData?.result || [];

  // Main Fields
  const [diseaseMainTitle, setDiseaseMainTitle] = useState({ en: '', kn: '' });
  const [diseaseMainImage, setDiseaseMainImage] = useState<File | null>(null);
  const [diseaseMainImageUrl, setDiseaseMainImageUrl] = useState('');
  const [diseaseSlug, setDiseaseSlug] = useState({ en: '', kn: '' });
  const [diseaseTitle, setDiseaseTitle] = useState({ en: '', kn: '' });
  const [diseaseDescription, setDiseaseDescription] = useState({ en: '', kn: '' });
  const [diseaseIcon, setDiseaseIcon] = useState<File | null>(null);
  const [diseaseIconUrl, setDiseaseIconUrl] = useState('');

  // Tab Titles
  const [commonCauseTabTitle, setCommonCauseTabTitle] = useState({ en: 'Common Causes', kn: 'ಸಾಮಾನ್ಯ ಕಾರಣಗಳು' });
  const [symptomsTabTitle, setSymptomsTabTitle] = useState({ en: 'Symptoms', kn: 'ಲಕ್ಷಣಗಳು' });
  const [preventionTipsTabTitle, setPreventionTipsTabTitle] = useState({ en: 'Prevention Tips', kn: 'ತಡೆಗಟ್ಟುವ ಸಲಹೆಗಳು' });
  const [treatmentOptionTabTitle, setTreatmentOptionTabTitle] = useState({ en: 'Treatment Options', kn: 'ಚಿಕಿತ್ಸಾ ಆಯ್ಕೆಗಳು' });

  // Sections
  const [commonCauses, setCommonCauses] = useState<SectionItem[]>([]);
  const [symptoms, setSymptoms] = useState<SectionItem[]>([]);
  const [preventionTips, setPreventionTips] = useState<SectionItem[]>([]);
  const [treatmentOptions, setTreatmentOptions] = useState<SectionItem[]>([]);

  useEffect(() => {
    if (categories.length > 0) {
      setSelectedCategory(categories[0]._id);
    }
  }, [categories]);

  useEffect(() => {
    const d = data?.data;
    if (!d) return;

    setDiseaseMainTitle(d.disease_main_title || { en: '', kn: '' });
    setDiseaseSlug(d.disease_slug || { en: '', kn: '' });
    setDiseaseTitle(d.disease_title || { en: '', kn: '' });
    setDiseaseDescription(d.disease_description || { en: '', kn: '' });
    setDiseaseMainImageUrl(d.disease_main_image || '');
    setDiseaseIconUrl(d.disease_icon || '');

    // Set tab titles
    setCommonCauseTabTitle(d.common_cause_tab_title || { en: 'Common Causes', kn: 'ಸಾಮಾನ್ಯ ಕಾರಣಗಳು' });
    setSymptomsTabTitle(d.symptoms_tab_title || { en: 'Symptoms', kn: 'ಲಕ್ಷಣಗಳು' });
    setPreventionTipsTabTitle(d.prevention_tips_tab_title || { en: 'Prevention Tips', kn: 'ತಡೆಗಟ್ಟುವ ಸಲಹೆಗಳು' });
    setTreatmentOptionTabTitle(d.treatment_option_tab_title || { en: 'Treatment Options', kn: 'ಚಿಕಿತ್ಸಾ ಆಯ್ಕೆಗಳು' });

    // Set sections with proper initialization
    setCommonCauses(d.common_cause?.map((item: CauseItem) => ({
      title: item.cause_title || { en: '', kn: '' },
      repeater: item.cause_repeater?.map((rep: CauseRepeater) => ({
        description: rep.description || { en: '', kn: '' }
      })) || []
    })) || []);

    setSymptoms(d.symptoms?.map((item: SymptomsItem) => ({
      title: item.symptoms_title || { en: '', kn: '' },
      repeater: item.symptoms_repeater?.map((rep: SymptomsRepeater) => ({
        description: rep.description || { en: '', kn: '' }
      })) || []
    })) || []);

    setPreventionTips(d.prevention_tips?.map((item: PreventionTipsItem) => ({
      title: item.prevention_tips_title || { en: '', kn: '' },
      repeater: item.prevention_tips_repeater?.map((rep: PreventionTipsRepeater) => ({
        description: rep.description || { en: '', kn: '' }
      })) || []
    })) || []);

    setTreatmentOptions(d.treatment_option?.map((item: TreatmentOptionItem) => ({
      title: item.treatment_option_title || { en: '', kn: '' },
      repeater: item.treatment_option_repeater?.map((rep: TreatmentOptionRepeater) => ({
        description: rep.description || { en: '', kn: '' }
      })) || []
    })) || []);
  }, [data]);

  const handleFileChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    setFile: (f: File | null) => void,
    setUrl: (u: string) => void
  ) => {
    const f = e.target.files?.[0] || null;
    setFile(f);
    setUrl(f ? URL.createObjectURL(f) : '');
  };

  // Section management
  const addSection = (sectionType: 'commonCauses' | 'symptoms' | 'preventionTips' | 'treatmentOptions') => {
    const newItem = {
      title: { en: '', kn: '' },
      repeater: []
    };

    switch (sectionType) {
      case 'commonCauses':
        setCommonCauses(prev => [...prev, newItem]);
        break;
      case 'symptoms':
        setSymptoms(prev => [...prev, newItem]);
        break;
      case 'preventionTips':
        setPreventionTips(prev => [...prev, newItem]);
        break;
      case 'treatmentOptions':
        setTreatmentOptions(prev => [...prev, newItem]);
        break;
    }
  };

  const removeSection = (
    sectionType: 'commonCauses' | 'symptoms' | 'preventionTips' | 'treatmentOptions',
    index: number
  ) => {
    switch (sectionType) {
      case 'commonCauses':
        setCommonCauses(prev => prev.filter((_, i) => i !== index));
        break;
      case 'symptoms':
        setSymptoms(prev => prev.filter((_, i) => i !== index));
        break;
      case 'preventionTips':
        setPreventionTips(prev => prev.filter((_, i) => i !== index));
        break;
      case 'treatmentOptions':
        setTreatmentOptions(prev => prev.filter((_, i) => i !== index));
        break;
    }
  };

  // Repeater management
  const addRepeater = (
    sectionType: 'commonCauses' | 'symptoms' | 'preventionTips' | 'treatmentOptions',
    sectionIndex: number
  ) => {
    const newRepeaterItem = {
      description: { en: '', kn: '' }
    };

    switch (sectionType) {
      case 'commonCauses':
        setCommonCauses(prev =>
          prev.map((item, idx) =>
            idx === sectionIndex
              ? { ...item, repeater: [...item.repeater, newRepeaterItem] }
              : item
          )
        );
        break;
      case 'symptoms':
        setSymptoms(prev =>
          prev.map((item, idx) =>
            idx === sectionIndex
              ? { ...item, repeater: [...item.repeater, newRepeaterItem] }
              : item
          )
        );
        break;
      case 'preventionTips':
        setPreventionTips(prev =>
          prev.map((item, idx) =>
            idx === sectionIndex
              ? { ...item, repeater: [...item.repeater, newRepeaterItem] }
              : item
          )
        );
        break;
      case 'treatmentOptions':
        setTreatmentOptions(prev =>
          prev.map((item, idx) =>
            idx === sectionIndex
              ? { ...item, repeater: [...item.repeater, newRepeaterItem] }
              : item
          )
        );
        break;
    }
  };

  const removeRepeater = (
    sectionType: 'commonCauses' | 'symptoms' | 'preventionTips' | 'treatmentOptions',
    sectionIndex: number,
    repeaterIndex: number
  ) => {
    switch (sectionType) {
      case 'commonCauses':
        setCommonCauses(prev =>
          prev.map((item, idx) =>
            idx === sectionIndex
              ? { ...item, repeater: item.repeater.filter((_, i) => i !== repeaterIndex) }
              : item
          )
        );
        break;
      case 'symptoms':
        setSymptoms(prev =>
          prev.map((item, idx) =>
            idx === sectionIndex
              ? { ...item, repeater: item.repeater.filter((_, i) => i !== repeaterIndex) }
              : item
          )
        );
        break;
      case 'preventionTips':
        setPreventionTips(prev =>
          prev.map((item, idx) =>
            idx === sectionIndex
              ? { ...item, repeater: item.repeater.filter((_, i) => i !== repeaterIndex) }
              : item
          )
        );
        break;
      case 'treatmentOptions':
        setTreatmentOptions(prev =>
          prev.map((item, idx) =>
            idx === sectionIndex
              ? { ...item, repeater: item.repeater.filter((_, i) => i !== repeaterIndex) }
              : item
          )
        );
        break;
    }
  };

  // Field handlers
  const handleTitleChange = (
    sectionType: 'commonCauses' | 'symptoms' | 'preventionTips' | 'treatmentOptions',
    index: number,
    lang: 'en' | 'kn',
    value: string
  ) => {
    switch (sectionType) {
      case 'commonCauses':
        setCommonCauses(prev =>
          prev.map((item, idx) =>
            idx === index
              ? { ...item, title: { ...item.title, [lang]: value } }
              : item
          )
        );
        break;
      case 'symptoms':
        setSymptoms(prev =>
          prev.map((item, idx) =>
            idx === index
              ? { ...item, title: { ...item.title, [lang]: value } }
              : item
          )
        );
        break;
      case 'preventionTips':
        setPreventionTips(prev =>
          prev.map((item, idx) =>
            idx === index
              ? { ...item, title: { ...item.title, [lang]: value } }
              : item
          )
        );
        break;
      case 'treatmentOptions':
        setTreatmentOptions(prev =>
          prev.map((item, idx) =>
            idx === index
              ? { ...item, title: { ...item.title, [lang]: value } }
              : item
          )
        );
        break;
    }
  };

  const handleRepeaterChange = (
    sectionType: 'commonCauses' | 'symptoms' | 'preventionTips' | 'treatmentOptions',
    sectionIndex: number,
    repeaterIndex: number,
    lang: 'en' | 'kn',
    data: string
  ) => {
    switch (sectionType) {
      case 'commonCauses':
        setCommonCauses(prev =>
          prev.map((section, secIdx) =>
            secIdx === sectionIndex
              ? {
                ...section,
                repeater: section.repeater.map((rep, repIdx) =>
                  repIdx === repeaterIndex
                    ? {
                      ...rep,
                      description: {
                        ...rep.description,
                        [lang]: data
                      }
                    }
                    : rep
                )
              }
              : section
          )
        );
        break;
      case 'symptoms':
        setSymptoms(prev =>
          prev.map((section, secIdx) =>
            secIdx === sectionIndex
              ? {
                ...section,
                repeater: section.repeater.map((rep, repIdx) =>
                  repIdx === repeaterIndex
                    ? {
                      ...rep,
                      description: {
                        ...rep.description,
                        [lang]: data
                      }
                    }
                    : rep
                )
              }
              : section
          )
        );
        break;
      case 'preventionTips':
        setPreventionTips(prev =>
          prev.map((section, secIdx) =>
            secIdx === sectionIndex
              ? {
                ...section,
                repeater: section.repeater.map((rep, repIdx) =>
                  repIdx === repeaterIndex
                    ? {
                      ...rep,
                      description: {
                        ...rep.description,
                        [lang]: data
                      }
                    }
                    : rep
                )
              }
              : section
          )
        );
        break;
      case 'treatmentOptions':
        setTreatmentOptions(prev =>
          prev.map((section, secIdx) =>
            secIdx === sectionIndex
              ? {
                ...section,
                repeater: section.repeater.map((rep, repIdx) =>
                  repIdx === repeaterIndex
                    ? {
                      ...rep,
                      description: {
                        ...rep.description,
                        [lang]: data
                      }
                    }
                    : rep
                )
              }
              : section
          )
        );
        break;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData();

    formData.append("category", selectedCategory);

    // Main Fields
    formData.append('disease_main_title', JSON.stringify(diseaseMainTitle));
    if (diseaseMainImage) formData.append('disease_main_image', diseaseMainImage);
    formData.append('disease_slug', JSON.stringify(diseaseSlug));
    formData.append('disease_title', JSON.stringify(diseaseTitle));
    formData.append('disease_description', JSON.stringify(diseaseDescription));
    if (diseaseIcon) formData.append('disease_icon', diseaseIcon);

    // Tab Titles
    formData.append('common_cause_tab_title', JSON.stringify(commonCauseTabTitle));
    formData.append('symptoms_tab_title', JSON.stringify(symptomsTabTitle));
    formData.append('prevention_tips_tab_title', JSON.stringify(preventionTipsTabTitle));
    formData.append('treatment_option_tab_title', JSON.stringify(treatmentOptionTabTitle));

    // Sections
    formData.append('common_cause', JSON.stringify(
      commonCauses.map(item => ({
        cause_title: item.title,
        cause_repeater: item.repeater
      }))
    ));
    formData.append('symptoms', JSON.stringify(
      symptoms.map(item => ({
        symptoms_title: item.title,
        symptoms_repeater: item.repeater
      }))
    ));
    formData.append('prevention_tips', JSON.stringify(
      preventionTips.map(item => ({
        prevention_tips_title: item.title,
        prevention_tips_repeater: item.repeater
      }))
    ));
    formData.append('treatment_option', JSON.stringify(
      treatmentOptions.map(item => ({
        treatment_option_title: item.title,
        treatment_option_repeater: item.repeater
      }))
    ));

    try {
      await updateDisease({ id, formData }).unwrap();
      toast.success('Disease updated successfully');
      router.push('/super-admin/disease');
    } catch (error) {
      toast.error('Failed to update disease');
      console.error('Update error:', error);
    }
  };

  if (isLoading) return <Loader />;
  if (error) return <p>Error loading disease data.</p>;

  const renderSection = (
    sectionType: 'commonCauses' | 'symptoms' | 'preventionTips' | 'treatmentOptions',
    title: string
  ) => {
    const sections = {
      commonCauses,
      symptoms,
      preventionTips,
      treatmentOptions
    }[sectionType];

    return (
      <>
        <hr />
        <div className="button-container">
          <h3>{title}</h3>
          <button type="button" onClick={() => addSection(sectionType)}>
            <FaPlus /> Add {title}
          </button>
        </div>

        {sections.map((section, index) => (
          <div key={index} className="repeater">
            <div className='en_g'>
              <label>{title} Title (EN):</label>
              <input
                type="text"
                value={section.title.en}
                onChange={(e) => handleTitleChange(sectionType, index, 'en', e.target.value)}
              />
            </div>
            <div className='kn_g'>
              <label>{title} Title (KN):</label>
              <input
                type="text"
                value={section.title.kn}
                onChange={(e) => handleTitleChange(sectionType, index, 'kn', e.target.value)}
              />
            </div>

            {section.repeater.map((repeater, repIndex) => (
              <div key={repIndex} className="nested-repeater">
                <label>{title} Description (EN):</label>
                <CKEditorWrapper
                  
                  data={repeater.description.en}
                 
                  onChange={(data) =>
                    handleRepeaterChange(sectionType, index, repIndex, 'en', data)
                  }
                  
                />
                <label>{title} Description (KN):</label>
                <CKEditorWrapper
                  
                  data={repeater.description.kn}
                
                  onChange={(data) =>
                    handleRepeaterChange(sectionType, index, repIndex, 'kn', data)
                  }
                   
                />
                <button type="button" onClick={() => removeRepeater(sectionType, index, repIndex)}>
                  Remove {title} Description
                </button>
              </div>
            ))}

            <button type="button" onClick={() => addRepeater(sectionType, index)}>
              Add {title} Description
            </button>
            <button type="button" onClick={() => removeSection(sectionType, index)}>
              Remove {title}
            </button>
          </div>
        ))}
      </>
    );
  };

  return (
    <form onSubmit={handleSubmit} className="form-container">
      <h2 className="form-title">Update Disease</h2>

      <div className='Disease_category'>
        <label htmlFor='category'>Disease Category</label>
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          required
        >
          {categories?.map((cat) => (
            <option key={cat._id} value={cat._id}>
              {cat._id}
            </option>
          ))}
        </select>
      </div>

      {/* Main Fields */}
      <div className='set_groups'>
        <div className='en_g'>
          <label>Main Title (EN):</label>
          <input type="text" value={diseaseMainTitle.en} onChange={e => setDiseaseMainTitle({ ...diseaseMainTitle, en: e.target.value })} />
        </div>
        <div className='kn_g'>
          <label>Main Title (KN):</label>
          <input type="text" value={diseaseMainTitle.kn} onChange={e => setDiseaseMainTitle({ ...diseaseMainTitle, kn: e.target.value })} />
        </div>
      </div>
      <div className='image_cust'>
        <label>Upload Main Image:</label>
        <input type="file" accept="image/*" onChange={e => handleFileChange(e, setDiseaseMainImage, setDiseaseMainImageUrl)} />
        {diseaseMainImageUrl && <img src={diseaseMainImageUrl} alt="Main" style={{ width: 100 }} />}
      </div>

      <div className='set_groups'>
        <div className='en_g'>
          <label>Disease Slug (EN):</label>
          <input type="text" value={diseaseSlug.en} onChange={e => setDiseaseSlug({ ...diseaseSlug, en: e.target.value })} />
        </div>
        <div className='kn_g'>
          <label>Disease Slug (KN):</label>
          <input type="text" value={diseaseSlug.kn} onChange={e => setDiseaseSlug({ ...diseaseSlug, kn: e.target.value })} />
        </div>
      </div>

      <div className='set_groups'>
        <div className='en_g'>
          <label>Disease Title (EN):</label>
          <input type="text" value={diseaseTitle.en} onChange={e => setDiseaseTitle({ ...diseaseTitle, en: e.target.value })} />
        </div>
        <div className='kn_g'>
          <label>Disease Title (KN):</label>
          <input type="text" value={diseaseTitle.kn} onChange={e => setDiseaseTitle({ ...diseaseTitle, kn: e.target.value })} />
        </div>
      </div>
      <div className="set_groups">
        <div className="en_g">
          <label>Disease Description (EN):</label>
          <textarea value={diseaseDescription.en}
            onChange={e =>
              setDiseaseDescription({
                ...diseaseDescription,
                en: e.target.value
              })
            }
          />
        </div>
        <div className="kn_g">
          <label>Disease Description (KN):</label>
          <textarea value={diseaseDescription.kn}
            onChange={e =>
              setDiseaseDescription({
                ...diseaseDescription,
                kn: e.target.value
              })
            }
          />
        </div>
      </div>

      <div className='upload_diseases'>
        <label>Upload Disease Icon:</label>
        <input type="file" accept="image/*" onChange={e => handleFileChange(e, setDiseaseIcon, setDiseaseIconUrl)} />
        {diseaseIconUrl && <img src={diseaseIconUrl} alt="Icon" style={{ width: 100 }} />}
      </div>

      {/* Sections */}
      {renderSection('commonCauses', 'Common Cause')}
      {renderSection('symptoms', 'Symptom')}
      {renderSection('preventionTips', 'Prevention Tip')}
      {renderSection('treatmentOptions', 'Treatment Option')}

      <hr />
      <button
        type="submit"
        className="submit-button"
        disabled={isUpdating}
      >
        {isUpdating ? (
          <>
            Updating
            <BeatLoader color="#ffffff" size={10} />
          </>
        ) : (
          'Update Disease'
        )}
      </button>
    </form>
  );
};

export default UpdateDisease;
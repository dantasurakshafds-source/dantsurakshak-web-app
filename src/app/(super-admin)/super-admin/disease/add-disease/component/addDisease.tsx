"use client"
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { useCreateDiseaseMutation } from '@/(store)/services/disease/diseaseApi';

import { FaPlus } from 'react-icons/fa';
import { useGetCategoriesQuery } from '@/(store)/services/category/categoryApi';
import { BeatLoader } from 'react-spinners';
import { CauseItem, PreventionTipsItem, PreventionTipsRepeater, SymptomsItem, TreatmentOptionItem } from '@/utils/Types';
import CKEditorWrapper from '@/app/(super-admin)/(common)/editor/CKEditorWrapper';
 

const AddDisease = () => {
  const [createDisease, { isLoading }] = useCreateDiseaseMutation();
  const router = useRouter();

  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const { data } = useGetCategoriesQuery();
  const categories = data?.result || [];

  useEffect(() => {
    if (categories.length > 0) {
      setSelectedCategory(categories[0]._id);
    }
  }, [categories]);

  // Main disease fields
  const [diseaseMainTitle, setDiseaseMainTitle] = useState({ en: '', kn: '' });
  const [diseaseMainImage, setDiseaseMainImage] = useState<File | null>(null);
  const [diseaseSlug, setDiseaseSlug] = useState({ en: '', kn: '' });
  const [diseaseTitle, setDiseaseTitle] = useState({ en: '', kn: '' });
  const [diseaseDescription, setDiseaseDescription] = useState({ en: '', kn: '' });
  const [diseaseIcon, setDiseaseIcon] = useState<File | null>(null);

  // Common Cause Section
  const [commonCauseTabTitle] = useState({ en: 'Common Causes', kn: 'ಸಾಮಾನ್ಯ ಕಾರಣಗಳು' });
  const [commonCauses, setCommonCauses] = useState<CauseItem[]>([]);

  // Symptoms Section
  const [symptomsTabTitle] = useState({ en: 'Symptoms', kn: 'ಲಕ್ಷಣಗಳು' });
  const [symptoms, setSymptoms] = useState<SymptomsItem[]>([]);

  // Prevention Tips Section
  const [preventionTipsTabTitle] = useState({ en: 'Prevention Tips', kn: 'ತಡೆಗಟ್ಟುವ ಸಲಹೆಗಳು' });
  const [preventionTips, setPreventionTips] = useState<PreventionTipsItem[]>([]);

  // Treatment Options Section
  const [treatmentOptionTabTitle] = useState({ en: 'Treatment Options', kn: 'ಚಿಕಿತ್ಸಾ ಆಯ್ಕೆಗಳು' });
  const [treatmentOptions, setTreatmentOptions] = useState<TreatmentOptionItem[]>([]);

  // Add new sections
  const addCommonCause = () => {
    setCommonCauses(prev => [
      ...prev,
      {
        cause_title: { en: '', kn: '' },
        cause_repeater: []
      }
    ]);
  };

  const addSymptom = () => {
    setSymptoms(prev => [
      ...prev,
      {
        symptoms_title: { en: '', kn: '' },
        symptoms_repeater: []
      }
    ]);
  };

  const addPreventionTip = () => {
    setPreventionTips(prev => [
      ...prev,
      {
        prevention_tips_title: { en: '', kn: '' },
        prevention_tips_repeater: []
      }
    ]);
  };

  const addTreatmentOption = () => {
    setTreatmentOptions(prev => [
      ...prev,
      {
        treatment_option_title: { en: '', kn: '' },
        treatment_option_repeater: []
      }
    ]);
  };


  const removeCommonCause = (index: number) => {
    setCommonCauses(prev => prev.filter((_, i) => i !== index));
  };

  const removeSymptom = (index: number) => {
    setSymptoms(prev => prev.filter((_, i) => i !== index));
  };

  const removePreventionTip = (index: number) => {
    setPreventionTips(prev => prev.filter((_, i) => i !== index));
  };

  const removeTreatmentOption = (index: number) => {
    setTreatmentOptions(prev => prev.filter((_, i) => i !== index));
  };


  const addCommonCauseRepeat = (causeIndex: number) => {
    setCommonCauses(prev =>
      prev.map((cause, idx) =>
        idx !== causeIndex
          ? cause
          : {
            ...cause,
            cause_repeater: [
              ...(cause.cause_repeater ?? []),
              { description: { en: "", kn: "" } },
            ],
          }
      )
    );
  };


  const addSymptomRepeat = (symptomIndex: number) => {
    setSymptoms(prev =>
      prev.map((sym, idx) =>
        idx !== symptomIndex
          ? sym
          : {
            ...sym,
            symptoms_repeater: [
              ...(sym.symptoms_repeater ?? []),
              { description: { en: "", kn: "" } },
            ],
          }
      )
    );
  };


  const addPreventionTipRepeat = (tipIndex: number) => {
    setPreventionTips(prev =>
      prev.map((tip, idx) =>
        idx !== tipIndex
          ? tip
          : {
            ...tip,
            prevention_tips_repeater: [
              ...(tip.prevention_tips_repeater ?? []),
              { description: { en: "", kn: "" } },
            ],
          }
      )
    );
  };


  const addTreatmentOptionRepeat = (optionIndex: number) => {
    setTreatmentOptions(prev =>
      prev.map((opt, idx) =>
        idx !== optionIndex
          ? opt
          : {
            ...opt,
            treatment_option_repeater: [
              ...(opt.treatment_option_repeater ?? []),
              { description: { en: "", kn: "" } },
            ],
          }
      )
    );
  };



  const removeCommonCauseRepeat = (causeIndex: number, repeatIndex: number) => {
    setCommonCauses(prev => {
      const newArr = [...prev];
      if (newArr[causeIndex]?.cause_repeater) {
        newArr[causeIndex].cause_repeater = newArr[causeIndex].cause_repeater.filter((_, i) => i !== repeatIndex);
      }
      return newArr;
    });
  };



  const removeSymptomRepeat = (symptomIndex: number, repeatIndex: number) => {
    setSymptoms(prev => {
      const newArr = [...prev];
      if (newArr[symptomIndex]?.symptoms_repeater) {
        newArr[symptomIndex].symptoms_repeater = newArr[symptomIndex].symptoms_repeater.filter((_, i) => i !== repeatIndex);
      }
      return newArr;
    });
  };



  const removePreventionTipRepeat = (tipIndex: number, repeatIndex: number) => {
    setPreventionTips(prev => {
      const newArr = [...prev];
      if (newArr[tipIndex]?.prevention_tips_repeater) {
        newArr[tipIndex].prevention_tips_repeater = newArr[tipIndex].prevention_tips_repeater.filter((_, i) => i !== repeatIndex);
      }
      return newArr;
    });
  };


  const removeTreatmentOptionRepeat = (optionIndex: number, repeatIndex: number) => {
    setTreatmentOptions(prev => {
      const newArr = [...prev];
      if (newArr[optionIndex]?.treatment_option_repeater) {
        newArr[optionIndex].treatment_option_repeater = newArr[optionIndex].treatment_option_repeater.filter((_, i) => i !== repeatIndex);
      }
      return newArr;
    });
  };



  const handleCommonCauseFieldChange = (index: number, field: string, lang: 'en' | 'kn', value: string) => {
    setCommonCauses(prev => {
      const newArr = [...prev];
      //@ts-expect-error ignore this message
      newArr[index][field][lang] = value;
      return newArr;
    });
  };

  const handleSymptomFieldChange = (index: number, field: string, lang: 'en' | 'kn', value: string) => {
    setSymptoms(prev => {
      const newArr = [...prev];
      //@ts-expect-error ignore this message
      newArr[index][field][lang] = value;
      return newArr;
    });
  };

  const handlePreventionTipFieldChange = (index: number, field: string, lang: 'en' | 'kn', value: string) => {
    setPreventionTips(prev => {
      const newArr = [...prev];
      //@ts-expect-error ignore this message
      newArr[index][field][lang] = value;
      return newArr;
    });
  };

  const handleTreatmentOptionFieldChange = (index: number, field: string, lang: 'en' | 'kn', value: string) => {
    setTreatmentOptions(prev => {
      const newArr = [...prev];
      //@ts-expect-error ignore this message
      newArr[index][field][lang] = value;
      return newArr;
    });
  };

  const handleCommonCauseRepeatChange = (
    causeIndex: number,
    repeatIndex: number,
    lang: 'en' | 'kn',
    //@ts-expect-error ignore this message
    editor
  ) => {
    setCommonCauses(prev => {
      const newArr = [...prev];
      const repeater = newArr[causeIndex]?.cause_repeater?.[repeatIndex];
      if (repeater?.description) {
        repeater.description[lang] = editor;
      }
      return newArr;
    });
  };


  const handleSymptomRepeatChange = (
    symptomIndex: number,
    repeatIndex: number,
    lang: 'en' | 'kn',
    //@ts-expect-error ignore this message
    editor
  ) => {
    setSymptoms(prev => {
      const newArr = [...prev];
      const repeater = newArr[symptomIndex]?.symptoms_repeater?.[repeatIndex];
      if (repeater?.description) {
        repeater.description[lang] = editor;
      }
      return newArr;
    });
  };


  const handlePreventionTipRepeatChange = (
    tipIndex: number,
    repeatIndex: number,
    lang: 'en' | 'kn',
    //@ts-expect-error ignore this message
    editor
  ) => {
    setPreventionTips(prev => {
      const newArr = [...prev];
      const repeater = newArr[tipIndex]?.prevention_tips_repeater?.[repeatIndex];
      if (repeater?.description) {
        repeater.description[lang] = editor;
      }
      return newArr;
    });
  };


  const handleTreatmentOptionRepeatChange = (
    optionIndex: number,
    repeatIndex: number,
    lang: 'en' | 'kn',
    //@ts-expect-error ignore this message
    editor
  ) => {
    setTreatmentOptions(prev => {
      const newArr = [...prev];
      const repeater = newArr[optionIndex]?.treatment_option_repeater?.[repeatIndex];
      if (repeater?.description) {
        repeater.description[lang] = editor;
      }
      return newArr;
    });
  };


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData();

    formData.append('category', selectedCategory);

    // Main Disease Fields
    formData.append('disease_main_title', JSON.stringify(diseaseMainTitle));
    if (diseaseMainImage) formData.append('disease_main_image', diseaseMainImage);
    formData.append('disease_slug', JSON.stringify(diseaseSlug));
    formData.append('disease_title', JSON.stringify(diseaseTitle));
    formData.append('disease_description', JSON.stringify(diseaseDescription));
    if (diseaseIcon) formData.append('disease_icon', diseaseIcon);

    // Common Cause Section
    formData.append('common_cause_tab_title', JSON.stringify(commonCauseTabTitle));
    formData.append('common_cause', JSON.stringify(commonCauses));

    // Symptoms Section
    formData.append('symptoms_tab_title', JSON.stringify(symptomsTabTitle));
    formData.append('symptoms', JSON.stringify(symptoms));

    // Prevention Tips Section
    formData.append('prevention_tips_tab_title', JSON.stringify(preventionTipsTabTitle));
    formData.append('prevention_tips', JSON.stringify(preventionTips));

    // Treatment Options Section
    formData.append('treatment_option_tab_title', JSON.stringify(treatmentOptionTabTitle));
    formData.append('treatment_option', JSON.stringify(treatmentOptions));

    try {
      const result = await createDisease(formData).unwrap();
      if (result) {
        router.push('/super-admin/disease');
      }
    } catch (error) {
      if (error instanceof Error) {
        toast.error('Failed to create disease');
      }
    }
  };

  return (
    <form onSubmit={handleSubmit} className="form-container">
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

      <div className="add-disease-grid">
        <div className='disease-fields-grid'>
          <label>Main Title (EN):</label>
          <input
            type="text"
            placeholder="en"
            value={diseaseMainTitle.en}
            onChange={(e) => setDiseaseMainTitle({ ...diseaseMainTitle, en: e.target.value })}
          />
        </div>
        <div className='disease-fields-grid'>
          <label>Main Title (KN):</label>
          <input
            type="text"
            placeholder="kn"
            value={diseaseMainTitle.kn}
            onChange={(e) => setDiseaseMainTitle({ ...diseaseMainTitle, kn: e.target.value })}
          />
        </div>

        <div className='disease-fields-grid'>
          <label>Disease Slug (EN):</label>
          <input
            type="text"
            placeholder="en"
            value={diseaseSlug.en}
            onChange={(e) => setDiseaseSlug({ ...diseaseSlug, en: e.target.value })}
          />
        </div>
        <div className='disease-fields-grid'>
          <label>Disease Slug (KN):</label>
          <input
            type="text"
            placeholder="kn"
            value={diseaseSlug.kn}
            onChange={(e) => setDiseaseSlug({ ...diseaseSlug, kn: e.target.value })}
          />
        </div>

        <div className='disease-fields-grid'>
          <label>Disease Title (EN):</label>
          <input
            type="text"
            placeholder="en"
            value={diseaseTitle.en}
            onChange={(e) => setDiseaseTitle({ ...diseaseTitle, en: e.target.value })}
          />
        </div>
        <div className='disease-fields-grid'>
          <label>Disease Title (KN):</label>
          <input
            type="text"
            placeholder="kn"
            value={diseaseTitle.kn}
            onChange={(e) => setDiseaseTitle({ ...diseaseTitle, kn: e.target.value })}
          />
        </div>
        <div className='disease-fields-grid'>
          <label>Disease Description (EN):</label>
          <textarea
            placeholder="en"
            value={diseaseDescription.en}
            onChange={(e) => setDiseaseDescription({ ...diseaseDescription, en: e.target.value })}
          />
        </div>
        <div className='disease-fields-grid'>
          <label>Disease Description (KN):</label>
          <textarea
            placeholder="kn"
            value={diseaseDescription.kn}
            onChange={(e) => setDiseaseDescription({ ...diseaseDescription, kn: e.target.value })}
          />
        </div>
        <div>
          <label>Upload Main Image:</label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setDiseaseMainImage(e.target.files?.[0] || null)}
          />
        </div>
        <div>
          <label>Upload Disease Icon:</label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setDiseaseIcon(e.target.files?.[0] || null)}
          />
        </div>
      </div>

      {/* ---------------- Common Cause Section ---------------- */}
      <hr />
      <div className="button-container">
        <h3>{commonCauseTabTitle.en}</h3>
        <button type="button" onClick={addCommonCause}>
          <FaPlus /> Add Common Cause
        </button>
      </div>

      {commonCauses.map((item, index) => (
        <div key={index} className="repeater">
          <label>Cause Title (EN):</label>
          <input
            type="text"
            placeholder="en"
            value={item?.cause_title?.en}
            onChange={(e) => handleCommonCauseFieldChange(index, 'cause_title', 'en', e.target.value)}
          />
          <label>Cause Title (KN):</label>
          <input
            type="text"
            placeholder="kn"
            value={item.cause_title?.kn}
            onChange={(e) => handleCommonCauseFieldChange(index, 'cause_title', 'kn', e.target.value)}
          />

          {item.cause_repeater?.map((rep, repIndex: number) => (
            <div key={repIndex} className="nested-repeater">
              <label>Cause Description (EN):</label>
              <CKEditorWrapper
                //@ts-expect-error ignore this error
                data={rep?.description?.en}
                onChange={(editor) => handleCommonCauseRepeatChange(index, repIndex, 'en', editor)}

              />





              <label>Cause Description (KN):</label>
              <CKEditorWrapper
                //@ts-expect-error ignore this message
                data={rep?.description?.kn}
                onChange={(editor) => handleCommonCauseRepeatChange(index, repIndex, 'kn', editor)}
              />
              <button type="button" onClick={() => removeCommonCauseRepeat(index, repIndex)}>
                Remove Cause Description
              </button>
            </div>
          ))}

          <button type="button" onClick={() => addCommonCauseRepeat(index)}>
            Add Cause Description
          </button>
          <button type="button" onClick={() => removeCommonCause(index)}>
            Remove Common Cause
          </button>
        </div>
      ))}

      {/* ---------------- Symptoms Section ---------------- */}
      <hr />
      <div className="button-container">
        <h3>{symptomsTabTitle.en}</h3>
        <button type="button" onClick={addSymptom}>
          <FaPlus /> Add Symptom
        </button>
      </div>

      {symptoms.map((item, index) => (
        <div key={index} className="repeater">
          <label>Symptoms Title (EN):</label>
          <input
            type="text"
            placeholder="en"
            value={item?.symptoms_title?.en}
            onChange={(e) => handleSymptomFieldChange(index, 'symptoms_title', 'en', e.target.value)}
          />
          <label>Symptoms Title (KN):</label>
          <input
            type="text"
            placeholder="kn"
            value={item?.symptoms_title?.kn}
            onChange={(e) => handleSymptomFieldChange(index, 'symptoms_title', 'kn', e.target.value)}
          />

          {item.symptoms_repeater?.map((rep, repIndex: number) => (
            <div key={repIndex} className="nested-repeater">
              <label>Symptoms Description (EN):</label>
              <CKEditorWrapper
                //@ts-expect-error ignore this message
                data={rep?.description?.en}
                onChange={(editor) => handleSymptomRepeatChange(index, repIndex, 'en', editor)}
              />
              <label>Symptoms Description (KN):</label>
              <CKEditorWrapper
                //@ts-expect-error ignore this message
                data={rep?.description?.kn}
                onChange={(editor) => handleSymptomRepeatChange(index, repIndex, 'kn', editor)}

              />
              <button type="button" onClick={() => removeSymptomRepeat(index, repIndex)}>
                Remove Symptoms Description
              </button>
            </div>
          ))}

          <button type="button" onClick={() => addSymptomRepeat(index)}>
            Add Symptoms Description
          </button>
          <button type="button" onClick={() => removeSymptom(index)}>
            Remove Symptom
          </button>
        </div>
      ))}

      {/* ---------------- Prevention Tips Section ---------------- */}
      <hr />
      <div className="button-container">
        <h3>{preventionTipsTabTitle.en}</h3>
        <button type="button" onClick={addPreventionTip}>
          <FaPlus /> Add Prevention Tip
        </button>
      </div>

      {preventionTips.map((item, index) => (
        <div key={index} className="repeater">
          <label>Prevention Tips Title (EN):</label>
          <input
            type="text"
            placeholder="en"
            value={item?.prevention_tips_title?.en}
            onChange={(e) => handlePreventionTipFieldChange(index, 'prevention_tips_title', 'en', e.target.value)}
          />
          <label>Prevention Tips Title (KN):</label>
          <input
            type="text"
            placeholder="kn"
            value={item?.prevention_tips_title?.kn}
            onChange={(e) => handlePreventionTipFieldChange(index, 'prevention_tips_title', 'kn', e.target.value)}
          />

          {item?.prevention_tips_repeater?.map((rep: PreventionTipsRepeater, repIndex: number) => (
            <div key={repIndex} className="nested-repeater">
              <label>Prevention Tips Description (EN):</label>
              <CKEditorWrapper
                //@ts-expect-error ignore this message

                data={rep?.description?.en}
                onChange={(editor) => handlePreventionTipRepeatChange(index, repIndex, 'en', editor)}

              />
              <label>Prevention Tips Description (KN):</label>
              <CKEditorWrapper
                //@ts-expect-error ignore this message

                data={rep?.description?.kn}
                onChange={(editor) => handlePreventionTipRepeatChange(index, repIndex, 'kn', editor)}

              />
              <button type="button" onClick={() => removePreventionTipRepeat(index, repIndex)}>
                Remove Prevention Tips Description
              </button>
            </div>
          ))}

          <button type="button" onClick={() => addPreventionTipRepeat(index)}>
            Add Prevention Tips Description
          </button>
          <button type="button" onClick={() => removePreventionTip(index)}>
            Remove Prevention Tip
          </button>
        </div>
      ))}


      <hr />
      <div className="button-container">
        <h3>{treatmentOptionTabTitle.en}</h3>
        <button type="button" onClick={addTreatmentOption}>
          <FaPlus /> Add Treatment Option
        </button>
      </div>

      {treatmentOptions.map((item, index) => (
        <div key={index} className="repeater">
          <label>Treatment Option Title (EN):</label>
          <input
            type="text"
            placeholder="en"
            value={item?.treatment_option_title?.en}
            onChange={(e) => handleTreatmentOptionFieldChange(index, 'treatment_option_title', 'en', e.target.value)}
          />
          <label>Treatment Option Title (KN):</label>
          <input
            type="text"
            placeholder="kn"
            value={item?.treatment_option_title?.kn}
            onChange={(e) => handleTreatmentOptionFieldChange(index, 'treatment_option_title', 'kn', e.target.value)}
          />

          {item?.treatment_option_repeater?.map((rep, repIndex: number) => (
            <div key={repIndex} className="nested-repeater">
              <label>Treatment Option Description (EN):</label>
              <CKEditorWrapper
           //@ts-expect-error ignore this message
                data={rep?.description?.en}
                onChange={(editor) => handleTreatmentOptionRepeatChange(index, repIndex, 'en', editor)}
              />
              <label>Treatment Option Description (KN):</label>
              <CKEditorWrapper
              //@ts-expect-error ignore this message
                data={rep?.description?.kn}
              
                onChange={(editor) => handleTreatmentOptionRepeatChange(index, repIndex, 'kn', editor)}
              />
              <button type="button" onClick={() => removeTreatmentOptionRepeat(index, repIndex)}>
                Remove Treatment Option Description
              </button>
            </div>
          ))}

          <button type="button" onClick={() => addTreatmentOptionRepeat(index)}>
            Add Treatment Option Description
          </button>
          <button type="button" onClick={() => removeTreatmentOption(index)}>
            Remove Treatment Option
          </button>
        </div>
      ))}

      <hr />
      <div className="button-container">
        <button
          type="submit"
          className="disease-form-submit-button"
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              createing... <BeatLoader color="#ffffff" size={10} />
            </>
          ) : (
            'create'
          )}
        </button>
      </div>
    </form>
  );
};

export default AddDisease;
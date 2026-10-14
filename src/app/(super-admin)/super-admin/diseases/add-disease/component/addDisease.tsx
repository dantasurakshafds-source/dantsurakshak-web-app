"use client"

import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import Image from 'next/image';
import { useCreateDiseaseMutation } from '@/(store)/services/disease/diseaseApi';
import { useGetCategoriesQuery } from '@/(store)/services/category/categoryApi';
import { BeatLoader } from 'react-spinners';
import OvalLoader from '@/(common)/OvalLoader';
import { uploadToCloudinary } from '@/utils/uploadToCloudinary';
import { useCloudinaryDelete } from '@/utils/useCloudinaryDelete';
import CKEditorWrapper from '@/app/(super-admin)/(common)/editor/CKEditorWrapper';
import { MdImage, MdTextFields, MdDescription, MdAddCircleOutline, MdDelete, MdClose, MdCloudUpload, MdCategory, MdLink, MdMedicalServices, MdWarning, MdHealthAndSafety, MdLocalHospital } from "react-icons/md";

// Types
interface BilingualField {
  en: string;
  kn: string;
}

interface CauseRepeaterItem {
  description: BilingualField;
}

interface CauseItem {
  cause_title: BilingualField;
  cause_repeater: CauseRepeaterItem[];
}

interface SymptomRepeaterItem {
  description: BilingualField;
}

interface SymptomItem {
  symptoms_title: BilingualField;
  symptoms_repeater: SymptomRepeaterItem[];
}

interface PreventionTipRepeaterItem {
  description: BilingualField;
}

interface PreventionTipItem {
  prevention_tips_title: BilingualField;
  prevention_tips_repeater: PreventionTipRepeaterItem[];
}

interface TreatmentOptionRepeaterItem {
  description: BilingualField;
}

interface TreatmentOptionItem {
  treatment_option_title: BilingualField;
  treatment_option_repeater: TreatmentOptionRepeaterItem[];
}

interface Category {
  _id: string;
  name?: string;
}

const AddDisease = () => {
  const [createDisease, { isLoading }] = useCreateDiseaseMutation();
  const { deleteFromCloudinary } = useCloudinaryDelete();
  const router = useRouter();

  // Section collapse states
  const [mainInfoOpen, setMainInfoOpen] = useState(true);
  const [commonCauseOpen, setCommonCauseOpen] = useState(true);
  const [symptomsOpen, setSymptomsOpen] = useState(true);
  const [preventionOpen, setPreventionOpen] = useState(true);
  const [treatmentOpen, setTreatmentOpen] = useState(true);

  // Deletion loading states
  const [isDeletingMainImage, setIsDeletingMainImage] = useState(false);
  const [isDeletingIcon, setIsDeletingIcon] = useState(false);

  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const { data } = useGetCategoriesQuery();
  const categories = useMemo(() => (data?.result || []) as Category[], [data]);

  useEffect(() => {
    if (categories.length > 0) {
      setSelectedCategory(categories[0]._id);
    }
  }, [categories]);

  // Main disease fields
  const [diseaseMainTitle, setDiseaseMainTitle] = useState<BilingualField>({ en: '', kn: '' });
  const [diseaseMainImage, setDiseaseMainImage] = useState<File | null>(null);
  const [diseaseMainImagePreview, setDiseaseMainImagePreview] = useState<string>('');
  const [diseaseMainImageUrl, setDiseaseMainImageUrl] = useState<string>('');
  const [diseaseSlug, setDiseaseSlug] = useState<BilingualField>({ en: '', kn: '' });
  const [diseaseTitle, setDiseaseTitle] = useState<BilingualField>({ en: '', kn: '' });
  const [diseaseDescription, setDiseaseDescription] = useState<BilingualField>({ en: '', kn: '' });
  const [diseaseIcon, setDiseaseIcon] = useState<File | null>(null);
  const [diseaseIconPreview, setDiseaseIconPreview] = useState<string>('');
  const [diseaseIconUrl, setDiseaseIconUrl] = useState<string>('');

  // Common Cause Section
  const [commonCauseTabTitle, setCommonCauseTabTitle] = useState<BilingualField>({ en: 'Common Causes', kn: 'ಸಾಮಾನ್ಯ ಕಾರಣಗಳು' });
  const [commonCauses, setCommonCauses] = useState<CauseItem[]>([]);

  // Symptoms Section
  const [symptomsTabTitle, setSymptomsTabTitle] = useState<BilingualField>({ en: 'Symptoms', kn: 'ಲಕ್ಷಣಗಳು' });
  const [symptoms, setSymptoms] = useState<SymptomItem[]>([]);

  // Prevention Tips Section
  const [preventionTipsTabTitle, setPreventionTipsTabTitle] = useState<BilingualField>({ en: 'Prevention Tips', kn: 'ತಡೆಗಟ್ಟುವ ಸಲಹೆಗಳು' });
  const [preventionTips, setPreventionTips] = useState<PreventionTipItem[]>([]);

  // Treatment Options Section
  const [treatmentOptionTabTitle, setTreatmentOptionTabTitle] = useState<BilingualField>({ en: 'Treatment Options', kn: 'ಚಿಕಿತ್ಸಾ ಆಯ್ಕೆಗಳು' });
  const [treatmentOptions, setTreatmentOptions] = useState<TreatmentOptionItem[]>([]);

  // Delete handlers
  const handleDeleteMainImage = async () => {
    setIsDeletingMainImage(true);
    try {
      if (diseaseMainImageUrl) {
        await deleteFromCloudinary(diseaseMainImageUrl, { resourceType: 'image' });
        setDiseaseMainImageUrl('');
      }
      if (diseaseMainImagePreview) {
        URL.revokeObjectURL(diseaseMainImagePreview);
        setDiseaseMainImagePreview('');
      }
      setDiseaseMainImage(null);
      toast.success('Main image removed');
    } catch {
      toast.error('Failed to delete main image');
    } finally {
      setIsDeletingMainImage(false);
    }
  };

  const handleDeleteIcon = async () => {
    setIsDeletingIcon(true);
    try {
      if (diseaseIconUrl) {
        await deleteFromCloudinary(diseaseIconUrl, { resourceType: 'image' });
        setDiseaseIconUrl('');
      }
      if (diseaseIconPreview) {
        URL.revokeObjectURL(diseaseIconPreview);
        setDiseaseIconPreview('');
      }
      setDiseaseIcon(null);
      toast.success('Icon removed');
    } catch {
      toast.error('Failed to delete icon');
    } finally {
      setIsDeletingIcon(false);
    }
  };

  // Image handlers
  const handleMainImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image must be under 5MB');
      return;
    }
    if (!file.type.startsWith('image/')) {
      toast.error('Please upload a valid image');
      return;
    }
    setDiseaseMainImage(file);
    setDiseaseMainImagePreview(URL.createObjectURL(file));
    setDiseaseMainImageUrl('');
  };

  const handleIconChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      toast.error('Icon must be under 2MB');
      return;
    }
    if (!file.type.startsWith('image/')) {
      toast.error('Please upload a valid image');
      return;
    }
    setDiseaseIcon(file);
    setDiseaseIconPreview(URL.createObjectURL(file));
    setDiseaseIconUrl('');
  };

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
        newArr[causeIndex].cause_repeater = newArr[causeIndex].cause_repeater.filter((_, i: number) => i !== repeatIndex);
      }
      return newArr;
    });
  };

  const removeSymptomRepeat = (symptomIndex: number, repeatIndex: number) => {
    setSymptoms(prev => {
      const newArr = [...prev];
      if (newArr[symptomIndex]?.symptoms_repeater) {
        newArr[symptomIndex].symptoms_repeater = newArr[symptomIndex].symptoms_repeater.filter((_, i: number) => i !== repeatIndex);
      }
      return newArr;
    });
  };

  const removePreventionTipRepeat = (tipIndex: number, repeatIndex: number) => {
    setPreventionTips(prev => {
      const newArr = [...prev];
      if (newArr[tipIndex]?.prevention_tips_repeater) {
        newArr[tipIndex].prevention_tips_repeater = newArr[tipIndex].prevention_tips_repeater.filter((_, i: number) => i !== repeatIndex);
      }
      return newArr;
    });
  };

  const removeTreatmentOptionRepeat = (optionIndex: number, repeatIndex: number) => {
    setTreatmentOptions(prev => {
      const newArr = [...prev];
      if (newArr[optionIndex]?.treatment_option_repeater) {
        newArr[optionIndex].treatment_option_repeater = newArr[optionIndex].treatment_option_repeater.filter((_, i: number) => i !== repeatIndex);
      }
      return newArr;
    });
  };

  const handleCommonCauseFieldChange = (index: number, field: 'cause_title', lang: 'en' | 'kn', value: string) => {
    setCommonCauses(prev => {
      const newArr = [...prev];
      newArr[index][field][lang] = value;
      return newArr;
    });
  };

  const handleSymptomFieldChange = (index: number, field: 'symptoms_title', lang: 'en' | 'kn', value: string) => {
    setSymptoms(prev => {
      const newArr = [...prev];
      newArr[index][field][lang] = value;
      return newArr;
    });
  };

  const handlePreventionTipFieldChange = (index: number, field: 'prevention_tips_title', lang: 'en' | 'kn', value: string) => {
    setPreventionTips(prev => {
      const newArr = [...prev];
      newArr[index][field][lang] = value;
      return newArr;
    });
  };

  const handleTreatmentOptionFieldChange = (index: number, field: 'treatment_option_title', lang: 'en' | 'kn', value: string) => {
    setTreatmentOptions(prev => {
      const newArr = [...prev];
      newArr[index][field][lang] = value;
      return newArr;
    });
  };

  const handleCommonCauseRepeatChange = (
    causeIndex: number,
    repeatIndex: number,
    lang: 'en' | 'kn',
    editor: string
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
    editor: string
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
    editor: string
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
    editor: string
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

    // Validation
    if (!selectedCategory) {
      toast.error('Please select a category');
      return;
    }
    if (!diseaseMainTitle.en || !diseaseMainTitle.kn) {
      toast.error('Main title is required in both languages');
      return;
    }

    try {
      const formData = new FormData();

      formData.append('category', selectedCategory);

      // Upload images if new ones are selected
      let finalMainImageUrl = diseaseMainImageUrl;
      if (diseaseMainImage) {
        const res = await uploadToCloudinary(diseaseMainImage, 'image');
        finalMainImageUrl = res.secure_url;
      }

      let finalIconUrl = diseaseIconUrl;
      if (diseaseIcon) {
        const res = await uploadToCloudinary(diseaseIcon, 'image');
        finalIconUrl = res.secure_url;
      }

      // Main Disease Fields
      formData.append('disease_main_title', JSON.stringify(diseaseMainTitle));
      if (finalMainImageUrl) formData.append('disease_main_image', finalMainImageUrl);
      formData.append('disease_slug', JSON.stringify(diseaseSlug));
      formData.append('disease_title', JSON.stringify(diseaseTitle));
      formData.append('disease_description', JSON.stringify(diseaseDescription));
      if (finalIconUrl) formData.append('disease_icon', finalIconUrl);

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

      const result = await createDisease(formData).unwrap();
      if (result) {
        toast.success('Disease added successfully');
        router.back();
      }
    } catch (error) {
      if (error instanceof Error) {
        toast.error('Failed to add disease');
      }
    }
  };

  const SectionHeader = ({
    title,
    icon,
    open,
    onToggle,
  }: {
    title: string;
    icon: React.ReactNode;
    open: boolean;
    onToggle: () => void;
  }) => (
    <div className="disease-section__header">
      <h2 className="disease-section__title">
        {icon} {title}
      </h2>
      <button
        type="button"
        className="disease-section__toggle"
        onClick={onToggle}
      >
        {open ? "−" : "+"}
      </button>
    </div>
  );

  const hasMainImage = diseaseMainImageUrl || diseaseMainImagePreview;
  const hasIcon = diseaseIconUrl || diseaseIconPreview;

  return (
    <form onSubmit={handleSubmit} className="disease-form">
      <div className="disease-layout">
        {/* ── Left column ─────────────────────────────── */}
        <div className="disease-main">

          {/* Main Information Section */}
          <div className="disease-section">
            <SectionHeader
              title="Main Information"
              icon={<MdMedicalServices />}
              open={mainInfoOpen}
              onToggle={() => setMainInfoOpen((p) => !p)}
            />
            {mainInfoOpen && (
              <div className="disease-section__body">

                {/* Category Selection */}
                <div className="disease-form-group">
                  <label className="disease-label">
                    <MdCategory />
                    Disease Category
                    <span className="disease-label__required">*</span>
                  </label>
                  <select
                    className="disease-select"
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    required
                  >
                    <option value="">Select a category</option>
                    {categories?.map((cat: Category) => (
                      <option key={cat._id} value={cat._id}>
                        {cat.name || cat._id}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Main Title */}
                <div className="disease-form-row">
                  <div className="disease-form-group">
                    <label className="disease-label">
                      <MdTextFields />
                      Main Title (English)
                      <span className="disease-label__required">*</span>
                    </label>
                    <input
                      className="disease-input"
                      type="text"
                      placeholder="Enter main title in English"
                      value={diseaseMainTitle.en}
                      onChange={(e) => setDiseaseMainTitle({ ...diseaseMainTitle, en: e.target.value })}
                      required
                    />
                  </div>
                  <div className="disease-form-group">
                    <label className="disease-label">
                      <MdTextFields />
                      Main Title (Kannada)
                      <span className="disease-label__required">*</span>
                    </label>
                    <input
                      className="disease-input"
                      type="text"
                      placeholder="ಮುಖ್ಯ ಶೀರ್ಷಿಕೆ ನಮೂದಿಸಿ"
                      value={diseaseMainTitle.kn}
                      onChange={(e) => setDiseaseMainTitle({ ...diseaseMainTitle, kn: e.target.value })}
                      required
                    />
                  </div>
                </div>

                {/* Slug */}
                <div className="disease-form-row">
                  <div className="disease-form-group">
                    <label className="disease-label">
                      <MdLink />
                      Slug (English)
                      <span className="disease-label__required">*</span>
                    </label>
                    <input
                      className="disease-input"
                      type="text"
                      placeholder="disease-slug-en"
                      value={diseaseSlug.en}
                      onChange={(e) => setDiseaseSlug({ ...diseaseSlug, en: e.target.value })}
                      required
                    />
                  </div>
                  <div className="disease-form-group">
                    <label className="disease-label">
                      <MdLink />
                      Slug (Kannada)
                      <span className="disease-label__required">*</span>
                    </label>
                    <input
                      className="disease-input"
                      type="text"
                      placeholder="disease-slug-kn"
                      value={diseaseSlug.kn}
                      onChange={(e) => setDiseaseSlug({ ...diseaseSlug, kn: e.target.value })}
                      required
                    />
                  </div>
                </div>

                {/* Title */}
                <div className="disease-form-row">
                  <div className="disease-form-group">
                    <label className="disease-label">
                      <MdTextFields />
                      Title (English)
                      <span className="disease-label__required">*</span>
                    </label>
                    <input
                      className="disease-input"
                      type="text"
                      placeholder="Enter title in English"
                      value={diseaseTitle.en}
                      onChange={(e) => setDiseaseTitle({ ...diseaseTitle, en: e.target.value })}
                      required
                    />
                  </div>
                  <div className="disease-form-group">
                    <label className="disease-label">
                      <MdTextFields />
                      Title (Kannada)
                      <span className="disease-label__required">*</span>
                    </label>
                    <input
                      className="disease-input"
                      type="text"
                      placeholder="ಶೀರ್ಷಿಕೆ ನಮೂದಿಸಿ"
                      value={diseaseTitle.kn}
                      onChange={(e) => setDiseaseTitle({ ...diseaseTitle, kn: e.target.value })}
                      required
                    />
                  </div>
                </div>

                {/* Description */}
                <div className="disease-form-row">
                  <div className="disease-form-group">
                    <label className="disease-label">
                      <MdDescription />
                      Description (English)
                      <span className="disease-label__required">*</span>
                    </label>
                    <textarea
                      className="disease-textarea"
                      placeholder="Enter description in English"
                      value={diseaseDescription.en}
                      onChange={(e) => setDiseaseDescription({ ...diseaseDescription, en: e.target.value })}
                      required
                    />
                  </div>
                  <div className="disease-form-group">
                    <label className="disease-label">
                      <MdDescription />
                      Description (Kannada)
                      <span className="disease-label__required">*</span>
                    </label>
                    <textarea
                      className="disease-textarea"
                      placeholder="ವಿವರಣೆ ನಮೂದಿಸಿ"
                      value={diseaseDescription.kn}
                      onChange={(e) => setDiseaseDescription({ ...diseaseDescription, kn: e.target.value })}
                      required
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Common Causes Section */}
          <div className="disease-section">
            <SectionHeader
              title="Common Causes"
              icon={<MdWarning />}
              open={commonCauseOpen}
              onToggle={() => setCommonCauseOpen((p) => !p)}
            />
            {commonCauseOpen && (
              <div className="disease-section__body">

                {/* Tab Title */}
                <div className="disease-form-row" style={{ marginTop: '16px' }}>
                  <div className="disease-form-group">
                    <label className="disease-label">
                      <MdTextFields />
                      Tab Title (EN)
                    </label>
                    <input
                      className="disease-input"
                      type="text"
                      value={commonCauseTabTitle.en}
                      onChange={(e) => setCommonCauseTabTitle({ ...commonCauseTabTitle, en: e.target.value })}
                    />
                  </div>
                  <div className="disease-form-group">
                    <label className="disease-label">
                      <MdTextFields />
                      Tab Title (KN)
                    </label>
                    <input
                      className="disease-input"
                      type="text"
                      value={commonCauseTabTitle.kn}
                      onChange={(e) => setCommonCauseTabTitle({ ...commonCauseTabTitle, kn: e.target.value })}
                    />
                  </div>
                </div>

                {commonCauses.map((item, index) => (
                  <div key={index} className="disease-body-item">
                    <div className="disease-body-item__header">
                      <h4 className="disease-body-item__title">
                        <MdWarning /> Cause {index + 1}
                      </h4>
                      <button
                        type="button"
                        className="disease-btn-danger"
                        onClick={() => removeCommonCause(index)}
                      >
                        <MdDelete /> Remove
                      </button>
                    </div>

                    <div className="disease-form-row">
                      <div className="disease-form-group">
                        <label className="disease-label">
                          <MdTextFields />
                          Cause Title (EN)
                          <span className="disease-label__required">*</span>
                        </label>
                        <input
                          className="disease-input"
                          type="text"
                          placeholder="Cause title in English"
                          value={item?.cause_title?.en}
                          onChange={(e) => handleCommonCauseFieldChange(index, 'cause_title', 'en', e.target.value)}
                        />
                      </div>
                      <div className="disease-form-group">
                        <label className="disease-label">
                          <MdTextFields />
                          Cause Title (KN)
                          <span className="disease-label__required">*</span>
                        </label>
                        <input
                          className="disease-input"
                          type="text"
                          placeholder="ಕಾರಣದ ಶೀರ್ಷಿಕೆ"
                          value={item.cause_title?.kn}
                          onChange={(e) => handleCommonCauseFieldChange(index, 'cause_title', 'kn', e.target.value)}
                        />
                      </div>
                    </div>

                    {item.cause_repeater?.map((rep: CauseRepeaterItem, repIndex: number) => (
                      <div key={repIndex} className="disease-nested-item">
                        <div className="disease-nested-item__header">
                          <h5 className="disease-nested-item__title">
                            Description {repIndex + 1}
                          </h5>
                          <button
                            type="button"
                            className="disease-btn-danger"
                            onClick={() => removeCommonCauseRepeat(index, repIndex)}
                          >
                            <MdDelete /> Remove
                          </button>
                        </div>
                        <div className="disease-form-row">
                          <div className="disease-form-group">
                            <label className="disease-label">
                              <MdDescription />
                              Description (EN)
                            </label>
                            <CKEditorWrapper
                              data={rep?.description?.en}
                              onChange={(editor: string) => handleCommonCauseRepeatChange(index, repIndex, 'en', editor)}
                            />
                          </div>
                          <div className="disease-form-group">
                            <label className="disease-label">
                              <MdDescription />
                              Description (KN)
                            </label>
                            <CKEditorWrapper
                              data={rep?.description?.kn}
                              onChange={(editor: string) => handleCommonCauseRepeatChange(index, repIndex, 'kn', editor)}
                            />
                          </div>
                        </div>
                      </div>
                    ))}

                    <button
                      type="button"
                      className="disease-add-btn"
                      onClick={() => addCommonCauseRepeat(index)}
                    >
                      <MdAddCircleOutline /> Add Description
                    </button>
                  </div>
                ))}

                <button
                  type="button"
                  className="disease-add-btn"
                  onClick={addCommonCause}
                >
                  <MdAddCircleOutline /> Add Common Cause
                </button>


              </div>
            )}
          </div>

          {/* Symptoms Section */}
          <div className="disease-section">
            <SectionHeader
              title="Symptoms"
              icon={<MdHealthAndSafety />}
              open={symptomsOpen}
              onToggle={() => setSymptomsOpen((p) => !p)}
            />
            {symptomsOpen && (
              <div className="disease-section__body">

                {/* Tab Title */}
                <div className="disease-form-row" style={{ marginTop: '16px' }}>
                  <div className="disease-form-group">
                    <label className="disease-label">
                      <MdTextFields />
                      Tab Title (EN)
                    </label>
                    <input
                      className="disease-input"
                      type="text"
                      value={symptomsTabTitle.en}
                      onChange={(e) => setSymptomsTabTitle({ ...symptomsTabTitle, en: e.target.value })}
                    />
                  </div>
                  <div className="disease-form-group">
                    <label className="disease-label">
                      <MdTextFields />
                      Tab Title (KN)
                    </label>
                    <input
                      className="disease-input"
                      type="text"
                      value={symptomsTabTitle.kn}
                      onChange={(e) => setSymptomsTabTitle({ ...symptomsTabTitle, kn: e.target.value })}
                    />
                  </div>
                </div>

                {symptoms.map((item, index) => (
                  <div key={index} className="disease-body-item">
                    <div className="disease-body-item__header">
                      <h4 className="disease-body-item__title">
                        <MdHealthAndSafety /> Symptom {index + 1}
                      </h4>
                      <button
                        type="button"
                        className="disease-btn-danger"
                        onClick={() => removeSymptom(index)}
                      >
                        <MdDelete /> Remove
                      </button>
                    </div>

                    <div className="disease-form-row">
                      <div className="disease-form-group">
                        <label className="disease-label">
                          <MdTextFields />
                          Symptom Title (EN)
                          <span className="disease-label__required">*</span>
                        </label>
                        <input
                          className="disease-input"
                          type="text"
                          placeholder="Symptom title in English"
                          value={item?.symptoms_title?.en}
                          onChange={(e) => handleSymptomFieldChange(index, 'symptoms_title', 'en', e.target.value)}
                        />
                      </div>
                      <div className="disease-form-group">
                        <label className="disease-label">
                          <MdTextFields />
                          Symptom Title (KN)
                          <span className="disease-label__required">*</span>
                        </label>
                        <input
                          className="disease-input"
                          type="text"
                          placeholder="ಲಕ್ಷಣದ ಶೀರ್ಷಿಕೆ"
                          value={item?.symptoms_title?.kn}
                          onChange={(e) => handleSymptomFieldChange(index, 'symptoms_title', 'kn', e.target.value)}
                        />
                      </div>
                    </div>

                    {item.symptoms_repeater?.map((rep: SymptomRepeaterItem, repIndex: number) => (
                      <div key={repIndex} className="disease-nested-item">
                        <div className="disease-nested-item__header">
                          <h5 className="disease-nested-item__title">
                            Description {repIndex + 1}
                          </h5>
                          <button
                            type="button"
                            className="disease-btn-danger"
                            onClick={() => removeSymptomRepeat(index, repIndex)}
                          >
                            <MdDelete /> Remove
                          </button>
                        </div>
                        <div className="disease-form-row">
                          <div className="disease-form-group">
                            <label className="disease-label">
                              <MdDescription />
                              Description (EN)
                            </label>
                            <CKEditorWrapper
                              data={rep?.description?.en}
                              onChange={(editor: string) => handleSymptomRepeatChange(index, repIndex, 'en', editor)}
                            />
                          </div>
                          <div className="disease-form-group">
                            <label className="disease-label">
                              <MdDescription />
                              Description (KN)
                            </label>
                            <CKEditorWrapper
                              data={rep?.description?.kn}
                              onChange={(editor: string) => handleSymptomRepeatChange(index, repIndex, 'kn', editor)}
                            />
                          </div>
                        </div>
                      </div>
                    ))}

                    <button
                      type="button"
                      className="disease-add-btn"
                      onClick={() => addSymptomRepeat(index)}
                    >
                      <MdAddCircleOutline /> Add Description
                    </button>
                  </div>
                ))}

                <button
                  type="button"
                  className="disease-add-btn"
                  onClick={addSymptom}
                >
                  <MdAddCircleOutline /> Add Symptom
                </button>

              </div>
            )}
          </div>

          {/* Prevention Tips Section */}
          <div className="disease-section">
            <SectionHeader
              title="Prevention Tips"
              icon={<MdHealthAndSafety />}
              open={preventionOpen}
              onToggle={() => setPreventionOpen((p) => !p)}
            />
            {preventionOpen && (
              <div className="disease-section__body">

                {/* Tab Title */}
                <div className="disease-form-row" style={{ marginTop: '16px' }}>
                  <div className="disease-form-group">
                    <label className="disease-label">
                      <MdTextFields />
                      Tab Title (EN)
                    </label>
                    <input
                      className="disease-input"
                      type="text"
                      value={preventionTipsTabTitle.en}
                      onChange={(e) => setPreventionTipsTabTitle({ ...preventionTipsTabTitle, en: e.target.value })}
                    />
                  </div>
                  <div className="disease-form-group">
                    <label className="disease-label">
                      <MdTextFields />
                      Tab Title (KN)
                    </label>
                    <input
                      className="disease-input"
                      type="text"
                      value={preventionTipsTabTitle.kn}
                      onChange={(e) => setPreventionTipsTabTitle({ ...preventionTipsTabTitle, kn: e.target.value })}
                    />
                  </div>
                </div>

                {preventionTips.map((item, index) => (
                  <div key={index} className="disease-body-item">
                    <div className="disease-body-item__header">
                      <h4 className="disease-body-item__title">
                        <MdHealthAndSafety /> Prevention Tip {index + 1}
                      </h4>
                      <button
                        type="button"
                        className="disease-btn-danger"
                        onClick={() => removePreventionTip(index)}
                      >
                        <MdDelete /> Remove
                      </button>
                    </div>

                    <div className="disease-form-row">
                      <div className="disease-form-group">
                        <label className="disease-label">
                          <MdTextFields />
                          Prevention Title (EN)
                          <span className="disease-label__required">*</span>
                        </label>
                        <input
                          className="disease-input"
                          type="text"
                          placeholder="Prevention title in English"
                          value={item?.prevention_tips_title?.en}
                          onChange={(e) => handlePreventionTipFieldChange(index, 'prevention_tips_title', 'en', e.target.value)}
                        />
                      </div>
                      <div className="disease-form-group">
                        <label className="disease-label">
                          <MdTextFields />
                          Prevention Title (KN)
                          <span className="disease-label__required">*</span>
                        </label>
                        <input
                          className="disease-input"
                          type="text"
                          placeholder="ತಡೆಗಟ್ಟುವಿಕೆ ಶೀರ್ಷಿಕೆ"
                          value={item?.prevention_tips_title?.kn}
                          onChange={(e) => handlePreventionTipFieldChange(index, 'prevention_tips_title', 'kn', e.target.value)}
                        />
                      </div>
                    </div>

                    {item?.prevention_tips_repeater?.map((rep: PreventionTipRepeaterItem, repIndex: number) => (
                      <div key={repIndex} className="disease-nested-item">
                        <div className="disease-nested-item__header">
                          <h5 className="disease-nested-item__title">
                            Description {repIndex + 1}
                          </h5>
                          <button
                            type="button"
                            className="disease-btn-danger"
                            onClick={() => removePreventionTipRepeat(index, repIndex)}
                          >
                            <MdDelete /> Remove
                          </button>
                        </div>
                        <div className="disease-form-row">
                          <div className="disease-form-group">
                            <label className="disease-label">
                              <MdDescription />
                              Description (EN)
                            </label>
                            <CKEditorWrapper
                              data={rep?.description?.en}
                              onChange={(editor: string) => handlePreventionTipRepeatChange(index, repIndex, 'en', editor)}
                            />
                          </div>
                          <div className="disease-form-group">
                            <label className="disease-label">
                              <MdDescription />
                              Description (KN)
                            </label>
                            <CKEditorWrapper
                              data={rep?.description?.kn}
                              onChange={(editor: string) => handlePreventionTipRepeatChange(index, repIndex, 'kn', editor)}
                            />
                          </div>
                        </div>
                      </div>
                    ))}

                    <button
                      type="button"
                      className="disease-add-btn"
                      onClick={() => addPreventionTipRepeat(index)}
                    >
                      <MdAddCircleOutline /> Add Description
                    </button>
                  </div>
                ))}

                <button
                  type="button"
                  className="disease-add-btn"
                  onClick={addPreventionTip}
                >
                  <MdAddCircleOutline /> Add Prevention Tip
                </button>

              </div>
            )}
          </div>

          {/* Treatment Options Section */}
          <div className="disease-section">
            <SectionHeader
              title="Treatment Options"
              icon={<MdLocalHospital />}
              open={treatmentOpen}
              onToggle={() => setTreatmentOpen((p) => !p)}
            />
            {treatmentOpen && (
              <div className="disease-section__body">

                {/* Tab Title */}
                <div className="disease-form-row" style={{ marginTop: '16px' }}>
                  <div className="disease-form-group">
                    <label className="disease-label">
                      <MdTextFields />
                      Tab Title (EN)
                    </label>
                    <input
                      className="disease-input"
                      type="text"
                      value={treatmentOptionTabTitle.en}
                      onChange={(e) => setTreatmentOptionTabTitle({ ...treatmentOptionTabTitle, en: e.target.value })}
                    />
                  </div>
                  <div className="disease-form-group">
                    <label className="disease-label">
                      <MdTextFields />
                      Tab Title (KN)
                    </label>
                    <input
                      className="disease-input"
                      type="text"
                      value={treatmentOptionTabTitle.kn}
                      onChange={(e) => setTreatmentOptionTabTitle({ ...treatmentOptionTabTitle, kn: e.target.value })}
                    />
                  </div>
                </div>

                {treatmentOptions.map((item, index) => (
                  <div key={index} className="disease-body-item">
                    <div className="disease-body-item__header">
                      <h4 className="disease-body-item__title">
                        <MdLocalHospital /> Treatment {index + 1}
                      </h4>
                      <button
                        type="button"
                        className="disease-btn-danger"
                        onClick={() => removeTreatmentOption(index)}
                      >
                        <MdDelete /> Remove
                      </button>
                    </div>

                    <div className="disease-form-row">
                      <div className="disease-form-group">
                        <label className="disease-label">
                          <MdTextFields />
                          Treatment Title (EN)
                          <span className="disease-label__required">*</span>
                        </label>
                        <input
                          className="disease-input"
                          type="text"
                          placeholder="Treatment title in English"
                          value={item?.treatment_option_title?.en}
                          onChange={(e) => handleTreatmentOptionFieldChange(index, 'treatment_option_title', 'en', e.target.value)}
                        />
                      </div>
                      <div className="disease-form-group">
                        <label className="disease-label">
                          <MdTextFields />
                          Treatment Title (KN)
                          <span className="disease-label__required">*</span>
                        </label>
                        <input
                          className="disease-input"
                          type="text"
                          placeholder="ಚಿಕಿತ್ಸೆಯ ಶೀರ್ಷಿಕೆ"
                          value={item?.treatment_option_title?.kn}
                          onChange={(e) => handleTreatmentOptionFieldChange(index, 'treatment_option_title', 'kn', e.target.value)}
                        />
                      </div>
                    </div>

                    {item?.treatment_option_repeater?.map((rep: TreatmentOptionRepeaterItem, repIndex: number) => (
                      <div key={repIndex} className="disease-nested-item">
                        <div className="disease-nested-item__header">
                          <h5 className="disease-nested-item__title">
                            Description {repIndex + 1}
                          </h5>
                          <button
                            type="button"
                            className="disease-btn-danger"
                            onClick={() => removeTreatmentOptionRepeat(index, repIndex)}
                          >
                            <MdDelete /> Remove
                          </button>
                        </div>
                        <div className="disease-form-row">
                          <div className="disease-form-group">
                            <label className="disease-label">
                              <MdDescription />
                              Description (EN)
                            </label>
                            <CKEditorWrapper
                              data={rep?.description?.en}
                              onChange={(editor: string) => handleTreatmentOptionRepeatChange(index, repIndex, 'en', editor)}
                            />
                          </div>
                          <div className="disease-form-group">
                            <label className="disease-label">
                              <MdDescription />
                              Description (KN)
                            </label>
                            <CKEditorWrapper
                              data={rep?.description?.kn}
                              onChange={(editor: string) => handleTreatmentOptionRepeatChange(index, repIndex, 'kn', editor)}
                            />
                          </div>
                        </div>
                      </div>
                    ))}

                    <button
                      type="button"
                      className="disease-add-btn"
                      onClick={() => addTreatmentOptionRepeat(index)}
                    >
                      <MdAddCircleOutline /> Add Description
                    </button>
                  </div>
                ))}

                <button
                  type="button"
                  className="disease-add-btn"
                  onClick={addTreatmentOption}
                >
                  <MdAddCircleOutline /> Add Treatment Option
                </button>

              </div>
            )}
          </div>
        </div>

        {/* ── Right sidebar ────────────────────────────── */}
        <div className="disease-sidebar">

          {/* Main Image */}
          <div className="disease-section">
            <div className="disease-section__header">
              <h2 className="disease-section__title">
                <MdImage />
                &nbsp;Main Image
              </h2>
            </div>
            <div className="disease-section__body">
              {hasMainImage ? (
                <div style={{ position: 'relative' }}>
                  <Image
                    src={diseaseMainImagePreview || diseaseMainImageUrl}
                    alt="Main"
                    width={280}
                    height={160}
                    style={{
                      width: '100%',
                      height: 160,
                      objectFit: 'cover',
                      borderRadius: 5,
                      display: 'block',
                    }}
                  />
                  <button
                    type="button"
                    className="disease-preview__remove"
                    onClick={handleDeleteMainImage}
                    disabled={isDeletingMainImage}
                  >
                    {isDeletingMainImage ? (
                      <BeatLoader size={5} color="#fff" />
                    ) : (
                      <MdClose />
                    )}
                  </button>
                </div>
              ) : (
                <div className="disease-featured-zone">
                  <div className="disease-featured-zone__icon">
                    <MdCloudUpload />
                  </div>
                  <p className="disease-featured-zone__text">
                    Click or Drag to Upload Main Image
                  </p>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleMainImageChange}
                  />
                </div>
              )}
            </div>
          </div>

          {/* Disease Icon */}
          <div className="disease-section">
            <div className="disease-section__header">
              <h2 className="disease-section__title">
                <MdImage />
                &nbsp;Disease Icon
              </h2>
            </div>
            <div className="disease-section__body">
              {hasIcon ? (
                <div style={{ position: 'relative' }}>
                  <Image
                    src={diseaseIconPreview || diseaseIconUrl}
                    alt="Icon"
                    width={100}
                    height={100}
                    style={{
                      width: '100%',
                      height: 100,
                      objectFit: 'cover',
                      borderRadius: 5,
                      display: 'block',
                    }}
                  />
                  <button
                    type="button"
                    className="disease-preview__remove"
                    onClick={handleDeleteIcon}
                    disabled={isDeletingIcon}
                  >
                    {isDeletingIcon ? (
                      <BeatLoader size={5} color="#fff" />
                    ) : (
                      <MdClose />
                    )}
                  </button>
                </div>
              ) : (
                <div className="disease-upload-zone">
                  <div className="disease-upload-zone__icon">
                    <MdImage />
                  </div>
                  <p className="disease-upload-zone__text">
                    Click to upload icon
                  </p>
                  <p className="disease-upload-zone__hint">
                    PNG, JPG up to 2MB · Optional
                  </p>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleIconChange}
                    disabled={isDeletingIcon}
                  />
                </div>
              )}
            </div>
          </div>

          {/* Footer actions */}
          <div className="disease-footer">
            <button
              type="button"
              className="disease-btn-cancel"
              onClick={() => router.back()}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="disease-btn-submit"
              disabled={isLoading}
              style={{ fontWeight: 600 }}
            >
              {isLoading ? (
                <>
                  <span style={{ fontWeight: 600 }}>Adding...</span>
                  <OvalLoader height="20" width="20" color="#ffffff" strokeWidth={5} strokeWidthSecondary={5} ariaLabel="oval-loading" />
                </>
              ) : (
                'Add Disease'
              )}
            </button>
          </div>
        </div>
      </div>
    </form>
  );
};

export default AddDisease;
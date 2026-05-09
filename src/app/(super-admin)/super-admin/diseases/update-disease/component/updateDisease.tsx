"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import Image from 'next/image';
import { useGetSingleDiseasesQuery, useUpdateDiseasesMutation } from '@/(store)/services/disease/diseaseApi';
import { useGetCategoriesQuery } from '@/(store)/services/category/categoryApi';
import { BeatLoader } from 'react-spinners';
import { uploadToCloudinary } from '@/utils/uploadToCloudinary';
import { useCloudinaryDelete } from '@/utils/useCloudinaryDelete';
import Loader from '@/(common)/Loader';
import { CauseItem, CauseRepeater, PreventionTipsItem, PreventionTipsRepeater, SymptomsItem, SymptomsRepeater, TreatmentOptionItem, TreatmentOptionRepeater } from '@/utils/Types';
import CKEditorWrapper from '@/app/(super-admin)/(common)/editor/CKEditorWrapper';
import {
  MdImage,
  MdTextFields,
  MdDescription,
  MdAddCircleOutline,
  MdDelete,
  MdClose,
  MdCloudUpload,
  MdCategory,
  MdLink,
  MdMedicalServices,
  MdWarning,
  MdHealthAndSafety,
  MdLocalHospital
} from "react-icons/md";

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

interface Category {
  _id: string;
  name?: string;
}

const UpdateDisease = ({ id }: UpdateDiseaseProps) => {
  const router = useRouter();
  const { data, isLoading, error } = useGetSingleDiseasesQuery({ id });
  const [updateDisease, { isLoading: isUpdating }] = useUpdateDiseasesMutation();
  const { deleteFromCloudinary } = useCloudinaryDelete();

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
  const { data: categoriesData } = useGetCategoriesQuery();
  const categories = useMemo(() => categoriesData?.result || [], [categoriesData]);

  useEffect(() => {
    if (categories.length > 0 && !selectedCategory) {
      setSelectedCategory(categories[0]._id);
    }
  }, [categories, selectedCategory]);

  // Main Fields
  const [diseaseMainTitle, setDiseaseMainTitle] = useState({ en: '', kn: '' });
  const [diseaseMainImage, setDiseaseMainImage] = useState<File | null>(null);
  const [diseaseMainImagePreview, setDiseaseMainImagePreview] = useState<string>('');
  const [diseaseMainImageUrl, setDiseaseMainImageUrl] = useState('');
  const [diseaseSlug, setDiseaseSlug] = useState({ en: '', kn: '' });
  const [diseaseTitle, setDiseaseTitle] = useState({ en: '', kn: '' });
  const [diseaseDescription, setDiseaseDescription] = useState({ en: '', kn: '' });
  const [diseaseIcon, setDiseaseIcon] = useState<File | null>(null);
  const [diseaseIconPreview, setDiseaseIconPreview] = useState<string>('');
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
    const d = data?.data || data?.result;
    if (!d) return;

    setDiseaseMainTitle(d.disease_main_title || { en: '', kn: '' });
    setDiseaseSlug(d.disease_slug || { en: '', kn: '' });
    setDiseaseTitle(d.disease_title || { en: '', kn: '' });
    setDiseaseDescription(d.disease_description || { en: '', kn: '' });
    setDiseaseMainImageUrl(d.disease_main_image || '');
    setDiseaseIconUrl(d.disease_icon || '');
    setSelectedCategory(d.category || '');

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

  // Delete handlers
  const handleDeleteMainImage = async () => {
    setIsDeletingMainImage(true);
    try {
      if (diseaseMainImageUrl) {
        await deleteFromCloudinary(diseaseMainImageUrl, { resourceType: 'image' });
      }
      if (diseaseMainImagePreview) {
        URL.revokeObjectURL(diseaseMainImagePreview);
      }
      setDiseaseMainImageUrl('');
      setDiseaseMainImagePreview('');
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
      }
      if (diseaseIconPreview) {
        URL.revokeObjectURL(diseaseIconPreview);
      }
      setDiseaseIconUrl('');
      setDiseaseIconPreview('');
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

      formData.append("category", selectedCategory);

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

      // Main Fields
      formData.append('disease_main_title', JSON.stringify(diseaseMainTitle));
      if (finalMainImageUrl) formData.append('disease_main_image', finalMainImageUrl);
      formData.append('disease_slug', JSON.stringify(diseaseSlug));
      formData.append('disease_title', JSON.stringify(diseaseTitle));
      formData.append('disease_description', JSON.stringify(diseaseDescription));
      if (finalIconUrl) formData.append('disease_icon', finalIconUrl);

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

      await updateDisease({ id, formData }).unwrap();
      toast.success('Disease updated successfully');
      router.back();
    } catch (error) {
      toast.error('Failed to update disease');
      console.error('Update error:', error);
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

  if (isLoading) return <Loader />;
  if (error) return <p>Error loading disease data.</p>;

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
                <div className="disease-form-row">
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
                        onClick={() => removeSection('commonCauses', index)}
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
                          value={item.title.en}
                          onChange={(e) => handleTitleChange('commonCauses', index, 'en', e.target.value)}
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
                          value={item.title.kn}
                          onChange={(e) => handleTitleChange('commonCauses', index, 'kn', e.target.value)}
                        />
                      </div>
                    </div>

                    {item.repeater.map((rep, repIndex) => (
                      <div key={repIndex} className="disease-nested-item">
                        <div className="disease-nested-item__header">
                          <h5 className="disease-nested-item__title">
                            Description {repIndex + 1}
                          </h5>
                          <button
                            type="button"
                            className="disease-btn-danger"
                            onClick={() => removeRepeater('commonCauses', index, repIndex)}
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
                              data={rep.description.en}
                              onChange={(data: string) => handleRepeaterChange('commonCauses', index, repIndex, 'en', data)}
                            />
                          </div>
                          <div className="disease-form-group">
                            <label className="disease-label">
                              <MdDescription />
                              Description (KN)
                            </label>
                            <CKEditorWrapper
                              data={rep.description.kn}
                              onChange={(data: string) => handleRepeaterChange('commonCauses', index, repIndex, 'kn', data)}
                            />
                          </div>
                        </div>
                      </div>
                    ))}

                    <button
                      type="button"
                      className="disease-add-btn"
                      onClick={() => addRepeater('commonCauses', index)}
                    >
                      <MdAddCircleOutline /> Add Description
                    </button>
                  </div>
                ))}

                <button
                  type="button"
                  className="disease-add-btn"
                  onClick={() => addSection('commonCauses')}
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
                <div className="disease-form-row">
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
                        onClick={() => removeSection('symptoms', index)}
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
                          value={item.title.en}
                          onChange={(e) => handleTitleChange('symptoms', index, 'en', e.target.value)}
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
                          value={item.title.kn}
                          onChange={(e) => handleTitleChange('symptoms', index, 'kn', e.target.value)}
                        />
                      </div>
                    </div>

                    {item.repeater.map((rep, repIndex) => (
                      <div key={repIndex} className="disease-nested-item">
                        <div className="disease-nested-item__header">
                          <h5 className="disease-nested-item__title">
                            Description {repIndex + 1}
                          </h5>
                          <button
                            type="button"
                            className="disease-btn-danger"
                            onClick={() => removeRepeater('symptoms', index, repIndex)}
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
                              data={rep.description.en}
                              onChange={(data: string) => handleRepeaterChange('symptoms', index, repIndex, 'en', data)}
                            />
                          </div>
                          <div className="disease-form-group">
                            <label className="disease-label">
                              <MdDescription />
                              Description (KN)
                            </label>
                            <CKEditorWrapper
                              data={rep.description.kn}
                              onChange={(data: string) => handleRepeaterChange('symptoms', index, repIndex, 'kn', data)}
                            />
                          </div>
                        </div>
                      </div>
                    ))}

                    <button
                      type="button"
                      className="disease-add-btn"
                      onClick={() => addRepeater('symptoms', index)}
                    >
                      <MdAddCircleOutline /> Add Description
                    </button>
                  </div>
                ))}

                <button
                  type="button"
                  className="disease-add-btn"
                  onClick={() => addSection('symptoms')}
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
                <div className="disease-form-row">
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
                        onClick={() => removeSection('preventionTips', index)}
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
                          value={item.title.en}
                          onChange={(e) => handleTitleChange('preventionTips', index, 'en', e.target.value)}
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
                          value={item.title.kn}
                          onChange={(e) => handleTitleChange('preventionTips', index, 'kn', e.target.value)}
                        />
                      </div>
                    </div>

                    {item.repeater.map((rep, repIndex) => (
                      <div key={repIndex} className="disease-nested-item">
                        <div className="disease-nested-item__header">
                          <h5 className="disease-nested-item__title">
                            Description {repIndex + 1}
                          </h5>
                          <button
                            type="button"
                            className="disease-btn-danger"
                            onClick={() => removeRepeater('preventionTips', index, repIndex)}
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
                              data={rep.description.en}
                              onChange={(data: string) => handleRepeaterChange('preventionTips', index, repIndex, 'en', data)}
                            />
                          </div>
                          <div className="disease-form-group">
                            <label className="disease-label">
                              <MdDescription />
                              Description (KN)
                            </label>
                            <CKEditorWrapper
                              data={rep.description.kn}
                              onChange={(data: string) => handleRepeaterChange('preventionTips', index, repIndex, 'kn', data)}
                            />
                          </div>
                        </div>
                      </div>
                    ))}

                    <button
                      type="button"
                      className="disease-add-btn"
                      onClick={() => addRepeater('preventionTips', index)}
                    >
                      <MdAddCircleOutline /> Add Description
                    </button>
                  </div>
                ))}

                <button
                  type="button"
                  className="disease-add-btn"
                  onClick={() => addSection('preventionTips')}
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
                <div className="disease-form-row">
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
                        onClick={() => removeSection('treatmentOptions', index)}
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
                          value={item.title.en}
                          onChange={(e) => handleTitleChange('treatmentOptions', index, 'en', e.target.value)}
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
                          value={item.title.kn}
                          onChange={(e) => handleTitleChange('treatmentOptions', index, 'kn', e.target.value)}
                        />
                      </div>
                    </div>

                    {item.repeater.map((rep, repIndex) => (
                      <div key={repIndex} className="disease-nested-item">
                        <div className="disease-nested-item__header">
                          <h5 className="disease-nested-item__title">
                            Description {repIndex + 1}
                          </h5>
                          <button
                            type="button"
                            className="disease-btn-danger"
                            onClick={() => removeRepeater('treatmentOptions', index, repIndex)}
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
                              data={rep.description.en}
                              onChange={(data: string) => handleRepeaterChange('treatmentOptions', index, repIndex, 'en', data)}
                            />
                          </div>
                          <div className="disease-form-group">
                            <label className="disease-label">
                              <MdDescription />
                              Description (KN)
                            </label>
                            <CKEditorWrapper
                              data={rep.description.kn}
                              onChange={(data: string) => handleRepeaterChange('treatmentOptions', index, repIndex, 'kn', data)}
                            />
                          </div>
                        </div>
                      </div>
                    ))}

                    <button
                      type="button"
                      className="disease-add-btn"
                      onClick={() => addRepeater('treatmentOptions', index)}
                    >
                      <MdAddCircleOutline /> Add Description
                    </button>
                  </div>
                ))}

                <button
                  type="button"
                  className="disease-add-btn"
                  onClick={() => addSection('treatmentOptions')}
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
              disabled={isUpdating}
            >
              {isUpdating ? (
                <>
                  <span>Updating...</span>
                  <BeatLoader color="#fff" size={8} />
                </>
              ) : (
                'Update Disease'
              )}
            </button>
          </div>
        </div>
      </div>
    </form>
  );
};

export default UpdateDisease;
'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import Image from 'next/image';
import { BeatLoader } from 'react-spinners';
import Loader from '@/(common)/Loader';
import { useGetSingleDentalEmergencyQuery, useUpdateDentalEmergencyMutation } from '@/(store)/services/dental-emergency/dentalEmergencyApi';
import { Language, DentalEmerRepeater, DentalEmerDescriptionRepeater } from '@/utils/Types';
import { uploadToCloudinary } from '@/utils/uploadToCloudinary';
import { useCloudinaryDelete } from '@/utils/useCloudinaryDelete';
import { MdImage, MdTextFields, MdDescription, MdAddCircleOutline, MdDelete, MdClose, MdCloudUpload, MdEmergency, MdInfo, MdList, MdTitle } from "react-icons/md";

interface UpdateDiseaseProps {
  id: string;
}

export default function EditDentalEmergency({ id }: UpdateDiseaseProps) {
  const router = useRouter();
  const { data, isLoading: isFetching, error } = useGetSingleDentalEmergencyQuery({ id });
  const [updateDental, { isLoading }] = useUpdateDentalEmergencyMutation();
  const { deleteFromCloudinary } = useCloudinaryDelete();

  // Section collapse states
  const [mainInfoOpen, setMainInfoOpen] = useState(true);
  const [innerSectionOpen, setInnerSectionOpen] = useState(true);
  const [emergencyInfoOpen, setEmergencyInfoOpen] = useState(true);
  const [stepsOpen, setStepsOpen] = useState(true);

  // Loading states for image deletions
  const [isDeletingTitleImage, setIsDeletingTitleImage] = useState(false);
  const [isDeletingIcon, setIsDeletingIcon] = useState(false);
  const [isDeletingInnerIcon, setIsDeletingInnerIcon] = useState(false);

  // Main bilingual
  const [title, setTitle] = useState<Language>({ en: '', kn: '' });
  const [titleImageFile, setTitleImageFile] = useState<File | null>(null);
  const [titleImagePreview, setTitleImagePreview] = useState<string>('');
  const [titleImageUrl, setTitleImageUrl] = useState<string>('');

  const [heading, setHeading] = useState<Language>({ en: '', kn: '' });
  const [para, setPara] = useState<Language>({ en: '', kn: '' });
  const [iconFile, setIconFile] = useState<File | null>(null);
  const [iconPreview, setIconPreview] = useState<string>('');
  const [iconUrl, setIconUrl] = useState<string>('');

  // Inner
  const [innerTitle, setInnerTitle] = useState<Language>({ en: '', kn: '' });
  const [innerPara, setInnerPara] = useState<Language>({ en: '', kn: '' });
  const [innerIconFile, setInnerIconFile] = useState<File | null>(null);
  const [innerIconPreview, setInnerIconPreview] = useState<string>('');
  const [innerIconUrl, setInnerIconUrl] = useState<string>('');

  // Emergency section
  const [emerTitle, setEmerTitle] = useState<Language>({ en: '', kn: '' });
  const [emerSubTitle, setEmerSubTitle] = useState<Language>({ en: '', kn: '' });

  // Repeater
  const [repeater, setRepeater] = useState<DentalEmerRepeater[]>([]);
  const addCalled = useRef(false);

  // Delete handlers with loading states
  const handleDeleteTitleImage = async () => {
    setIsDeletingTitleImage(true);
    try {
      if (titleImageUrl) {
        await deleteFromCloudinary(titleImageUrl, { resourceType: 'image' });
        setTitleImageUrl('');
      }
      if (titleImagePreview) {
        URL.revokeObjectURL(titleImagePreview);
        setTitleImagePreview('');
      }
      setTitleImageFile(null);
      toast.success('Title image removed');
    } catch {
      toast.error('Failed to delete title image');
    } finally {
      setIsDeletingTitleImage(false);
    }
  };

  const handleDeleteIcon = async () => {
    setIsDeletingIcon(true);
    try {
      if (iconUrl) {
        await deleteFromCloudinary(iconUrl, { resourceType: 'image' });
        setIconUrl('');
      }
      if (iconPreview) {
        URL.revokeObjectURL(iconPreview);
        setIconPreview('');
      }
      setIconFile(null);
      toast.success('Icon removed');
    } catch {
      toast.error('Failed to delete icon');
    } finally {
      setIsDeletingIcon(false);
    }
  };

  const handleDeleteInnerIcon = async () => {
    setIsDeletingInnerIcon(true);
    try {
      if (innerIconUrl) {
        await deleteFromCloudinary(innerIconUrl, { resourceType: 'image' });
        setInnerIconUrl('');
      }
      if (innerIconPreview) {
        URL.revokeObjectURL(innerIconPreview);
        setInnerIconPreview('');
      }
      setInnerIconFile(null);
      toast.success('Inner icon removed');
    } catch {
      toast.error('Failed to delete inner icon');
    } finally {
      setIsDeletingInnerIcon(false);
    }
  };

  // Seed form
  useEffect(() => {
    if (!isFetching && data?.result) {
      const d = data.result;
      setTitle(d.dental_emergency_title || { en: '', kn: '' });
      setHeading(d.dental_emergency_heading || { en: '', kn: '' });
      setPara(d.dental_emergency_para || { en: '', kn: '' });
      setTitleImageUrl(d.dental_emergency_image || '');
      setIconUrl(d.dental_emergency_icon || '');

      setInnerTitle(d.dental_emergency_inner_title || { en: '', kn: '' });
      setInnerPara(d.dental_emergency_inner_para || { en: '', kn: '' });
      setInnerIconUrl(d.dental_emergency_inner_icon || '');

      setEmerTitle(d.dental_emer_title || { en: '', kn: '' });
      setEmerSubTitle(d.dental_emer_sub_title || { en: '', kn: '' });

      setRepeater(d.dental_emer_repeater || []);
    }
  }, [data, isFetching]);

  if (isFetching) return <Loader />;
  if (error) return <p className="text-red-500">Error loading data.</p>;

  // Helpers
  const handleFile = (
    e: React.ChangeEvent<HTMLInputElement>,
    setFile: React.Dispatch<React.SetStateAction<File | null>>,
    setPreview: React.Dispatch<React.SetStateAction<string>>,
    setUrl: React.Dispatch<React.SetStateAction<string>>
  ) => {
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
    setFile(file);
    setPreview(URL.createObjectURL(file));
    setUrl('');
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

    if (!title.en || !title.kn) {
      toast.error('Title is required in both languages');
      return;
    }

    try {
      // Upload images if new ones are selected
      let finalTitleImageUrl = titleImageUrl;
      if (titleImageFile) {
        const res = await uploadToCloudinary(titleImageFile, 'image');
        finalTitleImageUrl = res.secure_url;
      }

      let finalIconUrl = iconUrl;
      if (iconFile) {
        const res = await uploadToCloudinary(iconFile, 'image');
        finalIconUrl = res.secure_url;
      }

      let finalInnerIconUrl = innerIconUrl;
      if (innerIconFile) {
        const res = await uploadToCloudinary(innerIconFile, 'image');
        finalInnerIconUrl = res.secure_url;
      }

      const fd = new FormData();

      // Main
      fd.append('dental_emergency_title', JSON.stringify(title));
      fd.append('dental_emergency_image', finalTitleImageUrl);
      fd.append('dental_emergency_heading', JSON.stringify(heading));
      fd.append('dental_emergency_para', JSON.stringify(para));
      if (finalIconUrl) fd.append('dental_emergency_icon', finalIconUrl);

      // Inner
      fd.append('dental_emergency_inner_title', JSON.stringify(innerTitle));
      fd.append('dental_emergency_inner_para', JSON.stringify(innerPara));
      if (finalInnerIconUrl) fd.append('dental_emergency_inner_icon', finalInnerIconUrl);

      // Emergency
      fd.append('dental_emer_title', JSON.stringify(emerTitle));
      fd.append('dental_emer_sub_title', JSON.stringify(emerSubTitle));

      // Repeater
      fd.append('dental_emer_repeater', JSON.stringify(repeater));

      await updateDental({ id, formData: fd }).unwrap();
      toast.success('Dental Emergency updated successfully!');
      router.back();
    } catch {
      toast.error('Failed to update Dental Emergency');
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
    <div className="dental-section__header">
      <h2 className="dental-section__title">
        {icon} {title}
      </h2>
      <button
        type="button"
        className="dental-section__toggle"
        onClick={onToggle}
      >
        {open ? "−" : "+"}
      </button>
    </div>
  );

  const hasTitleImage = titleImageUrl || titleImagePreview;
  const hasIcon = iconUrl || iconPreview;
  const hasInnerIcon = innerIconUrl || innerIconPreview;

  return (
    <form onSubmit={onSubmit} className="dental-form">
      <div className="dental-layout">
        {/* ── Left column ─────────────────────────────── */}
        <div className="dental-main">

          {/* Main Information Section */}
          <div className="dental-section">
            <SectionHeader
              title="Main Information"
              icon={<MdInfo />}
              open={mainInfoOpen}
              onToggle={() => setMainInfoOpen((p) => !p)}
            />
            {mainInfoOpen && (
              <div className="dental-section__body">
                {/* Title */}
                <div className="dental-form-row">
                  <div className="dental-form-group">
                    <label className="dental-label">
                      <MdTextFields />
                      Title (English)
                      <span className="dental-label__required">*</span>
                    </label>
                    <input
                      className="dental-input"
                      type="text"
                      placeholder="Enter title in English"
                      value={title.en}
                      onChange={e => setTitle(prev => ({ ...prev, en: e.target.value }))}
                      required
                    />
                  </div>
                  <div className="dental-form-group">
                    <label className="dental-label">
                      <MdTextFields />
                      Title (Kannada)
                      <span className="dental-label__required">*</span>
                    </label>
                    <input
                      className="dental-input"
                      type="text"
                      placeholder="ಶೀರ್ಷಿಕೆ ನಮೂದಿಸಿ"
                      value={title.kn}
                      onChange={e => setTitle(prev => ({ ...prev, kn: e.target.value }))}
                      required
                    />
                  </div>
                </div>

                {/* Heading */}
                <div className="dental-form-row">
                  <div className="dental-form-group">
                    <label className="dental-label">
                      <MdTitle />
                      Heading (English)
                      <span className="dental-label__required">*</span>
                    </label>
                    <input
                      className="dental-input"
                      type="text"
                      placeholder="Enter heading in English"
                      value={heading.en}
                      onChange={e => setHeading(prev => ({ ...prev, en: e.target.value }))}
                      required
                    />
                  </div>
                  <div className="dental-form-group">
                    <label className="dental-label">
                      <MdTitle />
                      Heading (Kannada)
                      <span className="dental-label__required">*</span>
                    </label>
                    <input
                      className="dental-input"
                      type="text"
                      placeholder="ಶೀರ್ಷಿಕೆ ನಮೂದಿಸಿ"
                      value={heading.kn}
                      onChange={e => setHeading(prev => ({ ...prev, kn: e.target.value }))}
                      required
                    />
                  </div>
                </div>

                {/* Paragraph */}
                <div className="dental-form-row">
                  <div className="dental-form-group">
                    <label className="dental-label">
                      <MdDescription />
                      Paragraph (English)
                      <span className="dental-label__required">*</span>
                    </label>
                    <textarea
                      className="dental-textarea"
                      placeholder="Enter paragraph in English"
                      value={para.en}
                      onChange={e => setPara(prev => ({ ...prev, en: e.target.value }))}
                      required
                    />
                  </div>
                  <div className="dental-form-group">
                    <label className="dental-label">
                      <MdDescription />
                      Paragraph (Kannada)
                      <span className="dental-label__required">*</span>
                    </label>
                    <textarea
                      className="dental-textarea"
                      placeholder="ಪ್ಯಾರಾಗ್ರಾಫ್ ನಮೂದಿಸಿ"
                      value={para.kn}
                      onChange={e => setPara(prev => ({ ...prev, kn: e.target.value }))}
                      required
                    />
                  </div>
                </div>

                {/* Icon Upload */}
                <div className="dental-form-group">
                  <label className="dental-label">
                    <MdImage />
                    Icon
                    <span className="dental-label__optional">(optional)</span>
                  </label>
                  {hasIcon ? (
                    <div style={{ position: 'relative', display: 'inline-flex', width: 'fit-content' }}>
                      <Image
                        src={iconPreview || iconUrl}
                        alt="Icon"
                        width={100}
                        height={80}
                        style={{ objectFit: 'cover', borderRadius: 5 }}
                      />
                      <button
                        type="button"
                        className="dental-preview__remove"
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
                    <div className="dental-upload-zone" style={{ padding: '16px' }}>
                      <div className="dental-upload-zone__icon" style={{ fontSize: 20 }}>
                        <MdImage />
                      </div>
                      <p className="dental-upload-zone__text">Click to upload icon</p>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleFile(e, setIconFile, setIconPreview, setIconUrl)}
                      />
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Inner Section */}
          <div className="dental-section">
            <SectionHeader
              title="Inner Section"
              icon={<MdInfo />}
              open={innerSectionOpen}
              onToggle={() => setInnerSectionOpen((p) => !p)}
            />
            {innerSectionOpen && (
              <div className="dental-section__body">
                <div className="dental-form-row">
                  <div className="dental-form-group">
                    <label className="dental-label">
                      <MdTextFields />
                      Inner Title (English)
                      <span className="dental-label__required">*</span>
                    </label>
                    <input
                      className="dental-input"
                      type="text"
                      placeholder="Enter inner title in English"
                      value={innerTitle.en}
                      onChange={e => setInnerTitle(prev => ({ ...prev, en: e.target.value }))}
                      required
                    />
                  </div>
                  <div className="dental-form-group">
                    <label className="dental-label">
                      <MdTextFields />
                      Inner Title (Kannada)
                      <span className="dental-label__required">*</span>
                    </label>
                    <input
                      className="dental-input"
                      type="text"
                      placeholder="ಒಳ ಶೀರ್ಷಿಕೆ ನಮೂದಿಸಿ"
                      value={innerTitle.kn}
                      onChange={e => setInnerTitle(prev => ({ ...prev, kn: e.target.value }))}
                      required
                    />
                  </div>
                </div>

                <div className="dental-form-row">
                  <div className="dental-form-group">
                    <label className="dental-label">
                      <MdDescription />
                      Inner Paragraph (English)
                      <span className="dental-label__required">*</span>
                    </label>
                    <textarea
                      className="dental-textarea"
                      placeholder="Enter inner paragraph in English"
                      value={innerPara.en}
                      onChange={e => setInnerPara(prev => ({ ...prev, en: e.target.value }))}
                      required
                    />
                  </div>
                  <div className="dental-form-group">
                    <label className="dental-label">
                      <MdDescription />
                      Inner Paragraph (Kannada)
                      <span className="dental-label__required">*</span>
                    </label>
                    <textarea
                      className="dental-textarea"
                      placeholder="ಒಳ ಪ್ಯಾರಾಗ್ರಾಫ್ ನಮೂದಿಸಿ"
                      value={innerPara.kn}
                      onChange={e => setInnerPara(prev => ({ ...prev, kn: e.target.value }))}
                      required
                    />
                  </div>
                </div>

                {/* Inner Icon Upload */}
                <div className="dental-form-group">
                  <label className="dental-label">
                    <MdImage />
                    Inner Icon
                    <span className="dental-label__optional">(optional)</span>
                  </label>
                  {hasInnerIcon ? (
                    <div style={{ position: 'relative', display: 'inline-flex', width: 'fit-content' }}>
                      <Image
                        src={innerIconPreview || innerIconUrl}
                        alt="Inner Icon"
                        width={100}
                        height={80}
                        style={{ objectFit: 'cover', borderRadius: 5 }}
                      />
                      <button
                        type="button"
                        className="dental-preview__remove"
                        onClick={handleDeleteInnerIcon}
                        disabled={isDeletingInnerIcon}
                      >
                        {isDeletingInnerIcon ? (
                          <BeatLoader size={5} color="#fff" />
                        ) : (
                          <MdClose />
                        )}
                      </button>
                    </div>
                  ) : (
                    <div className="dental-upload-zone" style={{ padding: '16px' }}>
                      <div className="dental-upload-zone__icon" style={{ fontSize: 20 }}>
                        <MdImage />
                      </div>
                      <p className="dental-upload-zone__text">Click to upload inner icon</p>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleFile(e, setInnerIconFile, setInnerIconPreview, setInnerIconUrl)}
                      />
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Emergency Information Section */}
          <div className="dental-section">
            <SectionHeader
              title="Emergency Information"
              icon={<MdEmergency />}
              open={emergencyInfoOpen}
              onToggle={() => setEmergencyInfoOpen((p) => !p)}
            />
            {emergencyInfoOpen && (
              <div className="dental-section__body">
                <div className="dental-form-row">
                  <div className="dental-form-group">
                    <label className="dental-label">
                      <MdTextFields />
                      Emergency Title (English)
                      <span className="dental-label__required">*</span>
                    </label>
                    <input
                      className="dental-input"
                      type="text"
                      placeholder="Enter emergency title in English"
                      value={emerTitle.en}
                      onChange={e => setEmerTitle(prev => ({ ...prev, en: e.target.value }))}
                      required
                    />
                  </div>
                  <div className="dental-form-group">
                    <label className="dental-label">
                      <MdTextFields />
                      Emergency Title (Kannada)
                      <span className="dental-label__required">*</span>
                    </label>
                    <input
                      className="dental-input"
                      type="text"
                      placeholder="ತುರ್ತು ಶೀರ್ಷಿಕೆ ನಮೂದಿಸಿ"
                      value={emerTitle.kn}
                      onChange={e => setEmerTitle(prev => ({ ...prev, kn: e.target.value }))}
                      required
                    />
                  </div>
                </div>

                <div className="dental-form-row">
                  <div className="dental-form-group">
                    <label className="dental-label">
                      <MdTextFields />
                      Sub-Title (English)
                      <span className="dental-label__required">*</span>
                    </label>
                    <input
                      className="dental-input"
                      type="text"
                      placeholder="Enter sub-title in English"
                      value={emerSubTitle.en}
                      onChange={e => setEmerSubTitle(prev => ({ ...prev, en: e.target.value }))}
                      required
                    />
                  </div>
                  <div className="dental-form-group">
                    <label className="dental-label">
                      <MdTextFields />
                      Sub-Title (Kannada)
                      <span className="dental-label__required">*</span>
                    </label>
                    <input
                      className="dental-input"
                      type="text"
                      placeholder="ಉಪ ಶೀರ್ಷಿಕೆ ನಮೂದಿಸಿ"
                      value={emerSubTitle.kn}
                      onChange={e => setEmerSubTitle(prev => ({ ...prev, kn: e.target.value }))}
                      required
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Emergency Steps Section */}
          <div className="dental-section">
            <SectionHeader
              title="Emergency Steps"
              icon={<MdList />}
              open={stepsOpen}
              onToggle={() => setStepsOpen((p) => !p)}
            />
            {stepsOpen && (
              <div className="dental-section__body">
                {repeater.map((item, repeaterIndex) => (
                  <div key={repeaterIndex} className="dental-body-item">
                    <div className="dental-body-item__header">
                      <h4 className="dental-body-item__title">
                        <MdList /> Step {repeaterIndex + 1}
                      </h4>
                      <button
                        type="button"
                        className="dental-btn-danger"
                        onClick={() => removeRepeaterItem(repeaterIndex)}
                      >
                        <MdDelete /> Remove Step
                      </button>
                    </div>

                    <div className="dental-form-row">
                      <div className="dental-form-group">
                        <label className="dental-label">
                          <MdTextFields />
                          Step Title (English)
                          <span className="dental-label__required">*</span>
                        </label>
                        <input
                          className="dental-input"
                          type="text"
                          placeholder="Enter step title in English"
                          value={item.dental_emer_tab_title.en}
                          onChange={e => updateRepeaterTitle(repeaterIndex, 'en', e.target.value)}
                          required
                        />
                      </div>
                      <div className="dental-form-group">
                        <label className="dental-label">
                          <MdTextFields />
                          Step Title (Kannada)
                          <span className="dental-label__required">*</span>
                        </label>
                        <input
                          className="dental-input"
                          type="text"
                          placeholder="ಹಂತದ ಶೀರ್ಷಿಕೆ ನಮೂದಿಸಿ"
                          value={item.dental_emer_tab_title.kn}
                          onChange={e => updateRepeaterTitle(repeaterIndex, 'kn', e.target.value)}
                          required
                        />
                      </div>
                    </div>

                    {/* Descriptions */}
                    {item.denatl_emer_description_repeater.map((desc, descIndex) => (
                      <div key={descIndex} className="dental-nested-item">
                        <div className="dental-nested-item__header">
                          <h5 className="dental-nested-item__title">
                            Description {descIndex + 1}
                          </h5>
                          <button
                            type="button"
                            className="dental-btn-danger"
                            onClick={() => removeDescriptionFromRepeaterItem(repeaterIndex, descIndex)}
                          >
                            <MdDelete /> Remove
                          </button>
                        </div>

                        <div className="dental-form-row">
                          <div className="dental-form-group">
                            <label className="dental-label">
                              <MdTitle />
                              Heading (English)
                              <span className="dental-label__required">*</span>
                            </label>
                            <input
                              className="dental-input"
                              type="text"
                              placeholder="Enter heading in English"
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
                          <div className="dental-form-group">
                            <label className="dental-label">
                              <MdTitle />
                              Heading (Kannada)
                              <span className="dental-label__required">*</span>
                            </label>
                            <input
                              className="dental-input"
                              type="text"
                              placeholder="ಶೀರ್ಷಿಕೆ ನಮೂದಿಸಿ"
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

                        <div className="dental-form-row">
                          <div className="dental-form-group">
                            <label className="dental-label">
                              <MdDescription />
                              Paragraph (English)
                              <span className="dental-label__required">*</span>
                            </label>
                            <textarea
                              className="dental-textarea"
                              placeholder="Enter paragraph in English"
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
                          <div className="dental-form-group">
                            <label className="dental-label">
                              <MdDescription />
                              Paragraph (Kannada)
                              <span className="dental-label__required">*</span>
                            </label>
                            <textarea
                              className="dental-textarea"
                              placeholder="ಪ್ಯಾರಾಗ್ರಾಫ್ ನಮೂದಿಸಿ"
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
                      </div>
                    ))}

                    <button
                      type="button"
                      className="dental-add-btn"
                      onClick={() => addDescriptionToRepeaterItem(repeaterIndex)}
                    >
                      <MdAddCircleOutline /> Add Description
                    </button>
                  </div>
                ))}

                <button
                  type="button"
                  className="dental-add-btn"
                  onClick={addRepeaterItem}
                >
                  <MdAddCircleOutline /> Add Step
                </button>
              </div>
            )}
          </div>
        </div>

        {/* ── Right sidebar ────────────────────────────── */}
        <div className="dental-sidebar">

          {/* Title Image */}
          <div className="dental-section">
            <div className="dental-section__header">
              <h2 className="dental-section__title">
                <MdImage />
                &nbsp;Title Image
              </h2>
            </div>
            <div className="dental-section__body">
              {hasTitleImage ? (
                <div style={{ position: 'relative' }}>
                  <Image
                    src={titleImagePreview || titleImageUrl}
                    alt="Title"
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
                    className="dental-preview__remove"
                    onClick={handleDeleteTitleImage}
                    disabled={isDeletingTitleImage}
                  >
                    {isDeletingTitleImage ? (
                      <BeatLoader size={5} color="#fff" />
                    ) : (
                      <MdClose />
                    )}
                  </button>
                </div>
              ) : (
                <div className="dental-featured-zone">
                  <div className="dental-featured-zone__icon">
                    <MdCloudUpload />
                  </div>
                  <p className="dental-featured-zone__text">
                    Click or Drag to Upload Title Image
                  </p>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleFile(e, setTitleImageFile, setTitleImagePreview, setTitleImageUrl)}
                  />
                </div>
              )}
            </div>
          </div>

          {/* Footer actions */}
          <div className="dental-footer">
            <button
              type="button"
              className="dental-btn-cancel"
              onClick={() => router.back()}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="dental-btn-submit"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <span>Updating...</span>
                  <BeatLoader color="#fff" size={8} />
                </>
              ) : (
                'Update Emergency'
              )}
            </button>
          </div>
        </div>
      </div>
    </form>
  );
}
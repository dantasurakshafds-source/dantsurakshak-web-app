 

"use client";

import React, { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useCreateSliderMutation } from "@/(store)/services/slider/sliderApi";
import { BeatLoader } from "react-spinners";
import { uploadToCloudinary } from "@/utils/uploadToCloudinary";
import { useCloudinaryDelete } from "@/utils/useCloudinaryDelete";

import {
  MdImage,
  MdVideoLibrary,
  MdTextFields,
  MdDescription,
  MdAddCircleOutline,
  MdDelete,
  MdClose,
  MdCloudUpload,
  MdViewList,
} from "react-icons/md";

export type SBody = {
  image: string;
  text: { en: string; kn: string };
  description: { en: string; kn: string };
};

interface BodyItem {
  imageFile: File | null;
  imagePreview: string;
  imageUrl: string;
  text: { en: string; kn: string };
  description: { en: string; kn: string };
}

const AddBanner: React.FC = () => {
  const [createSlider, { isLoading: loading }] = useCreateSliderMutation();
  const { deleteFromCloudinary } = useCloudinaryDelete();
  const router = useRouter();

  // Section collapse states
  const [bannerOpen, setBannerOpen] = useState(true);
  const [videoOpen, setVideoOpen] = useState(true);
  const [textOpen, setTextOpen] = useState(true);
  const [bodyOpen, setBodyOpen] = useState(true);

  // Deletion loading states
  const [isDeletingBannerImage, setIsDeletingBannerImage] = useState(false);
  const [isDeletingBannerVideo, setIsDeletingBannerVideo] = useState(false);
  const [isDeletingBodyImage, setIsDeletingBodyImage] = useState<number | null>(
    null,
  );

  // Banner main media
  const [bannerImage, setBannerImage] = useState<File | null>(null);
  const [bannerImagePreview, setBannerImagePreview] = useState<string>("");
  const [bannerImageUrl, setBannerImageUrl] = useState<string>("");

  const [bannerVideo, setBannerVideo] = useState<File | null>(null);
  const [bannerVideoPreview, setBannerVideoPreview] = useState<string>("");
  const [bannerVideoUrl, setBannerVideoUrl] = useState<string>("");

  // Form fields
  const [text, setText] = useState({ en: "", kn: "" });
  const [description, setDescription] = useState({ en: "", kn: "" });

  // Body items
  const [bodyItems, setBodyItems] = useState<BodyItem[]>([
    {
      imageFile: null,
      imagePreview: "",
      imageUrl: "",
      text: { en: "", kn: "" },
      description: { en: "", kn: "" },
    },
  ]);

  /* ── Delete handlers ─────────────────────────────────────── */
  const handleDeleteBannerImage = async () => {
    setIsDeletingBannerImage(true);
    try {
      if (bannerImageUrl) {
        await deleteFromCloudinary(bannerImageUrl, { resourceType: "image" });
        setBannerImageUrl("");
      }
      if (bannerImagePreview) {
        URL.revokeObjectURL(bannerImagePreview);
        setBannerImagePreview("");
      }
      setBannerImage(null);
      toast.success("Banner image removed");
    } catch {
      toast.error("Failed to delete banner image");
    } finally {
      setIsDeletingBannerImage(false);
    }
  };

  const handleDeleteBannerVideo = async () => {
    setIsDeletingBannerVideo(true);
    try {
      if (bannerVideoUrl) {
        await deleteFromCloudinary(bannerVideoUrl, { resourceType: "video" });
        setBannerVideoUrl("");
      }
      if (bannerVideoPreview) {
        URL.revokeObjectURL(bannerVideoPreview);
        setBannerVideoPreview("");
      }
      setBannerVideo(null);
      toast.success("Banner video removed");
    } catch {
      toast.error("Failed to delete banner video");
    } finally {
      setIsDeletingBannerVideo(false);
    }
  };

  const handleDeleteBodyImage = async (idx: number) => {
    setIsDeletingBodyImage(idx);
    try {
      const item = bodyItems[idx];
      if (item.imageUrl)
        await deleteFromCloudinary(item.imageUrl, { resourceType: "image" });
      if (item.imagePreview) URL.revokeObjectURL(item.imagePreview);
      setBodyItems((prev) => {
        const updated = [...prev];
        updated[idx] = {
          ...updated[idx],
          imageUrl: "",
          imagePreview: "",
          imageFile: null,
        };
        return updated;
      });
      toast.success("Body image removed");
    } catch {
      toast.error("Failed to delete body image");
    } finally {
      setIsDeletingBodyImage(null);
    }
  };

  const handleDeleteBodyItem = async (idx: number) => {
    const item = bodyItems[idx];
    if (item.imageUrl)
      await deleteFromCloudinary(item.imageUrl, { resourceType: "image" });
    if (item.imagePreview) URL.revokeObjectURL(item.imagePreview);
    setBodyItems((prev) => prev.filter((_, i) => i !== idx));
  };

  /* ── Input handlers ──────────────────────────────────────── */
  const handleBannerImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image must be under 5MB");
      e.target.value = "";
      return;
    }
    if (!file.type.startsWith("image/")) {
      toast.error("Please upload a valid image");
      e.target.value = "";
      return;
    }
    setBannerImage(file);
    setBannerImagePreview(URL.createObjectURL(file));
    setBannerImageUrl("");
  };

  const handleBannerVideoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 50 * 1024 * 1024) {
      toast.error("Video must be under 50MB");
      e.target.value = "";
      return;
    }
    if (!file.type.startsWith("video/")) {
      toast.error("Please upload a valid video");
      e.target.value = "";
      return;
    }
    setBannerVideo(file);
    setBannerVideoPreview(URL.createObjectURL(file));
    setBannerVideoUrl("");
  };

  const handleBodyImageChange = (idx: number, file: File | null) => {
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image must be under 5MB");
      return;
    }
    if (!file.type.startsWith("image/")) {
      toast.error("Please upload a valid image");
      return;
    }
    const previewUrl = URL.createObjectURL(file);
    setBodyItems((prev) => {
      const updated = [...prev];
      updated[idx] = {
        ...updated[idx],
        imageFile: file,
        imagePreview: previewUrl,
        imageUrl: "",
      };
      return updated;
    });
  };

  const handleBodyChange = (
    idx: number,
    field: "text" | "description",
    lang: "en" | "kn",
    val: string,
  ) => {
    setBodyItems((prev) => {
      const updated = [...prev];
      updated[idx] = {
        ...updated[idx],
        [field]: { ...updated[idx][field], [lang]: val },
      };
      return updated;
    });
  };

  const addBodyItem = () => {
    setBodyItems((prev) => [
      ...prev,
      {
        imageFile: null,
        imagePreview: "",
        imageUrl: "",
        text: { en: "", kn: "" },
        description: { en: "", kn: "" },
      },
    ]);
  };

  /* ── Submit ──────────────────────────────────────────────── */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!bannerImage && !bannerImageUrl && !bannerImagePreview) {
      toast.error("Banner image is required");
      return;
    }
    if (!text.en || !text.kn) {
      toast.error("Both English and Kannada text are required");
      return;
    }
    if (!description.en || !description.kn) {
      toast.error("Both English and Kannada description are required");
      return;
    }

    for (let i = 0; i < bodyItems.length; i++) {
      const item = bodyItems[i];
      if (!item.text.en || !item.text.kn) {
        toast.error(`Body item ${i + 1}: text is required in both languages`);
        return;
      }
      if (!item.description.en || !item.description.kn) {
        toast.error(
          `Body item ${i + 1}: description is required in both languages`,
        );
        return;
      }
    }

    try {
      let finalImageUrl = bannerImageUrl;
      if (bannerImage) {
        const res = await uploadToCloudinary(bannerImage, "image");
        finalImageUrl = res.secure_url;
      }

      let finalVideoUrl = bannerVideoUrl;
      if (bannerVideo) {
        const res = await uploadToCloudinary(bannerVideo, "video");
        finalVideoUrl = res.secure_url;
      }

      const body: SBody[] = await Promise.all(
        bodyItems.map(async (item) => {
          let imageUrl = item.imageUrl;
          if (item.imageFile) {
            const res = await uploadToCloudinary(item.imageFile, "image");
            imageUrl = res.secure_url;
          }
          return {
            image: imageUrl,
            text: item.text,
            description: item.description,
          };
        }),
      );

      const payload = new FormData();
      payload.append("sliderImage", finalImageUrl);
      if (finalVideoUrl) payload.append("sliderVideo", finalVideoUrl);
      payload.append("text", JSON.stringify(text));
      payload.append("description", JSON.stringify(description));
      payload.append("body", JSON.stringify(body));

      await createSlider(payload).unwrap();
      toast.success("Banner created successfully");
      router.push("/super-admin/banners");
    } catch (err: unknown) {
      const error = err as { data?: { message?: string }; status?: number };
      if (error?.data?.message) toast.error(error.data.message);
      else if (error?.status === 400)
        toast.error("Bad request: check all fields");
      else if (error?.status === 500)
        toast.error("Server error, try again later");
      else toast.error("Failed to create banner");
    }
  };

  /* ── UI helpers ──────────────────────────────────────────── */
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
    <div className="banner-section__header">
      <h2 className="banner-section__title">
        {icon}&nbsp;{title}
      </h2>
      <button
        type="button"
        className="banner-section__toggle"
        onClick={onToggle}
      >
        {open ? "−" : "+"}
      </button>
    </div>
  );

  const hasImage = bannerImageUrl || bannerImagePreview;

  return (
    <form onSubmit={handleSubmit} className="banners-form">
      <div className="banners-layout">
        {/* ── Left column ─────────────────────────────── */}
        <div className="banners-main">
          {/* Banner Image Section */}
          <div className="banner-section">
            {bannerOpen && (
              <div className="banner-section__body">
                {/* Preview */}
                {hasImage && (
                  <div
                    className="banner-preview"
                    style={{ display: "block", marginBottom: 10 }}
                  >
                    <Image
                      src={bannerImagePreview || bannerImageUrl}
                      alt="Banner preview"
                      width={600}
                      height={160}
                      className="banner-preview__img"
                      style={{
                        objectFit: "cover",
                        borderRadius: 5,
                        display: "block",
                      }}
                    />
                    <button
                      type="button"
                      className="banner-preview__remove"
                      onClick={handleDeleteBannerImage}
                      disabled={isDeletingBannerImage}
                    >
                      {isDeletingBannerImage ? (
                        <BeatLoader size={5} color="#fff" />
                      ) : (
                        <MdClose />
                      )}
                    </button>
                  </div>
                )}

                {/* Upload zone */}
                {!hasImage && (
                  <div className="banner-upload-zone">
                    <div className="banner-upload-zone__icon">
                      <MdCloudUpload />
                    </div>
                    <p className="banner-upload-zone__text">
                      Click or Drag to Upload Banner Image
                    </p>
                    <p className="banner-upload-zone__hint">
                      JPG, PNG up to 5MB
                    </p>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleBannerImageChange}
                      disabled={isDeletingBannerImage}
                      required={!hasImage}
                    />
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Banner Video Section */}
          <div className="banner-section">
            <SectionHeader
              title="Banner Video"
              icon={<MdVideoLibrary />}
              open={videoOpen}
              onToggle={() => setVideoOpen((p) => !p)}
            />
            {videoOpen && (
              <div className="banner-section__body">
                {bannerVideoUrl || bannerVideoPreview ? (
                  <div
                    className="banner-preview"
                    style={{ display: "block", marginBottom: 10 }}
                  >
                    <video
                      src={bannerVideoPreview || bannerVideoUrl}
                      className="banner-preview__video"
                      controls
                    />
                    <button
                      type="button"
                      className="banner-preview__remove"
                      onClick={handleDeleteBannerVideo}
                      disabled={isDeletingBannerVideo}
                    >
                      {isDeletingBannerVideo ? (
                        <BeatLoader size={5} color="#fff" />
                      ) : (
                        <MdClose />
                      )}
                    </button>
                  </div>
                ) : (
                  <div className="banner-upload-zone">
                    <div className="banner-upload-zone__icon">
                      <MdVideoLibrary />
                    </div>
                    <p className="banner-upload-zone__text">
                      Click or Drag to Upload Video
                    </p>
                    <p className="banner-upload-zone__hint">
                      MP4, WEBM up to 50MB &nbsp;·&nbsp; Optional
                    </p>
                    <input
                      type="file"
                      accept="video/mp4,video/webm"
                      onChange={handleBannerVideoChange}
                      disabled={isDeletingBannerVideo}
                    />
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Text & Description Section */}
          <div className="banner-section">
            <SectionHeader
              title="Text & Description"
              icon={<MdTextFields />}
              open={textOpen}
              onToggle={() => setTextOpen((p) => !p)}
            />
            {textOpen && (
              <div className="banner-section__body">
                <div className="banner-form-row">
                  <div className="banner-form-group">
                    <label className="banner-label">
                      <MdTextFields />
                      Text (English){" "}
                      <span className="banner-label__required">*</span>
                    </label>
                    <input
                      className="banner-input"
                      type="text"
                      placeholder="Enter banner title in English"
                      value={text.en}
                      onChange={(e) => setText({ ...text, en: e.target.value })}
                      required
                    />
                  </div>
                  <div className="banner-form-group">
                    <label className="banner-label">
                      <MdTextFields />
                      Text (Kannada){" "}
                      <span className="banner-label__required">*</span>
                    </label>
                    <input
                      className="banner-input"
                      type="text"
                      placeholder="ಬ್ಯಾನರ್ ಶೀರ್ಷಿಕೆ ನಮೂದಿಸಿ"
                      value={text.kn}
                      onChange={(e) => setText({ ...text, kn: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div className="banner-form-row">
                  <div className="banner-form-group">
                    <label className="banner-label">
                      <MdDescription />
                      Description (English){" "}
                      <span className="banner-label__required">*</span>
                    </label>
                    <textarea
                      className="banner-textarea"
                      placeholder="Enter description in English"
                      value={description.en}
                      onChange={(e) =>
                        setDescription({ ...description, en: e.target.value })
                      }
                      required
                    />
                  </div>
                  <div className="banner-form-group">
                    <label className="banner-label">
                      <MdDescription />
                      Description (Kannada){" "}
                      <span className="banner-label__required">*</span>
                    </label>
                    <textarea
                      className="banner-textarea"
                      placeholder="ವಿವರಣೆ ನಮೂದಿಸಿ"
                      value={description.kn}
                      onChange={(e) =>
                        setDescription({ ...description, kn: e.target.value })
                      }
                      required
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Body Items Section */}
          <div className="banner-section">
            <SectionHeader
              title="Body Items"
              icon={<MdViewList />}
              open={bodyOpen}
              onToggle={() => setBodyOpen((p) => !p)}
            />
            {bodyOpen && (
              <div className="banner-section__body">
                <button
                  type="button"
                  className="banner-add-btn"
                  onClick={addBodyItem}
                >
                  <MdAddCircleOutline /> Add Body Item
                </button>

                {bodyItems.map((item, idx) => (
                  <div key={idx} className="banner-body-item">
                    <div className="banner-body-item__header">
                      <h4 className="banner-body-item__title">
                        <MdViewList /> Body Item {idx + 1}
                      </h4>
                      <button
                        type="button"
                        className="banner-btn-danger"
                        onClick={() => handleDeleteBodyItem(idx)}
                      >
                        <MdDelete /> Remove
                      </button>
                    </div>

                    <div className="banner-form-row">
                      <div className="banner-form-group">
                        <label className="banner-label">
                          <MdTextFields />
                          Text (English){" "}
                          <span className="banner-label__required">*</span>
                        </label>
                        <input
                          className="banner-input"
                          type="text"
                          placeholder="Body title in English"
                          value={item.text.en}
                          onChange={(e) =>
                            handleBodyChange(idx, "text", "en", e.target.value)
                          }
                          required
                        />
                      </div>
                      <div className="banner-form-group">
                        <label className="banner-label">
                          <MdTextFields />
                          Text (Kannada){" "}
                          <span className="banner-label__required">*</span>
                        </label>
                        <input
                          className="banner-input"
                          type="text"
                          placeholder="ಶೀರ್ಷಿಕೆ ನಮೂದಿಸಿ"
                          value={item.text.kn}
                          onChange={(e) =>
                            handleBodyChange(idx, "text", "kn", e.target.value)
                          }
                          required
                        />
                      </div>
                    </div>

                    <div className="banner-form-row">
                      <div className="banner-form-group">
                        <label className="banner-label">
                          <MdDescription />
                          Description (English){" "}
                          <span className="banner-label__required">*</span>
                        </label>
                        <input
                          className="banner-input"
                          type="text"
                          placeholder="Body description in English"
                          value={item.description.en}
                          onChange={(e) =>
                            handleBodyChange(
                              idx,
                              "description",
                              "en",
                              e.target.value,
                            )
                          }
                          required
                        />
                      </div>
                      <div className="banner-form-group">
                        <label className="banner-label">
                          <MdDescription />
                          Description (Kannada){" "}
                          <span className="banner-label__required">*</span>
                        </label>
                        <input
                          className="banner-input"
                          type="text"
                          placeholder="ವಿವರಣೆ ನಮೂದಿಸಿ"
                          value={item.description.kn}
                          onChange={(e) =>
                            handleBodyChange(
                              idx,
                              "description",
                              "kn",
                              e.target.value,
                            )
                          }
                          required
                        />
                      </div>
                    </div>

                    {/* Body image */}
                    <div className="banner-form-group">
                      <label className="banner-label">
                        <MdImage />
                        Body Image{" "}
                        <span className="banner-label__optional">
                          (optional)
                        </span>
                      </label>

                      {item.imageUrl || item.imagePreview ? (
                        <div
                          style={{
                            display: "inline-flex",
                            position: "relative",
                          }}
                        >
                          <Image
                            src={item.imagePreview || item.imageUrl}
                            alt="Body item"
                            width={100}
                            height={80}
                            className="banner-preview__img banner-preview__img--small"
                            style={{ objectFit: "cover", borderRadius: 5 }}
                          />
                          <button
                            type="button"
                            className="banner-preview__remove"
                            onClick={() => handleDeleteBodyImage(idx)}
                            disabled={isDeletingBodyImage === idx}
                          >
                            {isDeletingBodyImage === idx ? (
                              <BeatLoader size={5} color="#fff" />
                            ) : (
                              <MdClose />
                            )}
                          </button>
                        </div>
                      ) : (
                        <div
                          className="banner-upload-zone"
                          style={{ padding: "16px" }}
                        >
                          <div
                            className="banner-upload-zone__icon"
                            style={{ fontSize: 20 }}
                          >
                            <MdImage />
                          </div>
                          <p className="banner-upload-zone__text">
                            Click to upload body image
                          </p>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) =>
                              handleBodyImageChange(
                                idx,
                                e.target.files?.[0] || null,
                              )
                            }
                            disabled={isDeletingBodyImage === idx}
                          />
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* ── Right sidebar ────────────────────────────── */}
        <div className="banners-sidebar">
          {/* Featured image preview */}
          <div className="banner-section">
            <div className="banner-section__header">
              <h2 className="banner-section__title">
                <MdImage />
                &nbsp;Featured Image
              </h2>
            </div>
            <div className="banner-section__body">
              {hasImage ? (
                <div style={{ position: "relative" }}>
                  <Image
                    src={bannerImagePreview || bannerImageUrl}
                    alt="Featured"
                    width={280}
                    height={160}
                    style={{
                      width: "100%",
                      height: 160,
                      objectFit: "cover",
                      borderRadius: 5,
                      display: "block",
                    }}
                  />
                  <button
                    type="button"
                    className="banner-preview__remove"
                    onClick={handleDeleteBannerImage}
                    disabled={isDeletingBannerImage}
                  >
                    {isDeletingBannerImage ? (
                      <BeatLoader size={5} color="#fff" />
                    ) : (
                      <MdClose />
                    )}
                  </button>
                </div>
              ) : (
                <div className="banner-featured-zone">
                  <div className="banner-featured-zone__icon">
                    <MdCloudUpload />
                  </div>
                  <p className="banner-featured-zone__text">
                    Click or Drag to Upload Featured Image
                  </p>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleBannerImageChange}
                  />
                </div>
              )}
            </div>
          </div>

          {/* Footer actions */}
          <div className="banners-footer">
            <button
              type="button"
              className="banner-btn-cancel"
              onClick={() => router.push("/super-admin/banners")}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="banner-btn-submit"
              disabled={loading}
            >
              {loading ? (
                <>
                  <span>Saving…</span>
                  <BeatLoader color="#fff" size={8} />
                </>
              ) : (
                "Save Banner"
              )}
            </button>
          </div>
        </div>
      </div>
    </form>
  );
};

export default AddBanner;

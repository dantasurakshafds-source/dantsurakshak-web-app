"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import OvalLoader from "@/(common)/OvalLoader";
import { useCreateTextMutation } from "@/(store)/services/text-slider/textSliderApi";
import { MdTextFields, MdCampaign } from "react-icons/md";

type BilingualField = { en: string; kn: string };

const AddAnnouncement: React.FC = () => {
    const [sliderText, setSliderText] = useState<BilingualField>({ en: "", kn: "" });
    const [createText, { isLoading }] = useCreateTextMutation();
    const router = useRouter();

    // Section collapse state
    const [mainInfoOpen, setMainInfoOpen] = useState(true);

    const handleBilingualFieldChange = (lang: "en" | "kn", value: string) =>
        setSliderText((prev) => ({ ...prev, [lang]: value }));

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!sliderText.en.trim() || !sliderText.kn.trim()) {
            toast.error("Both EN and KN fields are required");
            return;
        }
        const fd = new FormData();
        fd.append("slider_text", JSON.stringify(sliderText));
        try {
            const newSlide = await createText(fd).unwrap();
            if (newSlide) {
                toast.success("Announcement added successfully");
                router.back();
            }
        } catch (err) {
            if (err instanceof Error) {
                toast.error("Failed to add announcement");
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
        <div className="announcement-section__header">
            <h2 className="announcement-section__title">
                {icon} {title}
            </h2>
            <button
                type="button"
                className="announcement-section__toggle"
                onClick={onToggle}
            >
                {open ? "−" : "+"}
            </button>
        </div>
    );

    return (
        <form onSubmit={handleSubmit} className="announcement-form">
            <div className="announcement-layout">
                {/* ── Left column ─────────────────────────────── */}
                <div className="announcement-main">
                    {/* Main Information Section */}
                    <div className="announcement-section">
                        <SectionHeader
                            title="Announcement Text"
                            icon={<MdCampaign />}
                            open={mainInfoOpen}
                            onToggle={() => setMainInfoOpen((p) => !p)}
                        />
                        {mainInfoOpen && (
                            <div className="announcement-section__body">
                                <div className="announcement-form-row">
                                    <div className="announcement-form-group">
                                        <label className="announcement-label">
                                            <MdTextFields />
                                            Slider Text (English)
                                            <span className="announcement-label__required">*</span>
                                        </label>
                                        <input
                                            className="announcement-input"
                                            type="text"
                                            placeholder="Enter announcement text in English"
                                            value={sliderText.en}
                                            onChange={(e) => handleBilingualFieldChange("en", e.target.value)}
                                            required
                                        />
                                    </div>
                                    <div className="announcement-form-group">
                                        <label className="announcement-label">
                                            <MdTextFields />
                                            Slider Text (Kannada)
                                            <span className="announcement-label__required">*</span>
                                        </label>
                                        <input
                                            className="announcement-input"
                                            type="text"
                                            placeholder="ಪ್ರಕಟಣೆ ಪಠ್ಯ ನಮೂದಿಸಿ"
                                            value={sliderText.kn}
                                            onChange={(e) => handleBilingualFieldChange("kn", e.target.value)}
                                            required
                                        />
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* ── Right sidebar ────────────────────────────── */}
                <div className="announcement-sidebar">
                    {/* Info Card */}
                    <div className="announcement-section">
                        <div className="announcement-section__header">
                            <h2 className="announcement-section__title">
                                <MdCampaign />
                                &nbsp;Information
                            </h2>
                        </div>
                        <div className="announcement-section__body">
                            <p style={{ fontSize: '14px', color: '#666', lineHeight: 1.6, margin: 0 }}>
                                Add the announcement text that will be displayed in the slider.
                                Both English and Kannada translations are required.
                            </p>
                        </div>
                    </div>

                    {/* Footer actions */}
                    <div className="announcement-footer">
                        <button
                            type="button"
                            className="announcement-btn-cancel"
                            onClick={() => router.back()}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="announcement-btn-submit"
                            disabled={isLoading}
                            style={{ fontWeight: 600 }}
                        >
                            {isLoading ? (
                                <>
                                    <span style={{ fontWeight: 600 }}>Adding...</span>
                                    <OvalLoader height="20" width="20" color="#ffffff" strokeWidth={5} strokeWidthSecondary={5} ariaLabel="oval-loading" />
                                </>
                            ) : (
                                "Add Announcement"
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </form>
    );
};

export default AddAnnouncement;
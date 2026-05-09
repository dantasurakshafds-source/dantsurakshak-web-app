"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { BeatLoader } from "react-spinners";
import { useGetSingleTextQuery, useUpdateTextMutation } from "@/(store)/services/text-slider/textSliderApi";
import Loader from "@/(common)/Loader";
import { MdTextFields, MdCampaign } from "react-icons/md";

type BilingualField = { en: string; kn: string };

interface UpdateTextSliderProps {
    id: string;
}

const UpdateAnnouncement = ({ id }: UpdateTextSliderProps) => {
    const router = useRouter();

    const {
        data: slideWrapper,
        isLoading: fetching,
        isError,
    } = useGetSingleTextQuery({ id });
    const [updateText, { isLoading: updating }] = useUpdateTextMutation();
    const [sliderText, setSliderText] = useState<BilingualField>({
        en: "",
        kn: "",
    });

    // Section collapse state
    const [mainInfoOpen, setMainInfoOpen] = useState(true);

    const existing =
        //@ts-expect-error ignore this error
        slideWrapper?.result?.slider_text ?? ({} as BilingualField);

    useEffect(() => {
        if (existing.en || existing.kn) {
            setSliderText({
                en: existing.en,
                kn: existing.kn,
            });
        }
    }, [existing.en, existing.kn]);

    const handleChange = (lang: "en" | "kn", value: string) =>
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
            await updateText({ id, formData: fd }).unwrap();
            toast.success("Announcement updated successfully");
            router.back();
        } catch (err) {
            if (err instanceof Error) {
                toast.error("Failed to update announcement");
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

    if (fetching) {
        return (
            <div className="flex justify-center items-center h-64">
                <Loader />
            </div>
        );
    }

    if (isError) {
        return <div className="text-center text-red-500 p-8">Error loading announcement data.</div>;
    }

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
                                            onChange={(e) => handleChange("en", e.target.value)}
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
                                            onChange={(e) => handleChange("kn", e.target.value)}
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
                                Update the announcement text that will be displayed in the slider.
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
                            disabled={updating}
                        >
                            {updating ? (
                                <>
                                    <span>Updating...</span>
                                    <BeatLoader color="#fff" size={8} />
                                </>
                            ) : (
                                "Update Announcement"
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </form>
    );
};

export default UpdateAnnouncement;
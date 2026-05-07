"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { BeatLoader } from "react-spinners";
import { useCreateTextMutation } from "@/(store)/services/text-slider/textSliderApi";
type BilingualField = { en: string; kn: string };
const AddTextSlider: React.FC = () => {
    const [sliderText, setSliderText] = useState<BilingualField>({ en: "", kn: "" });
    const [createText, { isLoading }] = useCreateTextMutation();
    const router = useRouter();
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
                toast.success("Text Slider created successfully");
                router.push("/super-admin/text-slider");
            }
        } catch (err) {
            if (err instanceof Error) {
                toast.error("Failed to create text slider");
            }
        }
    };
    return (
        <form onSubmit={handleSubmit} className="form-container" id="create_text_slier">
            <div className="add_text_slider">
                <div className="add_text_grid">
                    <label>Slider Text (EN):*</label>
                    <input
                        type="text"
                        placeholder="en"
                        value={sliderText.en}
                        onChange={(e) => handleBilingualFieldChange("en", e.target.value)}
                        required
                    />
                </div>
                <div className="add_text_grid">
                    <label>Slider Text (KN):*</label>
                    <input
                        type="text"
                        placeholder="kn"
                        value={sliderText.kn}
                        onChange={(e) => handleBilingualFieldChange("kn", e.target.value)}
                        required
                    />
                </div>
            </div>
            <hr />
            <div className="button-container">
                <button
                    type="submit"
                    className="habits-health-form-submit-button"
                    disabled={isLoading}
                >
                    {isLoading ? (
                        <>
                            Submit Text Slider <BeatLoader size={8} color="#fff" />
                        </>
                    ) : (
                        "Create Text Slider"
                    )}
                </button>
            </div>
        </form>
    );
};

export default AddTextSlider;

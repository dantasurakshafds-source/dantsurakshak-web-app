"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { BeatLoader } from "react-spinners";
import {
    useGetSingleTextQuery,
    useUpdateTextMutation,
} from "@/(store)/services/text-slider/textSliderApi";
import Loader from "@/(common)/Loader";

type BilingualField = { en: string; kn: string };

interface UpdateTextSliderProps {
    id: string;
}

const UpdateTextSlider = ({ id }: UpdateTextSliderProps) => {
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
    }, [
        existing.en,
        existing.kn,
    ]);
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
            toast.success("Text Slider updated successfully");
            router.push("/super-admin/text-slider");
        } catch (err) {
            if (err instanceof Error) {
                toast.error("Failed to update");
            }
        }
    };
    if (fetching) {
        return (
            <div className="button-container">
                Loading… <Loader />
            </div>
        );
    }
    if (isError) {
        return <div className="button-container">Error loading slider data.</div>;
    }
    return (
        <form onSubmit={handleSubmit} className="form-container">
            <div className="add_text_slider">
                <div className="add_text_grid">
                    <label>Slider Text (EN):*</label>
                    <input
                        type="text"
                        placeholder="en"
                        value={sliderText.en}
                        onChange={(e) => handleChange("en", e.target.value)}
                        required
                    />
                </div>
                <div className="add_text_grid">
                    <label>Slider Text (KN):*</label>
                    <input
                        type="text"
                        placeholder="kn"
                        value={sliderText.kn}
                        onChange={(e) => handleChange("kn", e.target.value)}
                        required
                    />
                </div>
            </div>
            <hr />
            <div className="button-container">
                <button
                    type="submit"
                    className="habits-health-form-submit-button"
                    disabled={updating}
                >
                    {updating ? (
                        <>
                            Updating… <BeatLoader size={8} color="#fff" />
                        </>
                    ) : (
                        "Update Text Slider"
                    )}
                </button>
            </div>
        </form>
    );
};

export default UpdateTextSlider;

import React from "react";
import type { Metadata } from "next";
import { dbConnect } from "@/database/database";
import TermsAndConditionsModel from "@/models/TermsAndConditions";
import PublicLegalLayout, { LegalSection } from "@/components/PublicLegalLayout";

export const metadata: Metadata = {
  title: "Terms and Conditions | Danta Surakshak - MSRUAS",
  description:
    "Official Terms and Conditions for Danta Surakshak Oral Health App, Faculty of Dental Sciences, Ramaiah University of Applied Sciences (MSRUAS).",
};

// Revalidate every 60 seconds so changes in Super Admin reflect quickly
export const revalidate = 60;

async function getTermsData() {
  try {
    await dbConnect();
    const termsDoc = (await TermsAndConditionsModel.findOne()
      .sort({ updatedAt: -1 })
      .lean()) as unknown as {
      terms_repeater?: Array<{
        term_heading?: { en?: string; kn?: string };
        term_description?: { en?: string; kn?: string };
      }>;
      updatedAt?: Date | string;
    } | null;

    if (!termsDoc || !termsDoc.terms_repeater) {
      return { sections: [], updatedAt: undefined };
    }

    const sections: LegalSection[] = termsDoc.terms_repeater.map(
      (item: {
        term_heading?: { en?: string; kn?: string };
        term_description?: { en?: string; kn?: string };
      }) => ({
        heading: {
          en: item.term_heading?.en || "",
          kn: item.term_heading?.kn || "",
        },
        description: {
          en: item.term_description?.en || "",
          kn: item.term_description?.kn || "",
        },
      })
    );

    return {
      sections,
      updatedAt: termsDoc.updatedAt ? String(termsDoc.updatedAt) : undefined,
    };
  } catch (error) {
    console.error("Error fetching terms and conditions data:", error);
    return { sections: [], updatedAt: undefined };
  }
}

export default async function TermsConditionsPage() {
  const { sections, updatedAt } = await getTermsData();

  return (
    <PublicLegalLayout
      pageType="terms"
      titleEn="Terms and Conditions"
      titleKn="ನಿಯಮಗಳು ಮತ್ತು ಷರತ್ತುಗಳು"
      updatedAt={updatedAt}
      sections={sections}
    />
  );
}

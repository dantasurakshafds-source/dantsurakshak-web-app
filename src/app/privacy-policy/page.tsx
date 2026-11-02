import React from "react";
import type { Metadata } from "next";
import { dbConnect } from "@/database/database";
import PrivacyPolicyModel from "@/models/PrivacyPolicy";
import PublicLegalLayout, { LegalSection } from "@/components/PublicLegalLayout";

export const metadata: Metadata = {
  title: "Privacy Policy | Danta Surakshak - MSRUAS",
  description:
    "Official Privacy Policy for Danta Surakshak Oral Health App, Faculty of Dental Sciences, Ramaiah University of Applied Sciences (MSRUAS).",
};

// Revalidate every 60 seconds so changes in Super Admin reflect quickly
export const revalidate = 60;

async function getPrivacyPolicyData() {
  try {
    await dbConnect();
    const policyDoc = (await PrivacyPolicyModel.findOne()
      .sort({ updatedAt: -1 })
      .lean()) as unknown as {
      privacy_policy_repeater?: Array<{
        privacy_heading?: { en?: string; kn?: string };
        privacy_description?: { en?: string; kn?: string };
      }>;
      updatedAt?: Date | string;
    } | null;

    if (!policyDoc || !policyDoc.privacy_policy_repeater) {
      return { sections: [], updatedAt: undefined };
    }

    const sections: LegalSection[] = policyDoc.privacy_policy_repeater.map(
      (item: {
        privacy_heading?: { en?: string; kn?: string };
        privacy_description?: { en?: string; kn?: string };
      }) => ({
        heading: {
          en: item.privacy_heading?.en || "",
          kn: item.privacy_heading?.kn || "",
        },
        description: {
          en: item.privacy_description?.en || "",
          kn: item.privacy_description?.kn || "",
        },
      })
    );

    return {
      sections,
      updatedAt: policyDoc.updatedAt ? String(policyDoc.updatedAt) : undefined,
    };
  } catch (error) {
    console.error("Error fetching privacy policy data:", error);
    return { sections: [], updatedAt: undefined };
  }
}

export default async function PrivacyPolicyPage() {
  const { sections, updatedAt } = await getPrivacyPolicyData();

  return (
    <PublicLegalLayout
      pageType="privacy"
      titleEn="Privacy Policy"
      titleKn="ಗೌಪ್ಯತಾ ನೀತಿ"
      updatedAt={updatedAt}
      sections={sections}
    />
  );
}

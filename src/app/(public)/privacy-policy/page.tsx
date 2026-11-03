"use client";

import React, { useEffect, useState } from "react";
import PublicLegalLayout, { LegalSection } from "@/components/PublicLegalLayout";

interface RepeaterItem {
  privacy_heading?: { en?: string; kn?: string };
  privacy_description?: { en?: string; kn?: string };
}

interface PolicyDoc {
  _id?: string;
  privacy_policy_repeater?: RepeaterItem[];
  updatedAt?: string | Date;
}

export default function PrivacyPolicyPage() {
  const [sections, setSections] = useState<LegalSection[]>([]);
  const [updatedAt, setUpdatedAt] = useState<string | undefined>();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    async function fetchPolicyFromApi() {
      try {
        setIsLoading(true);
        // Call the built API endpoint for privacy policy
        const res = await fetch("/api/privacy-policy/get?page=1&limit=100");
        const json = await res.json();

        if (json.success && Array.isArray(json.result) && json.result.length > 0) {
          // Find the latest policy document by updatedAt
          const sorted = [...json.result].sort((a: PolicyDoc, b: PolicyDoc) => {
            const timeA = new Date(a.updatedAt || 0).getTime();
            const timeB = new Date(b.updatedAt || 0).getTime();
            return timeB - timeA;
          });

          const latestDoc = sorted[0];

          if (latestDoc?.privacy_policy_repeater && Array.isArray(latestDoc.privacy_policy_repeater)) {
            const mapped: LegalSection[] = latestDoc.privacy_policy_repeater.map((item: RepeaterItem) => ({
              heading: {
                en: item.privacy_heading?.en || "",
                kn: item.privacy_heading?.kn || "",
              },
              description: {
                en: item.privacy_description?.en || "",
                kn: item.privacy_description?.kn || "",
              },
            }));

            if (isMounted) {
              setSections(mapped);
            }
          }

          if (isMounted && latestDoc?.updatedAt) {
            setUpdatedAt(String(latestDoc.updatedAt));
          }
        }
      } catch (error) {
        console.error("Error fetching privacy policy from API:", error);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    fetchPolicyFromApi();

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <PublicLegalLayout
      pageType="privacy"
      titleEn="Privacy Policy"
      titleKn="ಗೌಪ್ಯತಾ ನೀತಿ"
      updatedAt={updatedAt}
      sections={sections}
      isLoading={isLoading}
    />
  );
}

"use client";

import React, { useEffect, useState } from "react";
import PublicLegalLayout, { LegalSection } from "@/components/PublicLegalLayout";

interface RepeaterItem {
  term_heading?: { en?: string; kn?: string };
  term_description?: { en?: string; kn?: string };
}

interface TermsDoc {
  _id?: string;
  terms_repeater?: RepeaterItem[];
  updatedAt?: string | Date;
}

export default function TermsConditionsPage() {
  const [sections, setSections] = useState<LegalSection[]>([]);
  const [updatedAt, setUpdatedAt] = useState<string | undefined>();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    async function fetchTermsFromApi() {
      try {
        setIsLoading(true);
        // Call the built API endpoint for terms & conditions
        const res = await fetch("/api/terms/get?page=1&limit=100");
        const json = await res.json();

        if (json.success && Array.isArray(json.result) && json.result.length > 0) {
          // Find the latest terms document by updatedAt
          const sorted = [...json.result].sort((a: TermsDoc, b: TermsDoc) => {
            const timeA = new Date(a.updatedAt || 0).getTime();
            const timeB = new Date(b.updatedAt || 0).getTime();
            return timeB - timeA;
          });

          const latestDoc = sorted[0];

          if (latestDoc?.terms_repeater && Array.isArray(latestDoc.terms_repeater)) {
            const mapped: LegalSection[] = latestDoc.terms_repeater.map((item: RepeaterItem) => ({
              heading: {
                en: item.term_heading?.en || "",
                kn: item.term_heading?.kn || "",
              },
              description: {
                en: item.term_description?.en || "",
                kn: item.term_description?.kn || "",
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
        console.error("Error fetching terms and conditions from API:", error);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    fetchTermsFromApi();

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <PublicLegalLayout
      pageType="terms"
      titleEn="Terms and Conditions"
      titleKn="ನಿಯಮಗಳು ಮತ್ತು ಷರತ್ತುಗಳು"
      updatedAt={updatedAt}
      sections={sections}
      isLoading={isLoading}
    />
  );
}

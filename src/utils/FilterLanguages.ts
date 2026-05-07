import { NextRequest } from "next/server";
import { EN, KN } from "./Constants";

export const getLanguage = (req: NextRequest): 'en' | 'kn' | null => {
    const lang = req.nextUrl.searchParams.get('lang');
    if (lang === EN || lang === KN) return lang;
    return null;  
  };
  
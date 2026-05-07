import { NextRequest, NextResponse } from "next/server";
import { dbConnect } from "@/database/database";
import Questionnaire from "@/models/Questionnaire";
import { ReusePaginationMethod } from "@/utils/Pagination";
import { QuestionnaireTypes } from "@/utils/Types";

 
function escapeRegex(input: string) {
  return input.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export async function GET(req: NextRequest) {
  try {
    await dbConnect();

    const { page, limit, skip } = ReusePaginationMethod(req);
    const sp = req.nextUrl.searchParams;

    const name = sp.get("name");
    const gender = sp.get("gender");
    const ageStr = sp.get("age");
    const phoneNumber = sp.get("phoneNumber");
    const caseNumber = sp.get("case_number");
    const assignTo = sp.get("assignTo");

    const filter: Record<string,string> = {};
    const badInputResponse = () =>
      NextResponse.json({
        status: 200,
        success: false,
        message: "please provide valid input to get the result",
      });

     
    if (sp.has("name")) {
      const v = (name ?? "").trim();
      if (!v) return badInputResponse();
      //@ts-expect-error ignore this message
      filter.name = { $regex: escapeRegex(v), $options: "i" };
    }

 
    if (sp.has("gender")) {
      const v = (gender ?? "").trim();
      if (!v) return badInputResponse();
      filter.gender = v;
    }

 
    if (sp.has("age")) {
      const vRaw = (ageStr ?? "").trim();
      if (vRaw === "") return badInputResponse();
      const v = Number(vRaw);
      if (Number.isNaN(v)) return badInputResponse();
      //@ts-expect-error ignore this
      filter.age = v;
    }

   
    if (sp.has("phoneNumber")) {
      const v = (phoneNumber ?? "").trim();
      if (!v) return badInputResponse();
       //@ts-expect-error ignore this
      filter.phoneNumber = { $regex: escapeRegex(v), $options: "i" };
      
    }

 
    if (sp.has("case_number")) {
      const v = (caseNumber ?? "").trim();
      if (!v) return badInputResponse();
       //@ts-expect-error ignore this
      filter.case_number = { $regex: escapeRegex(v), $options: "i" };
    }

 
    if (sp.has("assignTo")) {
      const v = (assignTo ?? "").trim();
      if (!v) return badInputResponse();
      filter.assignTo = v;
    }

 
    if (Object.keys(filter).length === 0) {
      return badInputResponse();
    }

 
    const questionnaires = await Questionnaire.find(filter)
      .select(
        "+questionary_type +diagnosis_notes +recomanded_actions +comments_or_notes +send_email_to_dantasurakshaks"
      )
      .populate("assignTo", "name phoneNumber")
      .populate("submitted_by", "name phoneNumber")
      .skip(skip)
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();

  
    questionnaires.forEach((q: QuestionnaireTypes) => {
      if (q.send_email_to_dantasurakshaks !== true) {
        delete q.questionary_type;
        delete q.diagnosis_notes;
        delete q.recomanded_actions;
        delete q.comments_or_notes;
      }
    });

    const totalResults = await Questionnaire.countDocuments(filter);

    return NextResponse.json({
      status: 200,
      success: true,
      data: questionnaires,
      page,
      limit,
      totalResults,
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { success: false, error: "Server error" },
      { status: 500 }
    );
  }
}

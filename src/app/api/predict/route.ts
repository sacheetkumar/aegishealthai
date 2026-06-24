import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    // 1. Authenticate session
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized access." }, { status: 401 });
    }

    // 2. Fetch linked patient profile
    const dbUser = await db.user.findUnique({
      where: { email: session.user.email },
      include: { patientProfile: true }
    });

    if (!dbUser?.patientProfile) {
      return NextResponse.json(
        { error: "No patient profile is associated with this account. Only patients can execute AI diagnostics." },
        { status: 403 }
      );
    }

    // 3. Parse request body
    const body = await req.json();
    const { action, symptoms, symptomsText, history } = body;

    // Handle dynamic follow-up question action
    if (action === "follow-up") {
      const fastapiResponse = await fetch(`${process.env.PREDICTION_API_URL || "http://localhost:8000"}/follow-up-question`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          symptoms_text: symptomsText || "",
          symptoms_tags: symptoms || [],
          history: history || []
        }),
      });

      if (!fastapiResponse.ok) {
        const errorText = await fastapiResponse.text();
        return NextResponse.json(
          { error: `AI service returned error: ${errorText || fastapiResponse.statusText}` },
          { status: fastapiResponse.status }
        );
      }

      const followUpData = await fastapiResponse.json();
      return NextResponse.json({ success: true, ...followUpData });
    }

    if ((!symptoms || symptoms.length === 0) && (!symptomsText || symptomsText.trim() === "")) {
      return NextResponse.json({ error: "Either symptoms tags or free-text description is required." }, { status: 400 });
    }

    // 4. Request classification from FastAPI microservice
    const fastapiResponse = await fetch(`${process.env.PREDICTION_API_URL || "http://localhost:8000"}/predict`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        symptoms_text: symptomsText || "",
        symptoms_tags: symptoms || []
      }),
    });

    if (!fastapiResponse.ok) {
      const errorText = await fastapiResponse.text();
      return NextResponse.json(
        { error: `AI Service returned error: ${errorText || fastapiResponse.statusText}` },
        { status: fastapiResponse.status }
      );
    }

    const predictionData = await fastapiResponse.json();

    if (!predictionData.success) {
      return NextResponse.json({ error: "AI prediction failed." }, { status: 500 });
    }

    // If Gemini requests a follow-up, return it without saving a diagnostic record yet
    if (predictionData.follow_up_required) {
      return NextResponse.json({
        success: true,
        follow_up_required: true,
        follow_up_question: predictionData.follow_up_question,
        predictions: {},
        symptomsEvaluated: symptoms || []
      });
    }

    // 5. Try to find if a Disease catalog entry matches the top prognosis
    const topPrediction = predictionData.predictions?.[0];
    const topDiseaseName = topPrediction?.disease || "Unknown";
    const topConfidence = topPrediction?.confidence || 0.5;

    const dbDisease = await db.disease.findFirst({
      where: { name: { equals: topDiseaseName, mode: "insensitive" } }
    });

    // 6. Record prediction data in PostgreSQL via Prisma
    const predictionLog = await db.prediction.create({
      data: {
        patientId: dbUser.patientProfile.id,
        diseaseId: dbDisease?.id || null,
        confidence: topConfidence,
        modelName: "Gemini AI Symptom Analyzer",
        modelRef: "gemini-2.0-flash",
        notes: JSON.stringify({
          predictions: predictionData.predictions,
          disclaimer: predictionData.disclaimer,
          symptomsText: symptomsText,
          symptomsTags: symptoms
        }),
      }
    });

    // Mock backward compatibility format for any other components
    return NextResponse.json({
      success: true,
      logId: predictionLog.id,
      predictions: {
        random_forest: {
          prognosis: topDiseaseName,
          confidence: topConfidence
        },
        xgboost: {
          prognosis: topDiseaseName,
          confidence: topConfidence
        }
      },
      aiResults: predictionData,
      symptomsEvaluated: symptoms || []
    });
  } catch (error) {
    console.error("AI Prediction Route Error:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred during prediction routing." },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized access." }, { status: 401 });
    }

    // Call FastAPI to get available symptoms list
    const fastapiResponse = await fetch(`${process.env.PREDICTION_API_URL || "http://localhost:8000"}/symptoms`);
    if (!fastapiResponse.ok) {
      return NextResponse.json({ error: "Failed to retrieve symptoms list from ML service." }, { status: 502 });
    }

    const data = await fastapiResponse.json();
    return NextResponse.json({ symptoms: data.symptoms });
  } catch (error) {
    console.error("GET Symptoms Route Error:", error);
    return NextResponse.json({ error: "An unexpected error occurred fetching symptoms list." }, { status: 500 });
  }
}

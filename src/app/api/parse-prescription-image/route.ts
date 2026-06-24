import { NextRequest, NextResponse } from "next/server";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent";

export async function POST(req: NextRequest) {
  try {
    if (!GEMINI_API_KEY) {
      return NextResponse.json({ error: "GEMINI_API_KEY is not configured" }, { status: 500 });
    }

    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No image file provided" }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const base64 = Buffer.from(bytes).toString("base64");
    const mimeType = file.type || "image/jpeg";

    const diseasesList = [
      "Fungal infection", "Allergy", "GERD", "Chronic cholestasis", "Drug Reaction",
      "Peptic ulcer disease", "AIDS", "Diabetes", "Gastroenteritis", "Bronchial Asthma",
      "Hypertension", "Migraine", "Cervical spondylosis", "Paralysis (brain hemorrhage)",
      "Jaundice", "Malaria", "Chicken pox", "Dengue", "Typhoid", "Hepatitis A",
      "Hepatitis B", "Hepatitis C", "Hepatitis D", "Hepatitis E", "Alcoholic hepatitis",
      "Tuberculosis", "Common Cold", "Pneumonia", "Dimorphic hemmorhoids(piles)",
      "Heart attack", "Varicose veins", "Hypothyroidism", "Hyperthyroidism",
      "Hypoglycemia", "Osteoarthristis", "Arthritis",
      "(vertigo) Paroymsal Positional Vertigo", "Acne", "Urinary tract infection",
      "Psoriasis", "Impetigo"
    ];

    const prompt = `You are a medical document analyzer. Analyze the image of a medical prescription and extract structured information.

Valid diseases in our catalog: ${diseasesList.join(", ")}

Valid symptom tags: itching, skin_rash, nodal_skin_eruptions, continuous_sneezing, shivering, chills, joint_pain, stomach_pain, acidity, ulcers_on_tongue, vomiting, burning_micturition, spotting_urination, fatigue, weight_gain, anxiety, cold_hands_and_feets, mood_swings, weight_loss, restlessness, lethargy, patches_in_throat, irregular_sugar_level, cough, high_fever, sunken_eyes, breathlessness, sweating, dehydration, indigestion, headache, yellowish_skin, dark_urine, nausea, loss_of_appetite, pain_behind_the_eyes, back_pain, constipation, abdominal_pain, diarrhoea, mild_fever, yellowing_of_eyes, acute_liver_failure, fluid_overload, swelling_of_stomach, swelled_lymph_nodes, malaise, blurred_and_distorted_vision, phlegm, throat_irritation, redness_of_eyes, sinus_pressure, runny_nose, congestion, chest_pain, weakness_in_limbs, fast_heart_rate, pain_during_bowel_movements, pain_in_anal_region, bloody_stool, irritation_in_anus, neck_pain, dizziness, cramps, bruising, obesity, swollen_legs, swollen_blood_vessels, puffy_face_and_eyes, enlarged_thyroid, brittle_nails, swollen_extremeties, excessive_hunger, extra_marital_contacts, drying_of_peels_and_cutis, throat_pain, internal_itching, toxic_look_typhos, depression, irritability, muscle_pain, altered_sensorium, red_spots_over_body, belly_pain, abnormal_menstruation, dischromic_patches, watering_from_eyes, increased_appetite, polyuria, family_history, mucoid_sputum, rusty_sputum, lack_of_concentration, visual_disturbances, receiving_blood_transfusion, receiving_unsterile_injections, coma, stomach_bleeding, distention_of_abdomen, history_of_alcohol_consumption, fluid_overload_1, blood_in_sputum, prominent_veins_on_calf, palpitations, painful_walking, pus_filled_pimples, blackheads, scurring, skin_peeling, silver_like_dusting, small_dents_in_nails, inflammatory_nails, blister, red_sore_around_nose, yellow_crust_ooze, scabs, neck_stiffness, muscle_weakness, stiff_joints, movement_stiffness, spinning_movements, loss_of_balance, unsteadiness, weakness_of_one_body_side, loss_of_smell, bladder_discomfort, foul_smell_of_urine, continuous_feel_of_urination, passage_of_gases, internal_itching_1, toxic_look_typhos_1, altered_sensorium_1

Extract:
1. patient_name: The patient's name if visible
2. doctor_name: The doctor's name (include Dr. prefix)
3. disease: Map to the closest matching disease from the catalog above
4. medications: List of prescribed medications with dosage
5. symptoms: Map mentioned symptoms to valid symptom tags from the list above
6. precautions: 3-4 relevant precautions
7. is_prescription: true if this appears to be a valid prescription

Respond ONLY with a valid JSON object. No markdown, no extra text.
{
  "is_prescription": true,
  "patient_name": "Name or null",
  "doctor_name": "Name or null",
  "disease": "Disease name",
  "medications": ["med1", "med2"],
  "symptoms": ["symptom_tag_1", "symptom_tag_2"],
  "precautions": ["precaution 1", "precaution 2"]
}`;

    const geminiRes = await fetch(`${GEMINI_URL}?key=${GEMINI_API_KEY}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              { text: prompt },
              { inline_data: { mime_type: mimeType, data: base64 } }
            ]
          }
        ]
      })
    });

    if (!geminiRes.ok) {
      const errText = await geminiRes.text();
      return NextResponse.json({ error: `Gemini API error: ${errText}` }, { status: 502 });
    }

    const geminiData = await geminiRes.json();
    const text = geminiData?.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!text) {
      return NextResponse.json({ error: "Gemini returned no content" }, { status: 502 });
    }

    const parsed = JSON.parse(text.replace(/```json|```/g, "").trim());

    return NextResponse.json({ success: true, data: parsed });
  } catch (error: any) {
    console.error("Parse prescription image error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to parse prescription image" },
      { status: 500 }
    );
  }
}
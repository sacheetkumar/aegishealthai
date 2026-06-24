from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
import os
import json
import numpy as np

# Initialize FastAPI App
app = FastAPI(
    title="AegisHealthAI AI Prediction Service",
    description="FastAPI AI microservice leveraging sentence-transformers, NumPy vector search, and Gemini API."
)

# Global clients/models
model = None
# We store the embedded knowledge base in memory
DISEASE_EMBEDDINGS = {}

# Gemini configure
GEMINI_API_KEY = os.environ.get("GEMINI_API_KEY")
if GEMINI_API_KEY:
    import google.generativeai as genai
    genai.configure(api_key=GEMINI_API_KEY)
    gemini_model = genai.GenerativeModel("gemini-2.0-flash")
else:
    gemini_model = None

def _call_gemini(prompt_text, **gen_kwargs):
    import time as _t
    for attempt in range(3):
        try:
            return gemini_model.generate_content(prompt_text, **gen_kwargs)
        except Exception as e:
            if attempt < 2 and ("429" in str(e) or "RESOURCE_EXHAUSTED" in str(e)):
                _t.sleep(2 ** attempt)
                continue
            raise e

# Clinical specialist categories
SPECIALIST_MAPPING = {
    "Cardiovascular": "Cardiologist",
    "Respiratory": "Pulmonologist",
    "Neurological": "Neurologist",
    "Dermatological": "Dermatologist",
    "Digestive": "Gastroenterologist",
    "General": "General Physician"
}

# Mapping specific disease specialist strings to our target specialist categories
SPECIALIST_CLEANUP = {
    "Cardiology": "Cardiologist",
    "Pulmonology": "Pulmonologist",
    "Neurology": "Neurologist",
    "Dermatology": "Dermatologist",
    "Gastroenterology": "Gastroenterologist",
    "Internal Medicine": "General Physician",
    "General Physician": "General Physician",
    "Infectious Diseases": "General Physician",
    "Endocrinology": "General Physician",
    "Orthopedics": "General Physician"
}

# Comprehensive 132 symptoms checklist tags matching Kaggle Dataset
symptoms_list = [
    "itching", "skin_rash", "nodal_skin_eruptions", "continuous_sneezing", "shivering", "chills", "joint_pain",
    "stomach_pain", "acidity", "ulcers_on_tongue", "vomiting", "burning_micturition", "spotting_urination",
    "fatigue", "weight_gain", "anxiety", "cold_hands_and_feets", "mood_swings", "weight_loss", "restlessness",
    "lethargy", "patches_in_throat", "irregular_sugar_level", "cough", "high_fever", "sunken_eyes", "breathlessness",
    "sweating", "dehydration", "indigestion", "headache", "yellowish_skin", "dark_urine", "nausea", "loss_of_appetite",
    "pain_behind_the_eyes", "back_pain", "constipation", "abdominal_pain", "diarrhoea", "mild_fever", "yellowing_of_eyes",
    "acute_liver_failure", "fluid_overload", "swelling_of_stomach", "swelled_lymph_nodes", "malaise",
    "blurred_and_distorted_vision", "phlegm", "throat_irritation", "redness_of_eyes", "sinus_pressure", "runny_nose",
    "congestion", "chest_pain", "weakness_in_limbs", "fast_heart_rate", "pain_during_bowel_movements",
    "pain_in_anal_region", "bloody_stool", "irritation_in_anus", "neck_pain", "dizziness", "cramps", "bruising",
    "obesity", "swollen_legs", "swollen_blood_vessels", "puffy_face_and_eyes", "enlarged_thyroid", "brittle_nails",
    "swollen_extremeties", "excessive_hunger", "extra_marital_contacts", "drying_of_peels_and_cutis", "throat_pain",
    "internal_itching", "toxic_look_typhos", "depression", "irritability", "muscle_pain", "altered_sensorium",
    "red_spots_over_body", "belly_pain", "abnormal_menstruation", "dischromic_patches", "watering_from_eyes",
    "increased_appetite", "polyuria", "family_history", "mucoid_sputum", "rusty_sputum", "lack_of_concentration",
    "visual_disturbances", "receiving_blood_transfusion", "receiving_unsterile_injections", "coma",
    "stomach_bleeding", "distention_of_abdomen", "history_of_alcohol_consumption", "fluid_overload_1",
    "blood_in_sputum", "prominent_veins_on_calf", "palpitations", "painful_walking", "pus_filled_pimples",
    "blackheads", "scurring", "skin_peeling", "silver_like_dusting", "small_dents_in_nails", "inflammatory_nails",
    "blister", "red_sore_around_nose", "yellow_crust_ooze", "scabs", "neck_stiffness", "muscle_weakness",
    "stiff_joints", "movement_stiffness", "spinning_movements", "loss_of_balance", "unsteadiness", "weakness_of_one_body_side",
    "loss_of_smell", "bladder_discomfort", "foul_smell_of_urine", "continuous_feel_of_urination", "passage_of_gases",
    "internal_itching_1", "toxic_look_typhos_1", "altered_sensorium_1"
]

# Static Medical Knowledge base of 41 diseases with description, specialist mapping and precautions
DISEASES_KB = {
    "Fungal infection": {
        "specialist": "Dermatologist",
        "description": "A skin infection caused by a fungus, leading to itching, redness, skin peeling, and dischromic patches.",
        "precautions": ["bath twice", "use dettol or antiseptic", "keep infected area dry", "use clean towels"]
    },
    "Allergy": {
        "specialist": "Pulmonologist",
        "description": "An immune system reaction to a foreign substance, causing sneezing, shivering, chills, and watering from eyes.",
        "precautions": ["avoid allergen exposure", "use nasal spray", "keep surroundings dust-free", "consult a doctor if severe"]
    },
    "GERD": {
        "specialist": "Gastroenterologist",
        "description": "Gastroesophageal reflux disease, causing stomach pain, acidity, ulcers on tongue, vomiting, and chest pain.",
        "precautions": ["avoid fatty foods", "do not lie down after eating", "avoid alcohol", "eat smaller meals"]
    },
    "Chronic cholestasis": {
        "specialist": "Gastroenterologist",
        "description": "A liver condition with blocked bile flow, presenting with itching, vomiting, yellowish skin, and yellowing of eyes.",
        "precautions": ["eat low-fat diet", "avoid alcohol", "take prescribed vitamins", "stay hydrated"]
    },
    "Drug Reaction": {
        "specialist": "Dermatologist",
        "description": "An adverse response to a medication, causing skin rash, itching, stomach pain, and spotting urination.",
        "precautions": ["stop taking offending drug", "seek medical attention immediately", "use cold compress", "take antihistamine"]
    },
    "Peptic ulcer disease": {
        "specialist": "Gastroenterologist",
        "description": "Sores developing on the lining of the stomach or small intestine, causing vomiting, indigestion, and abdominal pain.",
        "precautions": ["avoid spicy food", "eat smaller frequent meals", "limit alcohol", "do not skip meals"]
    },
    "AIDS": {
        "specialist": "General Physician",
        "description": "Acquired immunodeficiency syndrome, causing severe immune system damage, muscle wasting, patches in throat, and high fever.",
        "precautions": ["take anti-retroviral therapy (ART)", "use protection", "eat nutritious food", "avoid infections"]
    },
    "Diabetes": {
        "specialist": "General Physician",
        "description": "A chronic metabolic disease marked by high blood glucose levels, causing fatigue, weight loss, polyuria, and irregular sugar levels.",
        "precautions": ["monitor blood glucose regularly", "low carbohydrate diet", "exercise daily", "take prescribed insulin/medications"]
    },
    "Gastroenteritis": {
        "specialist": "Gastroenterologist",
        "description": "Infection and inflammation of the digestive tract, presenting with vomiting, dehydration, and severe diarrhoea.",
        "precautions": ["drink plenty of fluids (ORS)", "eat bland foods", "wash hands thoroughly", "avoid dairy products"]
    },
    "Bronchial Asthma": {
        "specialist": "Pulmonologist",
        "description": "A chronic respiratory condition causing airway inflammation and breathlessness, cough, and fatigue.",
        "precautions": ["keep inhaler handy", "avoid dust/smoke", "monitor breathing patterns", "stay warm in cold weather"]
    },
    "Hypertension": {
        "specialist": "Cardiologist",
        "description": "High blood pressure, increasing the risk of heart disease, causing headache, chest pain, and dizziness.",
        "precautions": ["reduce sodium intake", "exercise regularly", "manage stress", "take anti-hypertensive pills"]
    },
    "Migraine": {
        "specialist": "Neurologist",
        "description": "A neurological condition causing severe recurring headaches, visual disturbances, and sensory sensitivity.",
        "precautions": ["avoid trigger foods", "rest in dark quiet room", "stay hydrated", "manage sleep schedule"]
    },
    "Cervical spondylosis": {
        "specialist": "Neurologist",
        "description": "Age-related wear and tear affecting the spinal disks in the neck, causing neck pain, dizziness, and back pain.",
        "precautions": ["do neck exercises", "use ergonomic pillows", "maintain good posture", "avoid heavy lifting"]
    },
    "Paralysis (brain hemorrhage)": {
        "specialist": "Neurologist",
        "description": "Loss of voluntary muscle function in one or more parts of the body due to bleeding in the brain, presenting with weakness of one side.",
        "precautions": ["seek immediate emergency care", "monitor blood pressure", "undergo physiotherapy", "take prescribed anticoagulants"]
    },
    "Jaundice": {
        "specialist": "Gastroenterologist",
        "description": "Yellowing of the skin and eyes caused by high bilirubin levels, leading to dark urine, fatigue, and itching.",
        "precautions": ["eat light low-fat meals", "drink boiled water", "complete bed rest", "avoid alcohol"]
    },
    "Malaria": {
        "specialist": "General Physician",
        "description": "A mosquito-borne infectious disease causing fever, chills, sweating, headache, and severe muscle pain.",
        "precautions": ["take prescribed anti-malarial course", "use mosquito nets", "avoid standing water", "keep hydrated"]
    },
    "Chicken pox": {
        "specialist": "Dermatologist",
        "description": "A highly contagious viral infection causing an itchy blister-like rash, high fever, and fatigue.",
        "precautions": ["do not scratch blisters", "isolate from others", "use calamine lotion", "wear loose cotton clothes"]
    },
    "Dengue": {
        "specialist": "General Physician",
        "description": "A mosquito-borne viral disease causing high fever, joint pain, muscle pain, and red spots over the body.",
        "precautions": ["drink plenty of fluids", "take paracetamol (avoid aspirin/ibuprofen)", "rest completely", "use mosquito repellent"]
    },
    "Typhoid": {
        "specialist": "Gastroenterologist",
        "description": "A bacterial infection spread through contaminated food/water, causing high fever, chills, and abdominal pain.",
        "precautions": ["take complete antibiotic course", "eat easily digestible warm food", "drink boiled/bottled water", "wash hands regularly"]
    },
    "Hepatitis A": {
        "specialist": "Gastroenterologist",
        "description": "Highly contagious liver infection spread via contaminated food/water, causing yellowish skin, vomiting, and joint pain.",
        "precautions": ["avoid alcohol", "eat small nutritious meals", "wash hands before eating", "rest well"]
    },
    "Hepatitis B": {
        "specialist": "Gastroenterologist",
        "description": "Serious liver infection transmitted via body fluids, leading to fatigue, dark urine, and itching.",
        "precautions": ["take prescribed antiviral medications", "do not share personal care items", "avoid alcohol", "regular liver checkups"]
    },
    "Hepatitis C": {
        "specialist": "Gastroenterologist",
        "description": "An infectious liver disease transmitted through blood, presenting with fatigue and yellowing of skin and eyes.",
        "precautions": ["take complete antiviral course", "avoid alcohol", "eat balanced meals", "regular checkups"]
    },
    "Hepatitis D": {
        "specialist": "Gastroenterologist",
        "description": "A liver disease occurring only in people already infected with Hepatitis B, presenting with joint pain and dark urine.",
        "precautions": ["regular liver function monitoring", "avoid alcohol", "take prescribed antivirals", "maintain hygiene"]
    },
    "Hepatitis E": {
        "specialist": "Gastroenterologist",
        "description": "Liver inflammation transmitted mainly through contaminated drinking water, causing yellowish skin and dark urine.",
        "precautions": ["drink safe pure water", "avoid raw/uncooked meat", "rest completely", "avoid alcohol"]
    },
    "Alcoholic hepatitis": {
        "specialist": "Gastroenterologist",
        "description": "Liver inflammation caused by excessive alcohol consumption, leading to vomiting, yellow skin, and abdominal swelling.",
        "precautions": ["completely stop drinking alcohol", "eat high-protein diet", "take prescribed liver supplements", "exercise moderately"]
    },
    "Tuberculosis": {
        "specialist": "Pulmonologist",
        "description": "A serious infectious bacterial disease affecting the lungs, causing persistent cough, chest pain, and blood in sputum.",
        "precautions": ["complete full DOTS treatment", "wear face mask in public", "stay in well-ventilated rooms", "eat high-protein diet"]
    },
    "Common Cold": {
        "specialist": "Pulmonologist",
        "description": "A viral infection of the upper respiratory tract, causing continuous sneezing, chills, cough, and runny nose.",
        "precautions": ["drink warm water and herbal teas", "steam inhalation", "salt water gargles", "rest well"]
    },
    "Pneumonia": {
        "specialist": "Pulmonologist",
        "description": "An infection inflaming the air sacs in one or both lungs, causing chills, cough, and breathlessness.",
        "precautions": ["take prescribed antibiotics/antivirals", "stay warm", "drink warm fluids", "rest and isolate"]
    },
    "Dimorphic hemmorhoids(piles)": {
        "specialist": "Gastroenterologist",
        "description": "Swollen veins in the anus and lower rectum, causing pain during bowel movements, constipation, and bleeding.",
        "precautions": ["eat high-fiber diet", "drink plenty of water", "avoid straining during bowel movements", "take sitz baths"]
    },
    "Heart attack": {
        "specialist": "Cardiologist",
        "description": "A medical emergency where blood flow to the heart muscle is blocked, causing chest pain, breathlessness, and sweating.",
        "precautions": ["call ambulance immediately", "chew aspirin if advised", "stay calm and rest", "perform CPR if trained and necessary"]
    },
    "Varicose veins": {
        "specialist": "General Physician",
        "description": "Gnarled, enlarged veins, most commonly appearing in the legs, causing leg cramps, bruising, and swelling.",
        "precautions": ["avoid prolonged standing/sitting", "elevate legs when resting", "wear compression stockings", "exercise regularly"]
    },
    "Hypothyroidism": {
        "specialist": "General Physician",
        "description": "Underactive thyroid gland producing insufficient hormones, causing fatigue, weight gain, and depression.",
        "precautions": ["take thyroid hormone daily", "maintain a healthy weight", "monitor thyroid levels", "eat fiber-rich foods"]
    },
    "Hyperthyroidism": {
        "specialist": "General Physician",
        "description": "Overactive thyroid gland producing excess thyroid hormones, causing weight loss, fast heart rate, and sweating.",
        "precautions": ["take anti-thyroid pills", "reduce caffeine and stimulants", "regular blood checks", "eat calcium-rich foods"]
    },
    "Hypoglycemia": {
        "specialist": "General Physician",
        "description": "Abnormally low blood sugar level, causing anxiety, sweating, headache, and palpitations.",
        "precautions": ["eat sugar/candy immediately if levels drop", "consume balanced frequent meals", "monitor sugar levels", "carry glucose tablets"]
    },
    "Osteoarthristis": {
        "specialist": "Neurologist",
        "description": "Degenerative joint disease causing joint pain, stiffness, and painful walking.",
        "precautions": ["do low-impact joint exercises", "maintain healthy body weight", "apply hot/cold packs", "take prescribed pain relievers"]
    },
    "Arthritis": {
        "specialist": "Neurologist",
        "description": "Inflammation of one or more joints, causing pain, movement stiffness, and muscle weakness.",
        "precautions": ["do gentle stretches", "protect joints from strain", "eat anti-inflammatory foods", "take prescribed DMARDs"]
    },
    "(vertigo) Paroymsal Positional Vertigo": {
        "specialist": "Neurologist",
        "description": "A sensation of spinning or dizziness caused by inner ear disturbances, leading to loss of balance.",
        "precautions": ["perform Epley maneuver", "avoid sudden head movements", "sit down immediately when dizzy", "keep surroundings safe and clear"]
    },
    "Acne": {
        "specialist": "Dermatologist",
        "description": "A skin condition causing pimples, skin rash, blackheads, and scurring.",
        "precautions": ["wash face twice daily", "do not squeeze pimples", "use non-comedogenic cosmetics", "avoid oily foods"]
    },
    "Urinary tract infection": {
        "specialist": "General Physician",
        "description": "An infection in any part of the urinary system, causing burning micturition and bladder discomfort.",
        "precautions": ["drink plenty of water", "maintain perineal hygiene", "urinate after intercourse", "take complete antibiotic course"]
    },
    "Psoriasis": {
        "specialist": "Dermatologist",
        "description": "A skin disease causing red, itchy scaly patches, skin peeling, and silver-like dusting.",
        "precautions": ["keep skin moisturized", "avoid skin triggers/stress", "spend moderate time in sun", "use prescribed ointments"]
    },
    "Impetigo": {
        "specialist": "Dermatologist",
        "description": "A highly contagious skin infection causing red sores and blisters, typically around the nose and mouth.",
        "precautions": ["clean sores with warm soap water", "apply antibiotic ointment", "wash hands frequently", "do not share towels/clothes"]
    }
}

DATABASE_URL = os.environ.get("DATABASE_URL")

def get_db_connection():
    if not DATABASE_URL:
        return None
    try:
        import psycopg2
        conn = psycopg2.connect(DATABASE_URL)
        return conn
    except Exception as e:
        print(f"Warning: Failed to connect to PostgreSQL: {e}")
        return None

@app.on_event("startup")
def startup_event():
    global model, DISEASE_EMBEDDINGS
    
    # 1. Load Sentence Transformer model (non-fatal if it fails)
    print("Loading Sentence Transformer embedding model...")
    try:
        from sentence_transformers import SentenceTransformer
        model = SentenceTransformer('all-MiniLM-L6-v2')
        print("Embedding model loaded.")
    except Exception as e:
        print(f"Warning: Failed to load SentenceTransformer: {e}. Gemini-only mode.")
        model = None

    # 2. Synchronize database content
    print("Syncing medical records with PostgreSQL...")
    db_conn = get_db_connection()
    db_diseases = {}
    
    if db_conn:
        try:
            cursor = db_conn.cursor()
            # Attempt to retrieve diseases from PostgreSQL
            cursor.execute("SELECT name, description, precautions, specialist FROM \"Disease\";")
            rows = cursor.fetchall()
            for r in rows:
                name, description, precautions, specialist = r
                db_diseases[name] = {
                    "description": description or "",
                    "precautions": precautions or [],
                    "specialist": specialist or "General Physician"
                }
            cursor.close()
            db_conn.close()
            print(f"Synchronized {len(db_diseases)} diseases from PostgreSQL.")
        except Exception as e:
            print(f"Error fetching diseases from database: {e}. Falling back to internal dictionary.")
            db_diseases = {}
            
    # Use database items if fetched, otherwise fallback to local DISEASES_KB
    knowledge_base = db_diseases if db_diseases else DISEASES_KB
    
    # 3. Pre-compute embeddings for semantic similarity vector search
    print("Computing embeddings for clinical knowledge base...")
    documents = []
    names = []
    
    for name, info in knowledge_base.items():
        precaution_str = ", ".join(info["precautions"]) if isinstance(info["precautions"], list) else str(info["precautions"])
        doc_text = f"Disease: {name}. Description: {info['description']}. Mapped Specialist: {info['specialist']}. Precautions: {precaution_str}"
        documents.append(doc_text)
        names.append(name)
        
    if model:
        embeddings = model.encode(documents)
        
        for idx, name in enumerate(names):
            info = knowledge_base[name]
            DISEASE_EMBEDDINGS[name] = {
                "embedding": embeddings[idx],
                "specialist": info["specialist"],
                "description": info["description"],
                "precautions": info["precautions"]
            }
        print(f"Loaded {len(DISEASE_EMBEDDINGS)} disease embeddings in memory.")
    else:
        print("Skipping embeddings (no SentenceTransformer model available).")

def get_similar_diseases_numpy(query_str: str, limit: int = 5) -> str:
    """
    Pure-Python NumPy cosine similarity vector search fallback.
    Avoids C++ compilation of ChromaDB on Windows.
    """
    if not model or not DISEASE_EMBEDDINGS:
        return ""
    
    query_emb = model.encode([query_str])[0]
    
    similarities = []
    for name, data in DISEASE_EMBEDDINGS.items():
        emb = data["embedding"]
        # Compute cosine similarity
        dot_prod = np.dot(query_emb, emb)
        norm_q = np.linalg.norm(query_emb)
        norm_e = np.linalg.norm(emb)
        if norm_q > 0 and norm_e > 0:
            sim = dot_prod / (norm_q * norm_e)
        else:
            sim = 0.0
        similarities.append((name, sim, data))
        
    # Sort by similarity descending
    similarities.sort(key=lambda x: x[1], reverse=True)
    
    # Construct context string
    lines = []
    for name, sim, data in similarities[:limit]:
        prec_str = ", ".join(data["precautions"]) if isinstance(data["precautions"], list) else str(data["precautions"])
        lines.append(f"Disease: {name}. Sim score: {sim:.2f}. Description: {data['description']}. Specialist: {data['specialist']}. Precautions: {prec_str}")
        
    return "\n".join(lines)

class PredictRequest(BaseModel):
    symptoms_text: str = ""
    symptoms_tags: List[str] = []

class DiseasePrediction(BaseModel):
    disease: str
    confidence: float
    severity: str
    emergency_warning: Optional[str] = None
    specialist: str
    description: str
    precautions: List[str]

class PredictResponse(BaseModel):
    success: bool
    follow_up_required: bool
    follow_up_question: Optional[str] = None
    predictions: List[DiseasePrediction] = []
    disclaimer: str

class FollowUpRequest(BaseModel):
    symptoms_text: str = ""
    symptoms_tags: List[str] = []
    history: List[Dict[str, str]] = []

class FollowUpResponse(BaseModel):
    question: str

class RecommendationRequest(BaseModel):
    disease: str

class RecommendationResponse(BaseModel):
    specialty: str
    specialist: str

@app.get("/symptoms")
def get_symptoms():
    return {"symptoms": symptoms_list}

@app.post("/predict", response_model=PredictResponse)
def predict(request: PredictRequest):
    print("\n--- NEW GEMINI PREDICTION REQUEST ---")
    print("Raw symptoms text:", request.symptoms_text)
    print("Selected tags:", request.symptoms_tags)
    
    if not request.symptoms_text.strip() and not request.symptoms_tags:
        raise HTTPException(status_code=400, detail="Symptoms inputs cannot be empty.")

    # 1. Query NumPy Vector Search to retrieve similar diseases based on symptoms embedding
    query_terms = []
    if request.symptoms_text:
        query_terms.append(request.symptoms_text)
    if request.symptoms_tags:
        query_terms.append(" ".join(request.symptoms_tags))
    
    query_str = " ".join(query_terms)
    context_text = get_similar_diseases_numpy(query_str, limit=5)
    print("Retrieved semantic context matches:\n", context_text)

    # 2. Invoke Gemini model
    if not gemini_model:
        # Emergency mockup fallback if API key is missing to keep service operational
        print("WARNING: Gemini model not initialized. Using local mockup fallback.")
        # Find top match from similarity list
        top_match = "Influenza"
        if DISEASE_EMBEDDINGS:
            # Recompute top match name
            query_emb = model.encode([query_str])[0]
            best_sim = -1.0
            for name, data in DISEASE_EMBEDDINGS.items():
                emb = data["embedding"]
                sim = np.dot(query_emb, emb) / (np.linalg.norm(query_emb) * np.linalg.norm(emb))
                if sim > best_sim:
                    best_sim = sim
                    top_match = name
                    
        mock_info = DISEASES_KB.get(top_match, {
            "specialist": "General Physician",
            "description": "A medical condition matched by symptoms similarity.",
            "precautions": ["rest well", "stay hydrated", "consult physician"]
        })
        
        return PredictResponse(
            success=True,
            follow_up_required=False,
            predictions=[
                DiseasePrediction(
                    disease=top_match,
                    confidence=0.85,
                    severity="Medium",
                    specialist=mock_info["specialist"],
                    description=mock_info["description"],
                    precautions=mock_info["precautions"]
                )
            ],
            disclaimer="Disclaimer: This prediction is for informational purposes only (Gemini Mock Fallback)."
        )

    # Build prompt
    prompt = f"""
You are a highly experienced clinical diagnostic AI system.
You will evaluate the patient's symptoms against a medical knowledge base of known diseases and output your assessment in a strict JSON format.

Available context of matched diseases from our clinical database:
{context_text}

Patient inputs:
- Stated symptoms (Free text): {request.symptoms_text}
- Checked symptoms: {', '.join(request.symptoms_tags)}

Your task is to analyze these symptoms and respond with:
1. "follow_up_required": true/false. If symptoms are extremely vague (e.g., just "fatigue" or "cough"), set this to true and provide an intelligent follow-up question in "follow_up_question". If symptoms are clear enough to make a tentative diagnostic list, set this to false.
2. "predictions": A list of top 3 possible diseases. For each disease, provide:
   - "disease": The name of the disease.
   - "confidence": A confidence score between 0.0 and 1.0.
   - "severity": "Low", "Medium", or "High".
   - "emergency_warning": A warning string if the disease is highly severe or life-threatening (e.g., "Immediate medical attention is required"). Otherwise null.
   - "specialist": One of: "Cardiologist", "Pulmonologist", "Neurologist", "Dermatologist", "Gastroenterologist", "General Physician".
   - "description": A short explanation of the condition.
   - "precautions": A list of 3-4 self-care precautions.
3. "disclaimer": "This prediction is for informational purposes only and is not a substitute for professional medical advice, diagnosis, or treatment."

Output format:
Return ONLY a valid JSON object matching the schema below. Do not include markdown code block formatting (such as ```json) or any extra conversational text.
{{
  "follow_up_required": false,
  "follow_up_question": null,
  "predictions": [
    {{
      "disease": "Hypertension",
      "confidence": 0.85,
      "severity": "Medium",
      "emergency_warning": null,
      "specialist": "Cardiologist",
      "description": "High blood pressure is a common condition...",
      "precautions": ["reduce sodium intake", "exercise regularly", "manage stress"]
    }}
  ],
  "disclaimer": "This prediction is for informational purposes only and is not a substitute for professional medical advice, diagnosis, or treatment."
}}
"""

    try:
        response = _call_gemini(prompt, generation_config={"response_mime_type": "application/json"})
        
        result_json = json.loads(response.text)
        print("Gemini response parsed successfully.")
        
        # Clean/normalize specialist name according to specifications
        if "predictions" in result_json:
            for p in result_json["predictions"]:
                raw_spec = p.get("specialist", "General Physician")
                cleaned_spec = SPECIALIST_CLEANUP.get(raw_spec, raw_spec)
                if cleaned_spec not in SPECIALIST_MAPPING.values():
                    cleaned_spec = "General Physician"
                p["specialist"] = cleaned_spec

        return PredictResponse(
            success=True,
            follow_up_required=result_json.get("follow_up_required", False),
            follow_up_question=result_json.get("follow_up_question"),
            predictions=result_json.get("predictions", []),
            disclaimer=result_json.get("disclaimer", "This prediction is for informational purposes only and is not a substitute for professional medical advice.")
        )
    except Exception as e:
        print("Error evaluating predictions with Gemini API:", e)
        raise HTTPException(status_code=500, detail=f"Prediction evaluation failed: {str(e)}")

@app.post("/follow-up-question", response_model=FollowUpResponse)
def follow_up_question(request: FollowUpRequest):
    print("\n--- DYNAMIC FOLLOW-UP QUESTION REQUEST ---")
    if not gemini_model:
        return FollowUpResponse(question="Could you please provide more details about the duration and intensity of your symptoms?")

    prompt = f"""
You are a medical diagnostic assistant. The patient is entering symptoms.
Stated symptoms: {request.symptoms_text}
Checked symptom tags: {', '.join(request.symptoms_tags)}
Chat history: {json.dumps(request.history)}

Generate a single intelligent, warm, clinical follow-up question to help narrow down the diagnosis. Do not include any explanations, greetings, or formatting, just the question.
"""
    try:
        response = _call_gemini(prompt)
        question = response.text.strip()
        return FollowUpResponse(question=question)
    except Exception as e:
        print("Error generating follow-up question:", e)
        return FollowUpResponse(question="Are you experiencing any other symptoms, such as fever, pain, or dizziness?")

@app.post("/doctor-recommendation", response_model=RecommendationResponse)
def doctor_recommendation(request: RecommendationRequest):
    disease = request.disease
    print(f"\n--- SPECIALIST DOCTOR RECOMMENDATION FOR: {disease} ---")
    
    # 1. Resolve matching category specialist from local KB
    specialist = "General Physician"
    
    info = DISEASES_KB.get(disease)
    if info:
        specialist = info["specialist"]
    
    # Specialty reverse mapping to match our database DoctorSpecialization
    specialist_to_specialty = {
        "Cardiologist": "Cardiology",
        "Pulmonologist": "Pulmonology",
        "Neurologist": "Neurology",
        "Dermatologist": "Dermatology",
        "Gastroenterologist": "Gastroenterology",
        "General Physician": "Internal Medicine"
    }
    
    specialty = specialist_to_specialty.get(specialist, "Internal Medicine")
    
    return RecommendationResponse(
        specialty=specialty,
        specialist=specialist
    )

class ParsePrescriptionRequest(BaseModel):
    text: str

class ParsePrescriptionResponse(BaseModel):
    success: bool
    is_prescription: bool
    patient_name: Optional[str] = None
    doctor_name: Optional[str] = None
    disease: Optional[str] = None
    medications: List[str] = []
    symptoms: List[str] = []
    precautions: List[str] = []
    error: Optional[str] = None

@app.post("/parse-prescription", response_model=ParsePrescriptionResponse)
def parse_prescription(request: ParsePrescriptionRequest):
    print("\n--- NEW PRESCRIPTION OCR PARSING REQUEST ---")
    print("OCR Text Length:", len(request.text))
    
    if not request.text.strip():
        return ParsePrescriptionResponse(
            success=False,
            is_prescription=False,
            error="Input text is empty."
        )

    if not gemini_model:
        # Mock fallback if Gemini is not configured
        print("WARNING: Gemini model not initialized. Using fallback parsing.")
        text_lower = request.text.lower()
        
        # Check if it has any medical hints
        has_rx = "rx" in text_lower or "prescription" in text_lower or "medication" in text_lower or "take" in text_lower or "mg" in text_lower or "dr." in text_lower or "doctor" in text_lower
        if not has_rx:
            return ParsePrescriptionResponse(
                success=True,
                is_prescription=False,
                error="Invalid prescription: could not find medical markers."
            )
            
        # Try to find a disease
        matched_disease = "General"
        for d in DISEASES_KB.keys():
            if d.lower() in text_lower:
                matched_disease = d
                break
                
        # Try to find doctor name
        import re
        doc_match = re.search(r"(?:dr\.|dr|doctor)\s+([a-zA-Z]+(?:\s+[a-zA-Z]+)?)", request.text, re.IGNORECASE)
        doctor_name = f"Dr. {doc_match.group(1).title()}" if doc_match else None
        
        # Find medications
        meds = []
        for m in ["lisinopril", "metformin", "benzoyl peroxide", "paracetamol", "aspirin", "ibuprofen", "amoxicillin"]:
            if m in text_lower:
                for line in request.text.split("\n"):
                    if m in line.lower():
                        meds.append(line.strip())
                        break
        if not meds:
            meds = ["Prescribed medication"]

        # Find precautions and symptoms
        info = DISEASES_KB.get(matched_disease, {"precautions": ["consult a doctor"], "specialist": "General Physician"})
        precautions = info.get("precautions", ["consult a doctor"])
        
        sympts = []
        for s in symptoms_list:
            if s.replace("_", " ") in text_lower:
                sympts.append(s)
        
        return ParsePrescriptionResponse(
            success=True,
            is_prescription=True,
            patient_name="Alex Rivera", 
            doctor_name=doctor_name,
            disease=matched_disease,
            medications=meds,
            symptoms=sympts[:3],
            precautions=precautions
        )

    # Compile the list of diseases and symptoms for Gemini
    diseases_str = ", ".join(list(DISEASES_KB.keys()))
    symptoms_str = ", ".join(symptoms_list)

    prompt = f"""
You are a highly experienced clinical assistant. Analyze the raw OCR text extracted from a medical document and extract structured prescription information.

List of valid diseases in our catalog:
{diseases_str}

List of valid symptom tags in our catalog:
{symptoms_str}

Raw OCR text:
\"\"\"
{request.text}
\"\"\"

Your task is to:
1. Determine if this text represents a valid medical prescription (e.g., contains diagnostic notes, symptoms, medications, dosage directions, or doctor/patient names). If it does not appear to be a prescription, set "is_prescription" to false.
2. If it is a valid prescription:
   - Extract the patient's name (if mentioned, e.g. "Patient: Alex Rivera" -> "Alex Rivera").
   - Extract the prescribing doctor's name (e.g. "Dr. Rajesh Sharma" -> "Dr. Rajesh Sharma"). Ensure you include the prefix "Dr. ".
   - Identify the most likely disease diagnosis and map it EXACTLY to one of the valid diseases in the catalog list above (e.g., "Hypertension", "Diabetes", "Acne", "GERD", "Fungal infection", etc.). If no disease matches directly, choose the closest semantic match from the catalog.
   - Extract the list of medications with their dosage/instructions if present (e.g. ["Metformin 500mg -- twice daily"]).
   - Extract and map any mentioned symptoms to the valid symptom tags from the catalog list above. Only return tags that exist in the catalog list (e.g. ["cough", "chest_pain"]).
   - Extract a list of 3-4 precautions/lifestyle recommendations (either from the text or standard clinical recommendations for the diagnosed disease).

Respond ONLY with a valid JSON object matching the schema below. Do not include markdown code block formatting (like ```json) or any extra text.

Output Schema:
{{
  "is_prescription": true,
  "patient_name": "Patient Name or null",
  "doctor_name": "Doctor Name or null",
  "disease": "Exact Disease Name from catalog",
  "medications": ["Medication 1", "Medication 2"],
  "symptoms": ["symptom_tag_1", "symptom_tag_2"],
  "precautions": ["Precaution 1", "Precaution 2"]
}}
"""

    try:
        response = _call_gemini(prompt, generation_config={"response_mime_type": "application/json"})
        
        result_json = json.loads(response.text)
        print("OCR parse successful:", result_json)
        
        return ParsePrescriptionResponse(
            success=True,
            is_prescription=result_json.get("is_prescription", False),
            patient_name=result_json.get("patient_name"),
            doctor_name=result_json.get("doctor_name"),
            disease=result_json.get("disease"),
            medications=result_json.get("medications", []),
            symptoms=result_json.get("symptoms", []),
            precautions=result_json.get("precautions", [])
        )
    except Exception as e:
        print("Error parsing prescription with Gemini:", e)
        return ParsePrescriptionResponse(
            success=False,
            is_prescription=False,
            error=f"Gemini evaluation failed: {str(e)}"
        )

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)

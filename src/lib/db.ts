import { PrismaClient } from "@prisma/client";

const connectionString = process.env.DATABASE_URL;

let realPrisma: PrismaClient | null = null;
try {
  realPrisma = new PrismaClient({
    ...(connectionString ? { datasourceUrl: connectionString } : {}),
  });
} catch (e) {
  console.warn("⚠️ Failed to initialize Prisma client: ", e);
  realPrisma = null;
}

const globalForMockStore = globalThis as unknown as { mockStore: any };
const isNewStore = !globalForMockStore.mockStore;

// In-memory mock database store populated with seed data for development fallback
const mockStore: any = globalForMockStore.mockStore || {
  user: [
    {
      id: "usr-patient",
      name: "Alex Rivera",
      email: "patient@aegishealth.ai",
      passwordHash: "$2b$10$C37B8XFlHrW.HglEkvYy4uK6l.cpdeH6ew3pomucD3rYjzEHHmIZu", // bcrypt for "patient123"
      role: "PATIENT",
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: "usr-jenkins",
      name: "Dr. Sarah Jenkins",
      email: "jenkins@aegishealth.ai",
      passwordHash: "$2b$10$tMt818XhQKdDk8aQQxI7KeQcaMmlD25upxqp2a7TfvIubeQH1jfSW", // bcrypt for "doctor123"
      role: "DOCTOR",
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: "usr-chen",
      name: "Dr. Michael Chen",
      email: "chen@aegishealth.ai",
      passwordHash: "$2b$10$tMt818XhQKdDk8aQQxI7KeQcaMmlD25upxqp2a7TfvIubeQH1jfSW",
      role: "DOCTOR",
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: "usr-rostova",
      name: "Dr. Elena Rostova",
      email: "rostova@aegishealth.ai",
      passwordHash: "$2b$10$tMt818XhQKdDk8aQQxI7KeQcaMmlD25upxqp2a7TfvIubeQH1jfSW",
      role: "DOCTOR",
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: "usr-vance",
      name: "Dr. Marcus Vance",
      email: "vance@aegishealth.ai",
      passwordHash: "$2b$10$tMt818XhQKdDk8aQQxI7KeQcaMmlD25upxqp2a7TfvIubeQH1jfSW",
      role: "DOCTOR",
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: "usr-kincaid",
      name: "Dr. David Kincaid",
      email: "kincaid@aegishealth.ai",
      passwordHash: "$2b$10$tMt818XhQKdDk8aQQxI7KeQcaMmlD25upxqp2a7TfvIubeQH1jfSW",
      role: "DOCTOR",
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: "usr-rahman",
      name: "Dr. Aisha Rahman",
      email: "rahman@aegishealth.ai",
      passwordHash: "$2b$10$tMt818XhQKdDk8aQQxI7KeQcaMmlD25upxqp2a7TfvIubeQH1jfSW",
      role: "DOCTOR",
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: "usr-carter",
      name: "Dr. James Carter",
      email: "carter@aegishealth.ai",
      passwordHash: "$2b$10$tMt818XhQKdDk8aQQxI7KeQcaMmlD25upxqp2a7TfvIubeQH1jfSW",
      role: "DOCTOR",
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: "usr-miller",
      name: "Dr. Robert Miller",
      email: "miller@aegishealth.ai",
      passwordHash: "$2b$10$tMt818XhQKdDk8aQQxI7KeQcaMmlD25upxqp2a7TfvIubeQH1jfSW",
      role: "DOCTOR",
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: "usr-wright",
      name: "Dr. Thomas Wright",
      email: "wright@aegishealth.ai",
      passwordHash: "$2b$10$tMt818XhQKdDk8aQQxI7KeQcaMmlD25upxqp2a7TfvIubeQH1jfSW",
      role: "DOCTOR",
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: "usr-taylor",
      name: "Dr. Emily Taylor",
      email: "taylor@aegishealth.ai",
      passwordHash: "$2b$10$tMt818XhQKdDk8aQQxI7KeQcaMmlD25upxqp2a7TfvIubeQH1jfSW",
      role: "DOCTOR",
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: "usr-anderson",
      name: "Dr. Lisa Anderson",
      email: "anderson@aegishealth.ai",
      passwordHash: "$2b$10$tMt818XhQKdDk8aQQxI7KeQcaMmlD25upxqp2a7TfvIubeQH1jfSW",
      role: "DOCTOR",
      createdAt: new Date(),
      updatedAt: new Date()
    }
  ],
  patientProfile: [
    {
      id: "prof-patient",
      userId: "usr-patient",
      bloodType: "O+",
      allergies: ["Penicillin"],
      dateOfBirth: new Date("1988-06-11"),
      age: 38,
      gender: "Male",
      height: 180,
      weight: 78,
      createdAt: new Date(),
      updatedAt: new Date()
    }
  ],
  doctorProfile: [
    {
      id: "prof-jenkins",
      userId: "usr-jenkins",
      specialty: "Cardiology",
      licenseNumber: "LIC-CARD-992",
      experienceYears: 12,
      phone: "+91 98765 43201",
      address: "72 BKC, Bandra East, Mumbai, Maharashtra 400051",
      bio: "Board certified cardiologist specializing in cardiovascular health, preventative cardiology, and heart failure management.",
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: "prof-chen",
      userId: "usr-chen",
      specialty: "Endocrinology",
      licenseNumber: "LIC-ENDO-481",
      experienceYears: 8,
      phone: "+91 98765 43202",
      address: "45 Indiranagar Double Road, Bengaluru, Karnataka 560038",
      bio: "Clinical endocrinologist dedicated to advanced diabetes management, thyroid disorders, and metabolic health.",
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: "prof-rostova",
      userId: "usr-rostova",
      specialty: "Dermatology",
      licenseNumber: "LIC-DERM-290",
      experienceYears: 15,
      phone: "+91 98765 43203",
      address: "88 Connaught Place, New Delhi, Delhi 110001",
      bio: "Expert dermatologist specializing in diagnostic acne therapy, psoriasis treatment, and melanoma screen procedures.",
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: "prof-vance",
      userId: "usr-vance",
      specialty: "Gastroenterology",
      licenseNumber: "LIC-GAST-338",
      experienceYears: 10,
      phone: "+91 98765 43204",
      address: "34 Jubilee Hills Road 36, Hyderabad, Telangana 500033",
      bio: "Gastroenterologist offering specialized treatment for acid reflux (GERD), gastric ulcers, IBS, and chronic liver care.",
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: "prof-kincaid",
      userId: "usr-kincaid",
      specialty: "Neurology",
      licenseNumber: "LIC-NEUR-775",
      experienceYears: 14,
      phone: "+91 98765 43205",
      address: "56 Anna Salai, Chennai, Tamil Nadu 600002",
      bio: "Neurologist focusing on chronic migraine therapies, clinical neurophysiology, neuromuscular pain, and vertigo diagnostics.",
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: "prof-rahman",
      userId: "usr-rahman",
      specialty: "Infectious Diseases",
      licenseNumber: "LIC-INF-541",
      experienceYears: 7,
      phone: "+91 98765 43206",
      address: "12 Park Street, Kolkata, West Bengal 700016",
      bio: "Infectious disease clinician specializing in tropical medicine, tuberculosis prevention, and clinical immunology.",
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: "prof-carter",
      userId: "usr-carter",
      specialty: "Internal Medicine",
      licenseNumber: "LIC-IM-102",
      experienceYears: 9,
      phone: "+91 98765 43207",
      address: "29 FC Road, Shivajinagar, Pune, Maharashtra 411004",
      bio: "Primary care physician managing chronic medical conditions, yearly checkups, and comprehensive physical diagnostics.",
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: "prof-miller",
      userId: "usr-miller",
      specialty: "Pulmonology",
      licenseNumber: "LIC-PULM-771",
      experienceYears: 11,
      phone: "+91 98765 43208",
      address: "91 SG Highway, Ahmedabad, Gujarat 380054",
      bio: "Specialist pulmonologist dedicated to diagnosing and treating respiratory diseases including asthma, pneumonia, and tuberculosis.",
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: "prof-wright",
      userId: "usr-wright",
      specialty: "Orthopedics",
      licenseNumber: "LIC-ORTH-229",
      experienceYears: 16,
      phone: "+91 98765 43209",
      address: "67 MG Road, Jaipur, Rajasthan 302001",
      bio: "Board certified orthopedic surgeon focusing on bone health, joint disorders, osteoarthritis, and musculoskeletal rehabilitation.",
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: "prof-taylor",
      userId: "usr-taylor",
      specialty: "General Surgery",
      licenseNumber: "LIC-SURG-514",
      experienceYears: 13,
      phone: "+91 98765 43210",
      address: "43 Hazratganj, Lucknow, Uttar Pradesh 226001",
      bio: "Experienced general surgeon specializing in minimally invasive procedures, gastrointestinal surgery, and soft tissue treatments.",
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: "prof-anderson",
      userId: "usr-anderson",
      specialty: "Vascular Surgery",
      licenseNumber: "LIC-VASC-908",
      experienceYears: 10,
      phone: "+91 98765 43211",
      address: "55 Boring Road, Patna, Bihar 800001",
      bio: "Vascular specialist dedicated to the diagnostic therapy and surgical treatment of blood vessel disorders like varicose veins.",
      createdAt: new Date(),
      updatedAt: new Date()
    }
  ],
  specialization: [
    { id: "spec-dermatology", name: "Dermatology" },
    { id: "spec-pulmonology", name: "Pulmonology" },
    { id: "spec-gastroenterology", name: "Gastroenterology" },
    { id: "spec-infectious", name: "Infectious Diseases" },
    { id: "spec-endocrinology", name: "Endocrinology" },
    { id: "spec-cardiology", name: "Cardiology" },
    { id: "spec-neurology", name: "Neurology" },
    { id: "spec-orthopedics", name: "Orthopedics" },
    { id: "spec-surgery", name: "General Surgery" },
    { id: "spec-vascular", name: "Vascular Surgery" },
    { id: "spec-internal", name: "Internal Medicine" }
  ],
  doctorSpecialization: [
    { doctorId: "prof-jenkins", specializationId: "spec-cardiology" },
    { doctorId: "prof-chen", specializationId: "spec-endocrinology" },
    { doctorId: "prof-rostova", specializationId: "spec-dermatology" },
    { doctorId: "prof-vance", specializationId: "spec-gastroenterology" },
    { doctorId: "prof-kincaid", specializationId: "spec-neurology" },
    { doctorId: "prof-rahman", specializationId: "spec-infectious" },
    { doctorId: "prof-carter", specializationId: "spec-internal" },
    { doctorId: "prof-miller", specializationId: "spec-pulmonology" },
    { doctorId: "prof-wright", specializationId: "spec-orthopedics" },
    { doctorId: "prof-taylor", specializationId: "spec-surgery" },
    { doctorId: "prof-anderson", specializationId: "spec-vascular" }
  ],
  doctorAvailability: [
    // Sarah Jenkins slots
    { id: "slot-j1", doctorId: "prof-jenkins", dayOfWeek: 1, startTime: "09:00", endTime: "10:00", isBooked: false },
    { id: "slot-j2", doctorId: "prof-jenkins", dayOfWeek: 1, startTime: "10:30", endTime: "11:30", isBooked: false },
    { id: "slot-j3", doctorId: "prof-jenkins", dayOfWeek: 3, startTime: "14:00", endTime: "15:00", isBooked: false },
    // Chen slots
    { id: "slot-c1", doctorId: "prof-chen", dayOfWeek: 2, startTime: "09:30", endTime: "10:30", isBooked: false },
    { id: "slot-c2", doctorId: "prof-chen", dayOfWeek: 4, startTime: "11:00", endTime: "12:00", isBooked: false },
    { id: "slot-c3", doctorId: "prof-chen", dayOfWeek: 4, startTime: "15:00", endTime: "16:00", isBooked: false },
    // Elena slots
    { id: "slot-r1", doctorId: "prof-rostova", dayOfWeek: 1, startTime: "13:00", endTime: "14:00", isBooked: false },
    { id: "slot-r2", doctorId: "prof-rostova", dayOfWeek: 3, startTime: "09:00", endTime: "10:00", isBooked: false },
    { id: "slot-r3", doctorId: "prof-rostova", dayOfWeek: 5, startTime: "10:00", endTime: "11:00", isBooked: false },
    // Miller slots (Pulmonology)
    { id: "slot-m1", doctorId: "prof-miller", dayOfWeek: 1, startTime: "08:30", endTime: "09:30", isBooked: false },
    { id: "slot-m2", doctorId: "prof-miller", dayOfWeek: 3, startTime: "10:00", endTime: "11:00", isBooked: false },
    { id: "slot-m3", doctorId: "prof-miller", dayOfWeek: 5, startTime: "13:30", endTime: "14:30", isBooked: false },
    // Wright slots (Orthopedics)
    { id: "slot-w1", doctorId: "prof-wright", dayOfWeek: 2, startTime: "09:00", endTime: "10:00", isBooked: false },
    { id: "slot-w2", doctorId: "prof-wright", dayOfWeek: 4, startTime: "14:00", endTime: "15:00", isBooked: false },
    { id: "slot-w3", doctorId: "prof-wright", dayOfWeek: 5, startTime: "15:30", endTime: "16:30", isBooked: false },
    // Taylor slots (General Surgery)
    { id: "slot-t1", doctorId: "prof-taylor", dayOfWeek: 1, startTime: "11:00", endTime: "12:00", isBooked: false },
    { id: "slot-t2", doctorId: "prof-taylor", dayOfWeek: 3, startTime: "09:30", endTime: "10:30", isBooked: false },
    { id: "slot-t3", doctorId: "prof-taylor", dayOfWeek: 4, startTime: "16:00", endTime: "17:00", isBooked: false },
    // Anderson slots (Vascular Surgery)
    { id: "slot-a1", doctorId: "prof-anderson", dayOfWeek: 2, startTime: "13:00", endTime: "14:00", isBooked: false },
    { id: "slot-a2", doctorId: "prof-anderson", dayOfWeek: 4, startTime: "10:30", endTime: "11:30", isBooked: false }
  ],
  disease: [
    { id: "dis-fungal", name: "Fungal infection", specialist: "Dermatologist", precautions: ["bath twice", "use dettol or antiseptic", "keep infected area dry", "use clean towels"] },
    { id: "dis-allergy", name: "Allergy", specialist: "Pulmonologist", precautions: ["avoid allergen exposure", "use nasal spray", "keep surroundings dust-free", "consult a doctor if severe"] },
    { id: "dis-gerd", name: "GERD", specialist: "Gastroenterologist", precautions: ["avoid fatty foods", "do not lie down after eating", "avoid alcohol", "eat smaller meals"] },
    { id: "dis-chronic-cholestasis", name: "Chronic cholestasis", specialist: "Gastroenterologist", precautions: ["eat low-fat diet", "avoid alcohol", "take prescribed vitamins", "stay hydrated"] },
    { id: "dis-drug-reaction", name: "Drug Reaction", specialist: "Dermatologist", precautions: ["stop taking offending drug", "seek medical attention immediately", "use cold compress", "take antihistamine"] },
    { id: "dis-peptic-ulcer", name: "Peptic ulcer disease", specialist: "Gastroenterologist", precautions: ["avoid spicy food", "eat smaller frequent meals", "limit alcohol", "do not skip meals"] },
    { id: "dis-aids", name: "AIDS", specialist: "General Physician", precautions: ["take anti-retroviral therapy (ART)", "use protection", "eat nutritious food", "avoid infections"] },
    { id: "dis-diabetes", name: "Diabetes", specialist: "General Physician", precautions: ["monitor blood glucose regularly", "low carbohydrate diet", "exercise daily", "take prescribed insulin/medications"] },
    { id: "dis-gastroenteritis", name: "Gastroenteritis", specialist: "Gastroenterologist", precautions: ["drink plenty of fluids (ORS)", "eat bland foods", "wash hands thoroughly", "avoid dairy products"] },
    { id: "dis-bronchial-asthma", name: "Bronchial Asthma", specialist: "Pulmonologist", precautions: ["keep inhaler handy", "avoid dust/smoke", "monitor breathing patterns", "stay warm in cold weather"] },
    { id: "dis-hypertension", name: "Hypertension", specialist: "Cardiologist", precautions: ["reduce sodium intake", "exercise regularly", "manage stress", "take anti-hypertensive pills"] },
    { id: "dis-migraine", name: "Migraine", specialist: "Neurologist", precautions: ["avoid trigger foods", "rest in dark quiet room", "stay hydrated", "manage sleep schedule"] },
    { id: "dis-cervical-spondylosis", name: "Cervical spondylosis", specialist: "Neurologist", precautions: ["do neck exercises", "use ergonomic pillows", "maintain good posture", "avoid heavy lifting"] },
    { id: "dis-paralysis", name: "Paralysis (brain hemorrhage)", specialist: "Neurologist", precautions: ["seek immediate emergency care", "monitor blood pressure", "undergo physiotherapy", "take prescribed anticoagulants"] },
    { id: "dis-jaundice", name: "Jaundice", specialist: "Gastroenterologist", precautions: ["eat light low-fat meals", "drink boiled water", "complete bed rest", "avoid alcohol"] },
    { id: "dis-malaria", name: "Malaria", specialist: "General Physician", precautions: ["take prescribed anti-malarial course", "use mosquito nets", "avoid standing water", "keep hydrated"] },
    { id: "dis-chicken-pox", name: "Chicken pox", specialist: "Dermatologist", precautions: ["do not scratch blisters", "isolate from others", "use calamine lotion", "wear loose cotton clothes"] },
    { id: "dis-dengue", name: "Dengue", specialist: "General Physician", precautions: ["drink plenty of fluids", "take paracetamol (avoid aspirin/ibuprofen)", "rest completely", "use mosquito repellent"] },
    { id: "dis-typhoid", name: "Typhoid", specialist: "Gastroenterologist", precautions: ["take complete antibiotic course", "eat easily digestible warm food", "drink boiled/bottled water", "wash hands regularly"] },
    { id: "dis-hepatitis-a", name: "Hepatitis A", specialist: "Gastroenterologist", precautions: ["avoid alcohol", "eat small nutritious meals", "wash hands before eating", "rest well"] },
    { id: "dis-hepatitis-b", name: "Hepatitis B", specialist: "Gastroenterologist", precautions: ["take prescribed antiviral medications", "do not share personal care items", "avoid alcohol", "regular liver checkups"] },
    { id: "dis-hepatitis-c", name: "Hepatitis C", specialist: "Gastroenterologist", precautions: ["take complete antiviral course", "avoid alcohol", "eat balanced meals", "regular checkups"] },
    { id: "dis-hepatitis-d", name: "Hepatitis D", specialist: "Gastroenterologist", precautions: ["regular liver function monitoring", "avoid alcohol", "take prescribed antivirals", "maintain hygiene"] },
    { id: "dis-hepatitis-e", name: "Hepatitis E", specialist: "Gastroenterologist", precautions: ["drink safe pure water", "avoid raw/uncooked meat", "rest completely", "avoid alcohol"] },
    { id: "dis-alcoholic-hepatitis", name: "Alcoholic hepatitis", specialist: "Gastroenterologist", precautions: ["completely stop drinking alcohol", "eat high-protein diet", "take prescribed liver supplements", "exercise moderately"] },
    { id: "dis-tuberculosis", name: "Tuberculosis", specialist: "Pulmonologist", precautions: ["complete full DOTS treatment", "wear face mask in public", "stay in well-ventilated rooms", "eat high-protein diet"] },
    { id: "dis-common-cold", name: "Common Cold", specialist: "Pulmonologist", precautions: ["drink warm water and herbal teas", "steam inhalation", "salt water gargles", "rest well"] },
    { id: "dis-pneumonia", name: "Pneumonia", specialist: "Pulmonologist", precautions: ["take prescribed antibiotics/antivirals", "stay warm", "drink warm fluids", "rest and isolate"] },
    { id: "dis-piles", name: "Dimorphic hemmorhoids(piles)", specialist: "Gastroenterologist", precautions: ["eat high-fiber diet", "drink plenty of water", "avoid straining during bowel movements", "take sitz baths"] },
    { id: "dis-heart-attack", name: "Heart attack", specialist: "Cardiologist", precautions: ["call ambulance immediately", "chew aspirin if advised", "stay calm and rest", "perform CPR if trained and necessary"] },
    { id: "dis-varicose-veins", name: "Varicose veins", specialist: "General Physician", precautions: ["avoid prolonged standing/sitting", "elevate legs when resting", "wear compression stockings", "exercise regularly"] },
    { id: "dis-hypothyroidism", name: "Hypothyroidism", specialist: "General Physician", precautions: ["take thyroid hormone daily", "maintain a healthy weight", "monitor thyroid levels", "eat fiber-rich foods"] },
    { id: "dis-hyperthyroidism", name: "Hyperthyroidism", specialist: "General Physician", precautions: ["take anti-thyroid pills", "reduce caffeine and stimulants", "regular blood checks", "eat calcium-rich foods"] },
    { id: "dis-hypoglycemia", name: "Hypoglycemia", specialist: "General Physician", precautions: ["eat sugar/candy immediately if levels drop", "consume balanced frequent meals", "monitor sugar levels", "carry glucose tablets"] },
    { id: "dis-osteoarthritis", name: "Osteoarthristis", specialist: "Neurologist", precautions: ["do low-impact joint exercises", "maintain healthy body weight", "apply hot/cold packs", "take prescribed pain relievers"] },
    { id: "dis-arthritis", name: "Arthritis", specialist: "Neurologist", precautions: ["do gentle stretches", "protect joints from strain", "eat anti-inflammatory foods", "take prescribed DMARDs"] },
    { id: "dis-vertigo", name: "(vertigo) Paroymsal Positional Vertigo", specialist: "Neurologist", precautions: ["perform Epley maneuver", "avoid sudden head movements", "sit down immediately when dizzy", "keep surroundings safe and clear"] },
    { id: "dis-acne", name: "Acne", specialist: "Dermatologist", precautions: ["wash face twice daily", "do not squeeze pimples", "use non-comedogenic cosmetics", "avoid oily foods"] },
    { id: "dis-uti", name: "Urinary tract infection", specialist: "General Physician", precautions: ["drink plenty of water", "maintain perineal hygiene", "urinate after intercourse", "take complete antibiotic course"] },
    { id: "dis-psoriasis", name: "Psoriasis", specialist: "Dermatologist", precautions: ["keep skin moisturized", "avoid skin triggers/stress", "spend moderate time in sun", "use prescribed ointments"] },
    { id: "dis-impetigo", name: "Impetigo", specialist: "Dermatologist", precautions: ["clean sores with warm soap water", "apply antibiotic ointment", "wash hands frequently", "do not share towels/clothes"] }
  ],
  prediction: [],
  appointment: [],
  rating: [
    { doctorId: "prof-jenkins", score: 5 },
    { doctorId: "prof-jenkins", score: 4 },
    { doctorId: "prof-chen", score: 5 },
    { doctorId: "prof-rostova", score: 5 },
    { doctorId: "prof-rostova", score: 5 },
    { doctorId: "prof-miller", score: 5 },
    { doctorId: "prof-miller", score: 4 },
    { doctorId: "prof-wright", score: 5 },
    { doctorId: "prof-wright", score: 5 },
    { doctorId: "prof-taylor", score: 4 },
    { doctorId: "prof-taylor", score: 5 },
    { doctorId: "prof-anderson", score: 5 }
  ]
};

// Programmatically generate 110 Indian Doctors to mockStore for the mock fallback DB
if (isNewStore) {
  (() => {
    const firstNamesM = ["Rajesh", "Amit", "Vikram", "Suresh", "Sanjay", "Arvind", "Anil", "Vijay", "Ramesh", "Sunil", "Alok", "Deepak", "Sandeep", "Rohan", "Ajay", "Aditya", "Vikas", "Manoj", "Nitin", "Gaurav", "Harish", "Karan", "Madhav", "Pranav", "Raghav", "Siddharth", "Varun", "Yash", "Abhishek", "Rahul"];
  const firstNamesF = ["Priya", "Sunita", "Anjali", "Meera", "Neha", "Ritu", "Shalini", "Kavita", "Swati", "Jyoti", "Pooja", "Divya", "Aarti", "Sneha", "Deepa", "Geeta", "Rekha", "Anita", "Lakshmi", "Shweta", "Komal", "Nisha", "Preeti", "Rupa", "Tanvi", "Urvi", "Vasudha", "Yamini", "Aditi", "Bhavna"];
  const lastNames = ["Sharma", "Patel", "Iyer", "Rao", "Deshmukh", "Nair", "Joshi", "Gupta", "Verma", "Malhotra", "Reddy", "Chatterjee", "Bose", "Sen", "Das", "Kulkarni", "Bhat", "Hegde", "Menon", "Pillai", "Choudhury", "Singh", "Prasad", "Mehta", "Vyas", "Roy", "Bannerjee", "Mishra", "Pandey", "Trivedi"];

  const specialties = [
    "Dermatology", "Pulmonology", "Gastroenterology", "Infectious Diseases", "Endocrinology", 
    "Cardiology", "Neurology", "Orthopedics", "General Surgery", "Vascular Surgery", "Internal Medicine"
  ];

  const indianHospitals = [
    { city: "New Delhi, Delhi", name: "Max Super Speciality Hospital", area: "Saket", pin: "110017", code: "11" },
    { city: "Gurugram, Haryana", name: "Fortis Memorial Research Institute", area: "Sector 44", pin: "122003", code: "124" },
    { city: "New Delhi, Delhi", name: "Indraprastha Apollo Hospitals", area: "Sarita Vihar", pin: "110076", code: "11" },
    { city: "Mumbai, Maharashtra", name: "Kokilaben Dhirubhai Ambani Hospital", area: "Andheri West", pin: "400053", code: "22" },
    { city: "Mumbai, Maharashtra", name: "Lilavati Hospital & Research Centre", area: "Bandra West", pin: "400050", code: "22" },
    { city: "Mumbai, Maharashtra", name: "Sir H. N. Reliance Foundation Hospital", area: "Girgaon", pin: "400004", code: "22" },
    { city: "Bengaluru, Karnataka", name: "Manipal Hospital", area: "HAL Airport Road", pin: "560017", code: "80" },
    { city: "Bengaluru, Karnataka", name: "Aster CMI Hospital", area: "Sahakar Nagar", pin: "560092", code: "80" },
    { city: "Bengaluru, Karnataka", name: "Fortis Hospital", area: "Bannerghatta Road", pin: "560076", code: "80" },
    { city: "Hyderabad, Telangana", name: "Apollo Hospitals", area: "Jubilee Hills", pin: "500033", code: "40" },
    { city: "Hyderabad, Telangana", name: "Yashoda Hospitals", area: "Somajiguda", pin: "500082", code: "40" },
    { city: "Chennai, Tamil Nadu", name: "Apollo Hospitals", area: "Greams Road", pin: "600006", code: "44" },
    { city: "Chennai, Tamil Nadu", name: "Fortis Malar Hospital", area: "Adyar", pin: "600020", code: "44" },
    { city: "Kolkata, West Bengal", name: "AMRI Hospitals", area: "Salt Lake", pin: "700098", code: "33" },
    { city: "Kolkata, West Bengal", name: "Apollo Multispeciality Hospitals", area: "Canal Circular Road", pin: "700054", code: "33" },
    { city: "Pune, Maharashtra", name: "Jehangir Hospital", area: "Bund Garden Road", pin: "411001", code: "20" },
    { city: "Pune, Maharashtra", name: "Ruby Hall Clinic", area: "Sassoon Road", pin: "411001", code: "20" }
  ];
 
  const specIdMap: Record<string, string> = {
    "Dermatology": "spec-dermatology",
    "Pulmonology": "spec-pulmonology",
    "Gastroenterology": "spec-gastroenterology",
    "Infectious Diseases": "spec-infectious",
    "Endocrinology": "spec-endocrinology",
    "Cardiology": "spec-cardiology",
    "Neurology": "spec-neurology",
    "Orthopedics": "spec-orthopedics",
    "General Surgery": "spec-surgery",
    "Vascular Surgery": "spec-vascular",
    "Internal Medicine": "spec-internal"
  };
 
  // Clear initial manual list to make the database exclusively Indian doctors
  mockStore.user = mockStore.user.filter((u: any) => u.role !== "DOCTOR");
  mockStore.doctorProfile = [];
  mockStore.doctorSpecialization = [];
  mockStore.doctorAvailability = [];
  mockStore.rating = [];
 
  let docCounter = 1;
 
  for (let i = 0; i < specialties.length; i++) {
    const specialty = specialties[i];
    const specId = specIdMap[specialty];
 
    for (let j = 0; j < 10; j++) {
      const isFemale = (j % 2 === 0);
      const firstName = isFemale 
        ? firstNamesF[(i * 10 + j) % firstNamesF.length] 
        : firstNamesM[(i * 10 + j) % firstNamesM.length];
      const lastName = lastNames[(i * 10 + j) % lastNames.length];
      
      const userId = `usr-doc-${docCounter}`;
      const docId = `prof-doc-${docCounter}`;
      const name = `Dr. ${firstName} ${lastName}`;
      const email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}${docCounter}@aegishealth.ai`;
      const licenseNumber = `LIC-IND-${String(docCounter).padStart(3, '0')}`;
      const experienceYears = 5 + ((i * j + 3) % 20);
      
      const hospIdx = (i * 10 + j) % indianHospitals.length;
      const hosp = indianHospitals[hospIdx];
      const address = `${hosp.name}, ${hosp.area}, ${hosp.city} - ${hosp.pin}`;
      const mobileNumber = `+91 98765 ${String(10000 + docCounter * 73).slice(0, 5)}`;
      const clinicPhone = `+91 ${hosp.code} 4567 ${String(1000 + docCounter).slice(1)}`;
      
      const bio = `Practitioner in India specializing in ${specialty} with ${experienceYears} years of clinical expertise. Committed to patient care and advanced disease prediction workflows.`;
 
      // 1. User
      mockStore.user.push({
        id: userId,
        name: name,
        email: email,
        passwordHash: "$2b$10$tMt818XhQKdDk8aQQxI7KeQcaMmlD25upxqp2a7TfvIubeQH1jfSW", // "doctor123"
        role: "DOCTOR",
        createdAt: new Date(),
        updatedAt: new Date()
      });
 
      // 2. Doctor Profile
      mockStore.doctorProfile.push({
        id: docId,
        userId: userId,
        specialty: specialty,
        licenseNumber: licenseNumber,
        experienceYears: experienceYears,
        phone: mobileNumber,
        mobileNumber: mobileNumber,
        clinicPhone: clinicPhone,
        address: address,
        isRegistered: false,
        bio: bio,
        createdAt: new Date(),
        updatedAt: new Date()
      });

      // 3. Doctor Specialization
      if (specId) {
        mockStore.doctorSpecialization.push({
          doctorId: docId,
          specializationId: specId
        });
      }

      // 4. Doctor Availabilities (3 slots per doctor)
      for (let s = 1; s <= 3; s++) {
        mockStore.doctorAvailability.push({
          id: `slot-doc-${docCounter}-${s}`,
          doctorId: docId,
          dayOfWeek: 1 + ((j + s) % 5),
          startTime: `${9 + s}:00`,
          endTime: `${10 + s}:00`,
          isBooked: false
        });
      }

      // 5. Ratings
      const ratingCount = 2 + (j % 3);
      for (let r = 0; r < ratingCount; r++) {
        mockStore.rating.push({
          doctorId: docId,
          score: 4 + ((r + j) % 2)
        });
      }

      docCounter++;
    }
  }
})();
}

if (process.env.NODE_ENV !== "production") {
  globalForMockStore.mockStore = mockStore;
}

// Mock prisma client implementation containing query methods needed by the application
const mockPrisma: any = {
  $transaction: async (arg: any) => {
    if (Array.isArray(arg)) {
      const results = [];
      for (const op of arg) {
        results.push(await op);
      }
      return results;
    } else if (typeof arg === "function") {
      return await arg(mockPrisma);
    }
    return null;
  },
  session: {
    findUnique: async (args: any) => {
      const sessionToken = args?.where?.sessionToken;
      if (!mockStore.session) return null;
      const found = mockStore.session.find((s: any) => s.sessionToken === sessionToken);
      return found ? { ...found } : null;
    },
    create: async (args: any) => {
      const newSession = {
        id: `sess-${Date.now()}`,
        ...args.data
      };
      if (!mockStore.session) mockStore.session = [];
      mockStore.session.push(newSession);
      return newSession;
    },
    update: async (args: any) => {
      const sessionToken = args?.where?.sessionToken;
      if (!mockStore.session) return null;
      const idx = mockStore.session.findIndex((s: any) => s.sessionToken === sessionToken);
      if (idx !== -1) {
        mockStore.session[idx] = { ...mockStore.session[idx], ...args.data };
        return { ...mockStore.session[idx] };
      }
      return null;
    },
    delete: async (args: any) => {
      const sessionToken = args?.where?.sessionToken;
      if (!mockStore.session) return null;
      const idx = mockStore.session.findIndex((s: any) => s.sessionToken === sessionToken);
      if (idx !== -1) {
        const [deleted] = mockStore.session.splice(idx, 1);
        return deleted;
      }
      return null;
    },
    deleteMany: async (args: any) => {
      if (!mockStore.session) mockStore.session = [];
      const before = mockStore.session.length;
      mockStore.session = [];
      return { count: before };
    }
  },
  verificationToken: {
    create: async (args: any) => {
      const newToken = { ...args.data };
      if (!mockStore.verificationToken) mockStore.verificationToken = [];
      mockStore.verificationToken.push(newToken);
      return newToken;
    },
    useToken: async (args: any) => {
      const { identifier, token } = args.where;
      if (!mockStore.verificationToken) return null;
      const idx = mockStore.verificationToken.findIndex((t: any) => t.identifier === identifier && t.token === token);
      if (idx !== -1) {
        const [used] = mockStore.verificationToken.splice(idx, 1);
        return used;
      }
      return null;
    }
  },
  user: {
    findUnique: async (args: any) => {
      const email = args?.where?.email;
      const id = args?.where?.id;
      const found = mockStore.user.find((u: any) => (email && u.email === email) || (id && u.id === id));
      if (!found) return null;
      const copy = { ...found };
      if (args?.include?.patientProfile) {
        copy.patientProfile = mockStore.patientProfile.find((p: any) => p.userId === copy.id) || null;
      }
      if (args?.include?.doctorProfile) {
        copy.doctorProfile = mockStore.doctorProfile.find((d: any) => d.userId === copy.id) || null;
      }
      return copy;
    },
    findMany: async (args: any) => {
      let results = [...mockStore.user];
      if (args?.orderBy) {
        const [field, dir] = Object.entries(args.orderBy)[0];
        results.sort((a: any, b: any) => {
          const aVal = a[field];
          const bVal = b[field];
          if (aVal < bVal) return dir === "desc" ? 1 : -1;
          if (aVal > bVal) return dir === "desc" ? -1 : 1;
          return 0;
        });
      }
      if (args?.select) {
        results = results.map((u: any) => {
          const selected: any = {};
          for (const key of Object.keys(args.select)) {
            if (key in u) selected[key] = u[key];
          }
          return selected;
        });
      }
      return results;
    },
    create: async (args: any) => {
      const newUser = {
        id: `user-${Date.now()}`,
        name: args.data.name || null,
        email: args.data.email || null,
        passwordHash: args.data.passwordHash || null,
        role: args.data.role || "PATIENT",
        createdAt: new Date(),
        updatedAt: new Date()
      };
      mockStore.user.push(newUser);
      return newUser;
    },
    update: async (args: any) => {
      const id = args?.where?.id;
      const email = args?.where?.email;
      const idx = mockStore.user.findIndex((u: any) => (id && u.id === id) || (email && u.email === email));
      if (idx !== -1) {
        mockStore.user[idx] = {
          ...mockStore.user[idx],
          ...args.data,
          updatedAt: new Date()
        };
        return { ...mockStore.user[idx] };
      }
      return null;
    }
  },
  patientProfile: {
    findFirst: async () => {
      return mockStore.patientProfile[0] ? { ...mockStore.patientProfile[0] } : null;
    },
    findUnique: async (args: any) => {
      const userId = args?.where?.userId;
      const id = args?.where?.id;
      const found = mockStore.patientProfile.find((p: any) => (userId && p.userId === userId) || (id && p.id === id));
      return found ? { ...found } : null;
    },
    create: async (args: any) => {
      const newProfile = {
        id: `pat-prof-${Date.now()}`,
        userId: args.data.userId,
        bloodType: args.data.bloodType || null,
        gender: args.data.gender || null,
        age: args.data.age || null,
        height: args.data.height || null,
        weight: args.data.weight || null,
        allergies: args.data.allergies || [],
        createdAt: new Date(),
        updatedAt: new Date()
      };
      mockStore.patientProfile.push(newProfile);
      return newProfile;
    },
    update: async (args: any) => {
      const userId = args?.where?.userId;
      const id = args?.where?.id;
      const idx = mockStore.patientProfile.findIndex((p: any) => (userId && p.userId === userId) || (id && p.id === id));
      if (idx !== -1) {
        mockStore.patientProfile[idx] = {
          ...mockStore.patientProfile[idx],
          ...args.data,
          updatedAt: new Date()
        };
        return { ...mockStore.patientProfile[idx] };
      }
      return null;
    }
  },
  doctorProfile: {
    findUnique: async (args: any) => {
      const userId = args?.where?.userId;
      const found = mockStore.doctorProfile.find((d: any) => d.userId === userId);
      return found ? { ...found } : null;
    },
    findMany: async (args: any) => {
      return mockStore.doctorProfile.map((doc: any) => {
        const user = mockStore.user.find((u: any) => u.id === doc.userId) || {};
        const ratings = mockStore.rating.filter((r: any) => r.doctorId === doc.id).map((r: any) => ({ score: r.score }));
        const availabilities = mockStore.doctorAvailability.filter((av: any) => av.doctorId === doc.id && !av.isBooked);
        const specializations = mockStore.doctorSpecialization.filter((ds: any) => ds.doctorId === doc.id).map((ds: any) => {
          const spec = mockStore.specialization.find((s: any) => s.id === ds.specializationId) || {};
          return { specialization: spec };
        });

        return {
          ...doc,
          user: {
            name: user.name,
            email: user.email,
            image: user.image || null
          },
          specializations,
          ratings,
          availabilities
        };
      });
    },
    create: async (args: any) => {
      const newProfile = {
        id: `doc-prof-${Date.now()}`,
        userId: args.data.userId,
        specialty: args.data.specialty,
        licenseNumber: args.data.licenseNumber,
        experienceYears: args.data.experienceYears || 5,
        bio: args.data.bio || null,
        mobileNumber: args.data.mobileNumber || null,
        clinicPhone: args.data.clinicPhone || null,
        address: args.data.address || null,
        isRegistered: args.data.isRegistered !== undefined ? args.data.isRegistered : false,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      mockStore.doctorProfile.push(newProfile);
      return newProfile;
    }
  },
  doctorAvailability: {
    findUnique: async (args: any) => {
      const found = mockStore.doctorAvailability.find((av: any) => av.id === args?.where?.id);
      return found ? { ...found } : null;
    },
    update: async (args: any) => {
      const id = args?.where?.id;
      const idx = mockStore.doctorAvailability.findIndex((av: any) => av.id === id);
      if (idx !== -1) {
        mockStore.doctorAvailability[idx] = {
          ...mockStore.doctorAvailability[idx],
          ...args.data
        };
        return { ...mockStore.doctorAvailability[idx] };
      }
      return null;
    }
  },
  disease: {
    findFirst: async (args: any) => {
      const name = args?.where?.name?.equals;
      const found = mockStore.disease.find((d: any) => d.name.toLowerCase() === name?.toLowerCase());
      return found ? { ...found } : null;
    }
  },
  prediction: {
    create: async (args: any) => {
      const newPrediction = {
        id: `pred-${Date.now()}`,
        ...args.data,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      mockStore.prediction.push(newPrediction);
      return newPrediction;
    }
  },
  appointment: {
    create: async (args: any) => {
      const newAppt = {
        id: `appt-${Date.now()}`,
        ...args.data,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      mockStore.appointment.push(newAppt);
      return newAppt;
    }
  },
  account: {
    create: async (args: any) => {
      const newAccount = {
        id: `acc-${Date.now()}`,
        ...args.data,
      };
      if (!mockStore.account) mockStore.account = [];
      mockStore.account.push(newAccount);
      return newAccount;
    },
    findUnique: async (args: any) => {
      if (!mockStore.account) mockStore.account = [];
      const provider_providerAccountId = args?.where?.provider_providerAccountId;
      if (provider_providerAccountId) {
        const { provider, providerAccountId } = provider_providerAccountId;
        const found = mockStore.account.find((a: any) => a.provider === provider && a.providerAccountId === providerAccountId);
        return found ? { ...found } : null;
      }
      return null;
    }
  },
  passwordResetToken: {
    findFirst: async (args: any) => {
      const where = args?.where || {};
      if (!mockStore.passwordResetToken) return null;
      const found = mockStore.passwordResetToken.find((t: any) =>
        Object.entries(where).every(([key, value]) => t[key] === value)
      );
      return found ? { ...found } : null;
    },
    create: async (args: any) => {
      const newToken = {
        id: `prt-${Date.now()}`,
        ...args.data,
        createdAt: new Date(),
      };
      if (!mockStore.passwordResetToken) mockStore.passwordResetToken = [];
      mockStore.passwordResetToken.push(newToken);
      return newToken;
    },
    delete: async (args: any) => {
      const id = args?.where?.id;
      if (!mockStore.passwordResetToken) return null;
      const idx = mockStore.passwordResetToken.findIndex((t: any) => t.id === id);
      if (idx !== -1) {
        const [deleted] = mockStore.passwordResetToken.splice(idx, 1);
        return deleted;
      }
      return null;
    },
    deleteMany: async (args: any) => {
      const where = args?.where || {};
      if (!mockStore.passwordResetToken) mockStore.passwordResetToken = [];
      const before = mockStore.passwordResetToken.length;
      mockStore.passwordResetToken = mockStore.passwordResetToken.filter((t: any) =>
        !Object.entries(where).every(([key, value]) => t[key] === value)
      );
      return { count: before - mockStore.passwordResetToken.length };
    }
  }
};

// Attempt a lightweight connectivity check at startup so we fail-fast
// rather than catching errors on every query.
let databaseAvailable = false;

async function probeDatabase(client: PrismaClient): Promise<boolean> {
  try {
    await client.$queryRaw`SELECT 1`;
    return true;
  } catch {
    return false;
  }
}

// Kick off the probe immediately (non-blocking — the proxy will wait if needed)
const probePromise = realPrisma ? probeDatabase(realPrisma) : Promise.resolve(false);
probePromise.then(ok => { databaseAvailable = ok; });

// Create a fallback proxy client that intercepts database connection failures
// In production, errors are thrown instead of falling back to mock store
function createDatabaseProxy(real: PrismaClient | null, fallback: any) {
  let useFallback = false;
  const isProd = process.env.NODE_ENV === "production";

  function throwIfProd(error: any): never {
    if (isProd) {
      console.error("🚨 Production database error:", error?.message || error);
      throw new Error(`Database connection failed: ${error?.message || "Unknown error"}`);
    }
    throw error;
  }

  const getTargetHandler = (targetPath: string[]): any => {
    return new Proxy(() => {}, {
      get(target, prop: string | symbol) {
        if (typeof prop === "symbol") {
          return (target as any)[prop];
        }
        if (prop === "then" || prop === "toJSON" || prop === "toString" || prop === "valueOf" || prop === "constructor") {
          return (target as any)[prop];
        }
        return getTargetHandler([...targetPath, prop]);
      },
      async apply(target, thisArg, argumentsList) {
        if (!useFallback && real) {
          if (!databaseAvailable) {
            await probePromise;
          }
          if (!databaseAvailable) {
            if (isProd) throw new Error("Database is not available");
            useFallback = true;
          } else {
            try {
              let parent: any = real;
              for (let i = 0; i < targetPath.length - 1; i++) {
                parent = parent[targetPath[i]];
              }
              const method = targetPath.length > 0 ? parent[targetPath[targetPath.length - 1]] : parent;
              return await method.apply(parent, argumentsList);
            } catch (error: any) {
              if (isProd) throwIfProd(error);
              const msg = error?.message || "";
              console.warn("⚠️ Database query failed. Falling back to in-memory sandbox DB:", msg.slice(0, 120));
              useFallback = true;
            }
          }
        }

        if (isProd && useFallback) {
          throw new Error("Database fallback should not occur in production");
        }

        let parent: any = fallback;
        for (let i = 0; i < targetPath.length - 1; i++) {
          parent = parent[targetPath[i]];
        }
        const method = targetPath.length > 0 ? parent[targetPath[targetPath.length - 1]] : parent;
        if (typeof method === "function") {
          return await method.apply(parent, argumentsList);
        }
        return method;
      }
    });
  };

  return new Proxy(real || {}, {
    get(target, prop: string | symbol) {
      if (typeof prop === "symbol") {
        return (target as any)[prop];
      }
      if (prop === "then" || prop === "toJSON" || prop === "toString" || prop === "valueOf" || prop === "constructor") {
        return (target as any)[prop];
      }
      if (prop === "$transaction") {
        return async (cb: any) => {
          if (!useFallback && real) {
            if (!databaseAvailable) {
              await probePromise;
            }
            if (databaseAvailable) {
              try {
                return await real.$transaction(cb);
              } catch (error: any) {
                if (isProd) throwIfProd(error);
                const msg = error?.message || "";
                console.warn("⚠️ Database transaction failed. Falling back to in-memory sandbox DB:", msg.slice(0, 120));
                useFallback = true;
              }
            } else {
              if (isProd) throw new Error("Database is not available");
              useFallback = true;
            }
          }
          if (isProd && useFallback) {
            throw new Error("Database fallback should not occur in production");
          }
          return await fallback.$transaction(cb);
        };
      }
      return getTargetHandler([prop]);
    }
  });
}

const activeDb = createDatabaseProxy(realPrisma, mockPrisma);
export const db = activeDb as unknown as PrismaClient;

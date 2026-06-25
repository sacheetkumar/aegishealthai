const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const { Pool } = require('pg');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');

dotenv.config();

const connectionString = process.env.DATABASE_URL;
const pool = new Pool({ 
  connectionString,
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 30000
});
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("Starting database seeding for AegisHealthAI...");

  // 1. Clean up existing seed data to ensure repeatability
  console.log("Cleaning up existing doctor-related data...");
  
  // We'll delete ratings, availabilities, appointments first (due to FK constraints)
  await prisma.rating.deleteMany({});
  await prisma.appointment.deleteMany({});
  await prisma.doctorAvailability.deleteMany({});
  await prisma.doctorSpecialization.deleteMany({});
  
  // Delete doctor profiles
  await prisma.doctorProfile.deleteMany({});
  
  // Delete users with DOCTOR role
  await prisma.user.deleteMany({
    where: { role: 'DOCTOR' }
  });

  // Delete specializations
  await prisma.specialization.deleteMany({});

  // Clean up medical records, predictions and diseases
  await prisma.predictionSymptom.deleteMany({});
  await prisma.prediction.deleteMany({});
  await prisma.medicalRecordSymptom.deleteMany({});
  await prisma.prescription.deleteMany({});
  await prisma.report.deleteMany({});
  await prisma.medicalRecord.deleteMany({});
  await prisma.disease.deleteMany({});

  console.log("Cleanup complete. Creating specializations...");

  // 2. Create Specializations
  const specializationsData = [
    { name: "Dermatology", description: "Diagnosis and treatment of skin, hair, and nail conditions." },
    { name: "Pulmonology", description: "Specialized care for respiratory and lung diseases." },
    { name: "Gastroenterology", description: "Management of diseases of the digestive system." },
    { name: "Infectious Diseases", description: "Treatment of complex viral, bacterial, and fungal infections." },
    { name: "Endocrinology", description: "Care for hormone imbalances, diabetes, and thyroid conditions." },
    { name: "Cardiology", description: "Specialized care for heart health and cardiovascular diseases." },
    { name: "Neurology", description: "Diagnosis and management of brain, spinal cord, and nerve disorders." },
    { name: "Orthopedics", description: "Treatment of musculoskeletal system disorders, joints, and bones." },
    { name: "General Surgery", description: "Surgical management of gastrointestinal, hernia, and soft tissue issues." },
    { name: "Vascular Surgery", description: "Treatment of disorders of the blood vessels and lymphatic system." },
    { name: "Internal Medicine", description: "Comprehensive primary care and management of chronic diseases." }
  ];

  const specMap = {};
  for (const s of specializationsData) {
    const spec = await prisma.specialization.create({
      data: s
    });
    specMap[s.name] = spec.id;
  }

  console.log(`Created ${Object.keys(specMap).length} specializations.`);

  console.log("Creating 41 Kaggle diseases...");
  const diseasesData = [
    { name: "Fungal infection", specialist: "Dermatologist", precautions: ["bath twice", "use dettol or antiseptic", "keep infected area dry", "use clean towels"] },
    { name: "Allergy", specialist: "Pulmonologist", precautions: ["avoid allergen exposure", "use nasal spray", "keep surroundings dust-free", "consult a doctor if severe"] },
    { name: "GERD", specialist: "Gastroenterologist", precautions: ["avoid fatty foods", "do not lie down after eating", "avoid alcohol", "eat smaller meals"] },
    { name: "Chronic cholestasis", specialist: "Gastroenterologist", precautions: ["eat low-fat diet", "avoid alcohol", "take prescribed vitamins", "stay hydrated"] },
    { name: "Drug Reaction", specialist: "Dermatologist", precautions: ["stop taking offending drug", "seek medical attention immediately", "use cold compress", "take antihistamine"] },
    { name: "Peptic ulcer disease", specialist: "Gastroenterologist", precautions: ["avoid spicy food", "eat smaller frequent meals", "limit alcohol", "do not skip meals"] },
    { name: "AIDS", specialist: "General Physician", precautions: ["take anti-retroviral therapy (ART)", "use protection", "eat nutritious food", "avoid infections"] },
    { name: "Diabetes", specialist: "General Physician", precautions: ["monitor blood glucose regularly", "low carbohydrate diet", "exercise daily", "take prescribed insulin/medications"] },
    { name: "Gastroenteritis", specialist: "Gastroenterologist", precautions: ["drink plenty of fluids (ORS)", "eat bland foods", "wash hands thoroughly", "avoid dairy products"] },
    { name: "Bronchial Asthma", specialist: "Pulmonologist", precautions: ["keep inhaler handy", "avoid dust/smoke", "monitor breathing patterns", "stay warm in cold weather"] },
    { name: "Hypertension", specialist: "Cardiologist", precautions: ["reduce sodium intake", "exercise regularly", "manage stress", "take anti-hypertensive pills"] },
    { name: "Migraine", specialist: "Neurologist", precautions: ["avoid trigger foods", "rest in dark quiet room", "stay hydrated", "manage sleep schedule"] },
    { name: "Cervical spondylosis", specialist: "Neurologist", precautions: ["do neck exercises", "use ergonomic pillows", "maintain good posture", "avoid heavy lifting"] },
    { name: "Paralysis (brain hemorrhage)", specialist: "Neurologist", precautions: ["seek immediate emergency care", "monitor blood pressure", "undergo physiotherapy", "take prescribed anticoagulants"] },
    { name: "Jaundice", specialist: "Gastroenterologist", precautions: ["eat light low-fat meals", "drink boiled water", "complete bed rest", "avoid alcohol"] },
    { name: "Malaria", specialist: "General Physician", precautions: ["take prescribed anti-malarial course", "use mosquito nets", "avoid standing water", "keep hydrated"] },
    { name: "Chicken pox", specialist: "Dermatologist", precautions: ["do not scratch blisters", "isolate from others", "use calamine lotion", "wear loose cotton clothes"] },
    { name: "Dengue", specialist: "General Physician", precautions: ["drink plenty of fluids", "take paracetamol (avoid aspirin/ibuprofen)", "rest completely", "use mosquito repellent"] },
    { name: "Typhoid", specialist: "Gastroenterologist", precautions: ["take complete antibiotic course", "eat easily digestible warm food", "drink boiled/bottled water", "wash hands regularly"] },
    { name: "Hepatitis A", specialist: "Gastroenterologist", precautions: ["avoid alcohol", "eat small nutritious meals", "wash hands before eating", "rest well"] },
    { name: "Hepatitis B", specialist: "Gastroenterologist", precautions: ["take prescribed antiviral medications", "do not share personal care items", "avoid alcohol", "regular liver checkups"] },
    { name: "Hepatitis C", specialist: "Gastroenterologist", precautions: ["take complete antiviral course", "avoid alcohol", "eat balanced meals", "regular checkups"] },
    { name: "Hepatitis D", specialist: "Gastroenterologist", precautions: ["regular liver function monitoring", "avoid alcohol", "take prescribed antivirals", "maintain hygiene"] },
    { name: "Hepatitis E", specialist: "Gastroenterologist", precautions: ["drink safe pure water", "avoid raw/uncooked meat", "rest completely", "avoid alcohol"] },
    { name: "Alcoholic hepatitis", specialist: "Gastroenterologist", precautions: ["completely stop drinking alcohol", "eat high-protein diet", "take prescribed liver supplements", "exercise moderately"] },
    { name: "Tuberculosis", specialist: "Pulmonologist", precautions: ["complete full DOTS treatment", "wear face mask in public", "stay in well-ventilated rooms", "eat high-protein diet"] },
    { name: "Common Cold", specialist: "Pulmonologist", precautions: ["drink warm water and herbal teas", "steam inhalation", "salt water gargles", "rest well"] },
    { name: "Pneumonia", specialist: "Pulmonologist", precautions: ["take prescribed antibiotics/antivirals", "stay warm", "drink warm fluids", "rest and isolate"] },
    { name: "Dimorphic hemmorhoids(piles)", specialist: "Gastroenterologist", precautions: ["eat high-fiber diet", "drink plenty of water", "avoid straining during bowel movements", "take sitz baths"] },
    { name: "Heart attack", specialist: "Cardiologist", precautions: ["call ambulance immediately", "chew aspirin if advised", "stay calm and rest", "perform CPR if trained and necessary"] },
    { name: "Varicose veins", specialist: "General Physician", precautions: ["avoid prolonged standing/sitting", "elevate legs when resting", "wear compression stockings", "exercise regularly"] },
    { name: "Hypothyroidism", specialist: "General Physician", precautions: ["take thyroid hormone daily", "maintain a healthy weight", "monitor thyroid levels", "eat fiber-rich foods"] },
    { name: "Hyperthyroidism", specialist: "General Physician", precautions: ["take anti-thyroid pills", "reduce caffeine and stimulants", "regular blood checks", "eat calcium-rich foods"] },
    { name: "Hypoglycemia", specialist: "General Physician", precautions: ["eat sugar/candy immediately if levels drop", "consume balanced frequent meals", "monitor sugar levels", "carry glucose tablets"] },
    { name: "Osteoarthristis", specialist: "Neurologist", precautions: ["do low-impact joint exercises", "maintain healthy body weight", "apply hot/cold packs", "take prescribed pain relievers"] },
    { name: "Arthritis", specialist: "Neurologist", precautions: ["do gentle stretches", "protect joints from strain", "eat anti-inflammatory foods", "take prescribed DMARDs"] },
    { name: "(vertigo) Paroymsal Positional Vertigo", specialist: "Neurologist", precautions: ["perform Epley maneuver", "avoid sudden head movements", "sit down immediately when dizzy", "keep surroundings safe and clear"] },
    { name: "Acne", specialist: "Dermatologist", precautions: ["wash face twice daily", "do not squeeze pimples", "use non-comedogenic cosmetics", "avoid oily foods"] },
    { name: "Urinary tract infection", specialist: "General Physician", precautions: ["drink plenty of water", "maintain perineal hygiene", "urinate after intercourse", "take complete antibiotic course"] },
    { name: "Psoriasis", specialist: "Dermatologist", precautions: ["keep skin moisturized", "avoid skin triggers/stress", "spend moderate time in sun", "use prescribed ointments"] },
    { name: "Impetigo", specialist: "Dermatologist", precautions: ["clean sores with warm soap water", "apply antibiotic ointment", "wash hands frequently", "do not share towels/clothes"] }
  ];

  for (const d of diseasesData) {
    await prisma.disease.create({
      data: d
    });
  }
  console.log(`Created ${diseasesData.length} diseases.`);

  // 3. Create Patient for ratings (fallback patient if none exists)
  let patientProfile = await prisma.patientProfile.findFirst({});
  if (!patientProfile) {
    console.log("No patient profile found. Creating a test patient user...");
    const hashedPassword = await bcrypt.hash("patient123", 10);
    const testPatientUser = await prisma.user.create({
      data: {
        name: "Alex Rivera",
        email: "patient@aegishealth.ai",
        passwordHash: hashedPassword,
        role: "PATIENT"
      }
    });
    patientProfile = await prisma.patientProfile.create({
      data: {
        userId: testPatientUser.id,
        bloodType: "O+",
        allergies: ["Penicillin"]
      }
    });
  }

  console.log(`Using patient: ${patientProfile.id}`);

  // 4. Create Doctors programmatically (110 Indian Doctors across specialties)
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

  const doctorsData = [];
  let docCounter = 1;

  for (let i = 0; i < specialties.length; i++) {
    const specialty = specialties[i];
    for (let j = 0; j < 10; j++) {
      const isFemale = (j % 2 === 0);
      const firstName = isFemale 
        ? firstNamesF[(i * 10 + j) % firstNamesF.length] 
        : firstNamesM[(i * 10 + j) % firstNamesM.length];
      const lastName = lastNames[(i * 10 + j) % lastNames.length];
      
      const name = `Dr. ${firstName} ${lastName}`;
      const email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}${docCounter}@aegishealth.ai`;
      const licenseNumber = `LIC-IND-${String(docCounter).padStart(3, '0')}`;
      const experienceYears = 5 + ((i * j + 3) % 20);
      const bio = `Practitioner in India specializing in ${specialty} with ${experienceYears} years of clinical expertise. Committed to patient care and advanced disease prediction workflows.`;

      const hospIdx = (i * 10 + j) % indianHospitals.length;
      const hosp = indianHospitals[hospIdx];
      const address = `${hosp.name}, ${hosp.area}, ${hosp.city} - ${hosp.pin}`;
      const mobileNumber = `+91 98765 ${String(10000 + docCounter * 73).slice(0, 5)}`;
      const clinicPhone = `+91 ${hosp.code} 4567 ${String(1000 + docCounter).slice(1)}`;

      const ratings = [];
      const ratingCount = 2 + (j % 3);
      for (let r = 0; r < ratingCount; r++) {
        ratings.push(4 + ((r + j) % 2));
      }

      const availabilities = [
        { dayOfWeek: 1 + (j % 5), startTime: "09:00", endTime: "10:00" },
        { dayOfWeek: 1 + ((j + 1) % 5), startTime: "11:00", endTime: "12:00" },
        { dayOfWeek: 1 + ((j + 2) % 5), startTime: "15:00", endTime: "16:00" }
      ];

      doctorsData.push({
        name,
        email,
        specialty,
        licenseNumber,
        experienceYears,
        bio,
        specialtyName: specialty,
        mobileNumber,
        clinicPhone,
        address,
        isRegistered: (j % 2 === 0),
        ratings,
        availabilities
      });
      docCounter++;
    }
  }

  for (const d of doctorsData) {
    const hashedPassword = await bcrypt.hash("doctor123", 10);
    
    // Create User record
    const user = await prisma.user.create({
      data: {
        name: d.name,
        email: d.email,
        passwordHash: hashedPassword,
        role: "DOCTOR",
      }
    });

    // Create Doctor Profile
    const doctorProfile = await prisma.doctorProfile.create({
      data: {
        userId: user.id,
        specialty: d.specialty,
        licenseNumber: d.licenseNumber,
        experienceYears: d.experienceYears,
        bio: d.bio,
        mobileNumber: d.mobileNumber,
        clinicPhone: d.clinicPhone,
        address: d.address,
        isRegistered: d.isRegistered,
      }
    });

    // Connect to Specialization record
    const specId = specMap[d.specialtyName];
    if (specId) {
      await prisma.doctorSpecialization.create({
        data: {
          doctorId: doctorProfile.id,
          specializationId: specId
        }
      });
    }

    // Add Availabilities
    for (const av of d.availabilities) {
      await prisma.doctorAvailability.create({
        data: {
          doctorId: doctorProfile.id,
          dayOfWeek: av.dayOfWeek,
          startTime: av.startTime,
          endTime: av.endTime,
          isBooked: false,
        }
      });
    }

    // Add Ratings (requires completed appointments)
    let ratingCounter = 1;
    for (const score of d.ratings) {
      const scheduledAt = new Date();
      scheduledAt.setDate(scheduledAt.getDate() - ratingCounter * 3);
      
      const appt = await prisma.appointment.create({
        data: {
          patientId: patientProfile.id,
          doctorId: doctorProfile.id,
          scheduledAt: scheduledAt,
          status: "COMPLETED",
          reason: `Routine clinical visit for evaluation`,
          notes: `Checkup completed. Patient satisfied.`
        }
      });

      await prisma.rating.create({
        data: {
          doctorId: doctorProfile.id,
          patientId: patientProfile.id,
          appointmentId: appt.id,
          score: score,
          review: score >= 4 ? "Excellent doctor, very professional and thorough." : "Satisfactory visit, but wait times were long."
        }
      });
      ratingCounter++;
    }
    
    console.log(`Successfully seeded ${d.name} (${d.specialty}) with experience, availabilities, and ratings.`);
  }

  console.log("Database seeding completed successfully!");
}

main()
  .catch((e) => {
    console.error("Error running seed script:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

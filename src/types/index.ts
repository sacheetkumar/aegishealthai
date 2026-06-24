import { MetricType, AppointmentStatus, UserRole } from "@prisma/client";

export interface User {
  id: string;
  name: string | null;
  email: string | null;
  image: string | null;
  role: UserRole;
  createdAt: Date;
  updatedAt: Date;
}

export interface PatientProfile {
  id: string;
  userId: string;
  dateOfBirth: Date | null;
  gender: string | null;
  bloodType: string | null;
  allergies: string[];
  emergencyContactName: string | null;
  emergencyContactPhone: string | null;
  createdAt: Date;
  updatedAt: Date;
  user?: User;
}

export interface DoctorProfile {
  id: string;
  userId: string;
  specialty: string;
  licenseNumber: string;
  bio: string | null;
  createdAt: Date;
  updatedAt: Date;
  user?: User;
}

export interface HealthMetric {
  id: string;
  patientId: string;
  type: MetricType;
  value: number;
  unit: string;
  recordedAt: Date;
  notes?: string | null;
}

export interface Appointment {
  id: string;
  patientId: string;
  doctorId: string;
  scheduledAt: Date;
  status: AppointmentStatus;
  reason: string;
  notes?: string | null;
  createdAt: Date;
  updatedAt: Date;
  patient?: PatientProfile;
  doctor?: DoctorProfile;
}

// Custom UI type mappings
export type MetricDisplayConfig = {
  label: string;
  icon: string;
  colorClass: string;
  bgClass: string;
};

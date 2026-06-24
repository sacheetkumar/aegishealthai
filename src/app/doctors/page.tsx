import { listDoctors, type DoctorListItem } from "@/features/doctors/actions/list-doctors";
import { DoctorsClient } from "./doctors-client";

export const dynamic = "force-dynamic";

export default async function DoctorsPage() {
  const doctors = await listDoctors();

  const specialties = [...new Set(doctors.map(d => d.specialty))].sort();

  return <DoctorsClient doctors={doctors} specialties={specialties} />;
}

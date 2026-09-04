export const getDoctorName = (doctors, id) => {
  const doctor = doctors.find((item) => item.id === id);
  return doctor
    ? `${doctor.name} (${doctor.specialization})`
    : "Unknown Doctor";
};
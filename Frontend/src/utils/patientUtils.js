export const getPatientName = (patients, id) => {
  const patient = patients.find((item) => item.id === id);
  return patient ? patient.name : "Unknown Patient";
};
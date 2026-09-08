import { useMemo, useState } from "react";

import Loading from "../../components/Loading";

import {
  getPatientName,
} from "../../utils/patientUtils";

import {
  getDoctorName,
} from "../../utils/doctorUtils";


function PrescriptionList({
  prescriptions,
  patients,
  doctors,
  loading,
  onRefresh,
  onEdit,
  onDelete,
  onViewFhir,
  fhirLoading,
}) {

  // ===============================
  // FILTER STATES
  // ===============================

  const [searchText, setSearchText] =
    useState("");

  const [medicineFilter, setMedicineFilter] =
    useState("ALL");


  // ===============================
  // GET MEDICINES
  // ===============================

  const medicines = useMemo(() => {

    const values = prescriptions
      .map((prescription) =>
        String(
          prescription.medicineName || ""
        ).trim()
      )
      .filter(
        (medicine) => medicine !== ""
      );


    return [...new Set(values)].sort(
      (a, b) =>
        a.localeCompare(b)
    );

  }, [prescriptions]);


  // ===============================
  // FILTER PRESCRIPTIONS
  // ===============================

  const filteredPrescriptions =
    useMemo(() => {

      const search =
        searchText
          .trim()
          .toLowerCase();


      return prescriptions.filter(
        (prescription) => {

          // ===============================
          // GET PATIENT / DOCTOR NAMES
          // ===============================

          const patientName =
            getPatientName(
              patients,
              prescription.patientId
            );

          const doctorName =
            getDoctorName(
              doctors,
              prescription.doctorId
            );


          // ===============================
          // SEARCH FILTER
          // ===============================

          const matchesSearch =
            !search ||

            String(patientName || "")
              .toLowerCase()
              .includes(search) ||

            String(doctorName || "")
              .toLowerCase()
              .includes(search) ||

            String(
              prescription.patientId || ""
            )
              .toLowerCase()
              .includes(search) ||

            String(
              prescription.doctorId || ""
            )
              .toLowerCase()
              .includes(search) ||

            String(
              prescription.id || ""
            )
              .toLowerCase()
              .includes(search) ||

            String(
              prescription.medicineName || ""
            )
              .toLowerCase()
              .includes(search) ||

            String(
              prescription.dosage || ""
            )
              .toLowerCase()
              .includes(search) ||

            String(
              prescription.instructions || ""
            )
              .toLowerCase()
              .includes(search);


          if (!matchesSearch) {
            return false;
          }


          // ===============================
          // MEDICINE FILTER
          // ===============================

          const medicineName =
            String(
              prescription.medicineName || ""
            )
              .trim()
              .toLowerCase();


          const matchesMedicine =
            medicineFilter === "ALL" ||

            medicineName ===
              medicineFilter.toLowerCase();


          if (!matchesMedicine) {
            return false;
          }


          return true;

        }
      );

    }, [
      prescriptions,
      patients,
      doctors,
      searchText,
      medicineFilter,
    ]);


  // ===============================
  // RESET FILTERS
  // ===============================

  const handleResetFilters = () => {

    setSearchText("");

    setMedicineFilter("ALL");

  };


  // ===============================
  // CHECK FILTER STATUS
  // ===============================

  const filtersApplied =
    searchText.trim() !== "" ||
    medicineFilter !== "ALL";


  return (

    <div className="patient-list-card">


      {/* ===============================
          LIST HEADER
      =============================== */}

      <div className="list-header">

        <h2>
          Prescription List
        </h2>


        <button
          type="button"
          onClick={onRefresh}
          className="refresh-button"
        >
          Refresh
        </button>

      </div>


      {/* ===============================
          SEARCH & FILTER SECTION
      =============================== */}

      <div
        style={{
          marginBottom: "20px",
          padding: "18px",
          border: "1px solid #e5e7eb",
          borderRadius: "10px",
          background: "#f8fafc",
        }}
      >

        {/* ===============================
            SEARCH
        =============================== */}

        <div
          style={{
            marginBottom: "14px",
          }}
        >

          <label
            style={{
              display: "block",
              marginBottom: "6px",
              fontWeight: "600",
              fontSize: "14px",
            }}
          >
            Search Prescriptions
          </label>


          <input
            type="text"
            value={searchText}
            onChange={(event) =>
              setSearchText(
                event.target.value
              )
            }
            placeholder="Search by patient, doctor, medicine, ID, dosage, or instructions..."
            style={{
              width: "100%",
              boxSizing: "border-box",
              padding: "11px 13px",
              border: "1px solid #cbd5e1",
              borderRadius: "7px",
              fontSize: "14px",
              outline: "none",
            }}
          />

        </div>


        {/* ===============================
            FILTER ROW
        =============================== */}

        <div
          style={{
            display: "flex",
            gap: "12px",
            flexWrap: "wrap",
            alignItems: "end",
          }}
        >

          {/* ===============================
              MEDICINE FILTER
          =============================== */}

          <div
            style={{
              flex: "1 1 250px",
            }}
          >

            <label
              style={{
                display: "block",
                marginBottom: "6px",
                fontWeight: "600",
                fontSize: "14px",
              }}
            >
              Medicine
            </label>


            <select
              value={medicineFilter}
              onChange={(event) =>
                setMedicineFilter(
                  event.target.value
                )
              }
              style={{
                width: "100%",
                padding: "10px 12px",
                border: "1px solid #cbd5e1",
                borderRadius: "7px",
                fontSize: "14px",
                background: "white",
              }}
            >

              <option value="ALL">
                All Medicines
              </option>


              {medicines.map(
                (medicine) => (

                  <option
                    key={medicine}
                    value={medicine}
                  >
                    {medicine}
                  </option>

                )
              )}

            </select>

          </div>


          {/* ===============================
              RESET
          =============================== */}

          <button
            type="button"
            onClick={handleResetFilters}
            disabled={!filtersApplied}
            style={{
              padding: "10px 18px",
              border: "none",
              borderRadius: "7px",
              fontSize: "14px",
              fontWeight: "600",
              cursor: filtersApplied
                ? "pointer"
                : "not-allowed",
              background: filtersApplied
                ? "#64748b"
                : "#cbd5e1",
              color: "white",
              minHeight: "40px",
            }}
          >
            Reset Filters
          </button>

        </div>

      </div>


      {/* ===============================
          RESULT COUNT
      =============================== */}

      {!loading &&
        prescriptions.length > 0 && (

          <div
            style={{
              marginBottom: "12px",
              fontSize: "14px",
              color: "#64748b",
            }}
          >

            Showing{" "}

            <strong>
              {filteredPrescriptions.length}
            </strong>{" "}

            of{" "}

            <strong>
              {prescriptions.length}
            </strong>{" "}

            prescription
            {prescriptions.length !== 1
              ? "s"
              : ""}

          </div>

        )}


      {/* ===============================
          LOADING
      =============================== */}

      {loading ? (

        <Loading
          text="Loading prescriptions..."
        />


      ) : prescriptions.length === 0 ? (

        <p className="no-data">
          No prescriptions found.
        </p>


      ) : filteredPrescriptions.length === 0 ? (

        /* ===============================
           NO FILTER RESULTS
        =============================== */

        <div
          style={{
            textAlign: "center",
            padding: "30px 15px",
            color: "#64748b",
          }}
        >

          <p
            style={{
              marginBottom: "12px",
              fontSize: "15px",
            }}
          >
            No prescriptions match the
            selected search or filters.
          </p>


          <button
            type="button"
            onClick={handleResetFilters}
            style={{
              padding: "9px 16px",
              border: "none",
              borderRadius: "7px",
              background: "#64748b",
              color: "white",
              cursor: "pointer",
              fontWeight: "600",
            }}
          >
            Clear Filters
          </button>

        </div>


      ) : (

        /* ===============================
           PRESCRIPTION TABLE
        =============================== */

        <div className="table-container">

          <table>

            <thead>

              <tr>

                <th>
                  Patient
                </th>

                <th>
                  Doctor
                </th>

                <th>
                  Medicine
                </th>

                <th>
                  Dosage
                </th>

                <th>
                  Instructions
                </th>

                <th>
                  Actions
                </th>

              </tr>

            </thead>


            <tbody>

              {filteredPrescriptions.map(
                (prescription) => (

                  <tr
                    key={prescription.id}
                  >

                    {/* PATIENT */}

                    <td>
                      {getPatientName(
                        patients,
                        prescription.patientId
                      )}
                    </td>


                    {/* DOCTOR */}

                    <td>
                      {getDoctorName(
                        doctors,
                        prescription.doctorId
                      )}
                    </td>


                    {/* MEDICINE */}

                    <td>
                      {prescription.medicineName}
                    </td>


                    {/* DOSAGE */}

                    <td>
                      {prescription.dosage}
                    </td>


                    {/* INSTRUCTIONS */}

                    <td>
                      {prescription.instructions}
                    </td>


                    {/* ACTIONS */}

                    <td>

                      <div className="action-buttons">


                        {/* ===============================
                            VIEW FHIR
                        =============================== */}

                        <button
                          type="button"
                          className="fhir-button"
                          disabled={fhirLoading}
                          onClick={() =>
                            onViewFhir(
                              prescription
                            )
                          }
                        >

                          {fhirLoading
                            ? "Loading..."
                            : "View FHIR"}

                        </button>


                        {/* ===============================
                            EDIT
                        =============================== */}

                        <button
                          type="button"
                          className="edit-button"
                          onClick={() =>
                            onEdit(
                              prescription
                            )
                          }
                        >
                          Edit
                        </button>


                        {/* ===============================
                            DELETE
                        =============================== */}

                        <button
                          type="button"
                          className="delete-button"
                          onClick={() =>
                            onDelete(
                              prescription.id
                            )
                          }
                        >
                          Delete
                        </button>


                      </div>

                    </td>

                  </tr>

                )
              )}

            </tbody>

          </table>

        </div>

      )}

    </div>

  );
}


export default PrescriptionList;
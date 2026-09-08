import { useMemo, useState } from "react";

import Loading from "../../components/Loading";


function PatientList({
  patients,
  loading,
  onRefresh,
  onEdit,
  onDelete,
  onViewFhir,
}) {

  // ===============================
  // FILTER STATES
  // ===============================

  const [searchText, setSearchText] = useState("");

  const [genderFilter, setGenderFilter] = useState("ALL");

  const [ageFilter, setAgeFilter] = useState("ALL");


  // ===============================
  // FILTER PATIENTS
  // ===============================

  const filteredPatients = useMemo(() => {

    const search = searchText
      .trim()
      .toLowerCase();


    return patients.filter((patient) => {

      // ===============================
      // SEARCH FILTER
      // ===============================

      const matchesSearch =
        !search ||

        String(patient.name || "")
          .toLowerCase()
          .includes(search) ||

        String(patient.phone || "")
          .toLowerCase()
          .includes(search) ||

        String(patient.email || "")
          .toLowerCase()
          .includes(search) ||

        String(patient.id || "")
          .toLowerCase()
          .includes(search);


      if (!matchesSearch) {
        return false;
      }


      // ===============================
      // GENDER FILTER
      // ===============================

      const patientGender = String(
        patient.gender || ""
      ).toLowerCase();


      const matchesGender =
        genderFilter === "ALL" ||

        patientGender ===
          genderFilter.toLowerCase();


      if (!matchesGender) {
        return false;
      }


      // ===============================
      // AGE FILTER
      // ===============================

      const age = Number(patient.age);


      if (ageFilter === "UNDER_18") {
        return age < 18;
      }


      if (ageFilter === "18_30") {
        return age >= 18 && age <= 30;
      }


      if (ageFilter === "31_50") {
        return age >= 31 && age <= 50;
      }


      if (ageFilter === "51_65") {
        return age >= 51 && age <= 65;
      }


      if (ageFilter === "ABOVE_65") {
        return age > 65;
      }


      return true;

    });

  }, [
    patients,
    searchText,
    genderFilter,
    ageFilter,
  ]);


  // ===============================
  // RESET FILTERS
  // ===============================

  const handleResetFilters = () => {

    setSearchText("");

    setGenderFilter("ALL");

    setAgeFilter("ALL");

  };


  // ===============================
  // CHECK FILTER STATUS
  // ===============================

  const filtersApplied =
    searchText.trim() !== "" ||
    genderFilter !== "ALL" ||
    ageFilter !== "ALL";


  return (

    <div className="patient-list-card">


      {/* ===============================
          LIST HEADER
      =============================== */}

      <div className="list-header">

        <h2>Patient List</h2>


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

        {/* SEARCH */}

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
            Search Patients
          </label>


          <input
            type="text"
            value={searchText}
            onChange={(event) =>
              setSearchText(event.target.value)
            }
            placeholder="Search by name, phone, email, or patient ID..."
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


        {/* FILTER ROW */}

        <div
          style={{
            display: "flex",
            gap: "12px",
            flexWrap: "wrap",
            alignItems: "end",
          }}
        >

          {/* GENDER */}

          <div
            style={{
              flex: "1 1 180px",
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
              Gender
            </label>


            <select
              value={genderFilter}
              onChange={(event) =>
                setGenderFilter(event.target.value)
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
                All Genders
              </option>

              <option value="Female">
                Female
              </option>

              <option value="Male">
                Male
              </option>

              <option value="Other">
                Other
              </option>

            </select>

          </div>


          {/* AGE */}

          <div
            style={{
              flex: "1 1 180px",
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
              Age Group
            </label>


            <select
              value={ageFilter}
              onChange={(event) =>
                setAgeFilter(event.target.value)
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
                All Ages
              </option>

              <option value="UNDER_18">
                Under 18
              </option>

              <option value="18_30">
                18 – 30
              </option>

              <option value="31_50">
                31 – 50
              </option>

              <option value="51_65">
                51 – 65
              </option>

              <option value="ABOVE_65">
                Above 65
              </option>

            </select>

          </div>


          {/* RESET */}

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

      {!loading && patients.length > 0 && (

        <div
          style={{
            marginBottom: "12px",
            fontSize: "14px",
            color: "#64748b",
          }}
        >

          Showing{" "}
          <strong>
            {filteredPatients.length}
          </strong>{" "}

          of{" "}
          <strong>
            {patients.length}
          </strong>{" "}

          patient
          {patients.length !== 1
            ? "s"
            : ""}

        </div>

      )}


      {/* ===============================
          LOADING
      =============================== */}

      {loading ? (

        <Loading text="Loading patients..." />

      ) : patients.length === 0 ? (

        <p className="no-data">
          No patients found.
        </p>

      ) : filteredPatients.length === 0 ? (

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
            No patients match the selected
            search or filters.
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
           PATIENT TABLE
        =============================== */

        <div className="table-container">

          <table>

            <thead>

              <tr>

                <th>Name</th>

                <th>Age</th>

                <th>Gender</th>

                <th>Phone</th>

                <th>Email</th>

                <th>Actions</th>

              </tr>

            </thead>


            <tbody>

              {filteredPatients.map((patient) => (

                <tr key={patient.id}>

                  <td>
                    {patient.name}
                  </td>

                  <td>
                    {patient.age}
                  </td>

                  <td>
                    {patient.gender}
                  </td>

                  <td>
                    {patient.phone}
                  </td>

                  <td>
                    {patient.email}
                  </td>


                  <td>

                    <div className="action-buttons">


                      {/* ===============================
                          VIEW FHIR
                      =============================== */}

                      <button
                        type="button"
                        className="fhir-button"
                        onClick={() =>
                          onViewFhir(patient)
                        }
                      >
                        View FHIR
                      </button>


                      {/* ===============================
                          EDIT
                      =============================== */}

                      <button
                        type="button"
                        className="edit-button"
                        onClick={() =>
                          onEdit(patient)
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
                          onDelete(patient.id)
                        }
                      >
                        Delete
                      </button>


                    </div>

                  </td>

                </tr>

              ))}

            </tbody>

          </table>

        </div>

      )}

    </div>

  );

}


export default PatientList;
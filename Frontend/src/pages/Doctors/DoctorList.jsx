import { useMemo, useState } from "react";

import Loading from "../../components/Loading";


function DoctorList({
  doctors,
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

  const [specializationFilter, setSpecializationFilter] =
    useState("ALL");


  // ===============================
  // GET SPECIALIZATIONS
  // ===============================

  const specializations = useMemo(() => {

    const values = doctors
      .map((doctor) =>
        String(doctor.specialization || "").trim()
      )
      .filter((specialization) =>
        specialization !== ""
      );


    return [...new Set(values)].sort(
      (a, b) =>
        a.localeCompare(b)
    );

  }, [doctors]);


  // ===============================
  // FILTER DOCTORS
  // ===============================

  const filteredDoctors = useMemo(() => {

    const search = searchText
      .trim()
      .toLowerCase();


    return doctors.filter((doctor) => {

      // ===============================
      // SEARCH FILTER
      // ===============================

      const matchesSearch =
        !search ||

        String(doctor.name || "")
          .toLowerCase()
          .includes(search) ||

        String(doctor.phone || "")
          .toLowerCase()
          .includes(search) ||

        String(doctor.email || "")
          .toLowerCase()
          .includes(search) ||

        String(doctor.id || "")
          .toLowerCase()
          .includes(search);


      if (!matchesSearch) {
        return false;
      }


      // ===============================
      // SPECIALIZATION FILTER
      // ===============================

      const doctorSpecialization =
        String(
          doctor.specialization || ""
        )
          .trim()
          .toLowerCase();


      const matchesSpecialization =
        specializationFilter === "ALL" ||

        doctorSpecialization ===
          specializationFilter.toLowerCase();


      if (!matchesSpecialization) {
        return false;
      }


      return true;

    });

  }, [
    doctors,
    searchText,
    specializationFilter,
  ]);


  // ===============================
  // RESET FILTERS
  // ===============================

  const handleResetFilters = () => {

    setSearchText("");

    setSpecializationFilter("ALL");

  };


  // ===============================
  // CHECK FILTER STATUS
  // ===============================

  const filtersApplied =
    searchText.trim() !== "" ||
    specializationFilter !== "ALL";


  return (

    <div className="patient-list-card">


      {/* ===============================
          LIST HEADER
      =============================== */}

      <div className="list-header">

        <h2>Doctor List</h2>


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
            Search Doctors
          </label>


          <input
            type="text"
            value={searchText}
            onChange={(event) =>
              setSearchText(
                event.target.value
              )
            }
            placeholder="Search by name, phone, email, or doctor ID..."
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
              SPECIALIZATION
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
              Specialization
            </label>


            <select
              value={specializationFilter}
              onChange={(event) =>
                setSpecializationFilter(
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
                All Specializations
              </option>


              {specializations.map(
                (specialization) => (

                  <option
                    key={specialization}
                    value={specialization}
                  >
                    {specialization}
                  </option>

                )
              )}

            </select>

          </div>


          {/* ===============================
              RESET FILTERS
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
        doctors.length > 0 && (

          <div
            style={{
              marginBottom: "12px",
              fontSize: "14px",
              color: "#64748b",
            }}
          >

            Showing{" "}

            <strong>
              {filteredDoctors.length}
            </strong>{" "}

            of{" "}

            <strong>
              {doctors.length}
            </strong>{" "}

            doctor
            {doctors.length !== 1
              ? "s"
              : ""}

          </div>

        )}


      {/* ===============================
          LOADING
      =============================== */}

      {loading ? (

        <Loading
          text="Loading doctors..."
        />

      ) : doctors.length === 0 ? (

        <p className="no-data">
          No doctors found.
        </p>

      ) : filteredDoctors.length === 0 ? (

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
            No doctors match the selected
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
           DOCTOR TABLE
        =============================== */

        <div className="table-container">

          <table>

            <thead>

              <tr>

                <th>Name</th>

                <th>Specialization</th>

                <th>Phone</th>

                <th>Email</th>

                <th>Actions</th>

              </tr>

            </thead>


            <tbody>

              {filteredDoctors.map(
                (doctor) => (

                  <tr key={doctor.id}>

                    <td>
                      {doctor.name}
                    </td>

                    <td>
                      {doctor.specialization}
                    </td>

                    <td>
                      {doctor.phone}
                    </td>

                    <td>
                      {doctor.email}
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
                            onViewFhir(
                              doctor
                            )
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
                            onEdit(
                              doctor
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
                              doctor.id
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


export default DoctorList;
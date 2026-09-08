import { useMemo, useState } from "react";


function VitalsList({

  vitals,

  patients,

  loading,

  onViewFhir,

  fhirLoading,

}) {

  // ===============================
  // FILTER STATES
  // ===============================

  const [searchText, setSearchText] =
    useState("");

  const [sourceFilter, setSourceFilter] =
    useState("ALL");

  const [vitalTypeFilter, setVitalTypeFilter] =
    useState("ALL");

  const [fromDate, setFromDate] =
    useState("");

  const [toDate, setToDate] =
    useState("");


  // ===============================
  // FIND PATIENT NAME
  // ===============================

  const getPatientName = (patientId) => {

    if (
      !patients ||
      patients.length === 0
    ) {

      return patientId || "Unknown";

    }


    const patient =
      patients.find(
        (patient) =>
          patient.id === patientId
      );


    return patient
      ? patient.name
      : patientId || "Unknown";

  };


  // ===============================
  // GET SOURCES
  // ===============================

  const sources = useMemo(() => {

    const values = vitals
      .map((vital) =>
        String(
          vital.source || ""
        ).trim()
      )
      .filter(
        (source) =>
          source !== ""
      );


    return [
      ...new Set(values)
    ].sort(
      (a, b) =>
        a.localeCompare(b)
    );

  }, [vitals]);


  // ===============================
  // FILTER VITALS
  // ===============================

  const filteredVitals = useMemo(() => {

    const search =
      searchText
        .trim()
        .toLowerCase();


    return vitals.filter(
      (vital) => {

        const patientName =
          getPatientName(
            vital.patientId
          );


        // ===============================
        // SEARCH VALUES
        // ===============================

        const heartRate =
          vital.heartRate ??
          "";

        const temperature =
          vital.temperature ??
          "";

        const systolicBP =
          vital.systolicBloodPressure ??
          "";

        const diastolicBP =
          vital.diastolicBloodPressure ??
          "";

        const oxygen =
          vital.oxygenSaturation ??
          "";

        const respiratoryRate =
          vital.respiratoryRate ??
          "";

        const deviceId =
          vital.deviceId ||
          "";

        const source =
          vital.source ||
          "";


        // ===============================
        // SEARCH FILTER
        // ===============================

        const matchesSearch =
          !search ||

          String(patientName)
            .toLowerCase()
            .includes(search) ||

          String(
            vital.patientId || ""
          )
            .toLowerCase()
            .includes(search) ||

          String(deviceId)
            .toLowerCase()
            .includes(search) ||

          String(source)
            .toLowerCase()
            .includes(search) ||

          String(heartRate)
            .toLowerCase()
            .includes(search) ||

          String(temperature)
            .toLowerCase()
            .includes(search) ||

          String(systolicBP)
            .toLowerCase()
            .includes(search) ||

          String(diastolicBP)
            .toLowerCase()
            .includes(search) ||

          String(oxygen)
            .toLowerCase()
            .includes(search) ||

          String(respiratoryRate)
            .toLowerCase()
            .includes(search);


        if (!matchesSearch) {
          return false;
        }


        // ===============================
        // SOURCE FILTER
        // ===============================

        const vitalSource =
          String(
            vital.source || ""
          )
            .trim()
            .toLowerCase();


        let matchesSource = true;


        if (
          sourceFilter === "NO_SOURCE"
        ) {

          matchesSource =
            vitalSource === "";

        } else if (
          sourceFilter !== "ALL"
        ) {

          matchesSource =
            vitalSource ===
            sourceFilter.toLowerCase();

        }


        if (!matchesSource) {
          return false;
        }


        // ===============================
        // VITAL TYPE FILTER
        // ===============================

        let matchesVitalType = true;


        if (
          vitalTypeFilter ===
          "HEART_RATE"
        ) {

          matchesVitalType =
            vital.heartRate !== null &&
            vital.heartRate !== undefined;

        }


        if (
          vitalTypeFilter ===
          "TEMPERATURE"
        ) {

          matchesVitalType =
            vital.temperature !== null &&
            vital.temperature !== undefined;

        }


        if (
          vitalTypeFilter ===
          "BLOOD_PRESSURE"
        ) {

          matchesVitalType =
            (
              vital.systolicBloodPressure !==
                null &&
              vital.systolicBloodPressure !==
                undefined
            ) ||
            (
              vital.diastolicBloodPressure !==
                null &&
              vital.diastolicBloodPressure !==
                undefined
            );

        }


        if (
          vitalTypeFilter ===
          "OXYGEN"
        ) {

          matchesVitalType =
            vital.oxygenSaturation !== null &&
            vital.oxygenSaturation !== undefined;

        }


        if (
          vitalTypeFilter ===
          "RESPIRATORY_RATE"
        ) {

          matchesVitalType =
            vital.respiratoryRate !== null &&
            vital.respiratoryRate !== undefined;

        }


        if (!matchesVitalType) {
          return false;
        }


        // ===============================
        // DATE FILTER
        // ===============================

        const recordedDate =
          vital.recordedAt
            ? new Date(
                vital.recordedAt
              )
            : null;


        if (
          fromDate &&
          recordedDate &&
          recordedDate <
            new Date(
              `${fromDate}T00:00:00`
            )
        ) {

          return false;

        }


        if (
          toDate &&
          recordedDate &&
          recordedDate >
            new Date(
              `${toDate}T23:59:59`
            )
        ) {

          return false;

        }


        return true;

      }
    );

  }, [
    vitals,
    patients,
    searchText,
    sourceFilter,
    vitalTypeFilter,
    fromDate,
    toDate,
  ]);


  // ===============================
  // RESET FILTERS
  // ===============================

  const handleResetFilters = () => {

    setSearchText("");

    setSourceFilter("ALL");

    setVitalTypeFilter("ALL");

    setFromDate("");

    setToDate("");

  };


  // ===============================
  // FILTER STATUS
  // ===============================

  const filtersApplied =
    searchText.trim() !== "" ||
    sourceFilter !== "ALL" ||
    vitalTypeFilter !== "ALL" ||
    fromDate !== "" ||
    toDate !== "";


  // ===============================
  // LOADING
  // ===============================

  if (loading) {

    return (

      <div className="vitals-loading">

        Loading vitals...

      </div>

    );

  }


  // ===============================
  // EMPTY DATA
  // ===============================

  if (
    !vitals ||
    vitals.length === 0
  ) {

    return (

      <div className="vitals-empty">

        No vital records found.

      </div>

    );

  }


  return (

    <>

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
            Search Vitals
          </label>


          <input
            type="text"
            value={searchText}
            onChange={(event) =>
              setSearchText(
                event.target.value
              )
            }
            placeholder="Search by patient, patient ID, device ID, source, or vital value..."
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
            FILTER ROW 1
        =============================== */}

        <div
          style={{
            display: "flex",
            gap: "12px",
            flexWrap: "wrap",
            alignItems: "end",
            marginBottom: "12px",
          }}
        >

          {/* ===============================
              SOURCE
          =============================== */}

          <div
            style={{
              flex: "1 1 200px",
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
              Source
            </label>


            <select
              value={sourceFilter}
              onChange={(event) =>
                setSourceFilter(
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
                All Sources
              </option>


              {sources.map(
                (source) => (

                  <option
                    key={source}
                    value={source}
                  >
                    {source}
                  </option>

                )
              )}


              <option value="NO_SOURCE">
                No Source
              </option>

            </select>

          </div>


          {/* ===============================
              VITAL TYPE
          =============================== */}

          <div
            style={{
              flex: "1 1 220px",
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
              Vital Type
            </label>


            <select
              value={vitalTypeFilter}
              onChange={(event) =>
                setVitalTypeFilter(
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
                All Vital Types
              </option>

              <option value="HEART_RATE">
                Heart Rate
              </option>

              <option value="TEMPERATURE">
                Temperature
              </option>

              <option value="BLOOD_PRESSURE">
                Blood Pressure
              </option>

              <option value="OXYGEN">
                Oxygen Saturation
              </option>

              <option value="RESPIRATORY_RATE">
                Respiratory Rate
              </option>

            </select>

          </div>

        </div>


        {/* ===============================
            FILTER ROW 2
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
              FROM DATE
          =============================== */}

          <div
            style={{
              flex: "1 1 200px",
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
              From Date
            </label>


            <input
              type="date"
              value={fromDate}
              onChange={(event) =>
                setFromDate(
                  event.target.value
                )
              }
              style={{
                width: "100%",
                boxSizing: "border-box",
                padding: "10px 12px",
                border: "1px solid #cbd5e1",
                borderRadius: "7px",
                fontSize: "14px",
                background: "white",
              }}
            />

          </div>


          {/* ===============================
              TO DATE
          =============================== */}

          <div
            style={{
              flex: "1 1 200px",
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
              To Date
            </label>


            <input
              type="date"
              value={toDate}
              onChange={(event) =>
                setToDate(
                  event.target.value
                )
              }
              style={{
                width: "100%",
                boxSizing: "border-box",
                padding: "10px 12px",
                border: "1px solid #cbd5e1",
                borderRadius: "7px",
                fontSize: "14px",
                background: "white",
              }}
            />

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

      <div
        style={{
          marginBottom: "12px",
          fontSize: "14px",
          color: "#64748b",
        }}
      >

        Showing{" "}

        <strong>
          {filteredVitals.length}
        </strong>{" "}

        of{" "}

        <strong>
          {vitals.length}
        </strong>{" "}

        vital record
        {vitals.length !== 1
          ? "s"
          : ""}

      </div>


      {/* ===============================
          NO FILTER RESULTS
      =============================== */}

      {filteredVitals.length === 0 ? (

        <div
          className="vitals-empty"
          style={{
            textAlign: "center",
            padding: "30px 15px",
          }}
        >

          <p
            style={{
              marginBottom: "12px",
            }}
          >
            No vital records match the
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
           VITALS TABLE
        =============================== */

        <div className="vitals-table-container">

          <table className="vitals-table">

            <thead>

              <tr>

                <th>
                  Patient Name
                </th>

                <th>
                  Heart Rate
                </th>

                <th>
                  Temperature
                </th>

                <th>
                  Blood Pressure
                </th>

                <th>
                  Oxygen
                </th>

                <th>
                  Respiratory Rate
                </th>

                <th>
                  Recorded At
                </th>

                <th>
                  Actions
                </th>

              </tr>

            </thead>


            <tbody>

              {filteredVitals.map(
                (vital) => (

                  <tr
                    key={vital.id}
                  >


                    {/* PATIENT */}

                    <td>

                      {getPatientName(
                        vital.patientId
                      )}

                    </td>


                    {/* HEART RATE */}

                    <td>

                      {vital.heartRate ?? "-"}

                      {" "}BPM

                    </td>


                    {/* TEMPERATURE */}

                    <td>

                      {vital.temperature ?? "-"}

                      {" "}°C

                    </td>


                    {/* BLOOD PRESSURE */}

                    <td>

                      {vital.systolicBloodPressure ?? "-"}

                      {" / "}

                      {vital.diastolicBloodPressure ?? "-"}

                    </td>


                    {/* OXYGEN */}

                    <td>

                      {vital.oxygenSaturation ?? "-"}

                      {" "}%

                    </td>


                    {/* RESPIRATORY RATE */}

                    <td>

                      {vital.respiratoryRate ?? "-"}

                      {" "}/min

                    </td>


                    {/* RECORDED AT */}

                    <td>

                      {vital.recordedAt

                        ? new Date(
                            vital.recordedAt
                          ).toLocaleString()

                        : "-"

                      }

                    </td>


                    {/* ACTIONS */}

                    <td>

                      <div className="action-buttons">

                        <button
                          type="button"
                          className="fhir-button"
                          disabled={
                            fhirLoading ||
                            !vital.id
                          }
                          onClick={() => {

                            if (
                              vital.id
                            ) {

                              onViewFhir(
                                vital.id
                              );

                            }

                          }}
                        >

                          {fhirLoading
                            ? "Loading..."
                            : "View FHIR"}

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

    </>

  );

}


export default VitalsList;
function VitalsList({

  vitals,

  patients,

  loading,

  onViewFhir,

  fhirLoading,

}) {

  // ===============================
  // FIND PATIENT NAME
  // ===============================

  const getPatientName =
    (patientId) => {

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


  // ===============================
  // VITALS TABLE
  // ===============================

  return (

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

          {vitals.map(
            (vital) => (

              <tr key={vital.id}>


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

                        : "View FHIR"
                      }

                    </button>

                  </div>

                </td>


              </tr>

            )
          )}

        </tbody>

      </table>

    </div>

  );

}


export default VitalsList;
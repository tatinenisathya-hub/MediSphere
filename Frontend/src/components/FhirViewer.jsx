import { useState } from "react";

import "./FhirViewer.css";


function FhirViewer({
  fhirData,
  title,
  onClose,
}) {
  const [copied, setCopied] =
    useState(false);


  // ===============================
  // FORMAT FHIR JSON
  // ===============================

  const formattedJson = (() => {

    if (!fhirData) {
      return "No FHIR data available.";
    }

    try {

      // Backend returns JSON string
      if (
        typeof fhirData === "string"
      ) {
        return JSON.stringify(
          JSON.parse(fhirData),
          null,
          2
        );
      }


      // Backend returns JavaScript object
      return JSON.stringify(
        fhirData,
        null,
        2
      );

    } catch (error) {

      console.error(
        "Error formatting FHIR data:",
        error
      );

      return String(fhirData);
    }

  })();


  const hasFhirData =
    fhirData &&
    formattedJson !==
      "No FHIR data available.";


  // ===============================
  // COPY JSON
  // ===============================

  const copyToClipboard =
    async () => {

      if (!hasFhirData) {

        alert(
          "No FHIR data available to copy."
        );

        return;
      }

      try {

        await navigator.clipboard.writeText(
          formattedJson
        );

        setCopied(true);


        setTimeout(() => {

          setCopied(false);

        }, 2000);

      } catch (error) {

        console.error(
          "Failed to copy FHIR data:",
          error
        );

        alert(
          "Failed to copy FHIR data."
        );
      }

    };


  // ===============================
  // DOWNLOAD JSON
  // ===============================

  const downloadFhirJson = () => {

    if (!hasFhirData) {

      alert(
        "No FHIR data available to download."
      );

      return;
    }

    try {

      const blob =
        new Blob(
          [formattedJson],
          {
            type: "application/fhir+json",
          }
        );


      const url =
        URL.createObjectURL(blob);


      const link =
        document.createElement("a");


      link.href = url;


      link.download =
        `${(title || "fhir_data")
          .replace(/\s+/g, "_")
          .replace(/[^a-zA-Z0-9_-]/g, "")
          .toLowerCase()}.json`;


      document.body.appendChild(
        link
      );


      link.click();


      document.body.removeChild(
        link
      );


      setTimeout(() => {

        URL.revokeObjectURL(
          url
        );

      }, 500);


    } catch (error) {

      console.error(
        "Failed to download FHIR JSON:",
        error
      );

      alert(
        "Failed to download FHIR JSON."
      );
    }

  };


  // ===============================
  // UI
  // ===============================

  return (

    <div className="fhir-overlay">

      <div className="fhir-modal">


        {/* HEADER */}

        <div className="fhir-header">

          <h2>
            {title || "FHIR Data"}
          </h2>


          <button
            type="button"
            onClick={onClose}
            className="close-button"
            aria-label="Close FHIR viewer"
          >
            ✕
          </button>

        </div>


        {/* ACTION BUTTONS */}

        <div className="fhir-actions">


          <button
            type="button"
            onClick={copyToClipboard}
          >
            {copied
              ? "Copied!"
              : "Copy JSON"}
          </button>


          <button
            type="button"
            onClick={downloadFhirJson}
          >
            Download JSON
          </button>


          <button
            type="button"
            onClick={onClose}
            className="close-fhir-button"
          >
            Close
          </button>


        </div>


        {/* JSON VIEW */}

        <pre className="fhir-json">

          {formattedJson}

        </pre>


      </div>

    </div>

  );
}


export default FhirViewer;
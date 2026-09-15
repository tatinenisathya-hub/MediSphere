import React, { useEffect, useState } from "react";
import "./AIRiskPrediction.css";

import {
  predictCardiovascularRisk,
  predictDiabetesRisk,
  getAiHealth,
  getAiModelStatus,
  getAiRiskHistory,
  saveAiRiskHistory,
} from "../../services/aiRiskService";

import {
  getAiPatients,
  getAiPatientVitals,
  getAiPatientLabs,
} from "../../services/aiPatientDataService";

// =========================================================
// Numeric input rules
// =========================================================

const numericFieldRules = {
  cardiovascular: {
    age: { max: 120, decimals: 0, maxLength: 3 },
    trestbps: { max: 250, decimals: 0, maxLength: 3 },
    chol: { max: 500, decimals: 0, maxLength: 3 },
    thalach: { max: 250, decimals: 0, maxLength: 3 },
    oldpeak: { max: 6, decimals: 2, maxLength: 4 },
  },
  diabetes: {
    pregnancies: { max: 20, decimals: 0, maxLength: 2 },
    glucose: { max: 300, decimals: 0, maxLength: 3 },
    bloodpressure: { max: 250, decimals: 0, maxLength: 3 },
    skinthickness: { max: 100, decimals: 0, maxLength: 3 },
    insulin: { max: 1000, decimals: 0, maxLength: 4 },
    bmi: { max: 80, decimals: 1, maxLength: 4 },
    diabetespedigreefunction: { max: 3, decimals: 3, maxLength: 5 },
    age: { max: 120, decimals: 0, maxLength: 3 },
  },
};

const updateNumericValue = (
  setter,
  model,
  name,
  value
) => {
  const rule = numericFieldRules?.[model]?.[name];

  if (!rule) {
    setter((previous) => ({
      ...previous,
      [name]: value,
    }));
    return;
  }

  // Allow the field to be completely cleared while editing.
  if (value === "") {
    setter((previous) => ({
      ...previous,
      [name]: "",
    }));
    return;
  }

  // Keep only digits and, when required, one decimal point.
  let sanitized = String(value).replace(/[^0-9.]/g, "");

  if (rule.decimals === 0) {
    sanitized = sanitized.replace(/\./g, "");
  } else {
    const firstDotIndex = sanitized.indexOf(".");

    if (firstDotIndex !== -1) {
      const integerPart = sanitized
        .slice(0, firstDotIndex)
        .replace(/\./g, "");

      const decimalPart = sanitized
        .slice(firstDotIndex + 1)
        .replace(/\./g, "")
        .slice(0, rule.decimals);

      sanitized = `${integerPart}.${decimalPart}`;
    }
  }

  // Prevent an invalid value such as just "." from being stored.
  if (sanitized === ".") {
    setter((previous) => ({
      ...previous,
      [name]: "",
    }));
    return;
  }

  // Do not allow more characters than the field can reasonably contain.
  if (rule.maxLength && sanitized.length > rule.maxLength) {
    return;
  }

  const numericValue = Number(sanitized);

  if (!Number.isFinite(numericValue)) {
    return;
  }

  // Keep the configured maximum as a hard validation boundary.
  if (numericValue > rule.max) {
    return;
  }

  setter((previous) => ({
    ...previous,
    [name]: sanitized,
  }));
};

const getModelAccuracy = (modelStatus, modelType) => {
  const model = modelStatus?.models?.[modelType] || {};
  const accuracy =
    model?.accuracy ??
    model?.evaluation?.accuracy;

  if (accuracy === undefined || accuracy === null) {
    return modelType === "cardiovascular"
      ? 0.9208333333333333
      : 0.949;
  }

  const numericAccuracy = Number(accuracy);

  if (!Number.isFinite(numericAccuracy)) {
    return null;
  }

  return numericAccuracy;
};

const formatAccuracy = (accuracy) => {
  if (accuracy === undefined || accuracy === null) {
    return "Not available";
  }

  const numericAccuracy = Number(accuracy);

  if (!Number.isFinite(numericAccuracy)) {
    return "Not available";
  }

  return `${(numericAccuracy * 100).toFixed(1)}%`;
};

const formatRiskBand = (riskBand) => {
  if (!riskBand) {
    return "Unknown";
  }

  const value = String(riskBand)
    .trim()
    .toUpperCase();

  switch (value) {
    case "LOW_SCORE":
      return "Low";

    case "HIGH_SCORE":
      return "High";

    case "MODERATE":
      return "Moderate";

    case "HIGH":
      return "High";

    case "LOW":
      return "Low";

    default:
      return String(riskBand)
        .replace(/_/g, " ")
        .toLowerCase()
        .replace(/\b\w/g, (letter) =>
          letter.toUpperCase()
        );
  }
};

const formatHistoryDate = (value) => {
  if (!value) {
    return "Date not available";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return String(value);
  }

  return date.toLocaleString();
};

// =========================================================
// Initial cardiovascular form
// =========================================================

const initialCardiovascularData = {
  age: "",
  sex: "",
  cp: "",
  trestbps: "",
  chol: "",
  fbs: "",
  restecg: "",
  thalach: "",
  exang: "",
  oldpeak: "",
  slope: "",
  ca: "",
  thal: "",
};

// =========================================================
// Initial diabetes form
// =========================================================

const initialDiabetesData = {
  pregnancies: "",
  glucose: "",
  bloodpressure: "",
  skinthickness: "",
  insulin: "",
  bmi: "",
  diabetespedigreefunction: "",
  age: "",
};

// =========================================================
// AI Model Status Component
// =========================================================

const AiModelStatus = ({
  aiHealth,
  aiModelStatus,
  loading,
}) => {
  if (loading) {
    return (
      <section className="ai-model-status-card">
        <div className="ai-status-header">
          <div>
            <h2>AI Model Status</h2>

            <p>
              Federated learning model and AI
              service status.
            </p>
          </div>

          <span className="ai-status-badge loading">
            Checking...
          </span>
        </div>
      </section>
    );
  }

  const serviceUp =
    aiHealth?.status === "UP";

  const cardiovascular =
    aiModelStatus?.models?.cardiovascular || {};

  const diabetes =
    aiModelStatus?.models?.diabetes || {};

  const cardiovascularLoaded =
    cardiovascular?.status === "LOADED";

  const diabetesLoaded =
    diabetes?.status === "LOADED";

  
      const cardiovascularVersion =
    cardiovascular?.version ||
    cardiovascular?.modelVersion ||
    "2.0.0";

  const diabetesVersion =
    diabetes?.version ||
    diabetes?.modelVersion ||
    "4.0.0";

  const formatFramework = (framework) => {
    if (!framework) {
      return "TensorFlow";
    }

    if (typeof framework === "string") {
      return framework;
    }

    if (typeof framework === "object") {
      if (
        framework.tensorflow ||
        framework.tensorflowFederated
      ) {
        return [
          framework.tensorflow
            ? `TensorFlow ${framework.tensorflow}`
            : "",
          framework.tensorflowFederated
            ? `TFF ${framework.tensorflowFederated}`
            : "",
        ]
          .filter(Boolean)
          .join(" / ");
      }

      return Object.values(framework)
        .filter(
          (value) =>
            typeof value === "string" ||
            typeof value === "number"
        )
        .join(" / ");
    }

    return String(framework);
  };

  const cardiovascularFramework =
    formatFramework(
      cardiovascular?.framework
    );

  const diabetesFramework =
    formatFramework(
      diabetes?.framework
    );

  const cardiovascularClients =
    cardiovascular?.number_of_clients ??
    cardiovascular?.numClients ??
    cardiovascular?.numberOfClients ??
    3;

  const diabetesClients =
    diabetes?.number_of_clients ??
    diabetes?.numClients ??
    diabetes?.numberOfClients ??
    3;

  const cardiovascularRounds =
    cardiovascular?.rounds ??
    cardiovascular?.number_of_rounds ??
    cardiovascular?.federatedRounds ??
    cardiovascular?.numberOfRounds ??
    10;

  const diabetesRounds =
    diabetes?.rounds ??
    diabetes?.number_of_rounds ??
    diabetes?.federatedRounds ??
    diabetes?.numberOfRounds ??
    20;
  return (
    <section className="ai-model-status-card">

      {/* =====================================================
          Header
      ====================================================== */}

      <div className="ai-status-header">

        <div>
          <h2>AI Model Status</h2>

          <p>
            MediSphere federated AI service and
            deployed risk models.
          </p>
        </div>

        <span
          className={`ai-status-badge ${
            serviceUp
              ? "online"
              : "offline"
          }`}
        >
          {serviceUp
            ? "AI Service Online"
            : "AI Service Offline"}
        </span>

      </div>

      {/* =====================================================
          Model cards
      ====================================================== */}

      <div className="ai-status-grid">

        {/* ---------------------------------------------------
            Cardiovascular
        ---------------------------------------------------- */}

        <div className="ai-status-model">

          <div className="ai-status-model-title">

            <h3>
              Cardiovascular Risk
            </h3>

            <span
              className={`ai-model-state ${
                cardiovascularLoaded
                  ? "loaded"
                  : "not-loaded"
              }`}
            >
              {cardiovascularLoaded
                ? "LOADED"
                : "NOT LOADED"}
            </span>

          </div>

          <div className="ai-status-details">

            <div>
              <span>Version</span>

              <strong>
                {cardiovascularVersion}
              </strong>
            </div>

            <div>
              <span>Framework</span>

              <strong>
                {cardiovascularFramework}
              </strong>
            </div>

            <div>
              <span>Federated Clients</span>

              <strong>
                {cardiovascularClients}
              </strong>
            </div>

            <div>
              <span>Federated Rounds</span>

              <strong>
                {cardiovascularRounds}
              </strong>
            </div>

          </div>

        </div>

        {/* ---------------------------------------------------
            Diabetes
        ---------------------------------------------------- */}

        <div className="ai-status-model">

          <div className="ai-status-model-title">

            <h3>
              Diabetes Risk
            </h3>

            <span
              className={`ai-model-state ${
                diabetesLoaded
                  ? "loaded"
                  : "not-loaded"
              }`}
            >
              {diabetesLoaded
                ? "LOADED"
                : "NOT LOADED"}
            </span>

          </div>

          <div className="ai-status-details">

            <div>
              <span>Version</span>

              <strong>
                {diabetesVersion}
              </strong>
            </div>

            <div>
              <span>Framework</span>

              <strong>
                {diabetesFramework}
              </strong>
            </div>

            <div>
              <span>Federated Clients</span>

              <strong>
                {diabetesClients}
              </strong>
            </div>

            <div>
              <span>Federated Rounds</span>

              <strong>
                {diabetesRounds}
              </strong>
            </div>

          </div>

        </div>

      </div>

      {/* =====================================================
          Federated learning information
      ====================================================== */}

      <div className="federated-status">

        <strong>
          Federated Learning
        </strong>

        <span>
          Models are trained across multiple
          hospital clients using federated
          aggregation. Patient records remain
          within the participating data source.
        </span>

      </div>

    </section>
  );
};

// =========================================================
// Main component
// =========================================================

function AIRiskPredictionPage() {

  // =======================================================
  // Main model
  // =======================================================

  const [activeModel, setActiveModel] =
    useState("cardiovascular");

  // =======================================================
  // Patient state
  // =======================================================

  const [patients, setPatients] =
    useState([]);

  const [selectedPatientId, setSelectedPatientId] =
    useState("");

  const [selectedPatient, setSelectedPatient] =
    useState(null);

  const [patientVitals, setPatientVitals] =
    useState([]);

  const [patientLabs, setPatientLabs] =
    useState([]);

  const [loadingPatients, setLoadingPatients] =
    useState(true);

  const [loadingPatientData, setLoadingPatientData] =
    useState(false);

  // =======================================================
  // AI service status state
  // =======================================================

  const [aiHealth, setAiHealth] =
    useState(null);

  const [aiModelStatus, setAiModelStatus] =
    useState(null);

  const [loadingAiStatus, setLoadingAiStatus] =
    useState(true);

  // =======================================================
  // Cardiovascular state
  // =======================================================

  const [cardiovascularData, setCardiovascularData] =
    useState(initialCardiovascularData);

  const [cardiovascularResult, setCardiovascularResult] =
    useState(null);

  const [cardiovascularHistory, setCardiovascularHistory] =
    useState([]);

  // =======================================================
  // Diabetes state
  // =======================================================

  const [diabetesData, setDiabetesData] =
    useState(initialDiabetesData);

  const [diabetesResult, setDiabetesResult] =
    useState(null);

  const [diabetesHistory, setDiabetesHistory] =
    useState([]);

  const [loadingRiskHistory, setLoadingRiskHistory] =
    useState(false);

  // =======================================================
  // Prediction state
  // =======================================================

  const [loadingPrediction, setLoadingPrediction] =
    useState(false);

  const [error, setError] =
    useState("");

  // =========================================================
  // Load patients
  // =========================================================

  useEffect(() => {

    const loadPatients = async () => {

      try {

        setLoadingPatients(true);
        setError("");

        const data =
          await getAiPatients();

        setPatients(data);

      } catch (err) {

        console.error(
          "AI patient loading error:",
          err
        );

        setError(
          err.message ||
          "Unable to load MediSphere patients."
        );

      } finally {

        setLoadingPatients(false);

      }
    };

    loadPatients();

  }, []);

  // =========================================================
  // Load AI service status
  // =========================================================

  useEffect(() => {

    const loadAiStatus = async () => {

      try {

        setLoadingAiStatus(true);

        const [
          health,
          modelStatus,
        ] = await Promise.all([
          getAiHealth(),
          getAiModelStatus(),
        ]);

        setAiHealth(health);
        setAiModelStatus(modelStatus);

      } catch (err) {

        console.error(
          "Unable to load AI service status:",
          err
        );

        setAiHealth(null);
        setAiModelStatus(null);

      } finally {

        setLoadingAiStatus(false);

      }
    };

    loadAiStatus();

  }, []);

  // =========================================================
  // Load selected patient's vitals and laboratory results
  // =========================================================

  useEffect(() => {

    if (!selectedPatientId) {

      setSelectedPatient(null);
      setPatientVitals([]);
      setPatientLabs([]);

      return;
    }

    const patient =
      patients.find(
        (item) =>
          item.id === selectedPatientId
      );

    setSelectedPatient(
      patient || null
    );

    const loadPatientClinicalData =
      async () => {

        try {

          setLoadingPatientData(true);
          setError("");

          const [
            vitals,
            labs,
          ] = await Promise.all([
            getAiPatientVitals(
              selectedPatientId
            ),
            getAiPatientLabs(
              selectedPatientId
            ),
          ]);

          setPatientVitals(vitals);
          setPatientLabs(labs);

          populateAvailableClinicalData(
            patient,
            vitals,
            labs
          );

        } catch (err) {

          console.error(
            "AI patient clinical data error:",
            err
          );

          setError(
            err.message ||
            "Unable to load patient clinical data."
          );

        } finally {

          setLoadingPatientData(false);

        }
      };

    loadPatientClinicalData();

  }, [
    selectedPatientId,
    patients,
  ]);

  // =========================================================
  // Load patient's previous AI risk predictions
  // =========================================================

  useEffect(() => {
    if (!selectedPatientId) {
      setCardiovascularHistory([]);
      setDiabetesHistory([]);
      return;
    }

    const loadRiskHistory = async () => {
      try {
        setLoadingRiskHistory(true);

        const history = await getAiRiskHistory(
          selectedPatientId
        );

        setCardiovascularHistory(
          Array.isArray(history?.cardiovascular)
            ? history.cardiovascular
            : []
        );

        setDiabetesHistory(
          Array.isArray(history?.diabetes)
            ? history.diabetes
            : []
        );
      } catch (err) {
        console.error(
          "Unable to load AI risk history:",
          err
        );

        setCardiovascularHistory([]);
        setDiabetesHistory([]);
      } finally {
        setLoadingRiskHistory(false);
      }
    };

    loadRiskHistory();
  }, [selectedPatientId]);

  // =========================================================
  // Sort newest clinical records first
  // =========================================================

  const sortByDateDescending = (
    items,
    dateFields
  ) => {

    return [...items].sort(
      (a, b) => {

        const aDate =
          dateFields
            .map(
              (field) =>
                a?.[field]
            )
            .find(Boolean) || "";

        const bDate =
          dateFields
            .map(
              (field) =>
                b?.[field]
            )
            .find(Boolean) || "";

        return (
          new Date(bDate).getTime() -
          new Date(aDate).getTime()
        );
      }
    );
  };

  // =========================================================
  // Find laboratory result
  // =========================================================

  const findLatestLab = (
    labs,
    patterns
  ) => {

    const matchingLabs =
      labs.filter((lab) => {

        const testName =
          String(
            lab?.testName || ""
          ).toLowerCase();

        const testCode =
          String(
            lab?.testCode || ""
          ).toLowerCase();

        return patterns.some(
          (pattern) =>
            testName.includes(pattern) ||
            testCode.includes(pattern)
        );
      });

    if (!matchingLabs.length) {
      return null;
    }

    return sortByDateDescending(
      matchingLabs,
      [
        "performedAt",
        "createdAt",
      ]
    )[0];
  };

  // =========================================================
  // Check compatible laboratory unit
  // =========================================================

  const isMgDl = (lab) => {

    const unit =
      String(
        lab?.unit || ""
      ).toLowerCase();

    return (
      unit === "" ||
      unit.includes("mg/dl") ||
      unit.includes("mg / dl")
    );
  };

  // =========================================================
  // Populate available clinical data
  // =========================================================

  const populateAvailableClinicalData = (
    patient,
    vitals,
    labs
  ) => {

    if (!patient) {
      return;
    }

    const sortedVitals =
      sortByDateDescending(
        vitals,
        ["recordedAt"]
      );

    const latestVital =
      sortedVitals[0] || null;

    // -------------------------------------------------------
    // Patient demographics
    // -------------------------------------------------------

    const age =
      patient.age !== undefined &&
      patient.age !== null
        ? String(patient.age)
        : "";

    const gender =
      String(
        patient.gender || ""
      ).toLowerCase();

    let sex = "";

    if (
      gender === "male" ||
      gender === "m"
    ) {

      sex = "1";

    } else if (
      gender === "female" ||
      gender === "f"
    ) {

      sex = "0";

    }

    // -------------------------------------------------------
    // Vital values
    // -------------------------------------------------------

    const systolicBP =
      latestVital?.systolicBloodPressure;

    const diastolicBP =
      latestVital?.diastolicBloodPressure;

    // -------------------------------------------------------
    // Laboratory values
    // -------------------------------------------------------

    const cholesterolLab =
      findLatestLab(
        labs,
        [
          "cholesterol",
          "chol",
        ]
      );

    const fastingGlucoseLab =
      findLatestLab(
        labs,
        [
          "fasting glucose",
          "fasting blood sugar",
          "fasting plasma glucose",
        ]
      );

    const glucoseLab =
      findLatestLab(
        labs,
        ["glucose"]
      );

    const bmiLab =
      findLatestLab(
        labs,
        [
          "bmi",
          "body mass index",
        ]
      );

    // -------------------------------------------------------
    // Cardiovascular data
    // -------------------------------------------------------

    setCardiovascularData(
      (previous) => ({
        ...previous,

        age,
        sex,

        trestbps:
          systolicBP !== undefined &&
          systolicBP !== null
            ? String(systolicBP)
            : previous.trestbps,

        chol:
          cholesterolLab &&
          cholesterolLab.value !== undefined &&
          cholesterolLab.value !== null &&
          isMgDl(cholesterolLab)
            ? String(
                cholesterolLab.value
              )
            : previous.chol,

        fbs:
          fastingGlucoseLab &&
          fastingGlucoseLab.value !== undefined &&
          fastingGlucoseLab.value !== null &&
          isMgDl(fastingGlucoseLab)
            ? Number(
                fastingGlucoseLab.value
              ) > 120
              ? "1"
              : "0"
            : previous.fbs,
      })
    );

    // -------------------------------------------------------
    // Diabetes data
    // -------------------------------------------------------

    const diabetesGlucoseLab =
      glucoseLab ||
      fastingGlucoseLab;

    setDiabetesData(
      (previous) => ({
        ...previous,

        age,

        glucose:
          diabetesGlucoseLab &&
          diabetesGlucoseLab.value !== undefined &&
          diabetesGlucoseLab.value !== null &&
          isMgDl(
            diabetesGlucoseLab
          )
            ? String(
                diabetesGlucoseLab.value
              )
            : previous.glucose,

        bloodpressure:
          diastolicBP !== undefined &&
          diastolicBP !== null
            ? String(
                diastolicBP
              )
            : previous.bloodpressure,

        bmi:
          bmiLab &&
          bmiLab.value !== undefined &&
          bmiLab.value !== null
            ? String(
                bmiLab.value
              )
            : previous.bmi,
      })
    );
  };

  // =========================================================
  // Input handlers
  // =========================================================

  const handleCardiovascularChange =
    (event) => {

      const {
        name,
        value,
      } = event.target;

      if (event.target.type === "number") {
        updateNumericValue(
          setCardiovascularData,
          "cardiovascular",
          name,
          value
        );
        return;
      }

      setCardiovascularData(
        (previous) => ({
          ...previous,
          [name]: value,
        })
      );
    };

  const handleDiabetesChange =
    (event) => {

      const {
        name,
        value,
      } = event.target;

      if (event.target.type === "number") {
        updateNumericValue(
          setDiabetesData,
          "diabetes",
          name,
          value
        );
        return;
      }

      setDiabetesData(
        (previous) => ({
          ...previous,
          [name]: value,
        })
      );
    };

  // =========================================================
  // Patient selection
  // =========================================================

  const handlePatientChange =
    (event) => {

      const patientId =
        event.target.value;

      setSelectedPatientId(
        patientId
      );

      setCardiovascularResult(
        null
      );

      setDiabetesResult(
        null
      );

      setError("");
    };

  // =========================================================
  // Number conversion
  // =========================================================

  const convertToNumbers = (
    data
  ) => {

    const converted = {};

    Object.keys(data).forEach(
      (key) => {

        converted[key] =
          Number(data[key]);

      }
    );

    return converted;
  };

  // =========================================================
  // Validate form values
  // =========================================================

  const validateValues = (
    data
  ) => {

    return Object.values(
      data
    ).every(
      (value) =>
        value !== "" &&
        value !== null &&
        value !== undefined &&
        !Number.isNaN(
          Number(value)
        )
    );
  };

  // =========================================================
  // Cardiovascular prediction
  // =========================================================

  const handleCardiovascularPrediction =
    async (event) => {

      event.preventDefault();

      setError("");

      if (!selectedPatientId) {

        setError(
          "Please select a MediSphere patient before running the prediction."
        );

        return;
      }

      if (
        !validateValues(
          cardiovascularData
        )
      ) {

        setError(
          "Please provide all cardiovascular model features. Fields without available patient data must be entered manually."
        );

        return;
      }

      setCardiovascularResult(
        null
      );

      setLoadingPrediction(
        true
      );

      try {

        const requestData =
          convertToNumbers(
            cardiovascularData
          );

        const result =
          await predictCardiovascularRisk(
            requestData
          );

        setCardiovascularResult(
          result
        );

        try {
          await saveAiRiskHistory({
            patientId: selectedPatientId,
            modelType: "CARDIOVASCULAR",
            modelVersion:
              result?.modelVersion ||
              aiModelStatus?.models?.cardiovascular?.version ||
              aiModelStatus?.models?.cardiovascular?.modelVersion ||
              "2.0.0",
            riskProbability:
              Number(result?.riskProbability),
            riskBand: result?.riskBand,
            modelAccuracy: getModelAccuracy(
              aiModelStatus,
              "cardiovascular"
            ),
          });

          const history = await getAiRiskHistory(
            selectedPatientId
          );

          setCardiovascularHistory(
            Array.isArray(history?.cardiovascular)
              ? history.cardiovascular
              : []
          );
        } catch (historyError) {
          console.error(
            "Unable to save cardiovascular risk history:",
            historyError
          );
        }

      } catch (err) {

        console.error(
          "Cardiovascular AI error:",
          err
        );

        setError(
          err?.response?.data?.error ||
          err.message ||
          "Unable to obtain cardiovascular risk prediction."
        );

      } finally {

        setLoadingPrediction(
          false
        );
      }
    };

  // =========================================================
  // Diabetes prediction
  // =========================================================

  const handleDiabetesPrediction =
    async (event) => {

      event.preventDefault();

      setError("");

      if (!selectedPatientId) {

        setError(
          "Please select a MediSphere patient before running the prediction."
        );

        return;
      }

      if (
        !validateValues(
          diabetesData
        )
      ) {

        setError(
          "Please provide all diabetes model features. Fields without available patient data must be entered manually."
        );

        return;
      }

      setDiabetesResult(
        null
      );

      setLoadingPrediction(
        true
      );

      try {

        const requestData =
          convertToNumbers(
            diabetesData
          );

        const result =
          await predictDiabetesRisk(
            requestData
          );

        setDiabetesResult(
          result
        );

        try {
          await saveAiRiskHistory({
            patientId: selectedPatientId,
            modelType: "DIABETES",
            modelVersion:
              result?.modelVersion ||
              aiModelStatus?.models?.diabetes?.version ||
              aiModelStatus?.models?.diabetes?.modelVersion ||
              "4.0.0",
            riskProbability:
              Number(result?.riskProbability),
            riskBand: result?.riskBand,
            modelAccuracy: getModelAccuracy(
              aiModelStatus,
              "diabetes"
            ),
          });

          const history = await getAiRiskHistory(
            selectedPatientId
          );

          setDiabetesHistory(
            Array.isArray(history?.diabetes)
              ? history.diabetes
              : []
          );
        } catch (historyError) {
          console.error(
            "Unable to save diabetes risk history:",
            historyError
          );
        }

      } catch (err) {

        console.error(
          "Diabetes AI error:",
          err
        );

        setError(
          err?.response?.data?.error ||
          err.message ||
          "Unable to obtain diabetes risk prediction."
        );

      } finally {

        setLoadingPrediction(
          false
        );
      }
    };

  // =========================================================
  // Reset cardiovascular
  // =========================================================

  const resetCardiovascular =
    () => {

      const patient =
        selectedPatient;

      setCardiovascularResult(
        null
      );

      setError("");

      if (!patient) {

        setCardiovascularData(
          initialCardiovascularData
        );

        return;
      }

      populateAvailableClinicalData(
        patient,
        patientVitals,
        patientLabs
      );

      setCardiovascularData(
        (previous) => ({
          ...initialCardiovascularData,

          age:
            previous.age,

          sex:
            previous.sex,

          trestbps:
            previous.trestbps,

          chol:
            previous.chol,

          fbs:
            previous.fbs,
        })
      );
    };

  // =========================================================
  // Reset diabetes
  // =========================================================

  const resetDiabetes =
    () => {

      const patient =
        selectedPatient;

      setDiabetesResult(
        null
      );

      setError("");

      if (!patient) {

        setDiabetesData(
          initialDiabetesData
        );

        return;
      }

      populateAvailableClinicalData(
        patient,
        patientVitals,
        patientLabs
      );

      setDiabetesData(
        (previous) => ({
          ...initialDiabetesData,

          age:
            previous.age,

          glucose:
            previous.glucose,

          bloodpressure:
            previous.bloodpressure,

          bmi:
            previous.bmi,
        })
      );
    };

  // =========================================================
  // Risk class
  // =========================================================

  const getRiskClass =
    (riskBand) => {

      if (!riskBand) {
        return "";
      }

      const band =
        String(
          riskBand
        ).toUpperCase();

      if (
        band.includes("HIGH")
      ) {
        return "risk-high";
      }

      if (
        band.includes("MODERATE")
      ) {
        return "risk-moderate";
      }

      if (
        band.includes("LOW")
      ) {
        return "risk-low";
      }

      return "risk-moderate";
    };

  // =========================================================
  // Feature names
  // =========================================================

  const formatFeatureName =
    (feature) => {

      const names = {

        age:
          "Age",

        sex:
          "Sex",

        cp:
          "Chest Pain Type",

        trestbps:
          "Resting Blood Pressure",

        chol:
          "Cholesterol",

        fbs:
          "Fasting Blood Sugar",

        restecg:
          "Resting ECG",

        thalach:
          "Maximum Heart Rate",

        exang:
          "Exercise-Induced Angina",

        oldpeak:
          "ST Depression",

        slope:
          "ST Slope",

        ca:
          "Major Vessels",

        thal:
          "Thalassemia",

        pregnancies:
          "Pregnancies",

        glucose:
          "Glucose",

        bloodpressure:
          "Blood Pressure",

        skinthickness:
          "Skin Thickness",

        insulin:
          "Insulin",

        bmi:
          "BMI",

        diabetespedigreefunction:
          "Diabetes Pedigree Function",
      };

      return (
        names[feature] ||
        feature
      );
    };

  // =========================================================
  // SHAP direction helper
  // =========================================================

  const getContributionDirection =
    (item) => {
      const direction = String(
        item?.direction || ""
      )
        .trim()
        .toUpperCase();

      if (
        direction ===
        "INCREASES_RISK"
      ) {
        return "increase";
      }

      if (
        direction ===
        "DECREASES_RISK"
      ) {
        return "decrease";
      }

      if (
        direction ===
        "NEUTRAL"
      ) {
        return "neutral";
      }

      // Fallback when backend direction
      // is missing or uses another format.
      const value = Number(
        item?.contribution ??
        item?.shapValue ??
        0
      );

      if (value > 0) {
        return "increase";
      }

      if (value < 0) {
        return "decrease";
      }

      return "neutral";
    };

  // =========================================================
  // SHAP explanation
  // =========================================================

  const Explanation =
    ({ result }) => {

      if (!result) {
        return null;
      }

      const contributions =
        result.featureContributions ||
        [];

      return (
        <div className="ai-explanation">

          <div className="explanation-header">

            <div>

              <h2>
                SHAP Risk Explanation
              </h2>

              <p>
                Feature contributions
                generated by the AI model.
              </p>

            </div>

          </div>

          <div className="contributors-grid">

            {/* Risk increasing */}

            <div className="contributors-card positive">

              <h3>
                Risk-Increasing Factors
              </h3>

              {result
                .positiveContributors
                ?.length > 0 ? (

                <div className="contributor-list">

                  {result
                    .positiveContributors
                    .map(
                      (
                        item,
                        index
                      ) => (

                        <div
                          className="contributor-row"
                          key={`${item.feature}-${index}`}
                        >

                          <span>
                            {
                              formatFeatureName(
                                item.feature
                              )
                            }
                          </span>

                          <strong>
                            +
                            {Number(
                              item.contribution ??
                              item.shapValue ??
                              0
                            ).toFixed(4)}
                          </strong>

                        </div>

                      )
                    )}

                </div>

              ) : (

                <p className="no-contributors">
                  No risk-increasing
                  contributors.
                </p>

              )}

            </div>

            {/* Risk decreasing */}

            <div className="contributors-card negative">

              <h3>
                Risk-Decreasing Factors
              </h3>

              {result
                .negativeContributors
                ?.length > 0 ? (

                <div className="contributor-list">

                  {result
                    .negativeContributors
                    .map(
                      (
                        item,
                        index
                      ) => (

                        <div
                          className="contributor-row"
                          key={`${item.feature}-${index}`}
                        >

                          <span>
                            {
                              formatFeatureName(
                                item.feature
                              )
                            }
                          </span>

                          <strong>
                            {Number(
                              item.contribution ??
                              item.shapValue ??
                              0
                            ).toFixed(4)}
                          </strong>

                        </div>

                      )
                    )}

                </div>

              ) : (

                <p className="no-contributors">
                  No risk-decreasing
                  contributors.
                </p>

              )}

            </div>

          </div>

          {/* All feature contributions */}

          <div className="feature-table">

            <h3>
              All Feature Contributions
            </h3>

            <div className="table-container">

              <table>

                <thead>

                  <tr>

                    <th>
                      Feature
                    </th>

                    <th>
                      Contribution
                    </th>

                    <th>
                      Direction
                    </th>

                  </tr>

                </thead>

                <tbody>

                  {contributions.map(
                    (
                      item,
                      index
                    ) => {

                      const value =
                        Number(
                          item.contribution ??
                          item.shapValue ??
                          0
                        );

                      const direction =
                        getContributionDirection(
                          item
                        );

                      return (
                        <tr
                          key={`${item.feature}-${index}`}
                        >

                          <td>
                            {
                              formatFeatureName(
                                item.feature
                              )
                            }
                          </td>

                          <td>
                            {value > 0
                              ? "+"
                              : ""}
                            {value.toFixed(6)}
                          </td>

                          <td>

                            <span
                              className={
                                direction ===
                                "increase"
                                  ? "direction-increase"
                                  : direction ===
                                    "decrease"
                                  ? "direction-decrease"
                                  : "direction-neutral"
                              }
                            >
                              {direction ===
                              "increase"
                                ? "Increases Risk"
                                : direction ===
                                  "decrease"
                                ? "Decreases Risk"
                                : "Neutral"}
                            </span>

                          </td>

                        </tr>
                      );
                    }
                  )}

                </tbody>

              </table>

            </div>

          </div>

        </div>
      );
    };

  // =========================================================
  // Risk result
  // =========================================================

  const RiskResult =
    ({ result }) => {

      if (!result) {
        return null;
      }

      const probability =
        Number(
          result.riskProbability
        ) * 100;

      return (
        <div className="ai-result-card">

          <div className="result-heading">

            <div>

              <span className="result-label">
                AI Prediction
              </span>

              <h2>
                {result.model}
              </h2>

            </div>

            <span
              className={`risk-badge ${getRiskClass(
                result.riskBand
              )}`}
            >
              {formatRiskBand(result.riskBand)}
            </span>

          </div>

          <div className="risk-summary">

            <div className="risk-score">

              <span>
                Risk Probability
              </span>

              <strong>
                {probability.toFixed(2)}%
              </strong>

            </div>

            {result.riskPercentage !==
              undefined && (

              <div className="risk-score">

                <span>
                  Risk Percentage
                </span>

                <strong>
                  {Number(
                    result.riskPercentage
                  ).toFixed(2)}
                  %
                </strong>

              </div>

            )}

          </div>

          <div className="risk-meter">

            <div
              className={`risk-meter-fill ${getRiskClass(
                result.riskBand
              )}`}
              style={{
                width: `${Math.min(
                  Math.max(
                    probability,
                    0
                  ),
                  100
                )}%`,
              }}
            />

          </div>

          <p className="model-purpose">
            {result.modelPurpose}
          </p>

        </div>
      );
    };

  // =========================================================
  // Cardiovascular form
  // =========================================================

  const CardiovascularForm =
    () => (

      <form
        className="ai-form"
        onSubmit={
          handleCardiovascularPrediction
        }
      >

        <div className="form-grid">

          {/* Age */}

          <div className="form-field">

            <label>
              Age
            </label>

            <input
              type="text"
              inputMode="numeric"
              name="age"
              value={
                cardiovascularData.age
              }
              onChange={
                handleCardiovascularChange
              }
              maxLength={
                numericFieldRules.cardiovascular.age.maxLength
              }
              required
            />

          </div>

          {/* Sex */}

          <div className="form-field">

            <label>
              Sex
            </label>

            <select
              name="sex"
              value={
                cardiovascularData.sex
              }
              onChange={
                handleCardiovascularChange
              }
              required
            >

              <option value="">
                Select
              </option>

              <option value="1">
                Male
              </option>

              <option value="0">
                Female
              </option>

            </select>

          </div>

          {/* Chest pain */}

          <div className="form-field">

            <label>
              Chest Pain Type
            </label>

            <select
              name="cp"
              value={
                cardiovascularData.cp
              }
              onChange={
                handleCardiovascularChange
              }
              required
            >

              <option value="">
                Select
              </option>

              <option value="1">
                Type 1
              </option>

              <option value="2">
                Type 2
              </option>

              <option value="3">
                Type 3
              </option>

              <option value="4">
                Type 4
              </option>

            </select>

          </div>

          {/* Blood pressure */}

          <div className="form-field">

            <label>
              Resting Blood Pressure
            </label>

            <input
              type="text"
              inputMode="numeric"
              name="trestbps"
              value={
                cardiovascularData.trestbps
              }
              onChange={
                handleCardiovascularChange
              }
              maxLength={
                numericFieldRules.cardiovascular.trestbps.maxLength
              }
              required
            />

            <small>
              mmHg
            </small>

          </div>

          {/* Cholesterol */}

          <div className="form-field">

            <label>
              Cholesterol
            </label>

            <input
              type="text"
              inputMode="numeric"
              name="chol"
              value={
                cardiovascularData.chol
              }
              onChange={
                handleCardiovascularChange
              }
              maxLength={
                numericFieldRules.cardiovascular.chol.maxLength
              }
              required
            />

            <small>
              mg/dL
            </small>

          </div>

          {/* FBS */}

          <div className="form-field">

            <label>
              Fasting Blood Sugar
            </label>

            <select
              name="fbs"
              value={
                cardiovascularData.fbs
              }
              onChange={
                handleCardiovascularChange
              }
              required
            >

              <option value="">
                Select
              </option>

              <option value="1">
                Greater than 120 mg/dL
              </option>

              <option value="0">
                120 mg/dL or less
              </option>

            </select>

          </div>

          {/* Rest ECG */}

          <div className="form-field">

            <label>
              Resting ECG
            </label>

            <select
              name="restecg"
              value={
                cardiovascularData.restecg
              }
              onChange={
                handleCardiovascularChange
              }
              required
            >

              <option value="">
                Select
              </option>

              <option value="0">
                Normal
              </option>

              <option value="1">
                ST-T Wave Abnormality
              </option>

              <option value="2">
                Left Ventricular Hypertrophy
              </option>

            </select>

          </div>

          {/* Maximum heart rate */}

          <div className="form-field">

            <label>
              Maximum Heart Rate
            </label>

            <input
              type="text"
              inputMode="numeric"
              name="thalach"
              value={
                cardiovascularData.thalach
              }
              onChange={
                handleCardiovascularChange
              }
              maxLength={
                numericFieldRules.cardiovascular.thalach.maxLength
              }
              required
            />

            <small>
              Enter the model's maximum
              heart-rate measurement;
              latest wearable heart rate
              is not substituted automatically.
            </small>

          </div>

          {/* Exercise angina */}

          <div className="form-field">

            <label>
              Exercise-Induced Angina
            </label>

            <select
              name="exang"
              value={
                cardiovascularData.exang
              }
              onChange={
                handleCardiovascularChange
              }
              required
            >

              <option value="">
                Select
              </option>

              <option value="1">
                Yes
              </option>

              <option value="0">
                No
              </option>

            </select>

          </div>

          {/* Oldpeak */}

          <div className="form-field">

            <label>
              ST Depression (Oldpeak)
            </label>

            <input
              type="text"
              inputMode="decimal"
              name="oldpeak"
              value={
                cardiovascularData.oldpeak
              }
              onChange={
                handleCardiovascularChange
              }
              maxLength={
                numericFieldRules.cardiovascular.oldpeak.maxLength
              }
              required
            />

          </div>

          {/* Slope */}

          <div className="form-field">

            <label>
              ST Slope
            </label>

            <select
              name="slope"
              value={
                cardiovascularData.slope
              }
              onChange={
                handleCardiovascularChange
              }
              required
            >

              <option value="">
                Select
              </option>

              <option value="1">
                Up
              </option>

              <option value="2">
                Flat
              </option>

              <option value="3">
                Down
              </option>

            </select>

          </div>

          {/* CA */}

          <div className="form-field">

            <label>
              Major Vessels (CA)
            </label>

            <select
              name="ca"
              value={
                cardiovascularData.ca
              }
              onChange={
                handleCardiovascularChange
              }
              required
            >

              <option value="">
                Select
              </option>

              <option value="0">
                0
              </option>

              <option value="1">
                1
              </option>

              <option value="2">
                2
              </option>

              <option value="3">
                3
              </option>

            </select>

          </div>

          {/* Thalassemia */}

          <div className="form-field">

            <label>
              Thalassemia
            </label>

            <select
              name="thal"
              value={
                cardiovascularData.thal
              }
              onChange={
                handleCardiovascularChange
              }
              required
            >

              <option value="">
                Select
              </option>

              <option value="3">
                Normal
              </option>

              <option value="6">
                Fixed Defect
              </option>

              <option value="7">
                Reversible Defect
              </option>

            </select>

          </div>

        </div>

        <div className="form-actions">

          <button
            type="submit"
            className="predict-button"
            disabled={
              loadingPrediction
            }
          >
            {loadingPrediction
              ? "Predicting..."
              : "Predict Cardiovascular Risk"}
          </button>

          <button
            type="button"
            className="reset-button"
            onClick={
              resetCardiovascular
            }
            disabled={
              loadingPrediction
            }
          >
            Reset
          </button>

        </div>

      </form>
    );

  // =========================================================
  // Diabetes form
  // =========================================================

  const DiabetesForm =
    () => (

      <form
        className="ai-form"
        onSubmit={
          handleDiabetesPrediction
        }
      >

        <div className="form-grid">

          {/* Pregnancies */}

          <div className="form-field">

            <label>
              Pregnancies
            </label>

            <input
              type="text"
              inputMode="numeric"
              name="pregnancies"
              value={
                diabetesData.pregnancies
              }
              onChange={
                handleDiabetesChange
              }
              maxLength={
                numericFieldRules.diabetes.pregnancies.maxLength
              }
              required
            />

            <small>
              Not stored in the current
              Patient model; enter the
              patient's clinical history.
            </small>

          </div>

          {/* Glucose */}

          <div className="form-field">

            <label>
              Glucose
            </label>

            <input
              type="text"
              inputMode="numeric"
              name="glucose"
              value={
                diabetesData.glucose
              }
              onChange={
                handleDiabetesChange
              }
              maxLength={
                numericFieldRules.diabetes.glucose.maxLength
              }
              required
            />

            <small>
              mg/dL
            </small>

          </div>

          {/* Blood pressure */}

          <div className="form-field">

            <label>
              Blood Pressure
            </label>

            <input
              type="text"
              inputMode="numeric"
              name="bloodpressure"
              value={
                diabetesData.bloodpressure
              }
              onChange={
                handleDiabetesChange
              }
              maxLength={
                numericFieldRules.diabetes.bloodpressure.maxLength
              }
              required
            />

            <small>
              mmHg — uses latest
              diastolic BP when available.
            </small>

          </div>

          {/* Skin thickness */}

          <div className="form-field">

            <label>
              Skin Thickness
            </label>

            <input
              type="text"
              inputMode="numeric"
              name="skinthickness"
              value={
                diabetesData.skinthickness
              }
              onChange={
                handleDiabetesChange
              }
              maxLength={
                numericFieldRules.diabetes.skinthickness.maxLength
              }
              required
            />

            <small>
              Not stored in the current
              MediSphere Vital/Lab models.
            </small>

          </div>

          {/* Insulin */}

          <div className="form-field">

            <label>
              Insulin
            </label>

            <input
              type="text"
              inputMode="numeric"
              name="insulin"
              value={
                diabetesData.insulin
              }
              onChange={
                handleDiabetesChange
              }
              maxLength={
                numericFieldRules.diabetes.insulin.maxLength
              }
              required
            />

            <small>
              Not automatically populated
              unless an insulin laboratory
              result exists.
            </small>

          </div>

          {/* BMI */}

          <div className="form-field">

            <label>
              BMI
            </label>

            <input
              type="text"
              inputMode="decimal"
              name="bmi"
              value={
                diabetesData.bmi
              }
              onChange={
                handleDiabetesChange
              }
              maxLength={
                numericFieldRules.diabetes.bmi.maxLength
              }
              required
            />

            <small>
              kg/m²
            </small>

          </div>

          {/* Diabetes pedigree */}

          <div className="form-field">

            <label>
              Diabetes Pedigree Function
            </label>

            <input
              type="text"
              inputMode="decimal"
              name="diabetespedigreefunction"
              value={
                diabetesData
                  .diabetespedigreefunction
              }
              onChange={
                handleDiabetesChange
              }
              maxLength={
                numericFieldRules.diabetes.diabetespedigreefunction.maxLength
              }
              required
            />

            <small>
              Not stored in the current
              MediSphere patient model.
            </small>

          </div>

          {/* Age */}

          <div className="form-field">

            <label>
              Age
            </label>

            <input
              type="text"
              inputMode="numeric"
              name="age"
              value={
                diabetesData.age
              }
              onChange={
                handleDiabetesChange
              }
              maxLength={
                numericFieldRules.diabetes.age.maxLength
              }
              required
            />

            <small>
              years
            </small>

          </div>

        </div>

        <div className="form-actions">

          <button
            type="submit"
            className="predict-button"
            disabled={
              loadingPrediction
            }
          >
            {loadingPrediction
              ? "Predicting..."
              : "Predict Diabetes Risk"}
          </button>

          <button
            type="button"
            className="reset-button"
            onClick={
              resetDiabetes
            }
            disabled={
              loadingPrediction
            }
          >
            Reset
          </button>

        </div>

      </form>
    );

  // =========================================================
  // Patient AI risk history summary
  // =========================================================

  const PatientRiskHistory = () => {
    if (!selectedPatient) {
      return null;
    }

    const cardiovascularLatest =
      cardiovascularHistory?.[0] || null;
    const cardiovascularPrevious =
      cardiovascularHistory?.[1] || null;

    const diabetesLatest =
      diabetesHistory?.[0] || null;
    const diabetesPrevious =
      diabetesHistory?.[1] || null;

    const cardiovascularAccuracy = getModelAccuracy(
      aiModelStatus,
      "cardiovascular"
    );

    const diabetesAccuracy = getModelAccuracy(
      aiModelStatus,
      "diabetes"
    );

    const renderRiskValue = (record) => {
      if (!record) {
        return "No previous prediction";
      }

      const value = Number(record.riskProbability);

      return Number.isFinite(value)
        ? `${(value * 100).toFixed(2)}%`
        : "Not available";
    };

    const getNumericRisk = (record) => {
      if (!record) {
        return null;
      }

      const value = Number(record.riskProbability);

      return Number.isFinite(value)
        ? value * 100
        : null;
    };

    const getRiskChange = (latest, previous) => {
      const latestValue = getNumericRisk(latest);
      const previousValue = getNumericRisk(previous);

      if (
        latestValue === null ||
        previousValue === null
      ) {
        return null;
      }

      return latestValue - previousValue;
    };

    const formatRiskChange = (change) => {
      if (change === null) {
        return "Not enough history";
      }

      if (Math.abs(change) < 0.005) {
        return "No change";
      }

      const absoluteChange = Math.abs(change).toFixed(2);

      return `${change > 0 ? "+" : "-"}${absoluteChange} percentage points`;
    };

    const getRiskTrend = (change) => {
      if (change === null) {
        return {
          label: "Not available",
          className: "risk-trend-neutral",
          icon: "—",
        };
      }

      if (Math.abs(change) < 0.005) {
        return {
          label: "No change",
          className: "risk-trend-neutral",
          icon: "→",
        };
      }

      if (change > 0) {
        return {
          label: "Risk increased",
          className: "risk-trend-increase",
          icon: "↑",
        };
      }

      return {
        label: "Risk decreased",
        className: "risk-trend-decrease",
        icon: "↓",
      };
    };

    const renderRiskChange = (latest, previous) => {
      const change = getRiskChange(
        latest,
        previous
      );
      const trend = getRiskTrend(change);

      return (
        <div className="ai-risk-change">
          <div>
            <span>Change from Previous</span>
            <strong className={trend.className}>
              {change === null
                ? "Not enough history"
                : formatRiskChange(change)}
            </strong>
          </div>

          <span
            className={`ai-risk-trend ${trend.className}`}
          >
            <span aria-hidden="true">
              {trend.icon}
            </span>
            {trend.label}
          </span>
        </div>
      );
    };

    const renderRiskBand = (record) => {
      if (!record?.riskBand) {
        return "—";
      }

      return (
        <span
          className={`risk-history-band ${getRiskClass(
            record.riskBand
          )}`}
        >
          {formatRiskBand(record.riskBand)}
        </span>
      );
    };

    const renderDate = (record) =>
      record
        ? formatHistoryDate(record.predictionDate)
        : "No previous prediction";

    const renderTrendTableRow = ({
      modelName,
      modelVersion,
      latest,
      previous,
    }) => {
      const change = getRiskChange(
        latest,
        previous
      );
      const trend = getRiskTrend(change);

      return (
        <tr key={modelName}>
          <td>
            <div className="ai-trend-model">
              <strong>{modelName}</strong>
              <span>Model {modelVersion}</span>
            </div>
          </td>

          <td>
            <strong className="ai-trend-risk-value">
              {renderRiskValue(latest)}
            </strong>
            <small>
              {latest
                ? formatRiskBand(latest.riskBand)
                : "—"}
            </small>
          </td>

          <td>
            <strong className="ai-trend-risk-value">
              {renderRiskValue(previous)}
            </strong>
            <small>
              {previous
                ? formatRiskBand(previous.riskBand)
                : "—"}
            </small>
          </td>

          <td>
            <strong
              className={`ai-trend-change ${trend.className}`}
            >
              {formatRiskChange(change)}
            </strong>
          </td>

          <td>
            <span
              className={`ai-trend-badge ${trend.className}`}
            >
              <span aria-hidden="true">
                {trend.icon}
              </span>
              {trend.label}
            </span>
          </td>
        </tr>
      );
    };

    const cardiovascularModelVersion =
      aiModelStatus?.models?.cardiovascular?.version ||
      aiModelStatus?.models?.cardiovascular?.modelVersion ||
      "2.0.0";

    const diabetesModelVersion =
      aiModelStatus?.models?.diabetes?.version ||
      aiModelStatus?.models?.diabetes?.modelVersion ||
      "4.0.0";

    return (
      <section className="ai-risk-history-card">
        <div className="ai-risk-history-header">
          <div>
            <h2>AI Risk History</h2>
            <p>
              Latest and previous predictions saved for this
              MediSphere patient. Model accuracy refers to
              validation performance, not individual-patient
              accuracy.
            </p>
          </div>

          {loadingRiskHistory && (
            <span className="ai-history-loading">
              Loading history...
            </span>
          )}
        </div>

        <div className="ai-risk-history-grid">
          <div className="ai-risk-history-model">
            <div className="ai-risk-history-model-title">
              <h3>❤️ Cardiovascular Risk</h3>
              <span>
                Model {cardiovascularModelVersion}
              </span>
            </div>

            <div className="ai-risk-history-values">
              <div>
                <span>Latest Risk</span>
                <strong>
                  {renderRiskValue(
                    cardiovascularLatest
                  )}
                </strong>
                <small>
                  {renderRiskBand(
                    cardiovascularLatest
                  )}
                </small>
                <small>
                  {renderDate(
                    cardiovascularLatest
                  )}
                </small>
              </div>

              <div>
                <span>Previous Risk</span>
                <strong>
                  {renderRiskValue(
                    cardiovascularPrevious
                  )}
                </strong>
                <small>
                  {renderRiskBand(
                    cardiovascularPrevious
                  )}
                </small>
                <small>
                  {renderDate(
                    cardiovascularPrevious
                  )}
                </small>
              </div>
            </div>

            {renderRiskChange(
              cardiovascularLatest,
              cardiovascularPrevious
            )}

            <div className="ai-model-accuracy">
              <span>Model Validation Accuracy</span>
              <strong>
                {formatAccuracy(
                  cardiovascularAccuracy
                )}
              </strong>
            </div>
          </div>

          <div className="ai-risk-history-model">
            <div className="ai-risk-history-model-title">
              <h3>🩺 Diabetes Risk</h3>
              <span>
                Model {diabetesModelVersion}
              </span>
            </div>

            <div className="ai-risk-history-values">
              <div>
                <span>Latest Risk</span>
                <strong>
                  {renderRiskValue(
                    diabetesLatest
                  )}
                </strong>
                <small>
                  {renderRiskBand(
                    diabetesLatest
                  )}
                </small>
                <small>
                  {renderDate(
                    diabetesLatest
                  )}
                </small>
              </div>

              <div>
                <span>Previous Risk</span>
                <strong>
                  {renderRiskValue(
                    diabetesPrevious
                  )}
                </strong>
                <small>
                  {renderRiskBand(
                    diabetesPrevious
                  )}
                </small>
                <small>
                  {renderDate(
                    diabetesPrevious
                  )}
                </small>
              </div>
            </div>

            {renderRiskChange(
              diabetesLatest,
              diabetesPrevious
            )}

            <div className="ai-model-accuracy">
              <span>Model Validation Accuracy</span>
              <strong>
                {formatAccuracy(
                  diabetesAccuracy
                )}
              </strong>
            </div>
          </div>
        </div>

        <div className="ai-risk-trend-section">
          <div className="ai-risk-trend-header">
            <div>
              <h3>Risk Trend</h3>
              <p>
                Comparison of the latest prediction with the
                previous saved prediction for this patient.
              </p>
            </div>
          </div>

          <div className="ai-risk-trend-table-wrapper">
            <table className="ai-risk-trend-table">
              <thead>
                <tr>
                  <th>AI Model</th>
                  <th>Latest</th>
                  <th>Previous</th>
                  <th>Change</th>
                  <th>Trend</th>
                </tr>
              </thead>

              <tbody>
                {renderTrendTableRow({
                  modelName: "❤️ Cardiovascular Risk",
                  modelVersion:
                    cardiovascularModelVersion,
                  latest:
                    cardiovascularLatest,
                  previous:
                    cardiovascularPrevious,
                })}

                {renderTrendTableRow({
                  modelName: "🩺 Diabetes Risk",
                  modelVersion:
                    diabetesModelVersion,
                  latest:
                    diabetesLatest,
                  previous:
                    diabetesPrevious,
                })}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    );
  };

  // =========================================================
  // Patient data summary
  // =========================================================

  const PatientDataSummary =
    () => {

      if (!selectedPatient) {

        return (
          <div className="ai-patient-empty">

            <strong>
              Select a MediSphere patient
            </strong>

            <p>
              Patient demographics,
              available vitals, and
              laboratory results will be
              used to populate compatible
              AI model fields.
            </p>

          </div>
        );
      }

      const latestVital =
        sortByDateDescending(
          patientVitals,
          ["recordedAt"]
        )[0];

      return (
        <div className="ai-patient-summary">

          <div>

            <span>
              Selected Patient
            </span>

            <strong>
              {selectedPatient.name}
            </strong>

          </div>

          <div>

            <span>
              Patient ID
            </span>

            <strong>
              {selectedPatient.id}
            </strong>

          </div>

          <div>

            <span>
              Age
            </span>

            <strong>
              {selectedPatient.age}
            </strong>

          </div>

          <div>

            <span>
              Gender
            </span>

            <strong>
              {selectedPatient.gender}
            </strong>

          </div>

          <div>

            <span>
              Available Vitals
            </span>

            <strong>
              {patientVitals.length}
            </strong>

          </div>

          <div>

            <span>
              Available Lab Results
            </span>

            <strong>
              {patientLabs.length}
            </strong>

          </div>

          {latestVital && (

            <div>

              <span>
                Latest Heart Rate
              </span>

              <strong>

                {
                  latestVital.heartRate ??
                  "Not available"
                }

                {latestVital.heartRate != null
                  ? " bpm"
                  : ""}

              </strong>

            </div>

          )}

        </div>
      );
    };

  // =========================================================
  // Render
  // =========================================================

  return (

    <div className="ai-risk-page">

      {/* =====================================================
          Header
      ====================================================== */}

      <div className="ai-page-header">

        <div>

          <h1>
            AI Risk Prediction
          </h1>

          <p>
            Federated AI models with SHAP
            explainability for healthcare
            decision-support.
          </p>

        </div>

      </div>

      {/* =====================================================
          Disclaimer
      ====================================================== */}

      <div className="ai-disclaimer">

        <strong>
          Important:
        </strong>{" "}

        These predictions are an
        educational AI and clinical
        decision-support demonstration.
        They are not a medical diagnosis
        and should not replace professional
        medical judgment.

      </div>

      {/* =====================================================
          AI MODEL STATUS
      ====================================================== */}

      <AiModelStatus
        aiHealth={aiHealth}
        aiModelStatus={aiModelStatus}
        loading={loadingAiStatus}
      />

      {/* =====================================================
          PATIENT SELECTION
      ====================================================== */}

      <div className="ai-patient-selector">

        <div>

          <h2>
            Select MediSphere Patient
          </h2>

          <p>
            Use an existing patient record
            as the source for compatible
            AI features.
          </p>

        </div>

        <select
          value={selectedPatientId}
          onChange={
            handlePatientChange
          }
          disabled={
            loadingPatients ||
            loadingPatientData
          }
        >

          <option value="">

            {loadingPatients
              ? "Loading patients..."
              : "Select a patient"}

          </option>

          {patients.map(
            (patient) => (

              <option
                key={patient.id}
                value={patient.id}
              >

                {patient.name}
                {" — "}
                {patient.id}

              </option>

            )
          )}

        </select>

        {loadingPatientData && (

          <p className="ai-loading-text">

            Loading patient vitals and
            laboratory results...

          </p>

        )}

      </div>

      {/* =====================================================
          PATIENT SUMMARY
      ====================================================== */}

      <PatientDataSummary />

      <PatientRiskHistory />

      {/* =====================================================
          Error
      ====================================================== */}

      {error && (

        <div className="ai-error">
          {error}
        </div>

      )}

      {/* =====================================================
          MODEL TABS
      ====================================================== */}

      <div className="model-tabs">

        <button
          className={
            activeModel ===
            "cardiovascular"
              ? "model-tab active"
              : "model-tab"
          }
          onClick={() => {

            setActiveModel(
              "cardiovascular"
            );

            setError("");

          }}
        >
          ❤️ Cardiovascular Risk
        </button>

        <button
          className={
            activeModel ===
            "diabetes"
              ? "model-tab active"
              : "model-tab"
          }
          onClick={() => {

            setActiveModel(
              "diabetes"
            );

            setError("");

          }}
        >
          🩺 Diabetes Risk
        </button>

      </div>

      {/* =====================================================
          CARDIOVASCULAR
      ====================================================== */}

      {activeModel ===
        "cardiovascular" && (

        <div className="ai-section">

          <div className="ai-card">

            <div className="ai-card-header">

              <div>

                <h2>
                  Cardiovascular Risk
                  Assessment
                </h2>

                <p>
                  Patient demographics
                  and compatible clinical
                  measurements are loaded
                  from MediSphere.
                  Model-specific features
                  not stored in the system
                  must be entered manually.
                </p>

              </div>

              <span className="model-label">
                TensorFlow Federated
              </span>

            </div>

            {CardiovascularForm()}

          </div>

          <RiskResult
            result={
              cardiovascularResult
            }
          />

          <Explanation
            result={
              cardiovascularResult
            }
          />

        </div>

      )}

      {/* =====================================================
          DIABETES
      ====================================================== */}

      {activeModel ===
        "diabetes" && (

        <div className="ai-section">

          <div className="ai-card">

            <div className="ai-card-header">

              <div>

                <h2>
                  Diabetes Risk
                  Assessment
                </h2>

                <p>
                  Patient demographics
                  and compatible clinical
                  measurements are loaded
                  from MediSphere.
                  Model-specific features
                  not stored in the system
                  must be entered manually.
                </p>

              </div>

              <span className="model-label">
                TensorFlow Federated
              </span>

            </div>

            {DiabetesForm()}

          </div>

          <RiskResult
            result={
              diabetesResult
            }
          />

          <Explanation
            result={
              diabetesResult
            }
          />

        </div>

      )}

    </div>
  );
}

export default AIRiskPredictionPage;
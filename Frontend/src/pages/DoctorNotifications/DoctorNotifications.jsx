import { useCallback, useEffect, useMemo, useState } from "react";
import { getAllDoctorNotifications } from "../../services/doctorNotificationService";

import "./DoctorNotifications.css";

const SSE_URL = "http://localhost:8080/api/notifications/stream";


// =====================================
// HELPER FUNCTIONS
// =====================================

const getNotificationId = (notification) => {
  return (
    notification.notificationId ||
    notification.alertId ||
    notification.id ||
    null
  );
};


const getNotificationDate = (notification) => {
  return (
    notification.createdAt ||
    notification.receivedAt ||
    notification.recordedAt ||
    0
  );
};


const mergeNotifications = (
  existingNotifications,
  incomingNotifications
) => {
  const notificationMap = new Map();

  // Add existing notifications first
  existingNotifications.forEach((notification) => {
    const id = getNotificationId(notification);

    if (id) {
      notificationMap.set(id, notification);
    }
  });

  // Add incoming notifications and update duplicates
  incomingNotifications.forEach((notification) => {
    const id = getNotificationId(notification);

    if (id) {
      const existingNotification = notificationMap.get(id);

      notificationMap.set(id, {
        ...existingNotification,
        ...notification,
      });
    }
  });

  return Array.from(notificationMap.values()).sort(
    (a, b) =>
      new Date(getNotificationDate(b)).getTime() -
      new Date(getNotificationDate(a)).getTime()
  );
};


// =====================================
// COMPONENT
// =====================================

const DoctorNotifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [filter, setFilter] = useState("ALL");
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState("");


  // =====================================
  // FETCH NOTIFICATIONS FROM BACKEND
  // =====================================

  const fetchNotifications = useCallback(
    async (manualRefresh = false) => {
      try {
        if (manualRefresh) {
          setIsRefreshing(true);
        } else {
          setLoading(true);
        }

        const data = await getAllDoctorNotifications();

        const apiNotifications = Array.isArray(data) ? data : [];

        // Merge API notifications with existing SSE notifications
        setNotifications((previousNotifications) =>
          mergeNotifications(
            previousNotifications,
            apiNotifications
          )
        );

        setError("");
      } catch (err) {
        console.error("Notification loading error:", err);

        setError("Unable to load doctor notifications.");
      } finally {
        setLoading(false);
        setIsRefreshing(false);
      }
    },
    []
  );


  // =====================================
  // INITIAL FETCH + POLLING
  // =====================================

  useEffect(() => {
    fetchNotifications();

    const interval = setInterval(() => {
      fetchNotifications();
    }, 5000);

    return () => {
      clearInterval(interval);
    };
  }, [fetchNotifications]);


  // =====================================
  // REAL-TIME SSE CONNECTION
  // =====================================

  useEffect(() => {
    console.log(
      "Connecting to real-time notification stream..."
    );

    const eventSource = new EventSource(SSE_URL);

    eventSource.onopen = () => {
      console.log(
        "Connected to real-time notification stream."
      );
    };

    eventSource.addEventListener(
      "doctor-notification",
      (event) => {
        try {
          const newNotification = JSON.parse(event.data);

          console.log(
            "New real-time doctor notification:",
            newNotification
          );

          // Add received time if backend does not provide it
          const notificationWithReceivedTime = {
            ...newNotification,
            receivedAt:
              newNotification.receivedAt ||
              new Date().toISOString(),
          };

          setNotifications((previousNotifications) =>
            mergeNotifications(
              previousNotifications,
              [notificationWithReceivedTime]
            )
          );

          setError("");
        } catch (err) {
          console.error(
            "Failed to process real-time notification:",
            err
          );
        }
      }
    );

    eventSource.onerror = (err) => {
      console.warn(
        "SSE connection interrupted. Browser will retry automatically.",
        err
      );
    };

    return () => {
      console.log(
        "Closing real-time notification stream."
      );

      eventSource.close();
    };
  }, []);


  // =====================================
  // FILTER NOTIFICATIONS
  // =====================================

  const filteredNotifications = useMemo(() => {
    if (filter === "ALL") {
      return notifications;
    }

    return notifications.filter(
      (notification) =>
        notification.severity?.toUpperCase() === filter
    );
  }, [notifications, filter]);


  // =====================================
  // NOTIFICATION COUNTS
  // =====================================

  const highCount = notifications.filter(
    (notification) =>
      notification.severity?.toUpperCase() === "HIGH"
  ).length;

  const mediumCount = notifications.filter(
    (notification) =>
      notification.severity?.toUpperCase() === "MEDIUM"
  ).length;

  const lowCount = notifications.filter(
    (notification) =>
      notification.severity?.toUpperCase() === "LOW"
  ).length;


  // =====================================
  // FORMAT DATE
  // =====================================

  const formatDate = (date) => {
    if (!date) {
      return "Not available";
    }

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return "Not available";
    }

    return parsedDate.toLocaleString();
  };


  // =====================================
  // GET SEVERITY CSS CLASS
  // =====================================

  const getSeverityClass = (severity) => {
    return severity?.toLowerCase() || "unknown";
  };


  // =====================================
  // RENDER COMPONENT
  // =====================================

  return (
    <div className="doctor-notifications-page">

      {/* =====================================
          PAGE HEADER
      ===================================== */}

      <div className="notifications-header">
        <div>
          <h1>Doctor Notifications</h1>

          <p>
            Real-time alerts generated from patient wearable
            vital signs
          </p>
        </div>

        <button
          type="button"
          className="refresh-button"
          onClick={() => fetchNotifications(true)}
          disabled={isRefreshing}
        >
          {isRefreshing ? "Refreshing..." : "↻ Refresh"}
        </button>
      </div>


      {/* =====================================
          NOTIFICATION STATISTICS
      ===================================== */}

      <div className="notification-stats">

        <div className="notification-stat-card">
          <span>Total Alerts</span>
          <strong>{notifications.length}</strong>
        </div>

        <div className="notification-stat-card high-stat">
          <span>High Severity</span>
          <strong>{highCount}</strong>
        </div>

        <div className="notification-stat-card medium-stat">
          <span>Medium Severity</span>
          <strong>{mediumCount}</strong>
        </div>

        <div className="notification-stat-card low-stat">
          <span>Low Severity</span>
          <strong>{lowCount}</strong>
        </div>

      </div>


      {/* =====================================
          FILTER BUTTONS
      ===================================== */}

      <div className="notification-filters">

        <button
          type="button"
          className={
            filter === "ALL" ? "active-filter" : ""
          }
          onClick={() => setFilter("ALL")}
        >
          All
        </button>

        <button
          type="button"
          className={
            filter === "HIGH" ? "active-filter" : ""
          }
          onClick={() => setFilter("HIGH")}
        >
          High
        </button>

        <button
          type="button"
          className={
            filter === "MEDIUM" ? "active-filter" : ""
          }
          onClick={() => setFilter("MEDIUM")}
        >
          Medium
        </button>

        <button
          type="button"
          className={
            filter === "LOW" ? "active-filter" : ""
          }
          onClick={() => setFilter("LOW")}
        >
          Low
        </button>

      </div>


      {/* =====================================
          LOADING AND ERROR MESSAGES
      ===================================== */}

      {loading && (
        <div className="notification-message">
          Loading notifications...
        </div>
      )}

      {error && (
        <div className="notification-error">
          {error}
        </div>
      )}

      {!loading &&
        !error &&
        filteredNotifications.length === 0 && (
          <div className="notification-message">
            No notifications found.
          </div>
        )}


      {/* =====================================
          NOTIFICATION LIST
      ===================================== */}

      <div className="notification-list">

        {filteredNotifications.map((notification, index) => {

          const severityClass = getSeverityClass(
            notification.severity
          );

          const notificationKey =
            getNotificationId(notification) ||
            `${notification.patientId}-${notification.vitalType}-${index}`;

          return (
            <div
              className={`notification-card ${severityClass}`}
              key={notificationKey}
            >

              {/* =====================================
                  NOTIFICATION CARD HEADER
              ===================================== */}

              <div className="notification-card-header">

                <div>

                  <h3>
                    {notification.vitalType ||
                      "UNKNOWN VITAL"}
                  </h3>

                  <span className="patient-id">
                    Patient ID:{" "}
                    {notification.patientId ||
                      "Not available"}
                  </span>

                </div>

                <span
                  className={`severity-badge ${severityClass}`}
                >
                  {notification.severity || "UNKNOWN"}
                </span>

              </div>


              {/* =====================================
                  MEASURED VALUE
              ===================================== */}

              <div className="notification-value">

                {notification.measuredValue ?? "N/A"}

                <span>
                  {" "}
                  {notification.unit || ""}
                </span>

              </div>


              {/* =====================================
                  ALERT MESSAGE
              ===================================== */}

              <p className="notification-message-text">

                {notification.message ||
                  "No alert message available."}

              </p>


              {/* =====================================
                  NOTIFICATION DETAILS
              ===================================== */}

              <div className="notification-details">

                <p>
                  <strong>Status:</strong>{" "}
                  {notification.status || "OPEN"}
                </p>

                <p>
                  <strong>Recorded At:</strong>{" "}
                  {formatDate(notification.recordedAt)}
                </p>

                <p>
                  <strong>Received At:</strong>{" "}
                  {formatDate(
                    notification.receivedAt ||
                    notification.createdAt
                  )}
                </p>

              </div>

            </div>
          );

        })}

      </div>

    </div>
  );
};

export default DoctorNotifications;
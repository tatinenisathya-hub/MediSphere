import "./Laboratory.css";
import Header from "../../components/Header";

function LaboratoryPage() {
  return (
    <>
      <Header
        title="Laboratory Results"
        description="Laboratory data for the patient digital twin"
      />
      <div className="patient-list-card">
        <h2>Laboratory Results</h2>
        <p>
          Laboratory-result management will be implemented in the next
          Milestone 1 stages.
        </p>
      </div>
    </>
  );
}

export default LaboratoryPage;
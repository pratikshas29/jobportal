import React from "react";
import { Link } from "react-router-dom";
import "../assets/styles/Home.css";

function Home() {
  const documents = [
    { title: "Offer Letter", path: "/offer-letter" },
    { title: "Appointment Letter", path: "/appointment-letter" },
    { title: "Payslip", path: "/payslip" },
    { title: "Relieving Letter", path: "/relieving-letter" },
    { title: "Appraisal Letter", path: "/appraisal-letter" },
    { title: "Increment Letter", path: "/increment-letter" },
  ];

  return (
    <div className="container">
      <h1>Document Portal</h1>

      <div className="links-container">
        {documents.map((doc, index) => (
          <Link key={index} to={doc.path} className="document-link">
            {doc.title}
          </Link>
        ))}
      </div>
    </div>
  );
}

export default Home;

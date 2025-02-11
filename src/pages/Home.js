import React from "react";
import { Link } from "react-router-dom";
import { FileText, Briefcase, File, User, Clipboard } from "lucide-react"; // Import icons

function Home() {
  const documents = [
    { title: "Offer Letter", path: "/offer-letter", icon: <FileText size={32} /> },
    { title: "Appointment Letter", path: "/appointment-letter", icon: <FileText size={32} /> },
    { title: "Payslip", path: "/payslip", icon: <File size={32} /> },
    { title: "Relieving Letter", path: "/relieving-letter", icon: <FileText size={32} /> },
    { title: "Appraisal Letter", path: "/appraisal-letter", icon: <Clipboard size={32} /> },
    // { title: "Increment Letter", path: "/increment-letter", icon: <Briefcase size={32} /> },
    { title: "Manage Company", path: "/manage-company", icon: <Briefcase size={32} /> },
    { title: "Manage Candidates", path: "/manage-student", icon: <User size={32} /> },
  ];

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-4xl font-extrabold text-center text-gray-800 mb-12">
        Document Portal
      </h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
        {documents.map((doc, index) => (
          <Link
            key={index}
            to={doc.path}
            className="block p-8 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 rounded-xl shadow-xl transform hover:scale-105 transition-all duration-300 ease-in-out flex items-center justify-center text-white"
          >
            <div className="flex flex-col items-center">
              <div className="mb-4">{doc.icon}</div>
              <h2 className="text-2xl font-semibold text-center">{doc.title}</h2>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

export default Home;

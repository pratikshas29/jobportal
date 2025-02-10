import React, { useState,useEffect } from "react";
import "../components/CompanyDetailsForm.css";
import { db } from "./firebase";
import { collection, addDoc, getDocs, updateDoc, deleteDoc, doc } from "firebase/firestore";
const CompanyDetailsForm = ({ onUpdateCompanyDetails }) => {
  const [showDetails, setShowDetails] = useState(false);
  useEffect(() => {
    fetchCompanies();
  }, []);
  const [companies, setCompanies] = useState([]);
  const fetchCompanies = async () => {
 
    const querySnapshot = await getDocs(collection(db, "companies"));
    const companyList = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    
    console.log(companyList);
    setCompanies(companyList);
  };
  const [companyDetails, setCompanyDetails] = useState({
    
    name: "",
    address: "",
    city: "",
    phone: "",
    website: "",
logo:"",
    // Employee Details
    empCode: "",
    employeeName: "",
    designation: "",
    pan: "",
    location: "",
    doj: "",
    department: "",
    payableDays: "",

    // Earnings
    basic: "",
    da: "",
    conveyanceAllowance: "",
    otherAllowance: "",
    medicalAllowance: "",
    gross: "",
    cca: "",

    // Deductions
    professionalTax: "",
    otherDeductions: "",
    totalDeductions: "",
    netPay: "",

    lpa: "",
  });

  const calculateSalary = (lpa) => {
    // Convert to number and ensure precision
    const lpaNum = Number(lpa);

    // Calculate annual values first
    const basic = Math.round((lpaNum * 35) / 100);
    const da = Math.round((lpaNum * 30) / 100);
    const conveyanceAllowance = Math.round((lpaNum * 20) / 100);
    const otherAllowance = Math.round((lpaNum * 15) / 100);
    const grossSalary = basic + da + conveyanceAllowance + otherAllowance;

    // Monthly calculations
    const monthlyGross = Math.round(grossSalary / 12);
    const monthlyBasic = Math.round(basic / 12);
    const monthlyDa = Math.round(da / 12);
    const monthlyConveyanceAllowance = Math.round(conveyanceAllowance / 12);
    const monthlyOtherAllowance = Math.round(otherAllowance / 12);

    // Deductions (monthly)
    const professionalTax = 200; // Monthly PT is 200
    const monthlyOtherDeductions = Math.round((monthlyGross * 5.6) / 100);
    const monthlyTotalDeductions = professionalTax + monthlyOtherDeductions;
    const monthlyNetPay = monthlyGross - monthlyTotalDeductions;

    return {
      basic: monthlyBasic.toString(),
      da: monthlyDa.toString(),
      conveyanceAllowance: monthlyConveyanceAllowance.toString(),
      otherAllowance: monthlyOtherAllowance.toString(),
      medicalAllowance: "0",
      gross: monthlyGross.toString(),
      cca: "0",
      professionalTax: professionalTax.toString(),
      otherDeductions: monthlyOtherDeductions.toString(),
      totalDeductions: monthlyTotalDeductions.toString(),
      netPay: monthlyNetPay.toString(),
    };
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "company") {
      const selectedCompany = companies.find(company => company.name === value);
      if (selectedCompany) {
        setCompanyDetails({
          ...companyDetails,
          name: selectedCompany.name,
          address: selectedCompany.address,
          email: selectedCompany.email,
          phone: selectedCompany.mobile,
          website: selectedCompany.website,
          logo: selectedCompany.logo, // Updating the logo dynamically
          // Add any additional fields as needed
        });
      }
    }

    if (name === "pan") {
      const updatedValue = value.toUpperCase();
      const newDetails = {
        ...companyDetails,
        [name]: updatedValue,
      };
      setCompanyDetails(newDetails);
      onUpdateCompanyDetails(newDetails);
    } else if (name === "lpa") {
      // Prevent empty or invalid inputs
      if (value === "" || isNaN(value)) {
        const newDetails = {
          ...companyDetails,
          lpa: value,
        };
        setCompanyDetails(newDetails);
        setShowDetails(false);
        onUpdateCompanyDetails(newDetails);
        return;
      }

      // Store the exact string value from input
      const exactLPA = value;
      const calculatedValues = calculateSalary(exactLPA);

      const newDetails = {
        ...companyDetails,
        lpa: exactLPA,
        ...calculatedValues,
      };

      setCompanyDetails(newDetails);
      setShowDetails(true);
      onUpdateCompanyDetails(newDetails);
    } else {
      const newDetails = {
        ...companyDetails,
        [name]: value,
      };
      setCompanyDetails(newDetails);
      onUpdateCompanyDetails(newDetails);
    }
  };

  const renderInput = (name, label, type = "text", isReadOnly = false) => {
    const isDisabled = isReadOnly && name !== "lpa";

    // List of fields that should show the rupee symbol
    const amountFields = [
      "lpa",
      "basic",
      "da",
      "conveyanceAllowance",
      "otherAllowance",
      "medicalAllowance",
      "gross",
      "cca",
      "professionalTax",
      "otherDeductions",
      "totalDeductions",
      "netPay",
    ];

    const isAmountField = amountFields.includes(name);

    const inputProps = {
      type: type,
      name: name,
      value: companyDetails[name],
      onChange: handleChange,
      placeholder: `Enter ${label.toLowerCase()}`,
      readOnly: isDisabled,
      disabled: isDisabled,
      className: `${isDisabled ? "readonly-input" : ""} ${
        isAmountField ? "amount-input" : ""
      }`,
    };

    // Special handling for all number type inputs
    if (type === "number") {
      inputProps.onWheel = (e) => e.target.blur();
      inputProps.onKeyDown = (e) => {
        if (e.key === "ArrowUp" || e.key === "ArrowDown") {
          e.preventDefault();
        }
      };
      inputProps.step = "any";
      inputProps.onKeyPress = (e) => {
        if (!/[\d.]|\b(Backspace|Delete|Tab)\b/.test(e.key)) {
          e.preventDefault();
        }
      };
    }

    return (
      <div className="form-group">
        <label>{label}:</label>
        <div className={isAmountField ? "input-with-symbol" : ""}>
          {isAmountField && <span className="rupee-symbol">₹</span>}
          <input {...inputProps} />
        </div>
      </div>
    );
  };

  return (
    <div className="company-details-form">
      <h3>Payslip Details</h3>

      {/* Company Details Section */}
     
      <div className="form-group">
                  <label className="block mb-1 text-sm font-medium text-gray-700">Company</label>
                  <select
                    name="company"
                    onChange={handleChange}
                    className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    {companies.map((company) => (
                      <option key={company.id} value={company.name}>
                        {company.name}
                      </option>
                    ))}
                  </select>
                </div>

      {/* Employee Details Section */}
      <h4>Employee Details</h4>
      {renderInput("empCode", "Employee Code")}
      {renderInput("employeeName", "Employee Name")}
      {renderInput("designation", "Designation")}
      {renderInput("pan", "PAN")}
      {renderInput("location", "Location")}
      {renderInput("doj", "Date of Joining", "date")}
      {renderInput("department", "Department")}
      {renderInput("payableDays", "Payable Days", "number")}

      {/* LPA Input Field */}
      <h4>Salary Details</h4>
      {renderInput("lpa", "Annual Package (LPA)", "number", false)}

      {/* {showDetails && (
        <>
       
          <h4>Earnings</h4>
          {[
            "basic",
            "da",
            "conveyanceAllowance",
            "otherAllowance",
            "medicalAllowance",
            "gross",
            "cca",
          ].map((field) =>
            renderInput(
              field,
              field.charAt(0).toUpperCase() +
                field.slice(1).replace(/([A-Z])/g, " $1"),
              "number",
              true
            )
          )}

         
          <h4>Deductions</h4>
          {[
            "professionalTax",
            "otherDeductions",
            "totalDeductions",
            "netPay",
          ].map((field) =>
            renderInput(
              field,
              field.charAt(0).toUpperCase() +
                field.slice(1).replace(/([A-Z])/g, " $1"),
              "number",
              true
            )
          )}
        </>
      )} */}
    </div>
  );
};

export default CompanyDetailsForm;

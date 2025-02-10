import React, { useState, useEffect } from "react";
import "../components/CompanyDetailsForm.css";
import { db } from "./firebase";
import { collection, getDocs } from "firebase/firestore";

const CompanyDetailsForm = ({ onUpdateCompanyDetails }) => {
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    fetchCompanies();
  }, []);

  const [companies, setCompanies] = useState([]);
  const fetchCompanies = async () => {
    const querySnapshot = await getDocs(collection(db, "companies"));
    const companyList = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    setCompanies(companyList);
    console.log("Fetched Companies:", companyList); // Debugging

  };

  const [companyDetails, setCompanyDetails] = useState({
    empCode: "",
    employeeName: "",
    designation: "",
    pan: "",
    location: "",
    doj: "",
    department: "",
    payableDays: "",
    lpa: "",
    basic: "",
    da: "",
    conveyanceAllowance: "",
    otherAllowance: "",
    medicalAllowance: "",
    gross: "",
    cca: "",
    professionalTax: "",
    otherDeductions: "",
    totalDeductions: "",
    netPay: "",
  });

  const calculateSalary = (lpa) => {
    const lpaNum = Number(lpa);

    const basic = Math.round((lpaNum * 35) / 100);
    const da = Math.round((lpaNum * 30) / 100);
    const conveyanceAllowance = Math.round((lpaNum * 20) / 100);
    const otherAllowance = Math.round((lpaNum * 15) / 100);
    const grossSalary = basic + da + conveyanceAllowance + otherAllowance;

    const monthlyGross = Math.round(grossSalary / 12);
    const monthlyBasic = Math.round(basic / 12);
    const monthlyDa = Math.round(da / 12);
    const monthlyConveyanceAllowance = Math.round(conveyanceAllowance / 12);
    const monthlyOtherAllowance = Math.round(otherAllowance / 12);

    const professionalTax = 200;
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
      const selectedCompany = companies.find((company) => company.name === value);
      if (selectedCompany) {
        setCompanyDetails((prevState) => {
          const updatedDetails = {
            ...prevState,
            name: selectedCompany.name,
            address: selectedCompany.address,
            email: selectedCompany.email,
            phone: selectedCompany.phone,
            website: selectedCompany.website,
            logo: selectedCompany.logo,
          };
  
          onUpdateCompanyDetails(updatedDetails); // ✅ Ensures latest data is sent
          return updatedDetails;
        });
      }
    }
  
    if (name === "pan") {
      const updatedValue = value.toUpperCase();
      setCompanyDetails((prevState) => {
        const updatedDetails = { ...prevState, [name]: updatedValue };
        onUpdateCompanyDetails(updatedDetails);
        return updatedDetails;
      });
    } else if (name === "lpa") {
      if (value === "" || isNaN(value)) {
        setCompanyDetails((prevState) => {
          const updatedDetails = { ...prevState, lpa: value };
          setShowDetails(false);
          onUpdateCompanyDetails(updatedDetails);
          return updatedDetails;
        });
        return;
      }
  
      const calculatedValues = calculateSalary(value);
      setCompanyDetails((prevState) => {
        const updatedDetails = { ...prevState, lpa: value, ...calculatedValues };
        setShowDetails(true);
        onUpdateCompanyDetails(updatedDetails);
        return updatedDetails;
      });
    } else {
      setCompanyDetails((prevState) => {
        const updatedDetails = { ...prevState, [name]: value };
        onUpdateCompanyDetails(updatedDetails);
        return updatedDetails;
      });
    }
  };
  

  const renderInput = (name, label, type = "text", isReadOnly = false) => {
    const isDisabled = isReadOnly && name !== "lpa";
    const amountFields = ["lpa", "basic", "da", "conveyanceAllowance", "otherAllowance", "medicalAllowance", "gross", "cca", "professionalTax", "otherDeductions", "totalDeductions", "netPay"];
    const isAmountField = amountFields.includes(name);

    const inputProps = {
      type,
      name,
      value: companyDetails[name],
      onChange: handleChange,
      placeholder: `Enter ${label.toLowerCase()}`,
      readOnly: isDisabled,
      disabled: isDisabled,
      className: `${isDisabled ? "readonly-input" : ""} ${isAmountField ? "amount-input" : ""}`,
    };

    if (type === "number") {
      inputProps.onWheel = (e) => e.target.blur();
      inputProps.onKeyDown = (e) => { if (e.key === "ArrowUp" || e.key === "ArrowDown") { e.preventDefault(); } };
      inputProps.step = "any";
      inputProps.onKeyPress = (e) => { if (!/[\d.]|\b(Backspace|Delete|Tab)\b/.test(e.key)) { e.preventDefault(); } };
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
    <div className="">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Enter Payslip Detail</h2>
      <div className="form-group">
        <label className="block mb-1 text-sm font-medium text-gray-700">Company</label>
        <select name="company" onChange={handleChange} className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
          {companies.map((company) => (
            <option key={company.id} value={company.name}>
              {company.name}
            </option>
          ))}
        </select>
      </div>

      {/* <h4>Employee Details</h4> */}
      {renderInput("empCode", "Employee Code")}
      {renderInput("employeeName", "Employee Name")}
      {renderInput("designation", "Designation")}
      {renderInput("pan", "PAN")}
      {renderInput("location", "Location")}
      {renderInput("doj", "Date of Joining", "date")}
      {renderInput("department", "Department")}
      {renderInput("payableDays", "Payable Days", "number")}

      {/* <h4>Salary Details</h4> */}
      {renderInput("lpa", "Annual Package (LPA)", "number", false)}
    </div>
  );
};

export default CompanyDetailsForm;

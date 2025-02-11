import React, { useState, useEffect } from "react";
import "../components/CompanyDetailsForm.css";
import { db } from "./firebase";
import { collection, getDocs } from "firebase/firestore";

const CompanyDetailsForm = ({ onUpdateCompanyDetails }) => {
  const [showDetails, setShowDetails] = useState(false);
  const [candidates, setCandidates] = useState([]);
  const [selectedCandidate, setSelectedCandidate] = useState(null);

  useEffect(() => {
    fetchCompanies();
    fetchCandidates();
  }, []);

  const [companies, setCompanies] = useState([]);
  
  const fetchCompanies = async () => {
    const querySnapshot = await getDocs(collection(db, "companies"));
    const companyList = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    setCompanies(companyList);
  };

  const fetchCandidates = async () => {
    const querySnapshot = await getDocs(collection(db, "candidates"));
    const candidateList = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    setCandidates(candidateList);
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
    hra: "",
    lta: "",
    specialAllowance: "",
    epfEmployee: "",
    epfEmployer: "",
    esi: "",
    gratuity: "",
    annualBonus: "",
    monthlyCTC: "",
    annualCTC: "",
  });

  const calculateSalary = (lpa) => {
    const lpaNum = Number(lpa);
    const annualSalary = lpaNum * 100000; // Convert LPA to annual amount
    
    // Monthly Basic = 50% of CTC as per standard practice
    const monthlyBasic = Math.round((annualSalary * 0.5) / 12);
    
    // HRA = 40% of Basic for metro cities (as per Income Tax Act)
    const hra = Math.round(monthlyBasic * 0.4);
    
    // DA (Dearness Allowance) = 20% of Basic
    const da = Math.round(monthlyBasic * 0.2);
    
    // Standard Deductions and Allowances
    const conveyanceAllowance = 1600; // Fixed as per standard practice
    const medicalAllowance = 1250; // Fixed as per standard practice
    const lta = Math.round(monthlyBasic * 0.1); // Leave Travel Allowance = 10% of Basic
    
    // Calculate Special Allowance (remaining amount)
    const totalFixedAllowances = monthlyBasic + hra + da + conveyanceAllowance + medicalAllowance + lta;
    const monthlyCTC = Math.round(annualSalary / 12);
    const specialAllowance = Math.round(monthlyCTC - totalFixedAllowances);
    
    // Deductions
    const epfEmployee = Math.min(monthlyBasic * 0.12, 1800); // 12% of Basic, capped at 15000 monthly salary
    const epfEmployer = epfEmployee; // Employer contribution equals Employee contribution
    const esi = monthlyCTC <= 21000 ? Math.round(monthlyCTC * 0.0075) : 0; // 0.75% if applicable
    const professionalTax = 200; // Standard PT for most states
    
    // Calculate Gross and Net
    const grossSalary = monthlyBasic + hra + da + conveyanceAllowance + 
                       medicalAllowance + lta + specialAllowance;
    
    const totalDeductions = epfEmployee + esi + professionalTax;
    const netPay = grossSalary - totalDeductions;

    return {
      basic: monthlyBasic.toString(),
      hra: hra.toString(),
      da: da.toString(),
      conveyanceAllowance: conveyanceAllowance.toString(),
      medicalAllowance: medicalAllowance.toString(),
      lta: lta.toString(),
      specialAllowance: specialAllowance.toString(),
      gross: grossSalary.toString(),
      epfEmployee: epfEmployee.toString(),
      epfEmployer: epfEmployer.toString(),
      esi: esi.toString(),
      professionalTax: professionalTax.toString(),
      totalDeductions: totalDeductions.toString(),
      netPay: netPay.toString(),
      
      // Additional annual components
      gratuity: Math.round((monthlyBasic * 15) / 26).toString(), // As per Gratuity Act
      annualBonus: Math.round(monthlyBasic * 0.0833 * 12).toString(), // 8.33% of annual basic
      
      // Monthly CTC components
      monthlyCTC: monthlyCTC.toString(),
      annualCTC: annualSalary.toString(),
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
          onUpdateCompanyDetails(updatedDetails);
          return updatedDetails;
        });
      }
    } else if (name === "employeeName") {
      const candidate = candidates.find((c) => c.candidateName === value);
      if (candidate) {
        setSelectedCandidate(candidate);
        const calculatedValues = calculateSalary(candidate.packageLPA);
        setCompanyDetails((prevState) => {
          const updatedDetails = {
            ...prevState,
            employeeName: candidate.candidateName,
            empCode: candidate.employeeCode,
            designation: candidate.designation,
            pan: candidate.panNo,
            location: candidate.location,
            doj: candidate.DateOfJoining,
            department: candidate.department,
            lpa: candidate.packageLPA,
            ...calculatedValues
          };
          setShowDetails(true);
          onUpdateCompanyDetails(updatedDetails);
          return updatedDetails;
        });
      }
    } else if (name === "pan") {
      const updatedValue = value.toUpperCase();
      setCompanyDetails((prevState) => {
        const updatedDetails = { ...prevState, [name]: updatedValue };
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
    const value = selectedCandidate && companyDetails[name] ? companyDetails[name] : "";
    const isDisabled = isReadOnly || (selectedCandidate && name !== "payableDays");
    const amountFields = [
      "lpa", "basic", "hra", "da", "conveyanceAllowance", 
      "medicalAllowance", "lta", "specialAllowance", "gross",
      "epfEmployee", "epfEmployer", "esi", "professionalTax",
      "totalDeductions", "netPay", "gratuity", "annualBonus",
      "monthlyCTC", "annualCTC"
    ];
    const isAmountField = amountFields.includes(name);

    const inputProps = {
      type,
      name,
      value: value,
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
        <select 
          name="company" 
          onChange={handleChange} 
          className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="">Select Company</option>
          {companies.map((company) => (
            <option key={company.id} value={company.name}>
              {company.name}
            </option>
          ))}
        </select>
      </div>

      <div className="form-group">
        <label className="block mb-1 text-sm font-medium text-gray-700">Employee Name</label>
        <select
          name="employeeName"
          onChange={handleChange}
          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="">Select Employee</option>
          {candidates.map((candidate) => (
            <option key={candidate.id} value={candidate.candidateName}>
              {candidate.candidateName} 
              {/* - {candidate.packageLPA} LPA */}
            </option>
          ))}
        </select>
      </div>

      {/* {renderInput("empCode", "Employee Code", "text", true)}
      {renderInput("designation", "Designation", "text", true)}
      {renderInput("pan", "PAN", "text", true)}
      {renderInput("location", "Location", "text", true)}
      {renderInput("doj", "Date of Joining", "text", true)}
      {renderInput("department", "Department", "text", true)} */}
      {renderInput("payableDays", "Payable Days", "number")}

      {/* {showDetails && (
        <>
          <h3 className="text-lg font-semibold mt-6 mb-4">Salary Components</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {renderInput("monthlyCTC", "Monthly CTC", "text", true)}
            {renderInput("basic", "Basic", "text", true)}
            {renderInput("hra", "HRA", "text", true)}
            {renderInput("da", "DA", "text", true)}
            {renderInput("conveyanceAllowance", "Conveyance Allowance", "text", true)}
            {renderInput("medicalAllowance", "Medical Allowance", "text", true)}
            {renderInput("lta", "LTA", "text", true)}
            {renderInput("specialAllowance", "Special Allowance", "text", true)}
            {renderInput("gross", "Gross Salary", "text", true)}
            
            <h3 className="text-lg font-semibold mt-4 mb-2 col-span-2">Deductions</h3>
            {renderInput("epfEmployee", "EPF (Employee)", "text", true)}
            {renderInput("epfEmployer", "EPF (Employer)", "text", true)}
            {renderInput("esi", "ESI", "text", true)}
            {renderInput("professionalTax", "Professional Tax", "text", true)}
            {renderInput("totalDeductions", "Total Deductions", "text", true)}
            
            <h3 className="text-lg font-semibold mt-4 mb-2 col-span-2">Net Salary</h3>
            {renderInput("netPay", "Net Pay", "text", true)}
            
            <h3 className="text-lg font-semibold mt-4 mb-2 col-span-2">Annual Components</h3>
            {renderInput("gratuity", "Gratuity", "text", true)}
            {renderInput("annualBonus", "Annual Bonus", "text", true)}
            {renderInput("annualCTC", "Annual CTC", "text", true)}
          </div>
        </>
      )} */}
    </div>
  );
};

export default CompanyDetailsForm;

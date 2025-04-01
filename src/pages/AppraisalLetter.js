import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Download } from "lucide-react";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import "../assets/styles/ButtonStyles.css";
import "../assets/styles/AppraisalLetter.css";
import { db } from "./firebase";
import { collection, getDocs } from "firebase/firestore";

function AppraisalLetter() {
  const containerRef = React.useRef(null);
  const [companies, setCompanies] = useState([]);
  const [candidates, setCandidates] = useState([]);
  const [formData, setFormData] = useState({
    employeeName: "",
    date: "",
    lpa: "",
    basic: "",
    da: "",
    conveyance: "",
    other: "",
    total: "",
    salaryInWords: ""
  });
  useEffect(() => {
    fetchCompanies();
  }, []);

  const fetchCompanies = async () => {

    const querySnapshot = await getDocs(collection(db, "companies"));
    const companyList = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));

    console.log(companyList);
    setCompanies(companyList);
  };
  useEffect(() => {
    fetchCandidates();
  }, []);

  const fetchCandidates = async () => {

    const querySnapshot = await getDocs(collection(db, "candidates"));
    const candidateList = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));

    console.log(candidateList);
    setCandidates(candidateList);
  };

  // Convert number to words
  const numberToWords = (num) => {
    const single = ["", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine"];
    const double = ["Ten", "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen", "Seventeen", "Eighteen", "Nineteen"];
    const tens = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"];
    const formatTens = (num) => {
      if (num < 10) return single[num];
      if (num < 20) return double[num - 10];
      return tens[Math.floor(num / 10)] + (num % 10 ? " " + single[num % 10] : "");
    };

    if (num === 0) return "Zero";
    const convert = (num) => {
      if (num < 100) return formatTens(num);
      if (num < 1000) return single[Math.floor(num / 100)] + " Hundred" + (num % 100 ? " and " + formatTens(num % 100) : "");
      if (num < 100000) return convert(Math.floor(num / 1000)) + " Thousand" + (num % 1000 ? " " + convert(num % 1000) : "");
      if (num < 10000000) return convert(Math.floor(num / 100000)) + " Lakh" + (num % 100000 ? " " + convert(num % 100000) : "");
      return convert(Math.floor(num / 10000000)) + " Crore" + (num % 10000000 ? " " + convert(num % 10000000) : "");
    };
    return convert(Math.round(num));
  };

  // Calculate salary components based on LPA
  const calculateSalaryComponents = (lpa) => {
    const annualSalary = parseFloat(lpa) * 100000;

    // Standard Indian salary structure
    const basic = Math.round(annualSalary * 0.40); // 40% of CTC
    const hra = Math.round(basic * 0.50); // 50% of Basic
    const da = Math.round(annualSalary * 0.10); // 10% of CTC
    const conveyance = 19200; // Standard yearly conveyance
    const medical = 15000; // Standard medical allowance
    const special = annualSalary - (basic + hra + da + conveyance + medical);

    // Monthly calculations
    const monthlyBasic = Math.round(basic / 12);
    const monthlyHRA = Math.round(hra / 12);
    const monthlyDA = Math.round(da / 12);
    const monthlyConveyance = Math.round(conveyance / 12);
    const monthlyMedical = Math.round(medical / 12);
    const monthlySpecial = Math.round(special / 12);
    const monthlyTotal = monthlyBasic + monthlyHRA + monthlyDA + monthlyConveyance + monthlyMedical + monthlySpecial;

    return {
      basic: monthlyBasic.toFixed(2),
      da: monthlyDA.toFixed(2),
      conveyance: monthlyConveyance.toFixed(2),
      other: monthlySpecial.toFixed(2),
      total: monthlyTotal.toFixed(2),
      salaryInWords: `Rupees ${numberToWords(annualSalary)} Only Per Annum`
    };
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    if (name === "company") {
      const selectedCompany = companies.find(company => company.name === value);
      if (selectedCompany) {
        setFormData({
          ...formData,
          companyName: selectedCompany.name,
          companyAddressLine1: selectedCompany.address,
          companyEmail: selectedCompany.email,
          companyPhone: selectedCompany.mobile,
          companyWebsite: selectedCompany.website,
          companyLogo: selectedCompany.logo,
          companyColor:selectedCompany.serverColor,

        });
      }
    } else if (name === "employeeName") {
      // Find selected candidate and calculate salary components
      const selectedCandidate = candidates.find(candidate => candidate.candidateName === value);
      if (selectedCandidate) {
        const lpa = parseFloat(selectedCandidate.packageLPA);
        const components = calculateSalaryComponents(formData.newLPA || lpa); // Use new LPA if available
        
        setFormData(prev => ({
          ...prev,
          employeeName: value,
          currentLPA: lpa, // Store current LPA
          lpa: formData.newLPA || lpa, // Use new LPA if available
          basic: components.basic,
          da: components.da,
          packageLPA: formData.newLPA || selectedCandidate.packageLPA,
          conveyance: components.conveyance,
          other: components.other,
          total: components.total,
          salaryInWords: components.salaryInWords
        }));
      }
    } else if (name === "newLPA") {
      const newLPA = parseFloat(value) || 0;
      const components = calculateSalaryComponents(newLPA);
      
      setFormData(prev => ({
        ...prev,
        newLPA: value,
        lpa: newLPA,
        basic: components.basic,
        da: components.da,
        packageLPA: value,
        conveyance: components.conveyance,
        other: components.other,
        total: components.total,
        salaryInWords: components.salaryInWords
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleDownload = async () => {
    if (!containerRef.current) return;
    const pdf = new jsPDF("p", "mm", "a4");
    const elements = containerRef.current.getElementsByClassName("appraisal-letter-page");

    for (let i = 0; i < elements.length; i++) {
      const canvas = await html2canvas(elements[i]);
      const imgData = canvas.toDataURL("image/jpeg", 1.0);
      if (i > 0) pdf.addPage();
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      pdf.addImage(imgData, "JPEG", 0, 0, pdfWidth, pdfHeight);
    }

    pdf.save("appraisal-letter.pdf");
  };
  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }).format(date); // "05 Feb 2025"
  };

  const wordToNumber = (word) => {
    const wordMap = {
        'one': 1, 'two': 2, 'three': 3, 'four': 4, 'five': 5, 'six': 6, 'seven': 7, 'eight': 8, 'nine': 9, 'ten': 10,
        'eleven': 11, 'twelve': 12, 'thirteen': 13, 'fourteen': 14, 'fifteen': 15, 'sixteen': 16, 'seventeen': 17,
        'eighteen': 18, 'nineteen': 19, 'twenty': 20, 'thirty': 30, 'forty': 40, 'fifty': 50, 'sixty': 60,
        'seventy': 70, 'eighty': 80, 'ninety': 90, 'hundred': 100, 'thousand': 1000, 'lakh': 100000,
        'million': 1000000, 'billion': 1000000000
    };

    const words = word.toLowerCase().split(' ');
    let total = 0;
    let currentValue = 0;

    words.forEach(word => {
        if (wordMap[word] >= 100) {
            currentValue *= wordMap[word];
        } else if (wordMap[word] === 1000 || wordMap[word] === 100000 || wordMap[word] === 1000000) {
            currentValue *= wordMap[word];
            total += currentValue;
            currentValue = 0;
        } else {
            currentValue += wordMap[word];
        }
    });

    total += currentValue;  // Add remaining value
    return total;
};

const convertSalaryInWordsToNumber = (salaryInWords) => {
    const words = salaryInWords.toLowerCase().split(' ');
    
    let integerPart = [];
    let decimalPart = [];
    let foundPoint = false;
    let multiplier = 1;

    words.forEach(word => {
        if (word === 'point') {
            foundPoint = true;
        } else if (['lakh', 'million', 'billion', 'thousand'].includes(word)) {
            multiplier = wordToNumber(word);  // Capture correct multiplier
        } else if (foundPoint) {
            decimalPart.push(word);
        } else {
            integerPart.push(word);
        }
    });

    let integerValue = wordToNumber(integerPart.join(' '));
    let decimalValue = 0;

    if (decimalPart.length > 0) {
        let decimalDigits = decimalPart.map(word => wordToNumber(word));
        decimalValue = parseFloat("0." + decimalDigits.join(''));
    }

    // Apply multiplier correctly to both integer and decimal
    let finalSalary = (integerValue + decimalValue) * multiplier;

    return Math.round(finalSalary);  // Ensure no floating-point issues
};

// Example Usage
const numericSalary = convertSalaryInWordsToNumber(formData.packageLPA || "0");
console.log("salary:", numericSalary);


  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-[210mm] mx-auto">
        <div className="flex justify-between items-center mb-6 md:mb-12 mt-4 md:mt-6">
          <div className="ml-2 md:ml-4">
            <Link to="/" className="back-link flex items-center text-gray-600 hover:text-gray-900">
              <ArrowLeft className="h-4 w-4 md:h-5 md:w-5 mr-2" />
              <span className="text-sm md:text-base">Back to Home</span>
            </Link>
          </div>
        </div>

        {/* Form Section */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <h2 className="text-xl md:text-2xl font-bold mb-6">Enter Appraisal Letter Details</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Employee Name */}
            <div className="form-group">
              <label className="block mb-1 text-sm font-medium text-gray-700">Employee Name</label>
              <select
                name="employeeName"
                onChange={handleInputChange}
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

            {/* Date */}
            <div className="form-group">
              <label className="block mb-1 text-sm font-medium text-gray-700"> Appraisal Date</label>
              <input
                type="date"
                name="date"
                value={formData.date}
                onChange={handleInputChange}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* Company */}
            <div className="form-group">
              <label className="block mb-1 text-sm font-medium text-gray-700">Company</label>
              <select
                name="company"
                onChange={handleInputChange}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
              <label className="block mb-1 text-sm font-medium text-gray-700">New Package (LPA)</label>
              <input
                type="number"
                name="newLPA"
                value={formData.newLPA || ''}
                onChange={handleInputChange}
                placeholder="Enter new LPA"
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                step="0.1"
                min="0"
              />
            </div>
          </div>

          {/* Submit Button */}
          <div className="mt-6 flex justify-end">
            <button
              onClick={handleDownload}
              className="download-btn flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 active:bg-blue-800 shadow-lg hover:shadow-md transition-all duration-200"
            >
              <Download size={18} className="mr-2" />
              <span>Generate Appraisal Letter</span>
            </button>
          </div>
        </div>

        {/* Hidden PDF Content */}
        <div ref={containerRef} style={{ position: 'absolute', left: '-9999px', top: '-9999px' }}>
          <div className="appraisal-letter-page">
          <div 
  className="letter-header pb-4 mb-4" 
  style={{
    borderBottomColor: formData.companyColor,  // Apply bottom border color
    borderBottomStyle: "solid",               // Solid line
    borderBottomWidth: "1px"                  // 1px thickness
  }}
>
              <div>
                <h1 className="company-name" style={{ color: formData.companyColor }}>{formData.companyName}</h1>
                <p className="company-address">
                  {formData.companyAddressLine1}
                  <br />
                  
                 Phone: {formData.companyPhone}
                  {/* {formData.companyCity} - {formData.companyPincode}, ({formData.companyState}) INDIA. */}
                  <br/>
                  {formData.companyWebsite}
                </p>
              </div>
              <img src={formData.companyLogo} alt={formData.companyName} className="company-logo" />
            </div>


            <h2 className="letter-title">Employee Appraisal Letter</h2>

            <div className="letter-content">
              <p className="date">Date - {formatDate(formData.date)}</p>
              <p className="employee-name capitalize">{formData.employeeName},</p>
              <p className="subject">Sub: Appraisal Letter</p>

              <p className="appreciation-text">
                We would like to express our appreciation and commendation for all the passion
                and commitment you have been exhibiting in your existing role. In recognition
                of your contribution, it is our pleasure to award you a gross increase in your
                salary with effect from {formatDate(formData.date)}.
              </p>

              <p>Your revised salary structure as follows:</p>

              <div className="compensation-table">
                <div className="table-header">
                  <span>Compensation Heads</span>
                  <span>Compensation (In INR)</span>
                </div>
                <div className="table-row">
                  <span>Basic</span>
                  <span>₹{formData.basic}</span>
                </div>
                <div className="table-row">
                  <span>Dearness Allowance</span>
                  <span>₹{formData.da}</span>
                </div>
                <div className="table-row">
                  <span>Conveyance Allowance</span>
                  <span>₹{formData.conveyance}</span>
                </div>
                <div className="table-row">
                  <span>Other allowance</span>
                  <span>₹{formData.other}</span>
                </div>
                {/* {formData.currentLPA && formData.newLPA && (
                  <div className="table-row highlight">
                    <span>Increment</span>
                    <span>{((formData.newLPA - formData.currentLPA) / formData.currentLPA * 100).toFixed(2)}%</span>
                  </div>
                )} */}
                <div className="table-row total">
                  <span>Monthly Total</span>
                  <span>₹{formData.total}</span>
                </div>
                {/* <div className="table-row">
                  <span>Annual CTC</span>
                  <span>{formData.salaryInWords}</span>
                </div> */}
              </div>

              <p className="expectation-text">
                We expect you to keep up your performance in the years to come and grow with
                the organization. Please sign and return the duplicate copy in token of your
                acceptance, for your records.
              </p>

              <p>Wish you all the best.</p>

              <div className="signature-section">
                <p>Signature</p>
                <p>Hr Manager</p>
              </div>

              <div 
  className="footer w-full flex flex-col items-start text-left border-t leading-5 pt-2 absolute bottom-10 left-15 right-15"
  style={{
    borderTopColor: formData.companyColor, 
    borderTopStyle: "solid",
    borderTopWidth: "1px",
  }}
>
  <p className="m-0">{formData.companyName}</p>
  <p className="m-0">{formData.companyAddressLine1}</p>
  <p className="m-0">{formData.companyPhone}</p>          
  <p className="m-0">{formData.companyWebsite}</p>
   
</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AppraisalLetter;

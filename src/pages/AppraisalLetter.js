import React, { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Download } from "lucide-react";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import "../assets/styles/ButtonStyles.css";
import "../assets/styles/AppraisalLetter.css";

function AppraisalLetter() {
  const containerRef = React.useRef(null);
  const [formData, setFormData] = useState({
    employeeName: "",
    date: "",
    lpa: "", // Only input needed for salary
    // Other fields will be calculated automatically
    // Company Details
    companyName: "MYCLAN SERVICES PRIVATE LIMITED",
    companyAddressLine1: "Office No -309, 3rd Floor",
    companyAddressLine2: "Navale Icon, Near Navale Bridge",
    companyAddressLine3: "Narhe",
    companyCity: "Pune",
    companyState: "Maharashtra",
    companyPincode: "411041",
    companyEmail: "hr@myclanservices.co.in",
    companyPhone: "8956165171",
    companyWebsite: "www.myclanservices.co.in"
  });

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
    
    if (name === 'lpa') {
      const components = calculateSalaryComponents(value);
      setFormData(prev => ({
        ...prev,
        lpa: value,
        basic: components.basic,
        da: components.da,
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
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <h2 className="text-xl md:text-2xl font-bold mb-6">Enter Appraisal Letter Details</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="form-group">
              <label className="block mb-1 text-sm font-medium text-gray-700">Employee Name</label>
              <input
                type="text"
                name="employeeName"
                value={formData.employeeName}
                onChange={handleInputChange}
                className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div className="form-group">
              <label className="block mb-1 text-sm font-medium text-gray-700">Date</label>
              <input
                type="date"
                name="date"
                value={formData.date}
                onChange={handleInputChange}
                className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div className="md:col-span-2">
              <h3 className="text-lg font-semibold mb-4">Salary Components</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="form-group">
                  <label className="block mb-1 text-sm font-medium text-gray-700">Annual CTC (in Lakhs)</label>
                  <input
                    type="number"
                    name="lpa"
                    value={formData.lpa}
                    onChange={handleInputChange}
                    className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter CTC in Lakhs"
                    step="0.1"
                  />
                  {formData.salaryInWords && (
                    <p className="mt-2 text-sm text-gray-600">
                      {formData.salaryInWords}
                    </p>
                  )}
                </div>

                <div className="form-group">
                  <label className="block mb-1 text-sm font-medium text-gray-700">Dearness Allowance</label>
                  <input
                    type="text"
                    name="da"
                    value={formData.da}
                    onChange={handleInputChange}
                    className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div className="form-group">
                  <label className="block mb-1 text-sm font-medium text-gray-700">Conveyance Allowance</label>
                  <input
                    type="text"
                    name="conveyance"
                    value={formData.conveyance}
                    onChange={handleInputChange}
                    className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div className="form-group">
                  <label className="block mb-1 text-sm font-medium text-gray-700">Other Allowance</label>
                  <input
                    type="text"
                    name="other"
                    value={formData.other}
                    onChange={handleInputChange}
                    className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div className="form-group">
                  <label className="block mb-1 text-sm font-medium text-gray-700">Total Annual</label>
                  <input
                    type="text"
                    name="total"
                    value={formData.total}
                    onChange={handleInputChange}
                    className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 flex justify-end">
            <button
              onClick={handleDownload}
              className="download-btn flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 active:bg-blue-800 shadow-sm hover:shadow transition-all duration-200"
            >
              <Download size={18} className="mr-2" />
              <span>Generate Appraisal Letter</span>
            </button>
          </div>
        </div>

        {/* Hidden PDF Content */}
        <div ref={containerRef} style={{ position: 'absolute', left: '-9999px', top: '-9999px' }}>
          <div className="appraisal-letter-page">
            <div className="letter-header">
              <div>
                <h1 className="company-name">{formData.companyName}</h1>
                <p className="company-address">
                  {formData.companyAddressLine1}, {formData.companyAddressLine2}, {formData.companyAddressLine3}
                  <br />
                  {formData.companyCity} - {formData.companyPincode}, ({formData.companyState}) INDIA.
                </p>
              </div>
              <img src="/myclan-logo.png" alt="Myclan" className="company-logo" />
            </div>

            <h2 className="letter-title">Employee Appraisal Letter</h2>

            <div className="letter-content">
              <p className="date">Date - {formData.date}</p>
              <p className="employee-name">{formData.employeeName},</p>
              <p className="subject">Sub: Appraisal Letter</p>

              <p className="appreciation-text">
                We would like to express our appreciation and commendation for all the passion 
                and commitment you have been exhibiting in your existing role. In recognition 
                of your contribution, it is our pleasure to award you a gross increase in your 
                salary with effect from August 2024.
              </p>

              <p>Your revised salary structure as follows:</p>

              <div className="compensation-table">
                <div className="table-header">
                  <span>Compensation Heads</span>
                  <span>Compensation (In INR)</span>
                </div>
                <div className="table-row">
                  <span>Basic</span>
                  <span>{formData.basic}</span>
                </div>
                <div className="table-row">
                  <span>Dearness Allowance</span>
                  <span>{formData.da}</span>
                </div>
                <div className="table-row">
                  <span>Conveyance Allowance</span>
                  <span>{formData.conveyance}</span>
                </div>
                <div className="table-row">
                  <span>Other allowance</span>
                  <span>{formData.other}</span>
                </div>
                <div className="table-row total">
                  <span>Annual Total</span>
                  <span>{formData.total}</span>
                </div>
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

              <div className="footer">
                <p className="contact-title">Contact Us:</p>
                <p>Email – {formData.companyEmail} Contact No – {formData.companyPhone}</p>
                <p>Website – {formData.companyWebsite}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AppraisalLetter;

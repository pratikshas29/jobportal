import React, { useState,useEffect } from "react";
import { Download, ArrowLeft } from "lucide-react";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { Link } from "react-router-dom";
import "../assets/styles/OfferLetter.css";
import "../assets/styles/ButtonStyles.css";
import { db } from "./firebase";
import { collection, addDoc, getDocs, updateDoc, deleteDoc, doc } from "firebase/firestore";
function OfferLetter() {
  const containerRef = React.useRef(null);
  const [companies, setCompanies] = useState([]);
  const [formData, setFormData] = useState({
    employeeName: "",
    joiningDate: "",
    designation: "",
 
    lpa: "",
    salary: "",
    salaryInWords: "",
    basic: "",
    hra: "",
    da: "",
    conveyance: "",
    medical: "",
    lta: "",
    special: "",
    gross: ""
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
    return convert(num);
  };
  useEffect(() => {
    fetchCompanies();
  }, []);

  const fetchCompanies = async () => {

    const querySnapshot = await getDocs(collection(db, "companies"));
    const companyList = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    
    console.log(companyList);
    setCompanies(companyList);
  };
  // Calculate salary components based on LPA
  const calculateSalaryComponents = (lpa) => {
    const annualSalary = parseFloat(lpa) * 100000;
    
    // Standard Indian salary structure percentages
    const basic = Math.round(annualSalary * 0.35); // 35% of CTC
    const hra = Math.round(basic * 0.4); // 40% of Basic
    const da = Math.round(annualSalary * 0.30); // 30% of CTC
    const conveyance = Math.round(annualSalary * 0.20); // 20% of CTC
    const medical = 15000; // Standard medical allowance
    const lta = Math.round(basic * 0.1); // 10% of Basic
    const special = annualSalary - (basic + hra + da + conveyance + medical + lta);
    
    // Monthly calculations
    const monthlyBasic = Math.round(basic / 12);
    const monthlyHRA = Math.round(hra / 12);
    const monthlyDA = Math.round(da / 12);
    const monthlyConveyance = Math.round(conveyance / 12);
    const monthlyMedical = Math.round(medical / 12);
    const monthlyLTA = Math.round(lta / 12);
    const monthlySpecial = Math.round(special / 12);
    const monthlyGross = monthlyBasic + monthlyHRA + monthlyDA + monthlyConveyance + monthlyMedical + monthlyLTA + monthlySpecial;

    return {
      basic: monthlyBasic.toFixed(2),
      hra: monthlyHRA.toFixed(2),
      da: monthlyDA.toFixed(2),
      conveyance: monthlyConveyance.toFixed(2),
      medical: monthlyMedical.toFixed(2),
      lta: monthlyLTA.toFixed(2),
      special: monthlySpecial.toFixed(2),
      gross: monthlyGross.toFixed(2),
      annualSalary: annualSalary.toFixed(2),
      salaryInWords: numberToWords(annualSalary)
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
          companyLogo:selectedCompany.logo,
          // Add any additional fields as needed
        });
      }
    }
    if (name === 'lpa') {
      const components = calculateSalaryComponents(value);
      setFormData(prev => ({
        ...prev,
        lpa: value,
        basic: components.basic,
        hra: components.hra,
        da: components.da,
        conveyance: components.conveyance,
        medical: components.medical,
        lta: components.lta,
        special: components.special,
        gross: components.gross,
        annualSalary: components.annualSalary,
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
    const elements = containerRef.current.getElementsByClassName("offer-letter-page");

    for (let i = 0; i < elements.length; i++) {
      const canvas = await html2canvas(elements[i]);
      const imgData = canvas.toDataURL("image/jpeg", 1.0);

      if (i > 0) {
        pdf.addPage();
      }

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      pdf.addImage(imgData, "JPEG", 0, 0, pdfWidth, pdfHeight);
    }

    pdf.save("offer-letter.pdf");
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
      <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
        <h2 className="text-2xl md:text-3xl font-semibold text-gray-800 mb-8">Enter Offer Letter Details</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Employee Name */}
          <div className="form-group">
            <label className="block mb-2 text-sm font-medium text-gray-700">Employee Name</label>
            <input
              type="text"
              name="employeeName"
              value={formData.employeeName}
              onChange={handleInputChange}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter employe name"
            />
          </div>

          {/* Joining Date */}
          <div className="form-group">
            <label className="block mb-2 text-sm font-medium text-gray-700">Joining Date</label>
            <input
              type="date"
              name="joiningDate"
              value={formData.joiningDate}
              onChange={handleInputChange}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Designation */}
          <div className="form-group">
            <label className="block mb-2 text-sm font-medium text-gray-700">Designation</label>
            <input
              type="text"
              name="designation"
              value={formData.designation}
              onChange={handleInputChange}
              placeholder="Enter Designation"
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Total Salary (in Lakhs) */}
          <div className="form-group">
            <label className="block mb-2 text-sm font-medium text-gray-700">Total Salary (in Lakhs)</label>
            <input
              type="number"
              name="lpa"
              value={formData.lpa}
              onChange={handleInputChange}
              placeholder="Enter CTC in Lakhs"
              step="0.1"
              min="0"
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Company Selection */}
          <div className="form-group">
            <label className="block mb-2 text-sm font-medium text-gray-700">Company</label>
            <select
              name="company"
              onChange={handleInputChange}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              {companies.map((company) => (
                <option key={company.id} value={company.name}>
                  {company.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Download Button */}
        <div className="mt-8 flex justify-end">
          <button
            onClick={handleDownload}
            className="download-btn flex items-center px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 active:bg-blue-800 shadow-lg transform hover:scale-105 transition-all duration-200 text-sm md:text-base"
          >
            <Download size={20} className="mr-2" />
            <span>Generate Offer Letter</span>
          </button>
        </div>
      </div>
    </div>

        {/* Hidden PDF Content */}
        <div ref={containerRef} style={{ position: 'absolute', left: '-9999px', top: '-9999px' }}>
          {/* Page 1 - Terms and Conditions */}
          <div className="offer-letter-page bg-white" style={{ width: '210mm', minHeight: '297mm', padding: '20mm' }}>
            <div className="letter-header">
              <div className="company-info">
                <h1 className="company-name">
                {formData.companyName}
                </h1>
                <p className="company-address">
                  {/* Office No -309, 3<sup>rd</sup> Floor, Navale Icon, Near Navale
                  Bridge, Narhe
                  <br />
                  Pune - 411041, (Maharashtra) INDIA. */}
                     {formData.companyAddressLine1}
                </p>
              </div>
              <img
              src={formData.companyLogo} alt={formData.companyName}
                className="company-logo"
              />
            </div>

            <h2 className="letter-title">Joining Cum Appointment Letter</h2>

            <div className="letter-content">
              <p className="date">Date: {new Date().toLocaleDateString()}</p>
              <p className="employee-name">Dear {formData.employeeName || '[Employee Name]'},</p>

              <p className="letter-paragraph">
                We pleased in appointing you as {formData.designation} in MyClan
                Services Pvt. Ltd., at our Office in our organization, effective
                from {formData.joiningDate} on the following terms and conditions:
              </p>

              <p className="letter-paragraph">
                You will be placed in the appropriate responsibility level of
                the Company, and will be entitled to compensation (salary and
                other applicable benefits) as discussed. Compensation will be
                governed by the rules of the Company on the subject, as
                applicable and/or amended hereafter.
              </p>

              <p className="letter-paragraph">
                You will be eligible to the benefits of the Company's Leave
                Rules on your confirmation in the Company's Service as
                discussed. During the period of your employment you will devote
                full time to the work of the Company. Further, you will not take
                any other employment or assignment or any office honorary or for
                any consideration in cash or in kind or otherwise, without the
                prior written permission of the Company.
              </p>

              <p className="letter-paragraph">
                You will be on a Probation period for the Three months based on
                your performance. During the probation period your services can
                be terminated with seven day's notice on either side and without
                any reasons whatsoever. If your services are found satisfactory
                during the probation period, you will be confirmed in the
                present position and thereafter your services can be terminated
                on one month's notice on either side. The period of probation
                can be extended at the discretion of the Management and you will
                continue to be on probation till an order of confirmation has
                been issued in writing.
              </p>

              <p className="letter-paragraph">
                Your salary package will be Rs. {formData.salary}/- ({formData.salaryInWords} Rupees Only) and no other allowance is
                provided in that period.
              </p>
            </div>

            <div className="contact-section">
              <p className="font-semibold">Contact Us:</p>
              <p>Email – {formData.companyEmail} Contact No – {formData.companyPhone}</p>
              <p>Website – {formData.companyWebsite}</p>
            </div>
          </div>

          {/* Page 2 - Additional Terms */}
          <div className="offer-letter-page bg-white" style={{ width: '210mm', minHeight: '297mm', padding: '20mm' }}>
            <div className="letter-header">
              <div className="company-info">
                <h1 className="company-name">
                {formData.companyName}
                </h1>
                <p className="company-address">
                {formData.companyAddressLine1}
                </p>
              </div>
              <img
              src={formData.companyLogo} alt={formData.companyName}
                className="company-logo"
              />
            </div>

            <h2 className="letter-title">Additional Terms</h2>

            <div className="letter-content">
              <p className="letter-paragraph">
                You will not disclose any of our technical or other important
                information which might come into your possession during the
                continuation of your service with us shall not be disclosed,
                divulged or made public by you even thereafter.
              </p>

              <p className="letter-paragraph">
                If you conceive any new or advanced method of improving designs
                / processes / formulae / systems, etc. related to the interest /
                business of the Company, such developments will be fully
                communicated to the company and will be and will remain the sole
                right/property of the Company. Also includes Technology,
                Software packages license, Company's policy, Company's platform
                & Trade Mark and Company's human assets profile. Also the usage
                of personal USB Drives and CD-ROM's are strictly prohibited.
              </p>

              <p className="letter-paragraph">
                If any declaration given or information furnished by you, to the
                Company proves to be false, or if you are found to have
                willfully suppressed any material information, in such cases you
                will be liable to removal from services without any notice.
              </p>

              <p className="letter-paragraph">
                During the probationary period and any extension thereof, your
                service may be terminated on either side by giving one week's
                notice or salary in lieu thereof. Upon confirmation the services
                can be terminated from either side by giving one-month (30 Days)
                notice or salary in lieu thereof. Upon termination of employment
                you will immediately hand over to the Company all
                correspondence, specifications, formulae, books, documents,
                market data, cost data, drawings, affects or records belonging
                to the Company or relating to its business and shall not retain
                or make copies of these items.
              </p>

              <p className="letter-paragraph">
                If at any time in our opinion which is final in this matter you
                are found non-performer or guilty of fraud, dishonest,
                disobedience, disorderly behavior, negligence, indiscipline,
                absence from duty without permission or any other conduct
                considered by us deterrent to our interest or of violation of
                one or more terms of this letter, your services may be
                terminated without notice.
              </p>

              <p className="letter-paragraph">
                You will be responsible for safekeeping and return in good
                condition and order of all Company property which may be in your
                use, custody or charge.
              </p>

              <p className="letter-paragraph">
                All legal matters are subject to Pune Jurisdiction.
              </p>

              <p className="letter-paragraph">
                Please confirm your acceptance of the appointment on the above
                terms and conditions by signing and returning this letter to us
                for our records.
              </p>

              <p className="letter-paragraph">
                Enclosure:- Attaching herewith your salary annexure.
              </p>
            </div>

            <div className="contact-section">
              <p className="font-semibold">Contact Us:</p>
              <p>Email – {formData.companyEmail} Contact No – {formData.companyPhone}</p>
              <p>Website – {formData.companyWebsite}</p>
            </div>
          </div>

          {/* Page 3 - Salary Structure */}
          <div className="offer-letter-page bg-white" style={{ width: '210mm', minHeight: '297mm', padding: '20mm' }}>
            <div className="letter-header">
              <div className="company-info">
              <h1 className="company-name">
                {formData.companyName}
                </h1>
                <p className="company-address">
                {formData.companyAddressLine1}
                </p>
              </div>
              <img
              src={formData.companyLogo} alt={formData.companyName}
                className="company-logo"
              />
            </div>

            <h2 className="letter-title">Salary Annexure</h2>

            <div className="letter-content">
              <p className="date">Date: {new Date().toLocaleDateString()}</p>
              <p className="employee-name">Dear {formData.employeeName || '[Employee Name]'},</p>

              <p className="letter-paragraph">
                As per mentioned in the offer letter, here with attaching your
                salary structure which includes your Basic salary and other
                benefits received by you from the company.
              </p>

              <p className="font-semibold mt-4">
                Your salary structure as follows:
              </p>

              <div className="mt-4 salary-table">
                <h4 className="font-semibold mb-2">Compensation Heads</h4>
                <div className="space-y-2">
                  <div className="compensation-row">
                    <span>Basic</span>
                    <span>: {formData.basic}</span>
                  </div>
                  <div className="compensation-row">
                    <span>HRA</span>
                    <span>: {formData.hra}</span>
                  </div>
                  <div className="compensation-row">
                    <span>Dearness Allowance</span>
                    <span>: {formData.da}</span>
                  </div>
                  <div className="compensation-row">
                    <span>Conveyance Allowance</span>
                    <span>: {formData.conveyance}</span>
                  </div>
                  <div className="compensation-row">
                    <span>Medical Allowance</span>
                    <span>: {formData.medical}</span>
                  </div>
                  <div className="compensation-row">
                    <span>LTA</span>
                    <span>: {formData.lta}</span>
                  </div>
                  <div className="compensation-row">
                    <span>Special Allowance</span>
                    <span>: {formData.special}</span>
                  </div>
                  <div className="compensation-row font-bold mt-4 pt-2 border-t">
                    <span>Annual Total</span>
                    <span>: {formData.salary}</span>
                  </div>
                </div>
              </div>

              <div className="mt-8">
                <p className="letter-paragraph">
                  We expect you to keep up your performance in the years to come
                  and grow with the organization and we will expect you will get
                  happy and enthusiastic environment for work at the
                  organization.
                </p>
                <p className="mt-2">Wish you all the best.</p>
              </div>

              <div className="mt-8">
                <p>Signature</p>
                <p className="mt-4">HR Manager</p>
              </div>
            </div>

            <div className="contact-section">
              <p className="font-semibold">Contact Us:</p>
              <p>Email – {formData.companyEmail} Contact No – {formData.companyPhone}</p>
              <p>Website – {formData.companyWebsite}</p>
            </div>
          </div>
        </div>
      </div>
      
  
  );
}

export default OfferLetter;

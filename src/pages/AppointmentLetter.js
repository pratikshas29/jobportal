import React, { useState,useEffect } from "react";
import { Download } from "lucide-react";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { Link } from "react-router-dom";
import "../assets/styles/AppointmentLetter.css";
import "../assets/styles/ButtonStyles.css";
import { ArrowLeft } from "lucide-react";
import { db } from "./firebase";
import { collection, addDoc, getDocs, updateDoc, deleteDoc, doc } from "firebase/firestore";
function AppointmentLetter() {
  const containerRef = React.useRef(null);
  const [companies, setCompanies] = useState([]);
  const [formData, setFormData] = useState({
    employeeName: " ",
    address: " ",
    joiningDate: " ",
    designation: " ",
    department: " ",
    reportingAuthority: " ",
    ctc: "",
    ctcInWords: "",
    location: " ",
    bankName: "",
    accountNumber: "",
    ifscCode: "",
    branchName: "",
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
  // Function to convert number to words
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
    if (name === 'ctc') {
      // Convert CTC to words when CTC changes
      const ctcValue = parseFloat(value);
      const ctcInWords = !isNaN(ctcValue) ? 
        `Rupees ${numberToWords(ctcValue * 100000)} Only` : '';
      
      setFormData(prev => ({
        ...prev,
        [name]: value,
        ctcInWords: ctcInWords
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
    const elements = containerRef.current.getElementsByClassName("appointment-letter-page");

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

    pdf.save("appointment-letter.pdf");
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

      <div className="max-w-[500px] mx-auto">
        {/* Form Section */}
        <div className="bg-white rounded-lg shadow-sm p-8 mb-8">
          <h2 className="text-2xl font-bold mb-6">Enter Details</h2>
          
          <div className="grid grid-cols-1 gap-4">
            <div className="form-group">
              <label className="block mb-1">Employee Name</label>
              <input
                type="text"
                name="employeeName"
                value={formData.employeeName}
                onChange={handleInputChange}
                className="w-full p-2 border rounded"
              />
            </div>

            <div className="form-group">
              <label className="block mb-1">Address</label>
              <textarea
                name="address"
                value={formData.address}
                onChange={handleInputChange}
                className="w-full p-2 border rounded"
                rows="3"
              />
            </div>

            <div className="form-group">
              <label className="block mb-1">Joining Date</label>
              <input
                type="date"
                name="joiningDate"
                value={formData.joiningDate}
                onChange={handleInputChange}
                className="w-full p-2 border rounded"
              />
            </div>

            <div className="form-group">
              <label className="block mb-1">Designation</label>
              <input
                type="text"
                name="designation"
                value={formData.designation}
                onChange={handleInputChange}
                className="w-full p-2 border rounded"
              />
            </div>

            <div className="form-group">
              <label className="block mb-1">Department</label>
              <input
                type="text"
                name="department"
                value={formData.department}
                onChange={handleInputChange}
                className="w-full p-2 border rounded"
              />
            </div>

            <div className="form-group">
              <label className="block mb-1">Reporting Authority</label>
              <input
                type="text"
                name="reportingAuthority"
                value={formData.reportingAuthority}
                onChange={handleInputChange}
                className="w-full p-2 border rounded"
              />
            </div>

            <div className="form-group">
              <label className="block mb-1 text-sm font-medium text-gray-700">
                CTC (in Lakhs per annum)
              </label>
              <input
                type="number"
                name="ctc"
                value={formData.ctc}
                onChange={handleInputChange}
                className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter CTC in Lakhs"
                step="0.1"
              />
              {formData.ctcInWords && (
                <p className="mt-2 text-sm text-gray-600">
                  {formData.ctcInWords}
                </p>
              )}
            </div>

            <div className="form-group">
              <label className="block mb-1">Location</label>
              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleInputChange}
                className="w-full p-2 border rounded"
              />
            </div>

            {/* Bank Details Section */}
            <div className="form-group">
              <label className="block mb-1">Bank Name</label>
              <input
                type="text"
                name="bankName"
                value={formData.bankName}
                onChange={handleInputChange}
                className="w-full p-2 border rounded"
              />
            </div>

            <div className="form-group">
              <label className="block mb-1">Account Number</label>
              <input
                type="text"
                name="accountNumber"
                value={formData.accountNumber}
                onChange={handleInputChange}
                className="w-full p-2 border rounded"
              />
            </div>

            <div className="form-group">
              <label className="block mb-1">IFSC Code</label>
              <input
                type="text"
                name="ifscCode"
                value={formData.ifscCode}
                onChange={handleInputChange}
                className="w-full p-2 border rounded"
              />
            </div>

            <div className="form-group">
              <label className="block mb-1">Branch Name</label>
              <input
                type="text"
                name="branchName"
                value={formData.branchName}
                onChange={handleInputChange}
                className="w-full p-2 border rounded"
              />
            </div>
            <div className="form-group">
                  <label className="block mb-1 text-sm font-medium text-gray-700">Company</label>
                  <select
                    name="company"
                    onChange={handleInputChange}
                    className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    {companies.map((company) => (
                      <option key={company.id} value={company.name}>
                        {company.name}
                      </option>
                    ))}
                  </select>
                </div>
          </div>

          <div className="mt-6 flex justify-end">
            <button
              onClick={handleDownload}
              className="download-btn"
            >
              <Download size={20} />
              <span>Download PDF</span>
            </button>
          </div>
        </div>

        {/* Preview Section */}
          {/* Hidden Preview Section */}
          <div ref={containerRef} style={{ position: 'absolute', left: '-9999px', top: '-9999px' }}>
          <div className="appointment-letter-page bg-white" style={{ width: '210mm', minHeight: '297mm', padding: '20mm' }}>
            <div className="letter-header">
              <div className="logo-section">
                <img src={formData.companyLogo} alt={formData.companyName}  className="company-logo" />
                <p className="brilliance">{formData.companyName}</p>
              </div>
              <p className="letter-date">17 December 2020</p>
            </div>

            <div className="letter-content">
              <p className="to-section">To,</p>

              <div className="address-section">
                <p>{formData.employeeName || '[Employee Name]'}</p>
                <p>{formData.address || '[Address]'}</p>
              </div>

              <p className="subject-line">Subject: Appointment Letter</p>

              <p>Dear {formData.employeeName || '[Employee Name]'},</p>

              <p>
                We welcome you to Nitor Infotech Pvt.Ltd. Your appointment is
                subject to the Terms & Conditions contained in this letter &
                Company policy.
              </p>

              <p className="appointment-heading">Appointment</p>

              <div className="appointment-table">
                <table>
                  <tbody>
                    <tr>
                      <td>Date of joining as recorded</td>
                      <td>{formData.joiningDate || '[Date]'}</td>
                    </tr>
                    <tr>
                      <td>Designation</td>
                      <td>{formData.designation || '[Designation]'}</td>
                    </tr>
                    <tr>
                      <td>Department</td>
                      <td>{formData.department || '[Department]'}</td>
                    </tr>
                    <tr>
                      <td>Reporting Authority</td>
                      <td>{formData.reportingAuthority || '[Authority]'}</td>
                    </tr>
                    <tr>
                      <td>CTC (break up as per Annexure)</td>
                      <td>
                        {formData.ctc ? `Total Annual CTC Rs. ${formData.ctc} Lakhs` : '[CTC Amount]'}<br/>
                        {formData.ctcInWords ? `(${formData.ctcInWords})` : '[Amount in Words]'}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <p className="benefits-heading">Salary & Benefits</p>

              <ol className="benefits-list">
                <li>
                  Compensation structure may be altered/ modified at any time
                  providing appropriate communication to employees. Salary,
                  allowances and all other payments/ benefits shall be
                  governed by the Company's rules as well as statutory
                  provisions in force and subject to deduction of appropriate
                  taxes at source.
                </li>
                <li>
                  Your salary, benefits, level / grade fitment, level of
                  earnings within your group is absolutely personal to you,
                  which is purely based on your academic background,
                  experience, potential and competence as assessed by the
                  Company. As such comparison between individual employees is
                  invidious. Such information is strictly confidential to you.
                </li>
              </ol>

              <div className="footer-section">
                <p>{formData.companyName}</p>
                <p>
                {formData.companyAddressLine1}
                </p>
                <p>{formData.companyWebsite}</p>
              </div>
            </div>
          </div>

          {/* Page 2 */}
          <div className="appointment-letter-page">
            <div className="letter-header">
              <div className="logo-section">
                <img
                src={formData.companyLogo} alt={formData.companyName} 
                  className="company-logo"
                />
                <p className="brilliance">{formData.companyName}</p>
              </div>
            </div>

            <div className="letter-content">
              <ol className="benefits-list" start="3">
                <li>
                  Your performance may be reviewed by the Company at least
                  once annually. Any increase or decrease in your Remuneration
                  is at the absolute discretion of Company and will depend on
                  factors such as your performance and the performance of
                  Company's business as a whole. The Company is under no
                  obligation to increase the Remuneration as a result of any
                  review.
                </li>
                <li>
                  Your Remuneration will be paid monthly directly into a bank
                  account nominated by you and acceptable to Company.
                </li>
                <li>
                  You will pay levies such as PF/ESI (if applicable) and other
                  contributions as required under appropriate legislation.
                  These levies and expenses may be made by way of salary
                  sacrifice (before tax) or after tax. Company will make
                  mandatory payment as required under appropriate legislation.
                  Company contribution to PF and Gratuity is a part of your
                  CTC.
                </li>
                <li>
                  Company will reimburse you for all reasonable traveling,
                  accommodation and general expenses incurred by you in
                  connection with carrying out Company's business. Payment
                  will only be made against valid receipts.
                </li>
              </ol>

              <p className="section-heading">Posting</p>
              <ol className="posting-list" start="7">
                <li>
                  At present, you would be posted at Pune, however, you may be
                  required to travel to or work at other locations, including
                  interstate or overseas. Your services are liable to be
                  transferred to any other division, activity, geographical
                  location, branch, Group Company, sister concern or
                  subsidiary of this Company or any of its associates,
                  clients, customers, presently in existence & operational or
                  will be operational in future. In such an eventuality, you
                  will be governed by the terms and conditions and the
                  remunerations as applicable to such new place to which your
                  services may be temporarily or permanently transferred and
                  that you will, therefore, not be entitled to any additional
                  compensation.
                </li>
              </ol>

              <p className="section-heading">Responsibility</p>
              <ol className="responsibility-list" start="8">
                <li>
                  During your employment with the Company, you will be
                  governed by Service Conditions mentioned in this letter &
                  other rules, code of conduct and General terms and
                  conditions framed by the Management from time to time, which
                  shall be applicable to you, and also by such legal
                  provisions as may be applicable.
                </li>
                <li>
                  You are expected to give to the Company your best efforts,
                  attention and commitment. You are explicitly advised to
                  refrain from any such activity, whether for monetary or any
                  other considerations, as may become, in our opinion, a
                  hindrance to your performance.
                </li>
                <li>
                  You are, by virtue of employment with this Company, required
                  to do all the work allied, ancillary related or incidental
                  to the main job. Similarly, you may be asked to do any job
                  within your competence depending upon the exigencies of the
                  situation.
                </li>
              </ol>
            </div>
          </div>

          {/* Page 3 */}
          <div className="appointment-letter-page">
            <div className="letter-header">
              <div className="logo-section">
                <img
                src={formData.companyLogo} alt={formData.companyName} 
                  className="company-logo"
                />
                <p className="brilliance">{formData.companyName} </p>
              </div>
            </div>

            <div className="letter-content">
              <ol className="responsibility-list" start="11">
                <li>
                  Your appointment is a full time assignment and you will not
                  at any time engage, directly or indirectly, in any paid
                  occupation or business outside the Company without obtaining
                  prior written consent of the Company.
                </li>
              </ol>

              <p className="section-heading">Training</p>
              <ol className="training-list" start="12">
                <li>
                  In furtherance of your employment in this Company and for
                  increasing & honing your skills, you may be required to be
                  trained technically or otherwise. This may require the
                  Company to provide training either in-house or send you for
                  training outside the Company in India or abroad.
                </li>
                <li>
                  You shall always endeavor to upgrade your skills, knowledge,
                  and expertise from time to time and shall not refuse to
                  undergo any training undertaken by Company or as directed by
                  the Company for improvement or up gradation of skills,
                  services performance or such other things necessary for the
                  growth of the Company.
                </li>
              </ol>

              <p className="section-heading">Termination / Separation</p>
              <ol className="termination-list" start="14">
                <li>
                  The contract of employment can be terminated by either party
                  by giving a notice of three months in writing of its
                  intention to do so or by tendering a sum equivalent to three
                  month's salary in lieu thereof, and further the Company may
                  at its sole discretion, waive the whole or part of the
                  notice period without any compensation. However, Company
                  also reserves the right not to relieve you till the
                  completion of job/assignment in hand. However company shall
                  be within its right to terminate this contract in case of
                  any acts of commission or omission that are detrimental to
                  the business or reputation of the company such as but not
                  limited to bribery, forgery, fraud, pilferage, theft,
                  abandoning project, misuse of drugs and alcohol on company
                  premises, any act which constitutes an offence involving
                  moral turpitude etc.. The company also reserves the right to
                  terminate his or her services with immediate effect in case
                  of unsatisfactory or below standard performance on your
                  part, without giving you any notice or pay in lieu thereof.
                  In this case you will be paid up to the date of termination
                  only.
                </li>
                <li>
                  In the event of breach of any of the terms & conditions of
                  your appointment order and / or General Terms and conditions
                  & rules, the Company reserves the right to claim liquidated
                  Damages from you, apart from other damages. Company also
                  reserves the right to terminate your services without giving
                  notice.
                </li>
                <li>
                  Your appointment and employment will be subject to your
                  being and remaining medically fit. If deemed necessary you
                  may get medically examined by the Medical Officer appointed
                  by the Company.
                </li>
              </ol>
            </div>
          </div>

          {/* Page 4 */}
          <div className="appointment-letter-page">
            <div className="letter-header">
              <div className="logo-section">
                <img
                               src={formData.companyLogo} alt={formData.companyName} 

                  className="company-logo"
                />
                <p className="brilliance">{formData.companyName} </p>
              </div>
            </div>

            <div className="letter-content">
              <ol className="termination-list" start="16">
                <li>
                  Company as and when required by the Company. If at any
                  stage, you are found to be unfit by the Medical Officer for
                  the job currently being done by you, then you are liable to
                  be terminated on medical grounds.
                </li>
                <li>
                  You will be solely responsible for the Company property
                  assigned to you to discharge your duties. Loss of any of
                  items would be recovered from you, as the Company may deem
                  appropriate. On ceasing to be in the employment of this
                  Company for any reason, you will promptly settle all the
                  accounts including the return of all Company properties,
                  tools, equipment's, documents, etc. without making or
                  retaining any copies.
                </li>
                <li>
                  Upon leaving the employment you shall return to the company
                  forthwith all the property, documents, drawings, designs,
                  programs, data in whatever form, hardware, software, records
                  etc belonging to the Company or its associates, subsidiary,
                  clients, or customers.
                </li>
                <li>
                  Applicable notice period subject to the maximum period
                  specified will be determined by the Reporting Manager and HR
                  based on business requirements and approved by the
                  Management. Any balance of notice period beyond the last
                  working date so agreed upon will be automatically waived.
                </li>
                <li>
                  Where the employee does not serve the requisite notice
                  period as per the last working day agreed upon by the
                  Manager and HR, such exit would be treated as unclear exit.
                  The employee does not have the right to terminate with
                  sooner effect by tendering equivalent salary in lieu of any
                  part of the applicable notice period.
                </li>
                <li>
                  The age of retirement is 60 years for all employees on the
                  permanent rolls of the company. Employees shall continue on
                  the Company's rolls till and including the last day of the
                  financial year in which they complete the age of 60 years.
                  Continued service with the Company beyond the age of 60 will
                  be solely as per the discretion of the management.
                </li>
              </ol>

              <p className="section-heading">Confidentiality</p>
              <ol className="confidentiality-list" start="22">
                <li>
                  Without the prior consent of the Company in writing during
                  the continuance of your employment, you shall not publish or
                  cause to be published any publication or contribute any
                  article or review to any newspaper, magazine or other
                  publication whether for remuneration or otherwise on a
                  subject in any way related to or concerning the Company's
                  business, services, products, strategies or policies.
                </li>
                <li>
                  If, during the period of employment with us, you achieve any
                  inventions, process improvement, operational improvement or
                  other processes/methods, likely to result in more efficient
                  operation of any of the activities of the Company, the
                  Company shall be entitled to use, utilize and exploit such
                  improvement, and such rights shall stand to be automatically
                  assigned to the Company.
                </li>
              </ol>
            </div>
          </div>

          {/* Page 5 */}
          <div className="appointment-letter-page">
            <div className="letter-header">
              <div className="logo-section">
                <img
                                 src={formData.companyLogo} alt={formData.companyName} 

                  className="company-logo"
                />
                <p className="brilliance">{formData.companyName}</p>
              </div>
            </div>

            <div className="letter-content">
              <ol className="confidentiality-list" start="24">
                <li>
                  You have to treat the affairs of the Company and its
                  customers of which you may be cognizant, particularly the
                  products, quotations, specifications, trade secrets,
                  systems, procedures or other policy information as strictly
                  confidential.
                </li>
                <li>
                  During the period of your employment with the Company, you
                  shall at all times observe secrecy in respect of any
                  information of whatever nature be it technical, trade,
                  business data, information of systems, designs, drawings
                  existing programs or programs developed, Software,
                  inventions made by you or any other employee of the Company,
                  which you may acquire or which may come to your knowledge
                  while during the currency of your employment. You shall not
                  disclose the same to anyone except a Company's Officer
                  authorized in that behalf. Even after you cease to be in our
                  employment you shall not disclose the same to anyone.
                </li>
                <li>
                  You shall assign the right and interest in any invention,
                  improvement design or software development drawing made by
                  you solely or in a group while in employment, and you shall
                  perform all such acts, execute documents without any
                  consideration for securing the Patent design copyright or
                  trade mark or such or any other right or create title in the
                  name of the Company, in relation to any product, service
                  arising out of invention, improvement or software
                  development as stated above.
                </li>
              </ol>

              <p className="section-heading">General</p>
              <ol className="general-list" start="27">
                <li>
                  The Company is engaged in the business of providing various
                  professional and other High End Services to its customers
                  and clients. It is just and necessary to keep the operations
                  in tandem with the needs of the customers and clients.
                </li>
                <li>
                  Office working days are Monday to Friday. Office hours are
                  generally 9:30 am to 6:30 pm however, your working hours may
                  be flexible. You may be required to work in shifts as per
                  the exigencies of work. The management shall have the sole
                  right to change your working hours as per the exigencies of
                  work, similarly your weekly off's shall also be flexible and
                  shall be subject to change as per the exigencies of work.
                </li>
                <li>
                  There shall be exceptions and flexibility with respect to
                  working hours, leaves & holidays for accommodating needs of
                  internal/external customers and clients& project needs and
                  for those who are interfacing with the customers and
                  clients.
                </li>
              </ol>
            </div>
          </div>

          {/* Page 6 */}
          <div className="appointment-letter-page">
            <div className="letter-header">
              <div className="logo-section">
                <img
                                 src={formData.companyLogo} alt={formData.companyName} 

                  className="company-logo"
                />
                <p className="brilliance">{formData.companyName}</p>
              </div>
            </div>

            <div className="letter-content">
              <ol className="general-list" start="30">
                <li>
                  Leave – You will be entitled to leave in accordance with the
                  Leave Policy framed by the Company from time to time.
                </li>
                <li>
                  All the correspondence, communications by the company herein
                  after shall be made either personally at work place or at
                  the residential address given by you, at any one of the
                  places at the discretion and convenience of the company.
                  Should you change your residence, you shall forthwith inform
                  the address in writing to the company.
                </li>
                <li>
                  Any dispute between yourself and the Company concerning or
                  relating to or arising out of your appointment/employment
                  shall be subject to the jurisdiction of Pune.
                </li>
              </ol>

              <div className="closing-section">
                <p>
                  We take pleasure in welcoming you to our Organisation and
                  looking forward to a long association with the Company.
                </p>

                <p>
                  You are requested to affix your signature on the duplicate
                  of this letter confirming your acceptance of the terms and
                  conditions of employment and return it to Human Resources.
                </p>

                <p>
                  Please meet Human Resources Head regarding your joining
                  documentation and other formalities to be carried out on the
                  date of joining.
                </p>

                <p>Thanking You,</p>

                <p className="company-name">{formData.companyName}</p>

                <div className="signature-section">
                  <p className="signatory-name">Rohini Wagh</p>
                  <p className="signatory-designation">
                    VP & Head – People Function
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Page 7 - Salary Structure */}
          <div className="appointment-letter-page">
            <div className="letter-header">
              <div className="logo-section">
                <img
                              src={formData.companyLogo} alt={formData.companyName} 

                  className="company-logo"
                />
                <p className="brilliance">{formData.companyName}</p>
              </div>
            </div>

            <div className="letter-content">
              <div className="salary-table">
                <table>
                  <thead>
                    <tr>
                      <th>EARNINGS</th>
                      <th>MONTHLY</th>
                      <th>YEARLY</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>Basic</td>
                      <td>33,333.33</td>
                      <td>4,00,000.00</td>
                    </tr>
                    <tr>
                      <td>Education Allowance</td>
                      <td>200.00</td>
                      <td>2,400.00</td>
                    </tr>
                    <tr>
                      <td>HRA</td>
                      <td>13,333.33</td>
                      <td>1,60,000.00</td>
                    </tr>
                    <tr>
                      <td>Monthly Reimbursement</td>
                      <td>3,000.00</td>
                      <td>36,000.00</td>
                    </tr>
                    <tr>
                      <td>Travel Reimbursement (LTA)</td>
                      <td>2,776.67</td>
                      <td>33,320.00</td>
                    </tr>
                    <tr>
                      <td>Statutory Bonus</td>
                      <td>1,749.25</td>
                      <td>20,991.00</td>
                    </tr>
                    <tr>
                      <td>Special Allowance</td>
                      <td>8,698.08</td>
                      <td>1,04,377.00</td>
                    </tr>
                    <tr className="sub-total">
                      <td>SUB TOTAL</td>
                      <td>63,090.66</td>
                      <td>7,57,088.00</td>
                    </tr>
                    <tr>
                      <td>Employee Gratuity contribution</td>
                      <td>1,390.00</td>
                      <td>16,680.00</td>
                    </tr>
                    <tr>
                      <td>Monthly Wellness</td>
                      <td>100.00</td>
                      <td>1,200.00</td>
                    </tr>
                    <tr>
                      <td>Health Insurance</td>
                      <td>286.00</td>
                      <td>3,432.00</td>
                    </tr>
                    <tr>
                      <td>PF - Employer</td>
                      <td>1,800.00</td>
                      <td>21,600.00</td>
                    </tr>
                    <tr className="total">
                      <td>TOTAL</td>
                      <td>66,666.67</td>
                      <td>8,00,000.00</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div className="salary-notes">
                <p className="notes-heading">Notes :</p>
                <ul>
                  <li>All payments are subject to appropriate taxation.</li>
                  <li>
                    All payments would be as per company's rules and
                    regulations and administrative procedure.
                  </li>
                  <li>
                    The salary structure is liable for modification from time
                    to time.
                  </li>
                  <li>
                    Company's contribution to PF is calculated considering
                    basic pay as Rs. 15000 or 12% of basic whichever is less.
                  </li>
                  <li>
                    Company will consider payments done towards LTA as taxable
                    income till the time you submit relevant bills to claim
                    income tax benefit. In case employee wants to claim LTA
                    tax benefit under LTA, the relevant must be submitted
                    latest by 31st December.
                  </li>
                </ul>
              </div>

              <div className="signature-section">
                <p className="signatory-name">Rohini Wagh</p>
                <p className="signatory-designation">
                  VP & Head – People Function
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    </div>
  );
}

export default AppointmentLetter;

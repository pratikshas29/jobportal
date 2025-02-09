import React from "react";
import html2pdf from "html2pdf.js";
import logo from "../assets/logo.PNG";
import "./PaySlip.css";

const PaySlip = ({ employeeData, companyDetails }) => {
  // Function to format the date into Month Year format
  const formatMonthYear = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleString("default", { month: "long", year: "numeric" });
  };

  // Function to format amount with 2 decimal places
  const formatAmount = (amount) => {
    if (!amount) return "0.00";
    // Remove any existing commas first
    const cleanAmount = amount.toString().replace(/,/g, "");
    // Convert to float and fix to 2 decimal places
    return parseFloat(cleanAmount).toFixed(2);
  };

  const handleDownloadPDF = async () => {
    const element = document.createElement("div");

    element.innerHTML = `
            <div class="payslip-container">
                <div class="header">
                    <div class="logo">
                        <img src="${logo}" alt="Company Logo" class="company-logo" />
                    </div>
                    <div class="company-details">
                        <h2>${companyDetails.name || ""}</h2>
                        <p>${companyDetails.address || ""}</p>
                        <p>${companyDetails.city || ""}</p>
                        <p>Phone: ${companyDetails.phone || ""}</p>
                        <p>${companyDetails.website || ""}</p>
                    </div>
                </div>

                <h3 class="payslip-title">PAY SLIP FOR THE MONTH OF ${formatMonthYear(
                  companyDetails.doj
                ).toUpperCase()}</h3>

                <div class="employee-info">
                    <div class="emp-detail">
                        <span class="label">EMP Code</span>
                        <span class="value">${
                          companyDetails.empCode || ""
                        }</span>
                    </div>
                    <div class="emp-detail">
                        <span class="label">Name</span>
                        <span class="value">${
                          companyDetails.employeeName || ""
                        }</span>
                    </div>
                    <div class="emp-detail">
                        <span class="label">Designation</span>
                        <span class="value">${
                          companyDetails.designation || ""
                        }</span>
                    </div>
                    <div class="emp-detail">
                        <span class="label">PAN</span>
                        <span class="value">${companyDetails.pan || ""}</span>
                    </div>
                    <div class="emp-detail">
                        <span class="label">Location</span>
                        <span class="value">${
                          companyDetails.location || ""
                        }</span>
                    </div>
                    <div class="emp-detail">
                        <span class="label">DOJ</span>
                        <span class="value">${companyDetails.doj || ""}</span>
                    </div>
                    <div class="emp-detail">
                        <span class="label">Department</span>
                        <span class="value">${
                          companyDetails.department || ""
                        }</span>
                    </div>
                    <div class="emp-detail">
                        <span class="label">Payable Days</span>
                        <span class="value">${
                          companyDetails.payableDays || ""
                        }</span>
                    </div>
                </div>

                <div class="salary-details">
                    <div class="salary-header">
                        <div class="salary-item">Earnings</div>
                        <div class="salary-item">Amount (₹)</div>
                        <div class="salary-item">Deductions</div>
                        <div class="salary-item">Amount (₹)</div>
                    </div>
                    <div class="salary-row">
                        <div class="salary-item">Basic</div>
                        <div class="salary-item">${formatAmount(
                          companyDetails.basic
                        )}</div>
                        <div class="salary-item">Professional Tax</div>
                        <div class="salary-item">${formatAmount(
                          companyDetails.professionalTax
                        )}</div>
                    </div>
                    <div class="salary-row">
                        <div class="salary-item">DA</div>
                        <div class="salary-item">${formatAmount(
                          companyDetails.da
                        )}</div>
                        <div class="salary-item">Other Deductions</div>
                        <div class="salary-item">${formatAmount(
                          companyDetails.otherDeductions
                        )}</div>
                    </div>
                    <div class="salary-row">
                        <div class="salary-item">Conveyance Allowance</div>
                        <div class="salary-item">${formatAmount(
                          companyDetails.conveyanceAllowance
                        )}</div>
                        <div class="salary-item"></div>
                        <div class="salary-item"></div>
                    </div>
                    <div class="salary-row">
                        <div class="salary-item">Other Allowance</div>
                        <div class="salary-item">${formatAmount(
                          companyDetails.otherAllowance
                        )}</div>
                        <div class="salary-item"></div>
                        <div class="salary-item"></div>
                    </div>
                    <div class="salary-row">
                        <div class="salary-item">Medical Allowance</div>
                        <div class="salary-item">${formatAmount(
                          companyDetails.medicalAllowance
                        )}</div>
                        <div class="salary-item"></div>
                        <div class="salary-item"></div>
                    </div>
                    <div class="salary-row">
                        <div class="salary-item">CCA</div>
                        <div class="salary-item">${formatAmount(
                          companyDetails.cca
                        )}</div>
                        <div class="salary-item"></div>
                        <div class="salary-item"></div>
                    </div>
                    <div class="salary-row total">
                        <div class="salary-item">Gross Salary</div>
                        <div class="salary-item">${formatAmount(
                          companyDetails.gross
                        )}</div>
                        <div class="salary-item">Total Deductions</div>
                        <div class="salary-item">${formatAmount(
                          companyDetails.totalDeductions
                        )}</div>
                    </div>
                    <div class="salary-row net-pay">
                        <div class="salary-item">Net Pay</div>
                        <div class="salary-item">${formatAmount(
                          companyDetails.netPay
                        )}</div>
                        <div class="salary-item"></div>
                        <div class="salary-item"></div>
                    </div>
                </div>

                
            </div>
        `;

    const opt = {
      margin: 10,
      filename: `PaySlip_${
        companyDetails.employeeName || "Employee"
      }_${formatMonthYear(companyDetails.doj)}.pdf`,
      image: { type: "jpeg", quality: 0.98 },
      html2canvas: {
        scale: 2,
        useCORS: true,
        logging: true,
        allowTaint: true,
        imageTimeout: 2000,
        backgroundColor: "#ffffff",
      },
      jsPDF: {
        unit: "mm",
        format: "a4",
        orientation: "portrait",
        compress: true,
      },
    };

    try {
      await html2pdf().set(opt).from(element).save();
    } catch (error) {
      console.error("Error generating PDF:", error);
    }
  };

  return (
    <div>
      <button className="download-button" onClick={handleDownloadPDF}>
        Download PDF
      </button>
    </div>
  );
};

export default PaySlip;

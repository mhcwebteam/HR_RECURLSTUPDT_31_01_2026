


import React, { useState } from "react";
import logo from "../../src/asset/imagesmy.png";
import { X } from "lucide-react";
import { API_BASE_URL, API_BASE_URLss } from "../Config/Config";
import { jsPDF } from 'jspdf';
import axiosInstance from "../Config/axiosConfig";
import Swal from "sweetalert2";

const MediDocUpload = ({ rowData, onClose, refreshTable }) => {
  const [data, setData] = useState({
    pdfBlob: null,
    fileName: ""
  });

  
  const [isPreviewLoading, setIsPreviewLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [showPreview, setShowPreview] = useState(false);

  const [Token, useToken] = useState(() => {
    const userToken = JSON.parse(localStorage.getItem('userInfo'));
    return userToken ? userToken : null;
  });

const toBase64 = (url) => {
  return new Promise((resolve) => {
    if (!url) return resolve(null);

    // Use plain fetch — NO axios, NO auth headers, NO crossOrigin
    fetch(url, {
      method: 'GET',
      headers: {}, // ✅ empty headers — no Authorization added
      referrerPolicy: 'no-referrer',
    })
      .then(res => res.blob())
      .then(blob => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result);
        reader.onerror = () => resolve(null);
        reader.readAsDataURL(blob);
      })
      .catch(() => {
        // Final fallback — Image tag without crossOrigin
        const img = new Image();
        img.onload = () => {
          try {
            const canvas = document.createElement('canvas');
            canvas.width = img.width;
            canvas.height = img.height;
            canvas.getContext('2d').drawImage(img, 0, 0);
            resolve(canvas.toDataURL('image/jpeg'));
          } catch {
            resolve(null);
          }
        };
        img.onerror = () => resolve(null);
        img.src = url;
      });
  });
};


const toBase64ViaAxios = async (url) => {
  if (!url) return null;
  try {
    const response = await axiosInstance.get(url, {
      responseType: 'blob',
    });
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result);
      reader.onerror = () => resolve(null);
      reader.readAsDataURL(response.data);
    });
  } catch (err) {
    console.error('Image fetch failed:', err);
    return null;
  }
};

  const cleanUrl = (url) => {
    if (!url) return null;
    return url.replace(/([^:]\/)\/+/g, "$1").trim();
  };

  const getImageUrl = (type, childIndex = null) => {
    const base = API_BASE_URLss;
    const build = (path) => {
      if (!path) return null;
      return `${base}/${path}`.replace(/([^:]\/)\/+/g, "$1");
    };

    if (type === 'employee') {
      return build(rowData?.fullData?.documents?.photo);
    }
    if (type === 'spouse') {
      return build(rowData?.fullData?.documents?.spouse_document);
    }
    if (type === 'child') {
      const children = getOrderedChildren();
      if (children?.[childIndex]) {
        const child = children[childIndex];
        return build(rowData?.fullData?.documents?.[child.docKey]);
      }
    }
    return null;
  };

  const formatDate = (date) => {
    if (!date) return '';
    const d = new Date(date);
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const getOrderedChildren = () => {
    const daughters = rowData?.fullData?.daughters_data || [];
    const sons = rowData?.fullData?.sons_data || [];
    const allChildren = [];
    
    daughters.forEach((daughter, index) => {
      allChildren.push({
        ...daughter,
        type: 'daughter',
        order: index + 1,
        docKey: `daughter_${index + 1}_document`
      });
    });
    
    sons.forEach((son, index) => {
      allChildren.push({
        ...son,
        type: 'son',
        order: index + 1,
        docKey: `son_${index + 1}_document`
      });
    });
    
    return allChildren;
  };

  const getChildDocument = (childIndex) => {
    const children = getOrderedChildren();
    if (children[childIndex]) {
      const child = children[childIndex];
      const docPath = rowData?.fullData?.documents?.[child.docKey];
      return docPath ? `${API_BASE_URLss}/${docPath}` : null;
    }
    return null;
  };

  const getChildName = (childIndex) => {
    const children = getOrderedChildren();
    return children[childIndex]?.name || '-';
  };

  const getChildDOB = (childIndex) => {
    const children = getOrderedChildren();
    return children[childIndex]?.dob || null;
  };

  // Generate PDF and return blob (without downloading)
  const generatePDFBlob = async () => {
    try {
      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });
      
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      let yPos = 10;

      const addBorder = (x, y, width, height) => {
        doc.setDrawColor(0, 0, 0);
        doc.setLineWidth(0.1);
        doc.rect(x, y, width, height);
      };

  const addImageToPDF = async (imageUrl, x, y, w, h) => {
  if (!imageUrl) return false;
  try {
    const imgData = await toBase64ViaAxios(imageUrl); // ✅ changed
    if (imgData) {
      doc.addImage(imgData, "JPEG", x, y, w, h);
      return true;
    }
    return false;
  } catch (err) {
    console.error("Image error:", err);
    return false;
  }
};

      // HEADER SECTION
      addBorder(10, yPos, pageWidth - 20, 45);
      addBorder(10, yPos, 30, 45);
      
      try {
        const logoImg = await fetch(logo).then(res => res.blob());
        const reader = new FileReader();
        const logoDataUrl = await new Promise((resolve) => {
          reader.onloadend = () => resolve(reader.result);
          reader.readAsDataURL(logoImg);
        });
        doc.addImage(logoDataUrl, 'PNG', 12, yPos + 2, 26, 40);
      } catch (err) {
        doc.setFontSize(8);
        doc.setTextColor(0, 0, 0);
        doc.text('LOGO', 20, yPos + 22, { align: 'center' });
      }
      
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.text('MY HOME CONSTRUCTIONS PVT. LTD.', 45, yPos + 8);
      doc.setFontSize(9);
      doc.text('Mediclaim Data Enrolment Form', 45, yPos + 16);
      doc.setFontSize(7);
      doc.setFont('helvetica', 'normal');
      doc.text('DIR No. ASDPL-HR-F31', pageWidth - 35, yPos + 5);
      doc.text(`Date: ${new Date().toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}`, pageWidth - 35, yPos + 10);
      doc.text('Rev. Version 02', pageWidth - 35, yPos + 15);
      
      yPos += 50;

      // EMPLOYEE INFORMATION TABLE
      const employeeData = [
        { sno: 1, label: "Name of the employee", value: rowData?.employee_name?.toUpperCase() || rowData?.fullData?.name?.toUpperCase() || '-' },
        { sno: 2, label: "Emp. ID", value: rowData?.child_caseid || rowData?.CHILD_CASEID || '-' },
        { sno: 3, label: "Designation", value: rowData?.DESIG?.toUpperCase() || '-' },
        { sno: 4, label: "Department", value: rowData?.fullData?.DEPT?.toUpperCase() || '-' },
        { sno: 5, label: "Location", value: rowData?.fullData?.PLANT?.toUpperCase() || '-' },
        { sno: 6, label: "Gender", value: rowData?.fullData?.GENDER?.toUpperCase() || '-' }
      ];
      
      addBorder(10, yPos, pageWidth - 20, employeeData.length * 7);
      
      employeeData.forEach((item, idx) => {
        const rowY = yPos + (idx * 7);
        doc.setDrawColor(200, 200, 200);
        doc.rect(10, rowY, 10, 7);
        doc.setFontSize(8);
        doc.setFont('helvetica', 'normal');
        doc.text(item.sno.toString(), 15, rowY + 5);
        doc.rect(20, rowY, 70, 7);
        doc.text(item.label, 25, rowY + 5);
        doc.rect(90, rowY, pageWidth - 100, 7);
        doc.setFont('helvetica', 'bold');
        doc.text(item.value, 95, rowY + 5);
      });
      
      yPos += employeeData.length * 7 + 5;

      // FAMILY DETAILS SECTION
      const children = getOrderedChildren();
      doc.setFontSize(9);
      doc.setFont('helvetica', 'bold');
      doc.text('FAMILY DETAILS', 15, yPos);
      yPos += 5;
      
      const colWidths = [40, 40, 60, 60];
      const headers = ['Emp Name', 'Spouse Name', 'Child 1', 'Child 2'];
      let currentX = 10;
      
      headers.forEach((header, idx) => {
        doc.rect(currentX, yPos, colWidths[idx], 8);
        doc.setFontSize(7);
        doc.setFont('helvetica', 'bold');
        doc.text(header, currentX + 2, yPos + 5);
        currentX += colWidths[idx];
      });
      
      yPos += 8;
      
      currentX = 10;
      const nameValues = [
        rowData?.fullData?.name || rowData?.employee_name || '-',
        rowData?.fullData?.spouse_name || '-',
        children[0]?.name ? `${children[0].name} (${children[0].type === 'daughter' ? 'Daughter' : 'Son'})` : '-',
        children[1]?.name ? `${children[1].name} (${children[1].type === 'daughter' ? 'Daughter' : 'Son'})` : '-'
      ];
      
      nameValues.forEach((value, idx) => {
        doc.rect(currentX, yPos, colWidths[idx], 6);
        doc.setFontSize(7);
        doc.setFont('helvetica', 'normal');
        const textLines = doc.splitTextToSize(value, colWidths[idx] - 4);
        doc.text(textLines, currentX + 2, yPos + 4);
        currentX += colWidths[idx];
      });
      
      yPos += 6;
      
      const imagePositions = [
        { type: 'employee', index: null, x: 10, y: yPos, width: colWidths[0], height: 25, label: 'Employee Photo' },
        { type: 'spouse', index: null, x: 50, y: yPos, width: colWidths[1], height: 25, label: 'Spouse Photo' },
        { type: 'child', index: 0, x: 90, y: yPos, width: colWidths[2], height: 25, label: 'Child 1 Photo' },
        { type: 'child', index: 1, x: 150, y: yPos, width: colWidths[3], height: 25, label: 'Child 2 Photo' }
      ];
      
      for (const imgPos of imagePositions) {
        doc.rect(imgPos.x, imgPos.y, imgPos.width, imgPos.height);
        const imageUrl = getImageUrl(imgPos.type, imgPos.index);
        const imageAdded = await addImageToPDF(imageUrl, imgPos.x + 2, imgPos.y + 2, imgPos.width - 4, imgPos.height - 4);
        
        if (!imageAdded) {
          doc.setFontSize(6);
          doc.setFont('helvetica', 'italic');
          doc.text(imgPos.label, imgPos.x + 2, imgPos.y + 4);
          doc.text('(No Image Available)', imgPos.x + 2, imgPos.y + 12);
        }
      }
      
      yPos += 25;
      
      currentX = 10;
      const dobValues = [
        rowData?.fullData?.dob ? formatDate(rowData.fullData.dob) : '-',
        rowData?.fullData?.spouse_dob ? formatDate(rowData.fullData.spouse_dob) : '-',
        getChildDOB(0) ? formatDate(getChildDOB(0)) : '-',
        getChildDOB(1) ? formatDate(getChildDOB(1)) : '-'
      ];
      
      dobValues.forEach((value, idx) => {
        doc.rect(currentX, yPos, colWidths[idx], 7);
        doc.setFontSize(7);
        doc.setFont('helvetica', 'bold');
        doc.text('DOB:', currentX + 2, yPos + 4);
        doc.setFont('helvetica', 'normal');
        doc.text(value, currentX + 10, yPos + 4);
        currentX += colWidths[idx];
      });
      
      yPos += 12;
      
      doc.setFontSize(8);
      doc.setFont('helvetica', 'bold');
      doc.text('Instructions:', 15, yPos);
      yPos += 5;
      
      doc.setFontSize(7);
      doc.setFont('helvetica', 'normal');
      const instructions = [
        'A. Write the names in BLOCK LETTERS in the box.',
        'B. Date of birth should be in the (DD/MM/YYYY) format',
        'C. In case of un-married self only applicable'
      ];
      
      instructions.forEach(instruction => {
        doc.text(instruction, 15, yPos);
        yPos += 5;
      });
      
      yPos += 3;
      
      doc.setFontSize(8);
      doc.text('I hereby declare that the particulars stated above are true to best of my knowledge.', 15, yPos);
      yPos += 10;
      
      doc.setFontSize(7);
      doc.text('Employee Signature:', 15, yPos);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(0, 0, 255);
      doc.text(rowData?.employee_name || '_______________', 15, yPos + 5);
      doc.setTextColor(0, 0, 0);
      doc.setFont('helvetica', 'normal');
      doc.text('HR Dept.', pageWidth / 2 - 15, yPos + 2.5);
      
      const currentDate = new Date().toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
      doc.text('Date:', pageWidth - 45, yPos + 2.5);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(0, 0, 255);
      doc.text(currentDate, pageWidth - 35, yPos + 2.5);
      
      const footerY = pageHeight - 10;
      doc.setFontSize(6);
      doc.setTextColor(128, 128, 128);
      doc.setFont('helvetica', 'italic');
      doc.text('This is a computer-generated document. No signature is required.', pageWidth / 2, footerY, { align: 'center' });
      doc.text(`Generated on: ${new Date().toLocaleString()}`, pageWidth / 2, footerY - 4, { align: 'center' });
      
      return doc.output('blob');
    } catch (error) {
      console.error('Error generating PDF:', error);
      throw error;
    }
  };

  // Preview PDF - opens in new tab
  const handlePreviewPDF = async () => {
    setIsPreviewLoading(true);
    try {
      const pdfBlob = await generatePDFBlob();
      const fileName = `Mediclaim_Form_${rowData?.CHILD_CASEID || Date.now()}.pdf`;
      const url = URL.createObjectURL(pdfBlob);
      
      // Open in new tab for preview
      window.open(url, '_blank');
      
      // Store in state
      setData({
        pdfBlob: pdfBlob,
        fileName: fileName
      });
      
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error previewing PDF:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Failed to preview PDF: ' + error.message,
        confirmButtonColor: '#ef4444'
      });
    } finally {
      setIsPreviewLoading(false);
    }
  };

  // Download PDF
  const handleDownloadPDF = async () => {
    try {
      const pdfBlob = await generatePDFBlob();
      const fileName = `Mediclaim_Form_${rowData?.CHILD_CASEID || Date.now()}.pdf`;
      const url = URL.createObjectURL(pdfBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      setData({
        pdfBlob: pdfBlob,
        fileName: fileName
      });
    } catch (error) {
      console.error('Error downloading PDF:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Failed to download PDF: ' + error.message,
        confirmButtonColor: '#ef4444'
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Show confirmation dialog before submitting
    const confirmResult = await Swal.fire({
    title: 'Are you sure?',
    text: 'Do you want to verify and submit this form?',
    icon: 'question',
    showCancelButton: true,
    confirmButtonText: 'Yes, Submit',
    cancelButtonText: 'Cancel',
    confirmButtonColor: '#10b981',
    cancelButtonColor: '#6b7280',
    customClass: {
      container: 'swal2-container-custom'
    },
    didOpen: () => {
      // Set z-index after modal opens
      const swalContainer = document.querySelector('.swal2-container');
      if (swalContainer) {
        swalContainer.style.zIndex = '9999';
      }
    }
  });
  
  if (!confirmResult.isConfirmed) {
    return;
  }
    
    setIsSubmitting(true);
    
    try {
      let pdfBlob = data.pdfBlob;
      let fileName = data.fileName;
      
      // Generate PDF if not already generated
      if (!pdfBlob) {
        pdfBlob = await generatePDFBlob();
        fileName = `Mediclaim_Form_${rowData?.CHILD_CASEID || Date.now()}.pdf`;
      }
      
      const formData = new FormData();
      formData.append('CHILD_CASEID', rowData?.CHILD_CASEID);
      formData.append('onboarding_status', "verified");
      formData.append("mediclaim_form", pdfBlob, fileName);
          formData.append("onBoarding", 2);
              formData.append("MED_STATUS", "YES" || "");

      const response = await axiosInstance.post(
        `${API_BASE_URL}/on-board-Store`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${Token.token}`,
          },
        }
      );
      
      if (response.data.success) {
        await Swal.fire({
          icon: "success",
          title: "Success!",
          text: response?.data?.message || "Form submitted successfully",
          timer: 2000,
          showConfirmButton: false,
        });
        
        // Refresh the table if function provided
        if (refreshTable && typeof refreshTable === 'function') {
          await refreshTable();
        }
        
        // Clear form data and close modal
        setData({ pdfBlob: null, fileName: "" });
        setPreviewUrl(null);
        setShowPreview(false);
        
        // Close the modal after successful submission
        setTimeout(() => {
          onClose();
        }, 500);
      } else {
        throw new Error(response?.data?.message || "Submission failed");
      }
    } catch (error) {
      console.error("Upload error:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: error.response?.data?.message || error.message || "API request failed",
        confirmButtonColor: "#ef4444",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    // Clear all data before closing
    setData({ pdfBlob: null, fileName: "" });
    setPreviewUrl(null);
    setShowPreview(false);
    onClose();
  };

  const children = getOrderedChildren();

  return (
    <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50 p-4">
      <div className="bg-white w-full max-w-5xl font-serif rounded-lg shadow-xl overflow-y-auto max-h-[90vh] p-6">
        {/* Close button in top-right */}
        <div className="flex justify-end mb-2">
          <button
            onClick={handleClose}
            className="p-1 hover:bg-gray-100 rounded-full transition"
          >
            <X size={20} />
          </button>
        </div>

        {/* Header */}
        <div className="border border-gray-400">
          <div className="border-2 border-black mb-4 relative">
            <div className="flex justify-between items-start">
              <div className="flex items-stretch w-full">
                <div className="border-r-2 border-black px-3 py-2 flex items-center justify-center min-w-[80px]">
                  <img
                    src={logo}
                    alt="My Home Group"
                    className="w-18 h-18 object-contain"
                  />
                </div>
                <div className="flex-1 flex flex-col">
                  <div className="border-b border-black px-3 py-1.5 text-center">
                    <p className="text-sm font-bold tracking-wide">
                      MY HOME CONSTRUCTIONS PVT. LTD.
                    </p>
                  </div>
                  <div className="flex">
                    <div className="flex-1 px-3 py-1.5 flex items-center justify-center border-r border-black">
                      <p className="text-xs font-bold tracking-wider">
                        Mediclaim Data Enrolment Form
                      </p>
                    </div>
                <div className="px-3 py-1.5 text-[10px] text-right min-w-[160px]">
  <p className="font-semibold">DIR No. ASDPL-HR-F31</p>
  <p>
    Date: 01st Nov, 2019
  </p>
  <p>Rev. Version 02</p>
</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <table className="w-full text-xs border-collapse">
            <tbody>
              {[
                {
                  label: "Name of the employee",
                  value: rowData?.employee_name?.toUpperCase() || rowData?.fullData?.name?.toUpperCase(),
                },
                {
                  label: "Emp. ID",
                  value: rowData?.child_caseid || rowData?.CHILD_CASEID,
                },
                {
                  label: "Designation",
                  value: rowData?.MANPOWER_DESG?.toUpperCase(),
                },
                {
                  label: "Department",
                  value: rowData?.fullData?.DEPT?.toUpperCase(),
                },
                {
                  label: "Location",
                  value: rowData?.fullData?.PLANT?.toUpperCase(),
                },
                {
                  label: "Gender",
                  value: rowData?.fullData?.GENDER?.toUpperCase(),
                },
              ].map((item, index) => (
                <tr key={index} className="border-t border-gray-400">
                  <td className="border-r border-gray-400 w-10 p-2 text-center">
                    {index + 1}
                  </td>
                  <td className="border-r border-gray-400 p-2 w-1/3">
                    {item.label}
                  </td>
                  <td className="p-2 font-semibold">
                    {item.value || "-"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Family Details Section */}
        <div className="border border-gray-400 mt-6">
          <table className="w-full text-xs border-collapse">
            <thead>
              <tr className="border-b border-gray-400">
                <th className="border-r border-gray-400 p-2">Emp Name</th>
                <th className="border-r border-gray-400 p-2">Spouse Name</th>
                <th className="border-r border-gray-400 p-2">Child 1</th>
                <th className="p-2">Child 2</th>
              </tr>
            </thead>
            <tbody>
              {/* Names Row */}
              <tr className="border-t border-gray-400">
                <td className="border-r border-gray-400 p-2">
                  {rowData?.fullData?.name || rowData?.employee_name || '-'}
                </td>
                <td className="border-r border-gray-400 p-2">
                  {rowData?.fullData?.spouse_name || '-'}
                </td>
                <td className="border-r border-gray-400 p-2">
                  {children[0]?.name ? `${children[0].name} (${children[0].type === 'daughter' ? 'Daughter' : 'Son'})` : '-'}
                </td>
                <td className="p-2">
                  {children[1]?.name ? `${children[1].name} (${children[1].type === 'daughter' ? 'Daughter' : 'Son'})` : '-'}
                </td>
               </tr>

              {/* Photos Row */}
              <tr className="border-t border-gray-400">
                <td className="border-r border-gray-400 p-6 text-center">
                  {rowData?.fullData?.documents?.photo ? (
                   <img
  src={`${API_BASE_URLss}/${rowData.fullData.documents.photo}`}
  alt="Employee Photo"
  referrerPolicy="no-referrer"
  crossOrigin={undefined}
  className="mx-auto object-cover"
  style={{ width: "120px", height: "120px" }}
/>
                  ) : (
                    <p className="text-gray-600 text-sm">
                      Paste Photo here <br />
                      (passport size / stamp size)
                    </p>
                  )}
                </td>
                <td className="border-r border-gray-400 p-6 text-center">
                  {rowData?.fullData?.documents?.spouse_document ? (
                    <img
                      src={`${API_BASE_URLss}/${rowData.fullData.documents.spouse_document}`}
                      alt="Spouse Photo"
                      className="mx-auto object-cover"
                      style={{ width: "120px", height: "120px" }}
                    />
                  ) : (
                    <p className="text-gray-600 text-sm">No Spouse Photo</p>
                  )}
                </td>
                <td className="border-r border-gray-400 p-6 text-center">
                  {getChildDocument(0) ? (
                    <img
                      src={getChildDocument(0)}
                      alt={`Child 1`}
                      className="mx-auto object-cover"
                      style={{ width: "120px", height: "120px" }}
                    />
                  ) : (
                    <p className="text-gray-600 text-sm">No Child Photo</p>
                  )}
                </td>
                <td className="p-6 text-center">
                  {getChildDocument(1) ? (
                    <img
                      src={getChildDocument(1)}
                      alt={`Child 2`}
                      className="mx-auto object-cover"
                      style={{ width: "120px", height: "120px" }}
                    />
                  ) : (
                    <p className="text-gray-600 text-sm">No Child Photo</p>
                  )}
                </td>
               </tr>

              {/* DOB Row */}
              <tr className="border-t border-gray-400">
                <td className="border-r border-gray-400 p-2">
                  <p className="text-xs mb-1">Date of Birth</p>
                  {rowData?.fullData?.dob ? (
                    <p className="text-sm">{formatDate(rowData.fullData.dob)}</p>
                  ) : (
                    <div className="bg-gray-200 h-6 rounded-full"></div>
                  )}
                </td>
                <td className="border-r border-gray-400 p-2">
                  <p className="text-xs mb-1">Date of Birth</p>
                  {rowData?.fullData?.spouse_dob ? (
                    <p className="text-sm">{formatDate(rowData.fullData.spouse_dob)}</p>
                  ) : (
                    <div className="bg-gray-200 h-6 rounded-full"></div>
                  )}
                </td>
                <td className="border-r border-gray-400 p-2">
                  <p className="text-xs mb-1">Date of Birth</p>
                  {getChildDOB(0) ? (
                    <p className="text-sm">{formatDate(getChildDOB(0))}</p>
                  ) : (
                    <div className="bg-gray-200 h-6 rounded-full"></div>
                  )}
                </td>
                <td className="p-2">
                  <p className="text-xs mb-1">Date of Birth</p>
                  {getChildDOB(1) ? (
                    <p className="text-sm">{formatDate(getChildDOB(1))}</p>
                  ) : (
                    <div className="bg-gray-200 h-6 rounded-full"></div>
                  )}
                </td>
               </tr>
            </tbody>
          </table>
        </div>

        {/* Instructions */}
        <div className="text-xs mt-6 space-y-1">
          <p>A. Write the names in BLOCK LETTERS in the box.</p>
          <p>B. Date of birth should be in the (DD/MM/YYYY) format</p>
          <p>C. In case of un-married self only applicable</p>
        </div>

        {/* Declaration */}
        <div className="text-xs mt-4">
          <p>
            I hereby declare that the particulars stated above are true to best
            of my knowledge.
          </p>
        </div>

        {/* Signature Section */}
        <div className="flex justify-between items-center mt-8 text-xs">
          <div>
            <div className="h-6 w-40 mb-1"></div>
            <span className="text-blue-700">{rowData?.employee_name}</span>
            <p>Employee Signature</p>
          </div>
          <div>
            <p className="font-semibold">HR Dept.</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="h-6 w-36"></div>
            <p className="text-xs">Date</p>
            <span className="text-blue-700 text-sm font-medium">
              {new Date().toLocaleDateString("en-IN", {
                day: "2-digit",
                month: "short",
                year: "numeric",
              })}
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end mt-6 gap-3 border-t pt-4">
          <button
            onClick={handleClose}
            className="px-5 py-2 rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-100 transition"
          >
            Close
          </button>
          
          {/* <button
            onClick={handleDownloadPDF}
            className="px-5 py-2 rounded-lg bg-gray-600 text-white hover:bg-gray-700 transition shadow"
          >
            Download PDF
          </button> */}

          {/* <button
            onClick={handlePreviewPDF}
            disabled={isPreviewLoading}
            className="px-5 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 transition shadow disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isPreviewLoading ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Loading...
              </span>
            ) : (
              'Preview PDF'
            )}
          </button> */}

          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="px-5 py-2 rounded-lg bg-green-600 text-white hover:bg-green-700 transition shadow disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Submitting...
              </span>
            ) : (
              'Verify & Submit'
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default MediDocUpload;






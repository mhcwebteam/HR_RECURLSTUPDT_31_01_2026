// TransferLetterModal.jsx
import React from 'react';
import { Modal, Box, Typography, Button } from '@mui/material';
import jsPDF from 'jspdf';

const TransferLetterModal = ({ open, onClose, employeeData }) => {



  const handleDownload = () => {
    // Create new PDF document
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });

    // Set font
    pdf.setFont('helvetica');
    
    // Helper function to add text with proper spacing
    const addLine = (text, y, fontSize = 12, isBold = false, align = 'left') => {
      pdf.setFontSize(fontSize);
      pdf.setFont('helvetica', isBold ? 'bold' : 'normal');
      
      if (align === 'center') {
        const textWidth = pdf.getStringUnitWidth(text) * fontSize / pdf.internal.scaleFactor;
        const pageWidth = pdf.internal.pageSize.getWidth();
        const x = (pageWidth - textWidth) / 2;
        pdf.text(text, x, y);
      } else if (align === 'right') {
        const textWidth = pdf.getStringUnitWidth(text) * fontSize / pdf.internal.scaleFactor;
        const pageWidth = pdf.internal.pageSize.getWidth();
        const x = pageWidth - textWidth - 20;
        pdf.text(text, x, y);
      } else {
        pdf.text(text, 20, y);
      }
    };

    let y = 30;

    // Employee Details
    addLine(`Mr. ${employeeData?.name || ''}`, y, 13, true);
    y += 8;
    addLine(`EMP ID: ${employeeData?.empId || ''}`, y, 11);
    y += 6;
    addLine(employeeData?.designation || '', y, 11);
    y += 6;
    addLine(employeeData?.fromProject || '', y, 11);
    y += 15;

    // Title
    addLine('TRANSFER LETTER', y, 16, true, 'center');
    y += 15;

    // Body
    addLine(`Dear Mr. ${employeeData?.name || ''},`, y, 12);
    y += 10;

    // Paragraph 1
    const para1 = `Due to exigency of the work, it has been decided to transfer your services from ${employeeData?.selectedToProject || ''} to ${employeeData?.toProject || ''} w.e.f. ${employeeData?.effectiveDate || ''}.`;
    const splitPara1 = pdf.splitTextToSize(para1, 170);
    pdf.setFontSize(12);
    pdf.text(splitPara1, 20, y);
    y += (splitPara1.length * 7);

    // Paragraph 2
    addLine('You are requested to report to the Project Head for further instructions.', y, 12);
    y += 8;

    // Paragraph 3
    addLine('All the other terms & Conditions remain unaltered.', y, 12);
    y += 8;

    // Paragraph 4
    addLine('We wish you all the best in your assignment.', y, 12);
    y += 15;

    // Signature
    addLine('For My Home Infrastructures Pvt Ltd,', y, 12);
    y += 15;

    addLine('Sudeep Kumar K', y, 13, true);
    y += 7;
    addLine('VP – HR', y, 11, false);

    // Save PDF
    pdf.save(`Transfer_Letter_${employeeData?.name?.replace(/\s/g, '_') || 'letter'}.pdf`);
  };

  return (
    <Modal open={open} onClose={onClose}>
      <Box
        sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '700px',
          height: '90vh',
          maxWidth: '95vw',
          bgcolor: '#ffffff',
          borderRadius: '12px',
          boxShadow: '0 25px 60px rgba(0,0,0,0.18)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden'
        }}
      >
        {/* Preview Content */}
        <Box sx={{ 
          p: 3,
          overflowY: 'auto',
          flex: 1,
          bgcolor: '#ffffff',
          '&::-webkit-scrollbar': { width: '5px' },
          '&::-webkit-scrollbar-thumb': { background: '#cbd5e1', borderRadius: '5px' }
        }}>
          
          <Box sx={{ mb: 3 }}>
            <Typography sx={{ fontSize: '15px', fontWeight: 600 }}>Mr. {employeeData?.name || ''}</Typography>
            <Typography sx={{ fontSize: '13px', color: '#4b5563' }}>EMP ID: {employeeData?.empId || ''}</Typography>
            <Typography sx={{ fontSize: '13px', color: '#4b5563' }}>{employeeData?.designation || ''}</Typography>
            <Typography sx={{ fontSize: '13px', color: '#4b5563' }}>{employeeData?.name || ''}</Typography>
          </Box>

          <Typography sx={{ fontSize: '18px', fontWeight: 700, textAlign: 'center', mb: 3 }}>
            TRANSFER LETTER
          </Typography>

          <Typography sx={{ fontSize: '13px', mb: 2 }}>Dear Mr. {employeeData?.name || ''},</Typography>
          
          <Typography sx={{ fontSize: '13px', mb: 2, lineHeight: 1.6 }}>
            Due to exigency of the work, it has been decided to transfer your services from{' '}
            <strong>{employeeData?.selectedToProject || ''}</strong> to <strong>{employeeData?.toProject || ''}</strong>{' '}
            w.e.f. <strong>{employeeData?.effectiveDate || ''}</strong>.
          </Typography>
          
          <Typography sx={{ fontSize: '13px', mb: 2, lineHeight: 1.6 }}>
            You are requested to report to the Project Head for further instructions.
          </Typography>
          
          <Typography sx={{ fontSize: '13px', mb: 2, lineHeight: 1.6 }}>
            All the other terms & Conditions remain unaltered.
          </Typography>
          
          <Typography sx={{ fontSize: '13px', mb: 4, lineHeight: 1.6 }}>
            We wish you all the best in your assignment.
          </Typography>

          <Box>
            <Typography sx={{ fontSize: '13px', fontWeight: 600, mb: 3 }}>
              For My Home Infrastructures Pvt Ltd,
            </Typography>
            
            <Box>
              <Typography sx={{ fontSize: '15px', fontWeight: 500 }}>Sudeep Kumar K</Typography>
              <Typography sx={{ fontSize: '13px', color: '#4b5563' }}>VP – HR</Typography>
            </Box>
          </Box>
        </Box>

        {/* Footer */}
        <Box sx={{ 
          p: 1, 
          display: 'flex', 
          justifyContent: 'flex-end', 
          gap: 1, 
          borderTop: '1px solid #e2e8f0',
          bgcolor: '#f8fafc'
        }}>
          <Button 
            variant="contained"
            onClick={handleDownload}
            sx={{ 
              bgcolor: '#1e40af', 
              '&:hover': { bgcolor: '#1e3a8a' },
              textTransform: 'none',
              px: 3
            }}
          >
            Download PDF
          </Button>
          <Button 
            variant="outlined"
            onClick={onClose}
            sx={{ 
              color: '#64748b', 
              borderColor: '#cbd5e1',
              textTransform: 'none',
              px: 3
            }}
          >
            Close
          </Button>
        </Box>
      </Box>
    </Modal>
  );
};

export default TransferLetterModal;
import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Grid,
  Container,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableRow,
  IconButton,
  FormControlLabel,
  Checkbox,
  Alert
} from '@mui/material';
import { Download, Print, Save, ArrowBack } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';


const AppointmentLetter = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    reference_no_App: '',
    DO_App: '',
    Name_of_the_candidate: '',
    Address_of_The_CandidateP1: '',
    Designation: '',
    DO_Offer: '',
    Location: '',
    Reporting_to: '',
    CTC_Lpa: '',
    CTC_in_words: '',
    Probation: '6 months',
    Company: 'Company Name'
  });

  // Sample data - in real app, this would come from API
  const sampleData = {
    reference_no_App: 'HR/APPT/2024/001',
    DO_App: '15-06-2024',
    Name_of_the_candidate: 'John Doe',
    Address_of_The_CandidateP1: '123 Main Street, Hyderabad, Telangana - 500032',
    Designation: 'Senior Software Engineer',
    DO_Offer: '01-06-2024',
    Location: 'Hyderabad',
    Reporting_to: 'Project Manager',
    CTC_Lpa: '15,00,000',
    CTC_in_words: 'Fifteen Lakhs Only',
    Probation: '6 months',
    Company: 'Tech Solutions Pvt. Ltd.'
  };

  const [ctcBreakup, setCtcBreakup] = useState([
    { component: 'Basic Salary', amount: '₹ 7,50,000', percentage: '50%' },
    { component: 'House Rent Allowance', amount: '₹ 3,75,000', percentage: '25%' },
    { component: 'Special Allowance', amount: '₹ 2,25,000', percentage: '15%' },
    { component: 'Medical Allowance', amount: '₹ 75,000', percentage: '5%' },
    { component: 'Provident Fund', amount: '₹ 75,000', percentage: '5%' },
    { component: 'Total CTC', amount: '₹ 15,00,000', percentage: '100%' }
  ]);

  const [accepted, setAccepted] = useState(false);
  const [editable, setEditable] = useState(false);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);

  useEffect(() => {
    // Load data from API or localStorage
    const savedData = localStorage.getItem('appointmentData');
    if (savedData) {
      setFormData(JSON.parse(savedData));
    } else {
      setFormData(sampleData);
    }
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSave = () => {
    localStorage.setItem('appointmentData', JSON.stringify(formData));
    alert('Appointment letter data saved successfully!');
  };

  const generatePDF = async () => {
    setIsGeneratingPDF(true);
    try {
      const input = document.getElementById('appointment-letter-content');
      const canvas = await html2canvas(input, {
        scale: 2,
        useCORS: true,
        logging: false
      });
      
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgWidth = 210;
      const pageHeight = 295;
      const imgHeight = canvas.height * imgWidth / canvas.width;
      let heightLeft = imgHeight;
      let position = 0;

      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      pdf.save(`Appointment_Letter_${formData.reference_no_App}.pdf`);
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Error generating PDF. Please try again.');
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleBack = () => {
    navigate(-1);
  };

  const formatText = (text) => {
    if (!text) return '';
    
    // Replace placeholders with actual data
    return text
      .replace(/«Reference_no_App»/g, formData.reference_no_App)
      .replace(/«DO_App\_»/g, formData.DO_App)
      .replace(/«Name_of_the_candidate»/g, formData.Name_of_the_candidate)
      .replace(/«Address_of_The_CandidateP1»/g, formData.Address_of_The_CandidateP1)
      .replace(/«Designation»/g, formData.Designation)
      .replace(/«DO_Offer»/g, formData.DO_Offer)
      .replace(/«Location»/g, formData.Location)
      .replace(/«Reporting_to»/g, formData.Reporting_to)
      .replace(/«CTC_Lpa»/g, formData.CTC_Lpa)
      .replace(/«CTC_in_words»/g, formData.CTC_in_words)
      .replace(/«Probation»/g, formData.Probation)
      .replace(/«Company»/g, formData.Company);
  };

  const appointmentContent = `
Ref No: ${formData.reference_no_App}

${formData.DO_App}

To,
${formData.Name_of_the_candidate},
${formData.Address_of_The_CandidateP1}

Letter of Appointment as ${formData.Designation}

Dear ${formData.Name_of_the_candidate},

With reference to our offer letter dated:- ${formData.DO_Offer}, we are pleased to appoint you as ${formData.Designation} at "${formData.Location}". Your employment will be governed by the following terms and conditions:

1. Date of Appointment: Your date of commencement on job is from ${formData.DO_App}.

2. Place of Posting & Transfer:
   Your initial place of posting will be at our ${formData.Location}. The Company reserves its right to transfer your services to any of its Sites / Subsidiaries / Associates / Offices at any place existing at present or which may be established in future. Upon such transfer, you will be governed by the rules and regulations of the Company as applicable to the place of work.

3. Reporting:
   You will report to ${formData.Reporting_to} or any other authority assigned by Management from time to time.

4. Remuneration:
   You will be paid ₹${formData.CTC_Lpa} (${formData.CTC_in_words}) per annum, which will be subject to the statutory deductions as per the Company's policy and Government norms. The detailed breakup of the emoluments of CTC stack up is provided in Annexure - A appended herewith to this Letter of Appointment.

5. Probation:
   You will be on probation for a period of ${formData.Probation} from the date of your joining and will continue to be so unless your services are confirmed in writing. The probation period can be curtailed or extended by the Company at its sole discretion without assigning any reasons whatsoever in nature.
   
   During the probationary period, your performance will be thoroughly assessed / evaluated by the Company and only on satisfactory completion of your initial or extended probationary period; you will be confirmed in writing in the regular services of the Company.

6. Reference Checks:
   Your employment is subject to the obtaining or receiving satisfactory responses from the reference checks conducted by the company.

7. General:
   a) You will be eligible for Leaves/Weekly Offs/National & Festival Holidays as may be announced by the Company from time to time.
   b) If at any stage, during the tenure of your services, it is found that the information furnished by you, regarding your age, educational qualifications, and previous experience is false; your services will be terminated without any notice.
   c) You shall inform the Company about the changes in personal information, if any, like change in residential address, acquiring higher qualifications etc. from time to time.
   d) During the period of employment with the Company, you will be in whole-time service of the Company and shall not engage or associate yourself directly / indirectly or in any other manner whatsoever, or work part time and shall not accept any emoluments, commission or service charges or honoraria whatsoever from any one. You shall devote your whole time, attention and skill to the best of your ability for the business of the Company only.

8. Company's Property:
   You will always maintain in good condition Company's property, which may be entrusted to you for official use during the course of your employment and shall return all such property to the Company prior to relinquishment of your charge, failing which the cost of the same will be recovered from you by the Company.

9. Service Rules and Procedure:
   You will be governed by the service rules, regulations and such other practices, systems, policies and procedures such as office working hours. Leaves, Standing Orders and Other Service Conditions of the place of business of the Company as applicable and in force from time to time of the Company as notified and in force. Further, you shall follow in true spirit and abide by the Standard Operating Procedures of the Company.

10. Confidential Information:
    During your period of employment, you have to maintain complete secrecy on projects which you will be working on, about clients and the Company. Any confidential information/ Data / Drawing (soft copy or hard copy) shall not be shared with anyone. Sharing of confidential information outside the Company will be considered as offense. Any breach of the above conditions will result in termination of employment with immediate effect and appropriate damages will be claimed accordingly.
    
    You will maintain strict confidential of the information which is provided or given to your access by the Employer during the term of your employment. Any breach of the same will result in breach of the terms of employment and the employer has right to take stringent action against you which might result taking appropriate criminal action. The Employer has a right to file a civil case as well as to recover the damages caused due to such breach by the Employee.
    
    The Employee agrees not to use or cause to be used for own benefit or for the benefit of any third parties or to disclose to any third party in any manner, directly or indirectly the information concerning to the internal organization or business structure of Employer or its customers, or the work assignments or capabilities of any officer or Employee, Proprietary Information, Customer's Confidential Information, trade secrets or any other Knowledge or information, except that which is public knowledge, or relating to the business of Employer or its customers at any time during or after Employee's terms of employment with Employer, without prior written consent of Employer.

11. Applicability of Company Policy:
    The Company shall be entitled to make policy declarations from time to time pertaining to matters like leave entitlement, maternity leave, employees' benefits, working hours, transfer policies, etc., and may alter the same from time to time at its sole discretion. All such policy decisions of the Company shall be binding on you and shall override this Letter of Appointment to that extent.

12. Substance Abuse:
    a. The Unauthorized Possession, distribution, consumption, dispensing or misuse of substances (banned drugs, tobacco, gutka, pan masala etc.) and alcoholic beverages, are in violation of Company regulations and is prohibited.
    b. Employees violating this policy will be subject to strict disciplinary action up to and including termination of employment.

13. Separation:
    Your services are terminable by 30 days' notice or 30 days' gross salary in lieu on either side during probation period or after confirmation.
    a) In case of notice by you intending the desire to leave the services, the Company shall have the option to accept the resignation with immediate effect and relieve you from the services with immediate effect, earlier than the expiry of the notice period given by you.
    b) No Notice is required for termination of services in case of any act of misconduct Incompetence, poor work performance, incapability, failure to carry out reasonable instructions, redundancy, insubordination, fraud, theft or breach of any of the terms of employment implied or expressed on your part.
    c) In case if you quit employment or remain absent from duty without any notice before the expiry of the Notice Period, in lieu of notice period you shall not only forfeit your salary by way of liquidated damages, company shall also be entitled to deduct an appropriate amount of liquidated damages from or against any money found due to you by the Company on any account whatsoever.
    d) No notice period shall be required in cases where a transfer is denied, the existing assignment is completed, the project scope is reduced or modified by the concerned department, the project is handed over upon completion, or in any other situation involving suspension of work or reduction in scope.
    e) Any Information furnished by you in your Bio- Data and at the time of interview is found incorrect in our enquiry in future, your candidature will automatically be cancelled and your service through this appointment will stand terminated.
    f) Incase your remain absent without prior permission or authorization or over stay leave for eight consecutive calendar days beyond the period of leave originally granted or subsequently extended it shall be deemed that you have vacated your employment in the company on your own accord without notice and the same shall be treated as abandonment of employment on your part.

14. Retirement:
    You will retire on attaining the age of superannuation, which shall be 60 years, unless you are otherwise disqualified due to continued ill health, physical or mental disability.

15. Full and Final Settlement:
    a) Handover of Charge: You shall properly hand over the all documents to your reporting manager or any other authority assigned by the company.
    b) Your dues, if any, shall be cleared after receiving the Company assets, No dues certificate from the Reporting Manager's and HOD's.

16. Jurisdiction:
    All disputes shall be subject to the exclusive jurisdiction of Courts at Ranga Reddy District, Telangana.

17. Acceptance of our offer:
    Please acknowledge the receipt of Appointment Order by signing and returning the duplicate copy.

We welcome you and wish all success in your assignment with us.

Thanking you,

For ${formData.Company}.

Sudeep Kumar K
Vice President - HR

I have read and understood all the above terms and conditions of the Appointment Letter and the same are acceptable to me.

Signature of the Employee
`;

  return (
    <Container maxWidth="lg" sx={{ py: 3 }}>
      {/* Header */}
  

      {/* Appointment Letter Content */}
      <Paper id="appointment-letter-content" elevation={3} sx={{ p: 4 }}>
        <Box sx={{ fontFamily: "'Times New Roman', serif", lineHeight: 1.6 }}>
          {/* Header with Reference Number */}
          <Typography variant="body1" sx={{ textAlign: 'right', mb: 2 }}>
            <strong>Ref No:</strong> {formData.reference_no_App}
          </Typography>
          
          <Typography variant="body1" sx={{ textAlign: 'right', mb: 4 }}>
            <strong>Date:</strong> {formData.DO_App}
          </Typography>

          {/* Recipient Address */}
          <Typography variant="body1" sx={{ mb: 1 }}>
            To,
          </Typography>
          <Typography variant="body1" sx={{ mb: 1 }}>
            {formData.Name_of_the_candidate},
          </Typography>
          <Typography variant="body1" sx={{ mb: 4 }}>
            {formData.Address_of_The_CandidateP1}
          </Typography>

          {/* Title */}
          <Typography variant="h5" sx={{ textAlign: 'center', mb: 3, fontWeight: 'bold' }}>
            LETTER OF APPOINTMENT AS {formData.Designation.toUpperCase()}
          </Typography>

          {/* Salutation */}
          <Typography variant="body1" sx={{ mb: 4 }}>
            Dear {formData.Name_of_the_candidate},
          </Typography>

          {/* Introduction */}
          <Typography variant="body1" sx={{ mb: 4 }}>
            With reference to our offer letter dated: {formData.DO_Offer}, we are pleased to appoint you as <strong>{formData.Designation}</strong> at <strong>"{formData.Location}"</strong>. Your employment will be governed by the following terms and conditions:
          </Typography>

          {/* Terms and Conditions */}
          <Box sx={{ mb: 4 }}>
            {[
              {
                title: "1. Date of Appointment:",
                content: `Your date of commencement on job is from ${formData.DO_App}.`
              },
              {
                title: "2. Place of Posting & Transfer:",
                content: `Your initial place of posting will be at our ${formData.Location}. The Company reserves its right to transfer your services to any of its Sites / Subsidiaries / Associates / Offices at any place existing at present or which may be established in future. Upon such transfer, you will be governed by the rules and regulations of the Company as applicable to the place of work.`
              },
              {
                title: "3. Reporting:",
                content: `You will report to ${formData.Reporting_to} or any other authority assigned by Management from time to time.`
              },
              {
                title: "4. Remuneration:",
                content: `You will be paid ₹${formData.CTC_Lpa} (${formData.CTC_in_words}) per annum, which will be subject to the statutory deductions as per the Company's policy and Government norms. The detailed breakup of the emoluments of CTC stack up is provided in Annexure - A appended herewith to this Letter of Appointment.`
              },
              {
                title: "5. Probation:",
                content: `You will be on probation for a period of ${formData.Probation} from the date of your joining and will continue to be so unless your services are confirmed in writing. The probation period can be curtailed or extended by the Company at its sole discretion without assigning any reasons whatsoever in nature.\n\nDuring the probationary period, your performance will be thoroughly assessed / evaluated by the Company and only on satisfactory completion of your initial or extended probationary period; you will be confirmed in writing in the regular services of the Company.`
              }
            ].map((item, index) => (
              <Box key={index} sx={{ mb: 2 }}>
                <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                  {item.title}
                </Typography>
                <Typography variant="body1" sx={{ whiteSpace: 'pre-line', pl: 2 }}>
                  {item.content}
                </Typography>
              </Box>
            ))}
          </Box>

       

          {/* Rest of the terms (simplified for display) */}
          <Typography variant="body1" sx={{ whiteSpace: 'pre-line', mb: 4 }}>
            {appointmentContent.split('\n').slice(28).join('\n')}
          </Typography>

          {/* Signature Section */}
          <Box sx={{ mt: 6 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 4 }}>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="body1" sx={{ mb: 1 }}>
                  For {formData.Company}
                </Typography>
                <Typography variant="body1" sx={{ mb: 4, fontWeight: 'bold' }}>
                  Sudeep Kumar K
                </Typography>
                <Typography variant="body1">
                  Vice President - HR
                </Typography>
              </Box>
              
              <Box sx={{ textAlign: 'center' }}>
                <Divider sx={{ width: 300, mb: 2 }} />
                <Typography variant="body1">
                  Signature of the Employee
                </Typography>
              </Box>
            </Box>

            {/* Acceptance Checkbox */}
            <Box sx={{ border: '1px solid #ddd', p: 2, borderRadius: 1, mb: 3 }}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={accepted}
                    onChange={(e) => setAccepted(e.target.checked)}
                    color="primary"
                  />
                }
                label={
                  <Typography variant="body1">
                    I have read and understood all the above terms and conditions of the Appointment Letter and the same are acceptable to me.
                  </Typography>
                }
              />
            </Box>

            {accepted && (
              <Alert severity="success" sx={{ mb: 2 }}>
                Appointment letter accepted on {new Date().toLocaleDateString()}
              </Alert>
            )}
          </Box>
        </Box>
      </Paper>

      {/* Footer Actions */}
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3, gap: 2 }}>
        <Button
          variant="contained"
          size="large"
          onClick={() => {
            if (accepted) {
              generatePDF();
            } else {
              alert('Please accept the terms and conditions first.');
            }
          }}
          disabled={!accepted || isGeneratingPDF}
        >
          {isGeneratingPDF ? 'Generating Final Copy...' : 'Generate Final Appointment Letter'}
        </Button>
      </Box>
    </Container>
  );
};

export default AppointmentLetter;
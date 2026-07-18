import React from 'react';
import { Page, Text, View, Document, StyleSheet, Image } from '@react-pdf/renderer';

import logo from '../../assets/logo-name.png';

const formatAdmissionDate = (value) => {
  if (!value) {
    const d = new Date();
    return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`;
  }
  if (typeof value === 'string') return value;
  if (typeof value?.toDate === 'function') {
    const d = value.toDate();
    return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`;
  }
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return '';
  return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`;
};

const getAdmissionDateObj = (value) => {
  if (!value) return new Date();
  if (typeof value?.toDate === 'function') return value.toDate();
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return new Date();
  return d;
};

const styles = StyleSheet.create({
  page: {
    padding: 25,          // reduced from 30 to save vertical space
    fontSize: 10,         // slightly smaller font
    fontFamily: 'Times-Roman',
    lineHeight: 1.4,
  },

  // Header with Logo
  header: {
    borderBottomWidth: 2,
    borderBottomColor: '#800020',
    paddingBottom: 8,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  logoSection: {
    width: '70%',
    paddingRight: 10,
  },
  logoImage: {
    width: '100%',
    height: 40,
    objectFit: 'contain',
    marginBottom: 4,
  },
  instituteName: {
    fontSize: 11,
    fontFamily: 'Times-Bold',
    textAlign: 'center',
    marginBottom: 3,
    color: '#002147',
  },
  instituteSubtitle: {
    fontSize: 9,
    textAlign: 'center',
    marginBottom: 2,
  },
  contactInfo: {
    fontSize: 8,
    color: '#333',
    textAlign: 'center',
    marginTop: 2,
  },
  headerRight: {
    width: '30%',
    alignItems: 'center',
    justifyContent: 'flex-start',
  },

  // Photo Box
  photoBox: {
    width: 80,
    height: 100,
    borderWidth: 1,
    borderColor: '#000',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f9f9f9',
    marginBottom: 4,
  },
  photoImage: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },
  photoText: {
    fontSize: 8,
    textAlign: 'center',
    color: '#666',
  },
  appNoText: {
    fontSize: 9,
    marginTop: 4,
    textAlign: 'center',
    fontFamily: 'Times-Bold',
    borderWidth: 1,
    borderColor: '#000',
    padding: 4,
  },

  formTitle: {
    marginTop: 6,
    fontSize: 12,
    fontFamily: 'Times-Bold',
    textAlign: 'center',
    marginBottom: 4,
    color: '#002147',
  },

  // Office Use Section
  officeUseRow: {
    flexDirection: 'row',
    paddingVertical: 5,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#666',
    marginBottom: 8,
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    flexWrap: 'wrap',
  },
  officeField: {
    flex: 1,
    fontSize: 8,
    paddingHorizontal: 4,
    borderRightWidth: 1,
    borderRightColor: '#999',
    minHeight: 18,
  },
  officeFieldLast: {
    flex: 1,
    fontSize: 8,
    paddingHorizontal: 4,
    minHeight: 18,
  },

  // Course Selection Row
  courseRow: {
    flexDirection: 'row',
    paddingVertical: 5,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#666',
    marginBottom: 8,
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    flexWrap: 'wrap',
  },
  courseItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 10,
    marginBottom: 2,
  },

  // Form Sections
  sectionTitle: {
    backgroundColor: '#e8e8e8',
    padding: 4,
    fontSize: 11,
    fontFamily: 'Times-Bold',
    marginTop: 8,
    marginBottom: 6,
    borderWidth: 1,
    borderColor: '#999',
    color: '#002147',
  },

  // Form Fields
  row: {
    flexDirection: 'row',
    marginBottom: 5,
    alignItems: 'flex-start',
    minHeight: 18,
  },
  col: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  label: {
    fontSize: 10,
    fontFamily: 'Times-Bold',
    marginRight: 4,
    color: '#002147',
  },
  value: {
    borderBottomWidth: 1,
    borderBottomColor: '#666',
    flex: 1,
    paddingLeft: 3,
    paddingBottom: 2,
    paddingTop: 1,
    fontSize: 10,
    minHeight: 14,
  },
  valueFixed: {
    borderBottomWidth: 1,
    borderBottomColor: '#666',
    paddingLeft: 3,
    paddingBottom: 2,
    paddingTop: 1,
    fontSize: 10,
    minHeight: 14,
  },

  // Checkboxes
  checkbox: {
    width: 9,
    height: 9,
    borderWidth: 1,
    borderColor: '#000',
    marginRight: 3,
    marginLeft: 4,
  },
  checkedBox: {
    width: 9,
    height: 9,
    backgroundColor: '#000',
    borderWidth: 1,
    borderColor: '#000',
    marginRight: 3,
    marginLeft: 4,
  },
  checkboxLabel: {
    fontSize: 9,
    marginRight: 6,
  },

  // Digit Boxes for Mobile/Date
  digitBoxContainer: {
    flexDirection: 'row',
    gap: 2,
  },
  digitBox: {
    width: 15,
    height: 18,
    borderWidth: 1,
    borderColor: '#000',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 9,
    fontFamily: 'Times-Bold',
  },

  // Fee Tables
  feeTableContainer: {
    borderWidth: 1,
    borderColor: '#B0B0B0',
    backgroundColor: '#F2F2F2',
    marginTop: 8,
    marginBottom: 10,
    borderRadius: 3,
  },
  feeTableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#C0C0C0',
  },
  feeTableHeaderCell: {
    flex: 1,
    padding: 4,
    backgroundColor: '#D9D9D9',
    fontFamily: 'Times-Bold',
    fontSize: 9,
    textAlign: 'center',
    borderRightWidth: 1,
    borderRightColor: '#B0B0B0',
    color: '#000',
  },
  feeTableHeaderCellLast: {
    flex: 1,
    padding: 4,
    backgroundColor: '#D9D9D9',
    fontFamily: 'Times-Bold',
    fontSize: 9,
    textAlign: 'center',
    color: '#000',
  },
  feeTableDataCell: {
    flex: 1,
    padding: 4,
    fontSize: 9,
    borderRightWidth: 1,
    borderRightColor: '#B0B0B0',
    backgroundColor: '#F2F2F2',
  },
  feeTableDataCellLast: {
    flex: 1,
    padding: 4,
    fontSize: 9,
    textAlign: 'center',
    backgroundColor: '#F2F2F2',
  },

  // Declaration
  declTitle: {
    fontSize: 11,
    fontFamily: 'Times-Bold',
    textAlign: 'center',
    marginBottom: 6,
    textDecoration: 'underline',
    color: '#800020',
  },
  declPoint: {
    fontSize: 9,
    marginBottom: 3,
    lineHeight: 1.4,
  },

  // Signature Section (aligned vertically)
  signatureRowAligned: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
    marginBottom: 8,
    alignItems: 'flex-end',  // ensures both columns end at the same bottom line
  },
  signBoxWithDate: {
    width: '48%',
    flexDirection: 'column',
    justifyContent: 'space-between',
  },
  signBoxSimple: {
    width: '48%',
    flexDirection: 'column',
    justifyContent: 'flex-end',
    alignItems: 'flex-end',
  },
  signLine: {
    marginTop: 12,
    paddingTop: 3,
    fontSize: 9,
    textAlign: 'center',
    borderTopWidth: 1,
    borderTopColor: '#000',
    width: '100%',
  },
  signLineRight: {
    marginTop: 12,
    paddingTop: 3,
    fontSize: 9,
    textAlign: 'center',
    borderTopWidth: 1,
    borderTopColor: '#000',
    width: '100%',
  },
  officeUseOnly: {
    marginTop: 15,
    padding: 8,
    borderWidth: 1,
    borderColor: '#999',
  },
});

const SeniorAdmissionPDF = ({ data }) => {
  const renderDigitBoxes = (prefix, count) => {
    const digits = [];
    for (let i = 0; i < count; i++) {
      const value = data[`${prefix}${i}`] || '';
      digits.push(
        <View key={i} style={styles.digitBox}>
          <Text>{value}</Text>
        </View>
      );
    }
    return <View style={styles.digitBoxContainer}>{digits}</View>;
  };

  const courseStructure = {
    FY: {
      BBA: { name: 'FY BBA', admission: 2500, tuition: 40000, coActivity: 10000, exam: 2500, total: 55000, oneTime: 52500, inst1: 30250, inst2: 24750 },
      BCA: { name: 'FY BCA', admission: 2500, tuition: 40000, coActivity: 10000, exam: 2500, total: 55000, oneTime: 52500, inst1: 30250, inst2: 24750 },
      BCOM: { name: 'FY B.COM', admission: 1000, tuition: 12000, coActivity: 2500, exam: 2500, total: 18000, oneTime: 17000, inst1: 9900, inst2: 8100 },
      BA: { name: 'FY BA', admission: 1000, tuition: 7000, coActivity: 3000, exam: 1500, total: 12500, oneTime: 11000, inst1: 6875, inst2: 5625 },
    },
    SY: {
      BBA: { name: 'SY BBA', admission: 2500, tuition: 40000, coActivity: 10000, exam: 2500, total: 55000, oneTime: 52500, inst1: 30250, inst2: 24750 },
      BCA: { name: 'SY BCA', admission: 2500, tuition: 40000, coActivity: 10000, exam: 2500, total: 55000, oneTime: 52500, inst1: 30250, inst2: 24750 },
      BCOM: { name: 'SY B.COM', admission: 1000, tuition: 12000, coActivity: 2500, exam: 2500, total: 18000, oneTime: 17000, inst1: 9900, inst2: 8100 },
      BA: { name: 'SY BA', admission: 1000, tuition: 7000, coActivity: 3000, exam: 1500, total: 12500, oneTime: 11000, inst1: 6875, inst2: 5625 },
    },
    TY: {
      BBA: { name: 'TY BBA', admission: 2500, tuition: 40000, coActivity: 10000, exam: 2500, total: 55000, oneTime: 52500, inst1: 30250, inst2: 24750 },
      BCA: { name: 'TY BCA', admission: 2500, tuition: 40000, coActivity: 10000, exam: 2500, total: 55000, oneTime: 52500, inst1: 30250, inst2: 24750 },
      BCOM: { name: 'TY B.COM', admission: 1000, tuition: 12000, coActivity: 2500, exam: 2500, total: 18000, oneTime: 17000, inst1: 9900, inst2: 8100 },
      BA: { name: 'TY BA', admission: 1000, tuition: 7000, coActivity: 3000, exam: 1500, total: 12500, oneTime: 11000, inst1: 6875, inst2: 5625 },
    },
  };

  const hybridFees = {
    BBA: { admission: 2500, tuition: 45000, coActivity: 10000, exam: 2500, total: 60000, oneTime: 57500, inst1: 35000, inst2: 25000 },
    BCA: { admission: 2500, tuition: 45000, coActivity: 10000, exam: 2500, total: 60000, oneTime: 57500, inst1: 35000, inst2: 25000 },
    BCOM: { admission: 1000, tuition: 14000, coActivity: 2500, exam: 2500, total: 20000, oneTime: 19000, inst1: 12000, inst2: 8000 },
    BA: { admission: 1000, tuition: 8500, coActivity: 3000, exam: 1500, total: 14000, oneTime: 12500, inst1: 9000, inst2: 5000 },
  };

  const getFees = () => {
    const baseFees = courseStructure[data.year]?.[data.course];
    let fees = baseFees;
    if (data.isHybrid && hybridFees[data.course] && baseFees) {
      fees = {
        ...baseFees,
        ...hybridFees[data.course],
        name: `${baseFees.name} (Hybrid)`,
      };
    }
    const fine = Number(data.lateFineAmount) || 0;
    if (fees && fine > 0) {
      return {
        ...fees,
        total: fees.total + fine,
        oneTime: fees.oneTime + fine,
        inst1: fees.inst1 + fine,
      };
    }
    return fees;
  };

  const currentFees = getFees();

  return (
    <Document>
      {/* PAGE 1 - ALL STUDENT DETAILS */}
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.logoSection}>
            <Image src={logo} style={styles.logoImage} />
            <Text style={styles.instituteName}>
              Swami Vivekananda Institute Of Management
            </Text>
            <Text style={styles.instituteSubtitle}>Admission Form: 2026-27</Text>
            <Text style={styles.contactInfo}>
              ☎ 82086 65658 | ✉ swamivivekanandainstitute2021@gmail.com
            </Text>
            <Text style={styles.contactInfo}>
              Near Post Office, Shivaji Nagar, Pimpalgaon (B), Niphad, Nashik - 422 209
            </Text>
          </View>
          <View style={styles.headerRight}>
            <View style={styles.photoBox}>
              {data.photoData ? (
                <Image src={data.photoData} style={styles.photoImage} />
              ) : (
                <Text style={styles.photoText}>Passport Size{'\n'}Photo</Text>
              )}
            </View>
            <View style={styles.appNoText}>
              <Text>Application Form No.</Text>
              <Text style={{ marginTop: 1, color: '#800020', fontFamily: 'Times-Bold' }}>
                {data.appNo || '________'}
              </Text>
              <Text style={{ marginTop: 1 }}>Date of Admission: {formatAdmissionDate(data.admissionDate)}</Text>
            </View>
          </View>
        </View>

        <Text style={styles.formTitle}>
          Senior College Admission Form {data.isHybrid ? '(HYBRID MODE)' : ''}
        </Text>

        {/* Office Use Section */}
        <View style={styles.officeUseRow}>
          <View style={styles.officeField}><Text>Eligibility No.__</Text></View>
          <View style={styles.officeField}><Text>CRN__</Text></View>
          <View style={styles.officeField}><Text>Class__</Text></View>
          <View style={styles.officeField}><Text>Roll no__</Text></View>
          <View style={styles.officeField}><Text>Amt.Rs.__</Text></View>
          <View style={styles.officeField}><Text>Receipt No.__</Text></View>
          <View style={styles.officeFieldLast}><Text>Date of Adm.__</Text></View>
        </View>

        {/* Course Selection */}
        <View style={styles.courseRow}>
          <Text style={{ fontSize: 10, fontFamily: 'Times-Bold', marginRight: 8, color: '#002147' }}>Year:</Text>
          <View style={styles.courseItem}>
            <View style={data.year === 'FY' ? styles.checkedBox : styles.checkbox} />
            <Text style={styles.checkboxLabel}>FY</Text>
          </View>
          <View style={styles.courseItem}>
            <View style={data.year === 'SY' ? styles.checkedBox : styles.checkbox} />
            <Text style={styles.checkboxLabel}>SY</Text>
          </View>
          <View style={styles.courseItem}>
            <View style={data.year === 'TY' ? styles.checkedBox : styles.checkbox} />
            <Text style={styles.checkboxLabel}>TY</Text>
          </View>

          <Text style={{ fontSize: 10, fontFamily: 'Times-Bold', marginLeft: 15, marginRight: 8, color: '#002147' }}>
            Course:
          </Text>
          <View style={styles.courseItem}>
            <View style={data.course === 'BBA' ? styles.checkedBox : styles.checkbox} />
            <Text style={styles.checkboxLabel}>BBA</Text>
          </View>
          <View style={styles.courseItem}>
            <View style={data.course === 'BCA' ? styles.checkedBox : styles.checkbox} />
            <Text style={styles.checkboxLabel}>BCA</Text>
          </View>
          <View style={styles.courseItem}>
            <View style={data.course === 'BCOM' ? styles.checkedBox : styles.checkbox} />
            <Text style={styles.checkboxLabel}>B.COM</Text>
          </View>
          <View style={styles.courseItem}>
            <View style={data.course === 'BA' ? styles.checkedBox : styles.checkbox} />
            <Text style={styles.checkboxLabel}>BA</Text>
          </View>
          {data.isHybrid && (
            <View style={{ ...styles.courseItem, marginLeft: 5 }}>
              <View style={styles.checkedBox} />
              <Text style={{ ...styles.checkboxLabel, fontFamily: 'Times-Bold', color: '#800020' }}>HYBRID MODE</Text>
            </View>
          )}
        </View>

        {/* Section 1: Personal Information */}
        <Text style={styles.sectionTitle}>1. PERSONAL INFORMATION</Text>
        <View style={styles.row}>
          <View style={{ ...styles.col, marginRight: 8 }}>
            <Text style={styles.label}>(Surname)</Text>
            <Text style={styles.value}>{data.lastName || ''}</Text>
          </View>
          <View style={{ ...styles.col, marginRight: 8 }}>
            <Text style={styles.label}>(Middle Name)</Text>
            <Text style={styles.value}>{data.middleName || ''}</Text>
          </View>
          <View style={styles.col}>
            <Text style={styles.label}>(First Name)</Text>
            <Text style={styles.value}>{data.firstName || ''}</Text>
          </View>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>(In Devanagari Script):</Text>
          <Text style={styles.value}>{data.nameDevanagari || ''}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Mother's Name:</Text>
          <Text style={styles.value}>{data.motherName || ''}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Gender:</Text>
          <View style={data.gender === 'Male' ? styles.checkedBox : styles.checkbox} />
          <Text style={styles.checkboxLabel}>Male</Text>
          <View style={data.gender === 'Female' ? styles.checkedBox : styles.checkbox} />
          <Text style={styles.checkboxLabel}>Female</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Aadhar Number:</Text>
          {renderDigitBoxes('aadhar', 12)}
        </View>

        {/* Section 2: Permanent Address */}
        <Text style={styles.sectionTitle}>2. PERMANENT ADDRESS (As per Aadhar Card)</Text>
        <View style={styles.row}>
          <Text style={styles.label}>Building Name:</Text>
          <Text style={styles.value}>{data.buildingName || ''}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Street Name / Nagar:</Text>
          <Text style={styles.value}>{data.streetName || ''}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Village / Tahsil:</Text>
          <Text style={styles.value}>{data.village || ''}</Text>
        </View>
        <View style={styles.row}>
          <View style={{ ...styles.col, flex: 0.5 }}>
            <Text style={styles.label}>District:</Text>
            <Text style={styles.valueFixed}>{data.district || 'NASHIK'}</Text>
          </View>
          <View style={{ ...styles.col, flex: 0.5, marginLeft: 8 }}>
            <Text style={styles.label}>State:</Text>
            <Text style={styles.valueFixed}>{data.state || 'MAHARASHTRA'}</Text>
          </View>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>PIN Code:</Text>
          <Text style={styles.value}>{data.pinCode || ''}</Text>
        </View>

        {/* Section 3: Other Personnel Details */}
        <Text style={styles.sectionTitle}>3. OTHER PERSONNEL DETAILS</Text>
        <View style={styles.row}>
          <Text style={styles.label}>Date of Birth (DD-MM-YYYY):</Text>
          <Text style={styles.valueFixed}>
            {data.dobDay || '__'}-{data.dobMonth || '__'}-{data.dobYear || '____'}
          </Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Category:</Text>
          <Text style={styles.value}>{data.category || ''}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Blood Group:</Text>
          <Text style={styles.value}>{data.bloodGroup || ''}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Marital Status:</Text>
          <View style={data.maritalStatus === 'Married' ? styles.checkedBox : styles.checkbox} />
          <Text style={styles.checkboxLabel}>Married</Text>
          <View style={data.maritalStatus === 'Unmarried' ? styles.checkedBox : styles.checkbox} />
          <Text style={styles.checkboxLabel}>Unmarried</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Email:</Text>
          <Text style={styles.value}>{data.email || ''}</Text>
        </View>
        <View style={styles.row}>
          <View style={styles.col}>
            <Text style={styles.label}>Candidate Mobile:</Text>
            {renderDigitBoxes('candidateMobile', 10)}
          </View>
        </View>
        <View style={styles.row}>
          <View style={styles.col}>
            <Text style={styles.label}>Parent Mobile:</Text>
            {renderDigitBoxes('parentMobile', 10)}
          </View>
        </View>

        {/* Section 4: Qualification Details */}
        <Text style={styles.sectionTitle}>4. QUALIFICATION DETAILS</Text>
        <View style={styles.row}>
          <Text style={styles.label}>Last Exam:</Text>
          <Text style={styles.value}>
            {data.lastExamMonth} {data.lastExamYear}
          </Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>School/College:</Text>
          <Text style={styles.value}>{data.lastSchoolCollege || ''}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Course:</Text>
          <Text style={styles.value}>{data.lastCourseName || ''}</Text>
        </View>
        <View style={styles.row}>
          <View style={{ ...styles.col, flex: 0.5 }}>
            <Text style={styles.label}>Percentage:</Text>
            <Text style={styles.valueFixed}>{data.lastPercentage || ''}%</Text>
          </View>
          <View style={{ ...styles.col, flex: 0.5, marginLeft: 8 }}>
            <Text style={styles.label}>Result:</Text>
            <View style={data.lastResult === 'Pass' ? styles.checkedBox : styles.checkbox} />
            <Text style={styles.checkboxLabel}>Pass</Text>
            <View style={data.lastResult === 'ATKT' ? styles.checkedBox : styles.checkbox} />
            <Text style={styles.checkboxLabel}>ATKT</Text>
          </View>
        </View>

        {/* Section 5: Bank Details */}
        <Text style={styles.sectionTitle}>5. BANK DETAILS</Text>
        <View style={styles.row}>
          <Text style={styles.label}>Account No:</Text>
          <Text style={styles.value}>{data.bankAccountNumber || ''}</Text>
        </View>
        <View style={styles.row}>
          <View style={{ ...styles.col, marginRight: 8 }}>
            <Text style={styles.label}>IFSC Code:</Text>
            <Text style={styles.value}>{data.bankIFSC || ''}</Text>
          </View>
          <View style={styles.col}>
            <Text style={styles.label}>Bank Name:</Text>
            <Text style={styles.value}>{data.bankName || ''}</Text>
          </View>
        </View>

        {/* Section 6: Parent / Guardian Details */}
        <Text style={styles.sectionTitle}>6. PARENT / GUARDIAN DETAILS</Text>
        <View style={styles.row}>
          <Text style={styles.label}>Parent Name:</Text>
          <Text style={styles.value}>{data.parentName || ''}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Relation:</Text>
          <Text style={styles.value}>{data.relationWithCandidate || ''}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Occupation:</Text>
          <Text style={styles.value}>{data.parentOccupation || ''}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Annual Income:</Text>
          <Text style={styles.value}>Rs. {data.parentIncome || ''}</Text>
        </View>

        {/* NO SIGNATURE SECTION HERE – removed as requested */}
      </Page>

      {/* PAGE 2 - FEE STRUCTURE & DECLARATION */}
      <Page size="A4" style={styles.page}>
        {currentFees && (
          <>
            <Text style={{ ...styles.sectionTitle, marginTop: 0 }}>FEE STRUCTURE - {currentFees.name}</Text>
            <View style={styles.feeTableContainer} wrap={false}>
              <View style={styles.feeTableRow}>
                <View style={{ ...styles.feeTableHeaderCell, flex: 2 }}>
                  <Text>Fee Type</Text>
                </View>
                <View style={styles.feeTableHeaderCellLast}>
                  <Text>Amount</Text>
                </View>
              </View>
              <View style={styles.feeTableRow}>
                <View style={{ ...styles.feeTableDataCell, flex: 2 }}>
                  <Text>Admission Fees</Text>
                </View>
                <View style={styles.feeTableDataCellLast}>
                  <Text>Rs. {currentFees.admission}</Text>
                </View>
              </View>
              <View style={styles.feeTableRow}>
                <View style={{ ...styles.feeTableDataCell, flex: 2 }}>
                  <Text>Tuition Fees</Text>
                </View>
                <View style={styles.feeTableDataCellLast}>
                  <Text>Rs. {currentFees.tuition}</Text>
                </View>
              </View>
              <View style={styles.feeTableRow}>
                <View style={{ ...styles.feeTableDataCell, flex: 2 }}>
                  <Text>Co-curricular Activities</Text>
                </View>
                <View style={styles.feeTableDataCellLast}>
                  <Text>Rs. {currentFees.coActivity}</Text>
                </View>
              </View>
              <View style={styles.feeTableRow}>
                <View style={{ ...styles.feeTableDataCell, flex: 2 }}>
                  <Text>Exam Fees</Text>
                </View>
                <View style={styles.feeTableDataCellLast}>
                  <Text>Rs. {currentFees.exam}</Text>
                </View>
              </View>
              {Number(data.lateFineAmount) > 0 && (
                <View style={styles.feeTableRow}>
                  <View style={{ ...styles.feeTableDataCell, flex: 2 }}>
                    <Text>Late Fine</Text>
                  </View>
                  <View style={styles.feeTableDataCellLast}>
                    <Text>Rs. {data.lateFineAmount}</Text>
                  </View>
                </View>
              )}
              <View style={styles.feeTableRow}>
                <View style={{ ...styles.feeTableDataCell, flex: 2, backgroundColor: '#D9D9D9' }}>
                  <Text style={{ fontFamily: 'Times-Bold', color: '#002147' }}>TOTAL FEES</Text>
                </View>
                <View style={{ ...styles.feeTableDataCellLast, backgroundColor: '#D9D9D9' }}>
                  <Text style={{ fontFamily: 'Times-Bold', color: '#800020' }}>Rs. {currentFees.total}</Text>
                </View>
              </View>
            </View>

            <View style={styles.feeTableContainer} wrap={false}>
              <View style={styles.feeTableRow}>
                <View style={{ ...styles.feeTableHeaderCell, flex: 2 }}>
                  <Text>Payment Mode</Text>
                </View>
                <View style={styles.feeTableHeaderCell}>
                  <Text>Date</Text>
                </View>
                <View style={styles.feeTableHeaderCellLast}>
                  <Text>Amount</Text>
                </View>
              </View>
              <View style={styles.feeTableRow}>
                <View style={{ ...styles.feeTableDataCell, flex: 2 }}>
                  <Text>One Time</Text>
                </View>
                <View style={styles.feeTableDataCell}>
                  <Text>{formatAdmissionDate(getAdmissionDateObj(data.admissionDate))}</Text>
                </View>
                <View style={styles.feeTableDataCellLast}>
                  <Text>Rs. {currentFees.oneTime}</Text>
                </View>
              </View>
              <View style={styles.feeTableRow}>
                <View style={{ ...styles.feeTableDataCell, flex: 2 }}>
                  <Text>Installment 1</Text>
                </View>
                <View style={styles.feeTableDataCell}>
                  <Text>{formatAdmissionDate(getAdmissionDateObj(data.admissionDate))}</Text>
                </View>
                <View style={styles.feeTableDataCellLast}>
                  <Text>Rs. {currentFees.inst1}</Text>
                </View>
              </View>
              <View style={styles.feeTableRow}>
                <View style={{ ...styles.feeTableDataCell, flex: 2 }}>
                  <Text>Installment 2</Text>
                </View>
                <View style={styles.feeTableDataCell}>
                  <Text>21/09/2026</Text>
                </View>
                <View style={styles.feeTableDataCellLast}>
                  <Text>Rs. {currentFees.inst2}</Text>
                </View>
              </View>
            </View>

            <Text style={{ fontSize: 8, marginTop: 4, fontFamily: 'Times-Bold', textAlign: 'center', color: '#800020' }}>
              Note: Uniform/Books/Exam Fees are not Included. Admission will be finalized only after submission of all documents & full payment of fees.
            </Text>
          </>
        )}

        {/* Declaration */}
        <View style={{ marginTop: 10, paddingTop: 5, borderTopWidth: 1 }}>
          <Text style={styles.declTitle}>DECLARATION</Text>
          <Text style={styles.declPoint}>
            1. I hereby declare that I wish to take admission to the selected course. The personal details provided are correct to the best of my knowledge.
          </Text>
          <Text style={styles.declPoint}>
            2. I shall abide by all the rules and conditions of the University, College, and parent institution.
          </Text>
          <Text style={styles.declPoint}>
            3. I fully understand that the Principal/Management of the college will have full right to enforce all rules and discipline.
          </Text>
          <Text style={styles.declPoint}>
            4. I am aware that I will not be permitted to appear for examination if I fail to meet college requirements.
          </Text>
          <Text style={styles.declPoint}>
            5. I hold myself responsible for full payment of fees at the time of admission.
          </Text>
          <Text style={styles.declPoint}>
            6. I am aware that use of mobile phones is prohibited during academic activities.
          </Text>
        </View>

        {/* Parent/Guardian Declaration */}
        <View style={{ marginTop: 8, paddingTop: 5, borderTopWidth: 1 }}>
          <Text style={{ fontSize: 10, fontFamily: 'Times-Bold', marginBottom: 3, color: '#002147' }}>
            PARENT/GUARDIAN DECLARATION:
          </Text>
          <Text style={styles.declPoint}>
            My child is seeking admission in your college with my consent. I will ensure that he/she abides by all the rules of the college. The decisions of the Principal on any college matter will be binding on him/her. All correspondence may please be sent to the above address.
          </Text>
        </View>

        {/* Signatures – vertically aligned at same height */}
        <View style={styles.signatureRowAligned}>
          {/* Left side: with Date and Place */}
          <View style={styles.signBoxWithDate}>
            <View>
              <Text style={{ fontSize: 9, marginBottom: 2 }}>Date: ____ / ____ / ____</Text>
              <Text style={{ fontSize: 9, marginBottom: 12 }}>Place: _______________</Text>
            </View>
            <Text style={styles.signLine}>Signature of Parent/Guardian</Text>
          </View>

          {/* Right side: only signature line, aligned to bottom */}
          <View style={styles.signBoxSimple}>
            <View style={{ height: 32 }} /> {/* spacer to match left side's Date+Place height */}
            <Text style={styles.signLineRight}>Signature of Candidate</Text>
          </View>
        </View>

        {/* Office Use Only */}
        <View style={styles.officeUseOnly}>
          <Text style={{ fontSize: 10, fontFamily: 'Times-Bold', marginBottom: 5 }}>For office use only</Text>
          <View style={{ height: 20 }} />
          <View style={{ borderTopWidth: 1, borderTopColor: '#999', paddingTop: 5 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <Text style={{ fontSize: 8 }}>Date: _____________</Text>
              <Text style={{ fontSize: 8 }}>Particular: _____________</Text>
              <Text style={{ fontSize: 8 }}>Remark: _____________</Text>
            </View>
            <Text style={{ marginTop: 8, textAlign: 'right', fontSize: 8 }}>
              Name, Designation & Signature with Stamp
            </Text>
          </View>
        </View>
      </Page>
    </Document>
  );
};

export default SeniorAdmissionPDF;
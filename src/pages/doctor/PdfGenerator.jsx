// PdfGenerator.js
import { Document, Page, Text, View, StyleSheet, PDFDownloadLink } from '@react-pdf/renderer';

const styles = StyleSheet.create({
  page: {
    padding: 30
  },
  header: {
    fontSize: 24,
    marginBottom: 20,
    textAlign: 'center'
  },
  patientInfo: {
    marginBottom: 15
  },
  table: { 
    display: "table", 
    width: "auto",
    borderStyle: "solid",
    borderWidth: 1,
    borderRightWidth: 0,
    borderBottomWidth: 0
  },
  tableRow: { 
    margin: "auto", 
    flexDirection: "row" 
  },
  tableCol: { 
    width: "20%", 
    borderStyle: "solid", 
    borderWidth: 1, 
    borderLeftWidth: 0, 
    borderTopWidth: 0 
  },
  tableCell: { 
    margin: "auto", 
    marginTop: 5, 
    fontSize: 10 
  }
});

const PrescriptionPDF = ({ patient, medicines, date, additionalInstructions, pdData }) => (
  <Document>
    <Page size="A4" style={styles.page}>
      <View>
        <Text style={styles.header}>MEDICAL PRESCRIPTION</Text>
        <Text>Date: {date}</Text>
        
        <View style={styles.patientInfo}>
          <Text>Patient: {patient.name}</Text>
          <Text>ID: {patient.id}</Text>
        </View>

        {medicines.length > 0 && (
          <View>
            <Text>Prescribed Medications:</Text>
            <View style={styles.table}>
              <View style={styles.tableRow}>
                <View style={styles.tableCol}><Text style={styles.tableCell}>No.</Text></View>
                <View style={styles.tableCol}><Text style={styles.tableCell}>Medicine</Text></View>
                <View style={styles.tableCol}><Text style={styles.tableCell}>Dosage</Text></View>
                <View style={styles.tableCol}><Text style={styles.tableCell}>Frequency</Text></View>
                <View style={styles.tableCol}><Text style={styles.tableCell}>Duration</Text></View>
              </View>
              
              {medicines.map((med, index) => (
                <View style={styles.tableRow} key={index}>
                  <View style={styles.tableCol}><Text style={styles.tableCell}>{index + 1}</Text></View>
                  <View style={styles.tableCol}><Text style={styles.tableCell}>{med.name}</Text></View>
                  <View style={styles.tableCol}><Text style={styles.tableCell}>{med.dosage || '-'}</Text></View>
                  <View style={styles.tableCol}><Text style={styles.tableCell}>{med.frequency || '-'}</Text></View>
                  <View style={styles.tableCol}><Text style={styles.tableCell}>{med.duration || '-'}</Text></View>
                </View>
              ))}
            </View>
          </View>
        )}

        {additionalInstructions && (
          <View>
            <Text>Additional Instructions:</Text>
            <Text>{additionalInstructions}</Text>
          </View>
        )}
      </View>
    </Page>
  </Document>
);

export default PrescriptionPDF;
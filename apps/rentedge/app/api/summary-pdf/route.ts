import { NextResponse } from "next/server";
import React from "react";
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  renderToBuffer,
} from "@react-pdf/renderer";

// ── Expected request body ────────────────────────────────
// {
//   applicantName: string
//   phone: string
//   email: string
//   propertyTitle: string
//   rent: number
//   income: number
//   ratio: number                 // income / rent, e.g. 2.9
//   isSelfEmployed: boolean
//   documents: {
//     idReady: boolean
//     bankStatementsReady: boolean
//     payslipsReady: boolean
//     employmentConfirmationReady: boolean
//     referenceReady: boolean
//     depositStatus: 'ready' | 'partial' | 'not-ready'
//   }
//   guarantorText: string
//   referenceContactText: string
//   introMessage: string
// }

const styles = StyleSheet.create({
  page: { fontFamily: "Helvetica", fontSize: 9.5, color: "#1A1D23" },
  header: {
    backgroundColor: "#1A1D23",
    paddingHorizontal: 40,
    paddingVertical: 22,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  headerTitle: { color: "#FFFFFF", fontSize: 18, fontFamily: "Helvetica-Bold" },
  headerEyebrow: { color: "#C9A84C", fontSize: 8, fontFamily: "Helvetica-Bold", marginTop: 3, letterSpacing: 1 },
  headerRight: { alignItems: "flex-end" },
  headerRightText: { color: "#B8BCC4", fontSize: 8, marginBottom: 4 },
  body: { paddingHorizontal: 40, paddingTop: 24, paddingBottom: 30 },
  snapshotRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 12 },
  snapshotCol: { flexDirection: "column" },
  label: { fontSize: 8, fontFamily: "Helvetica-Bold", color: "#6B7280", marginBottom: 4, letterSpacing: 0.5 },
  value: { fontSize: 12, fontFamily: "Helvetica-Bold", color: "#1A1D23" },
  contactRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 14 },
  contactText: { fontSize: 8.5, color: "#6B7280" },
  divider: { borderBottomWidth: 0.75, borderBottomColor: "#E5E7EB", marginBottom: 14 },
  factPanelRow: { flexDirection: "row", marginBottom: 20, gap: 6 },
  factPanel: {
    flex: 1,
    backgroundColor: "#FBF6E9",
    borderWidth: 0.75,
    borderColor: "#B8923D",
    padding: 12,
  },
  factValue: { fontSize: 15, fontFamily: "Helvetica-Bold", color: "#1A1D23", marginTop: 4 },
  factSub: { fontSize: 8, color: "#6B7280", marginTop: 4 },
  sectionTitle: { fontSize: 11, fontFamily: "Helvetica-Bold", marginBottom: 8, marginTop: 4 },
  docRow: { flexDirection: "row", marginBottom: 6, alignItems: "center" },
  // NOTE: standard Helvetica (WinAnsi encoding) does not include glyphs like
  // ✓ or ○ — they render blank/broken. Stick to plain ASCII marks here unless
  // a custom TTF font with those glyphs is embedded via Font.register().
  docMarkReady: { color: "#2F8F5B", fontFamily: "Helvetica-Bold", width: 26, fontSize: 8.5 },
  docMarkPartial: { color: "#B8790F", fontFamily: "Helvetica-Bold", width: 26, fontSize: 8.5 },
  docMarkMissing: { color: "#B8790F", fontFamily: "Helvetica-Bold", width: 26, fontSize: 8.5 },
  docLabel: { fontSize: 9.5 },
  rgRow: { flexDirection: "row", marginBottom: 8 },
  rgLabel: { width: 110, fontSize: 8, fontFamily: "Helvetica-Bold", color: "#6B7280" },
  rgValue: { flex: 1, fontSize: 9.5 },
  introBox: {
    backgroundColor: "#FBF6E9",
    borderWidth: 0.75,
    borderColor: "#B8923D",
    padding: 12,
    marginTop: 4,
  },
  introText: { fontSize: 9.5, lineHeight: 1.5 },
  footer: {
    marginTop: 24,
    borderTopWidth: 0.5,
    borderTopColor: "#E5E7EB",
    paddingTop: 8,
  },
  footerText: { fontSize: 7, color: "#6B7280", lineHeight: 1.4 },
});

// Renders one checklist row. Deposit is the one tri-state item — everything
// else is a plain ready/not-ready boolean, matching what the profile flow
// actually asks. Marks are plain ASCII — Helvetica's WinAnsi encoding does
// not reliably render ✓ / ○, so those showed blank in the generated PDF.
function docRow(label: string, status: "ready" | "partial" | "missing") {
  const mark = status === "ready" ? "OK" : status === "partial" ? "~" : "--";
  const markStyle =
    status === "ready" ? styles.docMarkReady
    : status === "partial" ? styles.docMarkPartial
    : styles.docMarkMissing;

  return React.createElement(
    View,
    { style: styles.docRow, key: label },
    React.createElement(Text, { style: markStyle }, mark),
    React.createElement(Text, { style: styles.docLabel }, label)
  );
}

function buildDocument(data: any) {
  const {
    applicantName, phone, email, propertyTitle, rent, income, ratio,
    isSelfEmployed, documents, guarantorText, referenceContactText, introMessage,
    reference, generatedDate,
  } = data;

  const docsReadyCount = [
    documents.idReady,
    documents.bankStatementsReady,
    documents.payslipsReady,
    documents.employmentConfirmationReady,
    documents.referenceReady,
    documents.depositStatus === "ready",
  ].filter(Boolean).length;

  const statementsLabel = isSelfEmployed ? "6 months bank statements" : "3 months bank statements";
  const payslipsLabel = isSelfEmployed ? "6 months payslips or financial statements" : "3 months payslips";

  const depositStatus: "ready" | "partial" | "missing" =
    documents.depositStatus === "ready" ? "ready"
    : documents.depositStatus === "partial" ? "partial"
    : "missing";

  return React.createElement(
    Document,
    {},
    React.createElement(
      Page,
      { size: "A4", style: styles.page },

      // Header
      React.createElement(
        View,
        { style: styles.header },
        React.createElement(
          View,
          {},
          React.createElement(Text, { style: styles.headerTitle }, "RentEdge"),
          React.createElement(Text, { style: styles.headerEyebrow }, "RENTAL APPLICATION SUMMARY")
        ),
        React.createElement(
          View,
          { style: styles.headerRight },
          React.createElement(Text, { style: styles.headerRightText }, `Ref: ${reference}`),
          React.createElement(Text, { style: styles.headerRightText }, "rentedge.co.za")
        )
      ),

      // Body
      React.createElement(
        View,
        { style: styles.body },

        // Snapshot row
        React.createElement(
          View,
          { style: styles.snapshotRow },
          React.createElement(
            View, { style: styles.snapshotCol },
            React.createElement(Text, { style: styles.label }, "APPLICANT"),
            React.createElement(Text, { style: styles.value }, applicantName)
          ),
          React.createElement(
            View, { style: styles.snapshotCol },
            React.createElement(Text, { style: styles.label }, "PROPERTY"),
            React.createElement(Text, { style: styles.value }, propertyTitle)
          ),
          React.createElement(
            View, { style: styles.snapshotCol },
            React.createElement(Text, { style: styles.label }, "MONTHLY RENT"),
            React.createElement(Text, { style: styles.value }, `R${Number(rent).toLocaleString()}`)
          ),
          React.createElement(
            View, { style: styles.snapshotCol },
            React.createElement(Text, { style: styles.label }, "GENERATED"),
            React.createElement(Text, { style: styles.value }, generatedDate)
          )
        ),

        // Contact row
        React.createElement(
          View,
          { style: styles.contactRow },
          React.createElement(Text, { style: styles.contactText }, `Tel: ${phone}`),
          React.createElement(Text, { style: styles.contactText }, `Email: ${email}`)
        ),

        React.createElement(View, { style: styles.divider }),

        // Fact panels — deliberately neutral, no rating/verdict language
        React.createElement(
          View,
          { style: styles.factPanelRow },
          React.createElement(
            View, { style: styles.factPanel },
            React.createElement(Text, { style: styles.label }, "AFFORDABILITY"),
            React.createElement(Text, { style: styles.factValue }, `${ratio}x income-to-rent`),
            React.createElement(Text, { style: styles.factSub }, "Standard agent threshold is 3x")
          ),
          React.createElement(
            View, { style: styles.factPanel },
            React.createElement(Text, { style: styles.label }, "DOCUMENTATION"),
            React.createElement(Text, { style: styles.factValue }, `${docsReadyCount} of 6 ready`),
            React.createElement(Text, { style: styles.factSub }, "See full checklist below")
          )
        ),

        // Document checklist
        React.createElement(Text, { style: styles.sectionTitle }, "Document readiness"),
        docRow("Certified ID copy", documents.idReady ? "ready" : "missing"),
        docRow(statementsLabel, documents.bankStatementsReady ? "ready" : "missing"),
        docRow(payslipsLabel, documents.payslipsReady ? "ready" : "missing"),
        docRow("Employment confirmation letter", documents.employmentConfirmationReady ? "ready" : "missing"),
        docRow("Landlord reference contact details", documents.referenceReady ? "ready" : "missing"),
        docRow(
          depositStatus === "partial" ? "Deposit funds (partially ready)" : "Deposit funds ready",
          depositStatus
        ),

        // References & support
        React.createElement(Text, { style: { ...styles.sectionTitle, marginTop: 16 } }, "References & support"),
        React.createElement(
          View, { style: styles.rgRow },
          React.createElement(Text, { style: styles.rgLabel }, "Landlord reference"),
          React.createElement(Text, { style: styles.rgValue }, referenceContactText)
        ),
        React.createElement(
          View, { style: styles.rgRow },
          React.createElement(Text, { style: styles.rgLabel }, "Guarantor"),
          React.createElement(Text, { style: styles.rgValue }, guarantorText)
        ),

        // Introduction message
        React.createElement(Text, { style: { ...styles.sectionTitle, marginTop: 8 } }, "Introduction message"),
        React.createElement(
          View, { style: styles.introBox },
          React.createElement(Text, { style: styles.introText }, introMessage)
        ),

        // Footer
        React.createElement(
          View, { style: styles.footer },
          React.createElement(
            Text, { style: styles.footerText },
            "This summary was prepared by the applicant using RentEdge, based on information they provided. " +
            "It is intended to speed up the application process and is not a substitute for the letting agent's " +
            "own credit, reference, and affordability checks. Generated via rentedge.co.za."
          )
        )
      )
    )
  );
}

export async function POST(req: Request) {
  try {
    const data = await req.json();

    if (!data || !data.applicantName || !data.propertyTitle) {
      return NextResponse.json(
        { error: "Missing required applicant or property data" },
        { status: 400 }
      );
    }

    // Server generates the reference number and date — not the client —
    // so these stay consistent regardless of what the browser sends.
    const now = new Date();
    data.reference = `RE-${now.getFullYear().toString().slice(2)}${String(now.getMonth() + 1).padStart(2, "0")}-${Math.floor(1000 + Math.random() * 9000)}`;
    data.generatedDate = now.toLocaleDateString("en-ZA", { day: "numeric", month: "long", year: "numeric" });

    const buffer = await renderToBuffer(buildDocument(data));

    return new NextResponse(new Uint8Array(buffer), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="RentEdge-Summary-${data.reference}.pdf"`,
      },
    });
  } catch (err) {
    console.error("PDF generation failed:", err);
    return NextResponse.json(
      { error: "PDF generation failed" },
      { status: 500 }
    );
  }
}
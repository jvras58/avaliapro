import {
  Document,
  Page,
  View,
  Text,
  StyleSheet,
} from "@react-pdf/renderer";
import type { GeneratedExam } from "@/domain/types";

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------

const styles = StyleSheet.create({
  page: {
    fontFamily: "Helvetica",
    fontSize: 11,
    paddingTop: 72,
    paddingBottom: 56,
    paddingHorizontal: 56,
    color: "#111",
  },

  // ---- Fixed header (repeated on every page) ----
  header: {
    position: "absolute",
    top: 20,
    left: 56,
    right: 56,
    borderBottomWidth: 1,
    borderBottomColor: "#333",
    paddingBottom: 6,
  },
  headerTitle: {
    fontSize: 13,
    fontFamily: "Helvetica-Bold",
    marginBottom: 3,
  },
  headerMeta: {
    fontSize: 9,
    color: "#444",
    flexDirection: "row",
    justifyContent: "space-between",
  },

  // ---- Fixed footer (repeated on every page) ----
  footer: {
    position: "absolute",
    bottom: 20,
    left: 56,
    right: 56,
    borderTopWidth: 1,
    borderTopColor: "#333",
    paddingTop: 5,
    flexDirection: "row",
    justifyContent: "space-between",
    fontSize: 9,
    color: "#444",
  },

  // ---- Questions ----
  questionBlock: {
    marginBottom: 16,
  },
  questionStatement: {
    fontFamily: "Helvetica-Bold",
    marginBottom: 6,
  },
  alternativeRow: {
    flexDirection: "row",
    marginBottom: 3,
    paddingLeft: 8,
  },
  alternativeLabel: {
    width: 24,
    fontFamily: "Helvetica-Bold",
  },
  alternativeText: {
    flex: 1,
  },
  answerLine: {
    marginTop: 6,
    paddingLeft: 8,
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  answerLineLabel: {
    fontSize: 9,
    color: "#555",
  },
  answerLineDash: {
    flex: 1,
    borderBottomWidth: 1,
    borderBottomColor: "#999",
    marginLeft: 4,
  },

  // ---- Identification area (last section) ----
  identBox: {
    marginTop: 24,
    borderWidth: 1,
    borderColor: "#333",
    borderRadius: 3,
    padding: 10,
    gap: 10,
  },
  identRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  identLabel: {
    width: 36,
    fontSize: 10,
    fontFamily: "Helvetica-Bold",
  },
  identUnderline: {
    flex: 1,
    borderBottomWidth: 1,
    borderBottomColor: "#555",
  },
});

// ---------------------------------------------------------------------------
// Helper: label for an alternative index
// ---------------------------------------------------------------------------

function altLabel(index: number, mode: GeneratedExam["identificationMode"]): string {
  if (mode === "letters") {
    return `${String.fromCharCode(65 + index)}.`;
  }
  return String(Math.pow(2, index));
}

// ---------------------------------------------------------------------------
// PDF template component
// ---------------------------------------------------------------------------

export function ExamDocument({ exam }: { exam: GeneratedExam }) {
  return (
    <Document title={`${exam.title} — Versão ${exam.examNumber}`}>
      <Page size="A4" style={styles.page}>
        {/* Fixed header */}
        <View style={styles.header} fixed>
          <Text style={styles.headerTitle}>{exam.title}</Text>
          <View style={styles.headerMeta}>
            <Text>
              {[
                exam.course ? `Disciplina: ${exam.course}` : "",
                exam.instructor ? `Professor(a): ${exam.instructor}` : "",
              ]
                .filter(Boolean)
                .join("    ")}
            </Text>
            <Text>{exam.date ? `Data: ${exam.date}` : ""}</Text>
          </View>
        </View>

        {/* Questions */}
        {exam.questions.map((q, qi) => (
          <View key={q.originalId} style={styles.questionBlock} wrap={false}>
            <Text style={styles.questionStatement}>
              {qi + 1}. {q.statement}
            </Text>

            {q.alternatives.map((alt, ai) => (
              <View key={alt.description} style={styles.alternativeRow}>
                <Text style={styles.alternativeLabel}>
                  {altLabel(ai, exam.identificationMode)}
                </Text>
                <Text style={styles.alternativeText}>{alt.description}</Text>
              </View>
            ))}

            <View style={styles.answerLine}>
              <Text style={styles.answerLineLabel}>
                {exam.identificationMode === "letters" ? "Resposta:" : "Soma:"}
              </Text>
              <View style={styles.answerLineDash} />
            </View>
          </View>
        ))}

        {/* Identification area — printed after the last question */}
        <View style={styles.identBox}>
          <View style={styles.identRow}>
            <Text style={styles.identLabel}>Nome:</Text>
            <View style={styles.identUnderline} />
          </View>
          <View style={styles.identRow}>
            <Text style={styles.identLabel}>CPF:</Text>
            <View style={styles.identUnderline} />
          </View>
        </View>

        {/* Fixed footer */}
        <View style={styles.footer} fixed>
          <Text>{exam.title}</Text>
          <Text>Versão Nº {exam.examNumber}</Text>
        </View>
      </Page>
    </Document>
  );
}

import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export function exportReportPDF({title, table}) {
    const doc = new jsPDF();
    doc.text(title, 14, 16);
    autoTable(doc, {head: [table.head], body: table.body, startY: 22});
    doc.save(`${title}.pdf`);
}

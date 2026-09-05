import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export const generarFacturaPDF = (lic: any) => {
  const doc = new jsPDF();
  
  doc.setFontSize(20);
  doc.text("NEXUSDEV DOMINICANA", 10, 20);
  doc.setFontSize(10);
  doc.text(`Fecha: ${new Date().toLocaleDateString()}`, 10, 30);

  autoTable(doc, {
    startY: 40,
    head: [['Concepto', 'Cliente', 'Monto']],
    body: [
      ['Suscripción Mensual Nexus POS', lic.nombre_negocio, 'RD$ 1,500.00'],
    ],
  });

  doc.save(`Factura_Nexus_${lic.cliente_id}.pdf`);
};
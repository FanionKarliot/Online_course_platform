const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

function genererCertificat({ nomEtudiant, titreCours, dateFin, enrollmentId }) {
  return new Promise((resolve, reject) => {
    const nomFichier = `certificat-${enrollmentId}.pdf`;
    const cheminFichier = path.join('uploads/certificats', nomFichier);

    const doc = new PDFDocument({ layout: 'landscape', size: 'A4' });
    const stream = fs.createWriteStream(cheminFichier);
    doc.pipe(stream);

    doc
      .fontSize(28)
      .text('CERTIFICAT DE RÉUSSITE', { align: 'center' })
      .moveDown(2)
      .fontSize(16)
      .text('Ce certificat est décerné à', { align: 'center' })
      .moveDown(0.5)
      .fontSize(24)
      .text(nomEtudiant, { align: 'center' })
      .moveDown(1)
      .fontSize(14)
      .text(`pour avoir complété avec succès le cours`, { align: 'center' })
      .moveDown(0.3)
      .fontSize(18)
      .text(`« ${titreCours} »`, { align: 'center' })
      .moveDown(2)
      .fontSize(12)
      .text(`Délivré le ${new Date(dateFin).toLocaleDateString('fr-FR')}`, { align: 'center' });

    doc.end();

    stream.on('finish', () => resolve(`/uploads/certificats/${nomFichier}`));
    stream.on('error', reject);
  });
}

module.exports = { genererCertificat };
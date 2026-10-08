const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

let QRCode = null;
try {
  QRCode = require('qrcode');
} catch {
  console.warn("[certificat] qrcode non installé — QR ignoré. `npm i qrcode` pour l'activer.");
}

// ============ PALETTE ============
const C = {
  primaire: '#4f46e5',
  primaireFonce: '#312e81',
  violet: '#7c3aed',
  or: '#c8a349',
  orClair: '#f1e3b8',
  orFonce: '#8a6d1f',
  texteFonce: '#0f172a',
  texteGris: '#64748b',
  texteTresGris: '#94a3b8',
  fondIvoire: '#fdfbf5',
};

// ============ LAYOUT CENTRALISÉ ============
// Toutes les positions verticales clés, pour ajuster l'espacement à un seul endroit
const LAYOUT = {
  bandeHaut: 16,
  filetHaut: 3,
  margeCadreExt: 36,
  margeCadreInt: 43,

  yMarque: 62,
  yTagline: 80,
  yOrnement: 100,

  yTitre: 118,
  yTitreTailleMax: 38,
  ySousTitre: 162,
  yLigneDecorative: 188,

  yDecerneA: 212,
  yNom: 238,
  yNomTailleMax: 32,
  yNomTailleMin: 18,     // on ne descend jamais en dessous de cette taille
  yLigneNom: 282,

  yPourCours: 300,
  yTitreCours: 324,
  yTitreCoursTailleMax: 19,
  yTitreCoursTailleMin: 13,

  // Zone basse : sceau centré, QR à gauche, date/signature de part et d'autre
  sceauOffsetBasPage: 165, // sceau centré à H - cette valeur
  sceauRayon: 42,

  qrTaille: 54,
  qrOffsetBasPage: 118,    // QR positionné à H - cette valeur (remonté pour ne pas toucher le footer)
  qrMargeGauche: 55,

  piedOffsetBasPage: 100,  // bloc date/signature à H - cette valeur

  footerOffsetBasPage: 24, // numéro de certificat, bien séparé du reste
};

// ============ HELPERS ============

function formaterDate(date) {
  return new Date(date).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

function genererNumero(enrollmentId) {
  const annee = new Date().getFullYear();
  const court = String(enrollmentId).slice(-6).toUpperCase();
  return `CERT-${annee}-${court}`;
}

/**
 * Réduit progressivement la taille de police jusqu'à ce que le texte
 * tienne sur une seule ligne dans `largeurMax`, sans descendre sous `tailleMin`.
 * Évite qu'un nom ou un titre de cours trop long ne passe à la ligne
 * et vienne chevaucher les éléments positionnés juste en dessous (le sceau).
 */
function ajusterTaillePolice(doc, texte, police, tailleMax, tailleMin, largeurMax) {
  let taille = tailleMax;
  doc.font(police);
  while (taille > tailleMin && doc.widthOfString(texte, { size: taille }) > largeurMax) {
    taille -= 1;
  }
  return taille;
}

function dessinerOrnement(doc, x, y, taille, couleur) {
  doc.save();
  doc.translate(x, y);
  doc.lineWidth(1).strokeColor(couleur);
  doc.moveTo(-taille, 0).lineTo(taille, 0).stroke();
  doc.moveTo(0, 0).quadraticCurveTo(taille * 0.4, -taille * 0.4, taille, 0).stroke();
  doc.moveTo(0, 0).quadraticCurveTo(taille * 0.4, taille * 0.4, taille, 0).stroke();
  doc.moveTo(0, 0).quadraticCurveTo(-taille * 0.4, -taille * 0.4, -taille, 0).stroke();
  doc.moveTo(0, 0).quadraticCurveTo(-taille * 0.4, taille * 0.4, -taille, 0).stroke();
  doc.circle(0, 0, 1.8).fill(couleur);
  doc.restore();
}

// ============ GÉNÉRATION ============

function genererCertificat({ nomEtudiant, titreCours, dateFin, enrollmentId }) {
  return new Promise((resolve, reject) => {
    try {
      // Valeurs de repli : évite un PDF cassé si une donnée manque
      const nom = (nomEtudiant || 'Étudiant').trim();
      const titre = (titreCours || 'Cours').trim();

      const dossier = path.join(__dirname, '..', '..', 'uploads', 'certificats');
      fs.mkdirSync(dossier, { recursive: true });

      const nomFichier = `certificat-${enrollmentId}.pdf`;
      const cheminFichier = path.join(dossier, nomFichier);

      const doc = new PDFDocument({
        layout: 'landscape',
        size: 'A4',
        margin: 0,
        info: {
          Title: `Certificat — ${titre}`,
          Author: 'CoursEnLigne',
          Subject: 'Certificat de réussite',
          Keywords: 'certificat, réussite, cours, e-learning',
          Creator: 'CoursEnLigne',
        },
      });

      const stream = fs.createWriteStream(cheminFichier);
      doc.pipe(stream);

      const L = doc.page.width;
      const H = doc.page.height;
      const centreX = L / 2;
      const numero = genererNumero(enrollmentId);
      const dateFormatee = formaterDate(dateFin);

      // ---------- 1. FOND ----------
      doc.rect(0, 0, L, H).fill(C.fondIvoire);

      // ---------- 2. FILIGRANE ----------
      doc.save();
      doc.rotate(-30, { origin: [centreX, H / 2] });
      doc
        .fillColor('#eceff5')
        .font('Helvetica-Bold')
        .fontSize(140)
        .text('COURSENLIGNE', 0, H / 2 - 80, { align: 'center', width: L, characterSpacing: 8 });
      doc.restore();

      // ---------- 3. BANDEAUX DÉGRADÉS ----------
      const gradHaut = doc.linearGradient(0, 0, L, 0);
      gradHaut.stop(0, C.primaireFonce).stop(0.5, C.primaire).stop(1, C.violet);
      doc.rect(0, 0, L, LAYOUT.bandeHaut).fill(gradHaut);
      doc.rect(0, LAYOUT.bandeHaut, L, LAYOUT.filetHaut).fill(C.or);

      doc.rect(0, H - LAYOUT.bandeHaut - LAYOUT.filetHaut, L, LAYOUT.filetHaut).fill(C.or);
      const gradBas = doc.linearGradient(0, 0, L, 0);
      gradBas.stop(0, C.violet).stop(0.5, C.primaire).stop(1, C.primaireFonce);
      doc.rect(0, H - LAYOUT.bandeHaut, L, LAYOUT.bandeHaut).fill(gradBas);

      // ---------- 4. CADRES DOUBLES ----------
      const mOut = LAYOUT.margeCadreExt;
      const mIn = LAYOUT.margeCadreInt;

      doc.lineWidth(2).strokeColor(C.or).rect(mOut, mOut, L - mOut * 2, H - mOut * 2).stroke();
      doc.lineWidth(0.6).strokeColor(C.primaire).rect(mIn, mIn, L - mIn * 2, H - mIn * 2).stroke();

      // ---------- 5. ORNEMENTS COINS ----------
      const coinT = 11;
      [
        [mOut, mOut], [L - mOut - coinT, mOut],
        [mOut, H - mOut - coinT], [L - mOut - coinT, H - mOut - coinT],
      ].forEach(([x, y]) => {
        doc.save().translate(x + coinT / 2, y + coinT / 2).rotate(45)
          .rect(-coinT / 2, -coinT / 2, coinT, coinT).fill(C.or).restore();
      });

      // ---------- 6. EN-TÊTE ----------
      doc.fillColor(C.primaireFonce).font('Helvetica-Bold').fontSize(10)
        .text('C O U R S E N L I G N E', 0, LAYOUT.yMarque, { align: 'center', characterSpacing: 4 });
      doc.fillColor(C.texteGris).font('Helvetica-Oblique').fontSize(9)
        .text("Plateforme d'apprentissage en ligne", 0, LAYOUT.yTagline, { align: 'center' });
      dessinerOrnement(doc, centreX, LAYOUT.yOrnement, 18, C.or);

      // ---------- 7. TITRE ----------
      doc.fillColor(C.texteFonce).font('Helvetica-Bold').fontSize(LAYOUT.yTitreTailleMax)
        .text('CERTIFICAT', 0, LAYOUT.yTitre, { align: 'center', characterSpacing: 6 });
      doc.fillColor(C.or).font('Helvetica-Bold').fontSize(14)
        .text('DE RÉUSSITE', 0, LAYOUT.ySousTitre, { align: 'center', characterSpacing: 10 });

      const yLigne = LAYOUT.yLigneDecorative;
      doc.moveTo(centreX - 120, yLigne).lineTo(centreX - 25, yLigne).lineWidth(0.6).strokeColor(C.or).stroke();
      doc.moveTo(centreX + 25, yLigne).lineTo(centreX + 120, yLigne).strokeColor(C.or).stroke();
      doc.circle(centreX, yLigne, 3).fill(C.or);

      // ---------- 8. NOM (taille adaptative) ----------
      doc.fillColor(C.texteGris).font('Helvetica-Oblique').fontSize(12)
        .text('Ce certificat est fièrement décerné à', 0, LAYOUT.yDecerneA, { align: 'center' });

      const largeurDispoNom = L - mIn * 2 - 80;
      const tailleNom = ajusterTaillePolice(
        doc, nom, 'Helvetica-Bold', LAYOUT.yNomTailleMax, LAYOUT.yNomTailleMin, largeurDispoNom
      );
      doc.fillColor(C.primaireFonce).font('Helvetica-Bold').fontSize(tailleNom)
        .text(nom, 0, LAYOUT.yNom, { align: 'center' });

      const largeurNom = doc.widthOfString(nom, { font: 'Helvetica-Bold', size: tailleNom });
      const demiNom = Math.min(largeurNom / 2 + 14, L / 2 - 60);
      doc.moveTo(centreX - demiNom, LAYOUT.yLigneNom).lineTo(centreX + demiNom, LAYOUT.yLigneNom)
        .lineWidth(1).strokeColor(C.or).stroke();
      doc.circle(centreX - demiNom, LAYOUT.yLigneNom, 2).fill(C.or);
      doc.circle(centreX + demiNom, LAYOUT.yLigneNom, 2).fill(C.or);

      // ---------- 9. TITRE DU COURS (taille adaptative, une seule ligne garantie) ----------
      doc.fillColor(C.texteGris).font('Helvetica').fontSize(12)
        .text('pour avoir complété avec succès le cours', 0, LAYOUT.yPourCours, { align: 'center' });

      const texteCours = `« ${titre} »`;
      const largeurDispoCours = L - mIn * 2 - 120;
      const tailleCours = ajusterTaillePolice(
        doc, texteCours, 'Helvetica-BoldOblique',
        LAYOUT.yTitreCoursTailleMax, LAYOUT.yTitreCoursTailleMin, largeurDispoCours
      );
      doc.fillColor(C.primaire).font('Helvetica-BoldOblique').fontSize(tailleCours)
        .text(texteCours, 0, LAYOUT.yTitreCours, { align: 'center', width: L, lineBreak: false });

      // ---------- 10. SCEAU ----------
      const sceauX = centreX;
      const sceauY = H - LAYOUT.sceauOffsetBasPage;
      const rExt = LAYOUT.sceauRayon;

      doc.save();
      doc.translate(sceauX - 22, sceauY + 30).rotate(12);
      doc.moveTo(0, 0).lineTo(20, 0).lineTo(10, 48).closePath().fill(C.or);
      doc.restore();

      doc.save();
      doc.translate(sceauX + 2, sceauY + 30).rotate(-12);
      doc.moveTo(0, 0).lineTo(20, 0).lineTo(10, 48).closePath().fill(C.orFonce);
      doc.restore();

      doc.circle(sceauX, sceauY, rExt).lineWidth(3).strokeColor(C.or).stroke();
      doc.circle(sceauX, sceauY, rExt - 7).fill(C.primaire);
      doc.circle(sceauX, sceauY, rExt - 13).lineWidth(0.6).strokeColor(C.orClair).stroke();

      doc.fillColor('#ffffff').font('Helvetica-Bold').fontSize(8)
        .text('CERTIFIÉ', sceauX - 40, sceauY - 20, { width: 80, align: 'center', characterSpacing: 2 });
      doc.fillColor(C.orClair).font('Helvetica-Bold').fontSize(26)
        .text('✓', sceauX - 40, sceauY - 8, { width: 80, align: 'center' });
      doc.fillColor('#ffffff').font('Helvetica-Bold').fontSize(7)
        .text('CONFORME', sceauX - 40, sceauY + 22, { width: 80, align: 'center', characterSpacing: 1 });

      // ---------- 11. DATE (gauche) / SIGNATURE (droite) ----------
      const yPied = H - LAYOUT.piedOffsetBasPage;

      doc.fillColor(C.texteGris).font('Helvetica-Bold').fontSize(9)
        .text('DATE DE DÉLIVRANCE', 90, yPied - 18, { width: 190, align: 'center', characterSpacing: 1.5 });
      doc.fillColor(C.texteFonce).font('Helvetica-Bold').fontSize(12)
        .text(dateFormatee, 90, yPied + 2, { width: 190, align: 'center' });
      doc.moveTo(110, yPied + 24).lineTo(260, yPied + 24).lineWidth(0.6).strokeColor(C.texteTresGris).stroke();
      doc.fillColor(C.texteTresGris).font('Helvetica-Oblique').fontSize(8)
        .text('Fait à Antananarivo', 90, yPied + 28, { width: 190, align: 'center' });

      const xSig = L - 280;
      doc.fillColor(C.texteGris).font('Helvetica-Bold').fontSize(9)
        .text('LE RESPONSABLE PÉDAGOGIQUE', xSig, yPied - 18, { width: 200, align: 'center', characterSpacing: 1.5 });
      doc.fillColor(C.primaireFonce).font('Helvetica-BoldOblique').fontSize(18)
        .text('Mr Randriamananjara', xSig, yPied - 2, { width: 200, align: 'center' });
      doc.moveTo(xSig + 20, yPied + 24).lineTo(xSig + 180, yPied + 24).lineWidth(0.6).strokeColor(C.texteTresGris).stroke();
      doc.fillColor(C.texteTresGris).font('Helvetica-Oblique').fontSize(8)
        .text('Signature officielle', xSig, yPied + 28, { width: 200, align: 'center' });

      // ---------- 12. QR CODE (optionnel, remonté pour ne pas toucher le footer) ----------
      const finaliser = async () => {
        if (QRCode) {
          try {
            const urlVerification = `https://coursenligne.example/verifier/${enrollmentId}`;
            const qrDataUrl = await QRCode.toDataURL(urlVerification, {
              margin: 0,
              width: 200,
              color: { dark: C.primaireFonce, light: '#ffffff' },
            });
            const qrBuffer = Buffer.from(qrDataUrl.split(',')[1], 'base64');
            const qrY = H - LAYOUT.qrOffsetBasPage;

            doc.image(qrBuffer, LAYOUT.qrMargeGauche, qrY, {
              width: LAYOUT.qrTaille, height: LAYOUT.qrTaille,
            });
            doc.fillColor(C.texteTresGris).font('Helvetica').fontSize(6.5)
              .text('Scannez pour vérifier', LAYOUT.qrMargeGauche - 14, qrY + LAYOUT.qrTaille + 3, {
                width: LAYOUT.qrTaille + 28, align: 'center',
              });
          } catch (e) {
            console.warn('[certificat] Échec QR :', e.message);
          }
        }

        // ---------- 13. FOOTER (bien séparé, en-dessous de tout le reste) ----------
        doc.fillColor(C.texteTresGris).font('Helvetica').fontSize(7)
          .text(`N° de certificat : ${numero}   •   ID : ${enrollmentId}`, 0, H - LAYOUT.footerOffsetBasPage, {
            align: 'center', width: L, characterSpacing: 0.5,
          });

        doc.end();
      };

      finaliser().catch(reject);

      stream.on('finish', () => resolve(`/uploads/certificats/${nomFichier}`));
      stream.on('error', reject);
    } catch (erreurSync) {
      reject(erreurSync); // capture aussi les erreurs survenues avant le flux asynchrone
    }
  });
}

module.exports = { genererCertificat };
import 'package:flutter/material.dart';

import '../theme/couleurs.dart';

// Un encadré coloré avec une icône et un texte.
// On l'utilise pour les messages importants :
// « Cette application ne remplace pas un médecin », « Quand consulter », etc.
//
// Exemple d'utilisation :
//   const Encadre(icone: Icons.info_outline, texte: 'Mon message')
class Encadre extends StatelessWidget {
  const Encadre({
    super.key,
    required this.icone,
    required this.texte,
    this.titre,
    this.fond = Couleurs.poudre,
    this.couleur = Couleurs.prune,
  });

  final IconData icone;
  final String texte;
  final String? titre; // le titre est facultatif (le « ? » veut dire « peut être vide »)
  final Color fond;
  final Color couleur;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: fond,
        borderRadius: BorderRadius.circular(14),
      ),
      // Row = les éléments sont placés côte à côte (icône à gauche, texte à droite)
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Icon(icone, color: couleur, size: 22),
          const SizedBox(width: 12),
          // Expanded = le texte prend toute la place restante et passe à la ligne
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                if (titre != null) ...[
                  Text(titre!, style: TextStyle(fontWeight: FontWeight.w700, color: couleur, fontSize: 15)),
                  const SizedBox(height: 4),
                ],
                Text(texte, style: TextStyle(color: couleur, fontSize: 14, height: 1.45)),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

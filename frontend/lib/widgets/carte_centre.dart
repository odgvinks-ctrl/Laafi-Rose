import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

import '../models/centre_sante.dart';
import '../theme/couleurs.dart';

// Une carte qui présente un centre de santé dans la liste.
class CarteCentre extends StatelessWidget {
  const CarteCentre({super.key, required this.centre});

  final CentreSante centre;

  @override
  Widget build(BuildContext context) {
    final textes = Theme.of(context).textTheme;

    // On construit le texte du lieu : « Quartier, Ville »
    // where(...) enlève les valeurs vides, join(', ') les colle avec une virgule
    final lieu = [centre.quartier, centre.ville].where((t) => t != null && t.isNotEmpty).join(', ');

    return Card(
      elevation: 0,
      color: Couleurs.blanc,
      margin: const EdgeInsets.only(bottom: 12),
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(16),
        side: const BorderSide(color: Couleurs.ligne),
      ),
      child: InkWell(
        borderRadius: BorderRadius.circular(16),
        onTap: () => context.push('/centre/${centre.id}'),
        child: Padding(
          padding: const EdgeInsets.all(16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                children: [
                  Expanded(child: Text(centre.nom, style: textes.titleMedium)),
                  // La distance n'existe que si la localisation est activée
                  if (centre.distanceKm != null)
                    Text('${centre.distanceKm!.toStringAsFixed(1)} km', style: textes.bodySmall),
                ],
              ),
              if (centre.type != null) Text(centre.type!, style: textes.bodySmall),
              if (lieu.isNotEmpty) ...[
                const SizedBox(height: 6),
                Row(
                  children: [
                    const Icon(Icons.place_outlined, size: 16, color: Couleurs.gris),
                    const SizedBox(width: 4),
                    Expanded(child: Text(lieu, style: textes.bodyMedium)),
                  ],
                ),
              ],
              const SizedBox(height: 10),
              // Wrap = comme une Row, mais passe à la ligne s'il n'y a plus de place
              Wrap(
                spacing: 8,
                runSpacing: 8,
                children: [
                  if (centre.verifie)
                    const Etiquette(texte: 'Infos vérifiées', icone: Icons.verified_outlined, fond: Couleurs.vertFond, couleur: Couleurs.vert)
                  else
                    const Etiquette(texte: 'Infos à vérifier', icone: Icons.help_outline, fond: Couleurs.ambreFond, couleur: Couleurs.ambre),
                  if (centre.rendezVous)
                    const Etiquette(texte: 'Rendez-vous', icone: Icons.event_available, fond: Couleurs.poudre, couleur: Couleurs.roseFonce),
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }
}

// Une petite étiquette arrondie (icône + texte).
// Elle est publique (pas de « _ » devant) pour être réutilisée dans d'autres écrans.
class Etiquette extends StatelessWidget {
  const Etiquette({super.key, required this.texte, required this.icone, required this.fond, required this.couleur});

  final String texte;
  final IconData icone;
  final Color fond;
  final Color couleur;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
      decoration: BoxDecoration(color: fond, borderRadius: BorderRadius.circular(20)),
      child: Row(
        // mainAxisSize.min = la Row prend juste la place de son contenu
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(icone, size: 14, color: couleur),
          const SizedBox(width: 4),
          Text(texte, style: TextStyle(fontSize: 12, fontWeight: FontWeight.w700, color: couleur)),
        ],
      ),
    );
  }
}

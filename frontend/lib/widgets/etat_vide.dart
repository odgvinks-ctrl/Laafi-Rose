import 'package:flutter/material.dart';

import '../theme/couleurs.dart';

class EtatVide extends StatelessWidget {
  const EtatVide({super.key, required this.icone, required this.titre, this.texte, this.action});

  final IconData icone;
  final String titre;
  final String? texte;
  final Widget? action;

  @override
  Widget build(BuildContext context) {
    final textes = Theme.of(context).textTheme;
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 32, horizontal: 8),
      child: Column(
        children: [
          CircleAvatar(radius: 28, backgroundColor: Couleurs.sable, child: Icon(icone, color: Couleurs.gris)),
          const SizedBox(height: 12),
          Text(titre, style: textes.titleLarge, textAlign: TextAlign.center),
          if (texte != null) ...[
            const SizedBox(height: 8),
            Text(texte!, style: textes.bodyMedium, textAlign: TextAlign.center),
          ],
          if (action != null) ...[const SizedBox(height: 16), action!],
        ],
      ),
    );
  }
}

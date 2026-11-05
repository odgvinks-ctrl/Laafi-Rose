import 'package:flutter/material.dart';

class PageSquelette extends StatelessWidget {
  const PageSquelette({super.key, required this.titre, this.sousTitre, this.enfants = const [], this.enTete});

  final String titre;
  final String? sousTitre;
  final List<Widget> enfants;
  final Widget? enTete;

  @override
  Widget build(BuildContext context) {
    final textes = Theme.of(context).textTheme;
    return ListView(
      padding: const EdgeInsets.fromLTRB(20, 12, 20, 32),
      children: [
        if (enTete != null) enTete!,
        Text(titre, style: textes.headlineMedium),
        if (sousTitre != null) ...[
          const SizedBox(height: 8),
          Text(sousTitre!, style: textes.bodyMedium),
        ],
        const SizedBox(height: 20),
        ...enfants,
      ],
    );
  }
}

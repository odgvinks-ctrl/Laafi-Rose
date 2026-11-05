import 'package:flutter/material.dart';

import '../widgets/page_squelette.dart';

class EcranEcouter extends StatelessWidget {
  const EcranEcouter({super.key, required this.slug});

  final String slug;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(backgroundColor: Theme.of(context).scaffoldBackgroundColor),
      body: const PageSquelette(
        titre: 'Écouter',
        sousTitre: 'Le texte reste affiché en français pendant l\'écoute.',
      ),
    );
  }
}

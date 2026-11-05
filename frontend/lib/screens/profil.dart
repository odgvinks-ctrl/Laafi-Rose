import 'package:flutter/material.dart';

import '../widgets/page_squelette.dart';

class EcranProfil extends StatelessWidget {
  const EcranProfil({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(backgroundColor: Theme.of(context).scaffoldBackgroundColor),
      body: const PageSquelette(
        titre: 'Profil et préférences',
        sousTitre: 'Langue, taille du texte, confidentialité.',
      ),
    );
  }
}

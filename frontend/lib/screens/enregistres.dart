import 'package:flutter/material.dart';

import '../widgets/page_squelette.dart';

class EcranEnregistres extends StatelessWidget {
  const EcranEnregistres({super.key});

  @override
  Widget build(BuildContext context) {
    return const PageSquelette(
      titre: 'Enregistrés',
      sousTitre: 'Consultables sans connexion internet.',
    );
  }
}

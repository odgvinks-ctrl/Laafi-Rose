import 'package:flutter/material.dart';

import '../widgets/page_squelette.dart';
import '../widgets/en_tete_laafi.dart';

class EcranAccueil extends StatelessWidget {
  const EcranAccueil({super.key});

  @override
  Widget build(BuildContext context) {
    return const PageSquelette(
      titre: 'Prendre soin de soi commence par s\'informer.',
      sousTitre: 'Recherchez un cancer, un signe ou un centre de santé.',
      enTete: EnTeteLaafi(),
    );
  }
}

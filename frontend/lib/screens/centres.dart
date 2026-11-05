import 'package:flutter/material.dart';

import '../widgets/page_squelette.dart';

class EcranCentres extends StatelessWidget {
  const EcranCentres({super.key});

  @override
  Widget build(BuildContext context) {
    return const PageSquelette(
      titre: 'Centres de santé',
      sousTitre: 'Trouvez un centre de dépistage ou de soins près de chez vous.',
    );
  }
}

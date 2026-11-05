import 'package:flutter/material.dart';

import '../widgets/page_squelette.dart';

class EcranAssistant extends StatelessWidget {
  const EcranAssistant({super.key});

  @override
  Widget build(BuildContext context) {
    return const PageSquelette(
      titre: 'Assistant',
      sousTitre: 'Informations générales · ne remplace pas un soignant.',
    );
  }
}

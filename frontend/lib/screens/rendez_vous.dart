import 'package:flutter/material.dart';

import '../widgets/page_squelette.dart';

class EcranRendezVous extends StatelessWidget {
  const EcranRendezVous({super.key, required this.centreId});

  final int centreId;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(backgroundColor: Theme.of(context).scaffoldBackgroundColor),
      body: const PageSquelette(
        titre: 'Demande de rendez-vous',
        sousTitre: 'Aucune information médicale ne vous sera demandée.',
      ),
    );
  }
}

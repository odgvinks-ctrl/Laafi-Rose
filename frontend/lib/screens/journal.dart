import 'package:flutter/material.dart';

import '../widgets/page_squelette.dart';

class EcranJournal extends StatelessWidget {
  const EcranJournal({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(backgroundColor: Theme.of(context).scaffoldBackgroundColor),
      body: const PageSquelette(
        titre: 'Mon journal',
        sousTitre: 'Notez comment vous vous sentez. Ces notes restent sur votre téléphone.',
      ),
    );
  }
}

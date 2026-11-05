import 'package:flutter/material.dart';

import '../widgets/page_squelette.dart';

class EcranQuestionnaire extends StatelessWidget {
  const EcranQuestionnaire({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(backgroundColor: Theme.of(context).scaffoldBackgroundColor),
      body: const PageSquelette(
        titre: 'Vrai ou faux ? Testez ce que vous savez.',
        sousTitre: 'Ce questionnaire informe. Il n\'évalue pas votre état de santé.',
      ),
    );
  }
}

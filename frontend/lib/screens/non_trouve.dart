import 'package:flutter/material.dart';

import '../widgets/page_squelette.dart';

class EcranNonTrouve extends StatelessWidget {
  const EcranNonTrouve({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(backgroundColor: Theme.of(context).scaffoldBackgroundColor),
      body: const PageSquelette(
        titre: 'Cette page n\'existe pas',
        sousTitre: 'Le lien est peut-être incorrect, ou la page a été déplacée.',
      ),
    );
  }
}

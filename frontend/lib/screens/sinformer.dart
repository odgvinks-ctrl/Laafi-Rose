import 'package:flutter/material.dart';

import '../widgets/page_squelette.dart';

class EcranSinformer extends StatelessWidget {
  const EcranSinformer({super.key});

  @override
  Widget build(BuildContext context) {
    return const PageSquelette(
      titre: 'S\'informer',
      sousTitre: 'Les cancers, les facteurs de risque et les dépistages possibles.',
    );
  }
}

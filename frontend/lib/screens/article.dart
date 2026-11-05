import 'package:flutter/material.dart';

import '../widgets/page_squelette.dart';

class EcranArticle extends StatelessWidget {
  const EcranArticle({super.key, required this.slug});

  final String slug;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(backgroundColor: Theme.of(context).scaffoldBackgroundColor),
      body: const PageSquelette(
        titre: 'Fiche',
      ),
    );
  }
}

import 'package:flutter/material.dart';

import '../widgets/page_squelette.dart';

class EcranCentreDetail extends StatelessWidget {
  const EcranCentreDetail({super.key, required this.id});

  final int id;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(backgroundColor: Theme.of(context).scaffoldBackgroundColor),
      body: const PageSquelette(
        titre: 'Fiche du centre',
      ),
    );
  }
}

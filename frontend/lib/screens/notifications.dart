import 'package:flutter/material.dart';

import '../widgets/page_squelette.dart';

class EcranNotifications extends StatelessWidget {
  const EcranNotifications({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(backgroundColor: Theme.of(context).scaffoldBackgroundColor),
      body: const PageSquelette(
        titre: 'Notifications',
      ),
    );
  }
}

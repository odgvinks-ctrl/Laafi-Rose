import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

import '../theme/couleurs.dart';
import 'logo_laafi.dart';

class EnTeteLaafi extends StatelessWidget {
  const EnTeteLaafi({super.key});

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.fromLTRB(20, 8, 8, 8),
      child: Row(
        children: [
          const LogoLaafi(),
          const Spacer(),
          IconButton(
            tooltip: 'Notifications',
            onPressed: () => context.push('/notifications'),
            icon: const Icon(Icons.notifications_none, color: Couleurs.prune),
          ),
          IconButton(
            tooltip: 'Profil et préférences',
            onPressed: () => context.push('/profil'),
            icon: const Icon(Icons.account_circle_outlined, color: Couleurs.prune),
          ),
        ],
      ),
    );
  }
}

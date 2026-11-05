import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:provider/provider.dart';

import '../state/preferences.dart';
import '../widgets/logo_laafi.dart';

class EcranBienvenue extends StatelessWidget {
  const EcranBienvenue({super.key});

  Future<void> _commencer(BuildContext context) async {
    await context.read<Preferences>().marquerIntroVue();
    if (context.mounted) context.go('/');
  }

  @override
  Widget build(BuildContext context) {
    final textes = Theme.of(context).textTheme;
    return Scaffold(
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.all(20),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                children: [
                  const LogoLaafi(),
                  const Spacer(),
                  TextButton(onPressed: () => _commencer(context), child: const Text('Passer')),
                ],
              ),
              const Spacer(),
              Text('Comprendre les cancers, simplement.', style: textes.headlineMedium),
              const SizedBox(height: 10),
              Text(
                'Des fiches claires, en français, en mooré et en dioula, pour savoir quels signes doivent amener à consulter.',
                style: textes.bodyLarge,
              ),
              const SizedBox(height: 24),
              SizedBox(
                width: double.infinity,
                child: FilledButton(onPressed: () => _commencer(context), child: const Text('Commencer')),
              ),
              const SizedBox(height: 8),
              Center(child: Text("Aucun compte n'est nécessaire pour utiliser l'application.", style: textes.bodySmall)),
            ],
          ),
        ),
      ),
    );
  }
}

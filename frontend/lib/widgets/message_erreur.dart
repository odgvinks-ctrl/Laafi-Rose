import 'package:flutter/material.dart';

import '../theme/couleurs.dart';

// Affiche un message d'erreur avec un bouton « Réessayer ».
// [surReessayer] est la fonction appelée quand on appuie sur le bouton.
class MessageErreur extends StatelessWidget {
  const MessageErreur({super.key, required this.message, this.surReessayer});

  final String message;
  final VoidCallback? surReessayer; // VoidCallback = une fonction sans paramètre

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 24),
      child: Column(
        children: [
          const Icon(Icons.cloud_off, color: Couleurs.gris, size: 36),
          const SizedBox(height: 12),
          Text(message, textAlign: TextAlign.center, style: Theme.of(context).textTheme.bodyMedium),
          // On affiche le bouton seulement si une fonction a été donnée
          if (surReessayer != null) ...[
            const SizedBox(height: 12),
            OutlinedButton.icon(
              onPressed: surReessayer,
              icon: const Icon(Icons.refresh),
              label: const Text('Réessayer'),
            ),
          ],
        ],
      ),
    );
  }
}

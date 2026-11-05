import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../core/reseau/etat_connexion.dart';
import '../theme/couleurs.dart';

class BandeHorsConnexion extends StatelessWidget {
  const BandeHorsConnexion({super.key});

  @override
  Widget build(BuildContext context) {
    if (context.watch<EtatConnexion>().enLigne) return const SizedBox.shrink();
    return Semantics(
      liveRegion: true,
      child: Container(
        width: double.infinity,
        color: Couleurs.prune,
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
        child: const Row(
          children: [
            Icon(Icons.wifi_off, size: 16, color: Couleurs.fond),
            SizedBox(width: 8),
            Expanded(
              child: Text('Hors connexion · contenus enregistrés disponibles', style: TextStyle(color: Couleurs.fond, fontSize: 13)),
            ),
          ],
        ),
      ),
    );
  }
}

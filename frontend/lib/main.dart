import 'package:flutter/material.dart';

import 'app.dart';
import 'config.dart';
import 'core/api/client_api.dart';
import 'core/api/stockage_jeton.dart';
import 'core/reseau/etat_connexion.dart';
import 'data/depots.dart';
import 'state/preferences.dart';
import 'state/session.dart';

Future<void> main() async {
  WidgetsFlutterBinding.ensureInitialized();

  final jeton = StockageJeton();
  final depots = Depots(
    backend: ClientApi(base: Config.apiBackend, jeton: jeton),
    ia: ClientApi(base: Config.apiIa, jeton: jeton),
    jeton: jeton,
  );
  final preferences = await Preferences.charger();
  final session = Session(depots.auth);
  final connexion = EtatConnexion();
  await connexion.ecouter();
  await session.restaurer();
  depots.articles.synchroniser().catchError((_) => 0);

  runApp(LaafiRose(depots: depots, preferences: preferences, session: session, connexion: connexion));
}

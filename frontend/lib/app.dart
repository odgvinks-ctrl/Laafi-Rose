import 'package:flutter/material.dart';
import 'package:flutter_localizations/flutter_localizations.dart';
import 'package:go_router/go_router.dart';
import 'package:provider/provider.dart';

import 'core/reseau/etat_connexion.dart';
import 'data/depots.dart';
import 'routes/routeur.dart';
import 'state/preferences.dart';
import 'state/session.dart';
import 'theme/theme.dart';

class LaafiRose extends StatefulWidget {
  const LaafiRose({super.key, required this.depots, required this.preferences, required this.session, required this.connexion});

  final Depots depots;
  final Preferences preferences;
  final Session session;
  final EtatConnexion connexion;

  @override
  State<LaafiRose> createState() => _LaafiRoseState();
}

class _LaafiRoseState extends State<LaafiRose> {
  late final GoRouter _routeur = construireRouteur(widget.preferences);

  @override
  Widget build(BuildContext context) {
    return MultiProvider(
      providers: [
        Provider<Depots>.value(value: widget.depots),
        ChangeNotifierProvider<Preferences>.value(value: widget.preferences),
        ChangeNotifierProvider<Session>.value(value: widget.session),
        ChangeNotifierProvider<EtatConnexion>.value(value: widget.connexion),
      ],
      child: Consumer<Preferences>(
        builder: (context, preferences, _) => MaterialApp.router(
          title: 'Laafi Rose',
          debugShowCheckedModeBanner: false,
          theme: construireTheme(),
          routerConfig: _routeur,
          locale: const Locale('fr'),
          supportedLocales: const [Locale('fr')],
          localizationsDelegates: const [
            GlobalMaterialLocalizations.delegate,
            GlobalWidgetsLocalizations.delegate,
            GlobalCupertinoLocalizations.delegate,
          ],
          builder: (context, child) => MediaQuery(
            data: MediaQuery.of(context).copyWith(textScaler: TextScaler.linear(preferences.echelleTexte)),
            child: child!,
          ),
        ),
      ),
    );
  }
}

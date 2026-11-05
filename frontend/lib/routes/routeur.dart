import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

import '../screens/accueil.dart';
import '../screens/article.dart';
import '../screens/assistant.dart';
import '../screens/bienvenue.dart';
import '../screens/centre_detail.dart';
import '../screens/centres.dart';
import '../screens/connexion.dart';
import '../screens/ecouter.dart';
import '../screens/enregistres.dart';
import '../screens/journal.dart';
import '../screens/non_trouve.dart';
import '../screens/notifications.dart';
import '../screens/profil.dart';
import '../screens/questionnaire.dart';
import '../screens/rendez_vous.dart';
import '../screens/sinformer.dart';
import '../state/preferences.dart';
import '../widgets/coquille_navigation.dart';

final _racine = GlobalKey<NavigatorState>();

GoRouter construireRouteur(Preferences preferences) {
  return GoRouter(
    navigatorKey: _racine,
    initialLocation: '/',
    refreshListenable: preferences,
    redirect: (context, state) {
      final versIntro = state.matchedLocation == '/bienvenue';
      if (!preferences.introVue && !versIntro) return '/bienvenue';
      if (preferences.introVue && versIntro) return '/';
      return null;
    },
    errorBuilder: (context, state) => const EcranNonTrouve(),
    routes: [
      GoRoute(path: '/bienvenue', builder: (context, state) => const EcranBienvenue()),
      GoRoute(path: '/connexion', builder: (context, state) => const EcranConnexion()),
      StatefulShellRoute.indexedStack(
        builder: (context, state, shell) => CoquilleNavigation(shell: shell),
        branches: [
          StatefulShellBranch(routes: [GoRoute(path: '/', builder: (context, state) => const EcranAccueil())]),
          StatefulShellBranch(routes: [GoRoute(path: '/sinformer', builder: (context, state) => const EcranSinformer())]),
          StatefulShellBranch(routes: [GoRoute(path: '/centres', builder: (context, state) => const EcranCentres())]),
          StatefulShellBranch(routes: [GoRoute(path: '/assistant', builder: (context, state) => const EcranAssistant())]),
          StatefulShellBranch(routes: [GoRoute(path: '/enregistres', builder: (context, state) => const EcranEnregistres())]),
        ],
      ),
      GoRoute(path: '/article/:slug', builder: (context, state) => EcranArticle(slug: state.pathParameters['slug']!)),
      GoRoute(path: '/ecouter/:slug', builder: (context, state) => EcranEcouter(slug: state.pathParameters['slug']!)),
      GoRoute(path: '/questionnaire', builder: (context, state) => const EcranQuestionnaire()),
      GoRoute(
        path: '/centre/:id',
        builder: (context, state) => EcranCentreDetail(id: int.parse(state.pathParameters['id']!)),
        routes: [
          GoRoute(path: 'rendez-vous', builder: (context, state) => EcranRendezVous(centreId: int.parse(state.pathParameters['id']!))),
        ],
      ),
      GoRoute(path: '/journal', builder: (context, state) => const EcranJournal()),
      GoRoute(path: '/profil', builder: (context, state) => const EcranProfil()),
      GoRoute(path: '/notifications', builder: (context, state) => const EcranNotifications()),
    ],
  );
}

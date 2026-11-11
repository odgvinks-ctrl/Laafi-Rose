import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:provider/provider.dart';

import '../data/depots.dart';
import '../models/article.dart';
import '../theme/couleurs.dart';
import '../theme/theme.dart';
import '../widgets/carte_article.dart';
import '../widgets/en_tete_laafi.dart';
import '../widgets/encadre.dart';

// ÉCRAN D'ACCUEIL
//
// C'est un StatefulWidget : un écran qui a un « état » (des données qui changent).
// Ici, l'état c'est la liste des fiches, qu'on charge au démarrage.
class EcranAccueil extends StatefulWidget {
  const EcranAccueil({super.key});

  @override
  State<EcranAccueil> createState() => _EcranAccueilState();
}

class _EcranAccueilState extends State<EcranAccueil> {
  // Les variables de l'état
  List<Article> _articles = [];
  bool _chargement = true;

  // initState est appelé UNE seule fois, quand l'écran s'ouvre.
  // C'est le bon endroit pour charger les données.
  @override
  void initState() {
    super.initState();
    _charger();
  }

  // Charge les fiches enregistrées dans le téléphone (base SQLite locale).
  // « async » + « await » = on attend la réponse sans bloquer l'écran.
  Future<void> _charger() async {
    // context.read<Depots>() récupère l'objet Depots fourni dans app.dart
    final articles = await context.read<Depots>().articles.lister();

    // Si l'écran a été fermé entre-temps, on s'arrête
    if (!mounted) return;

    // setState dit à Flutter : « les données ont changé, redessine l'écran »
    setState(() {
      _articles = articles;
      _chargement = false;
    });
  }

  // Appelée quand on tire l'écran vers le bas : on récupère les nouvelles fiches
  // depuis le serveur, puis on recharge la liste.
  Future<void> _actualiser() async {
    final depots = context.read<Depots>();
    try {
      await depots.articles.synchroniser();
    } catch (_) {
      // Pas de réseau : ce n'est pas grave, on garde les fiches déjà enregistrées
    }
    await _charger();
  }

  // Quand on valide la recherche, on va sur l'onglet « S'informer » avec le mot cherché
  void _rechercher(String texte) {
    if (texte.trim().isEmpty) return;
    context.go('/sinformer?q=${Uri.encodeComponent(texte.trim())}');
  }

  @override
  Widget build(BuildContext context) {
    final textes = Theme.of(context).textTheme;

    // On cherche la fiche « cancer du sein » pour la mettre à la une.
    // Si elle n'existe pas, on prend la première fiche (ou rien).
    Article? aLaUne;
    for (final a in _articles) {
      if (a.slug == 'cancer-du-sein') aLaUne = a;
    }
    aLaUne ??= _articles.isEmpty ? null : _articles.first;

    // RefreshIndicator = « tirer pour actualiser »
    return RefreshIndicator(
      onRefresh: _actualiser,
      child: ListView(
        padding: const EdgeInsets.only(bottom: 32),
        children: [
          const EnTeteLaafi(),
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 20),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const SizedBox(height: 8),
                Text("Prendre soin de soi commence par s'informer.", style: textes.headlineMedium),
                const SizedBox(height: 8),
                Text('Recherchez un cancer, un signe ou un centre de santé.', style: textes.bodyMedium),
                const SizedBox(height: 16),

                // Le champ de recherche
                TextField(
                  textInputAction: TextInputAction.search,
                  onSubmitted: _rechercher,
                  decoration: decorationChamp('Rechercher').copyWith(
                    prefixIcon: const Icon(Icons.search),
                    hintText: 'Ex. : sein, col, dépistage…',
                  ),
                ),
                const SizedBox(height: 16),

                // Le grand bouton pour trouver un centre
                const _CarteCentres(),
                const SizedBox(height: 24),

                // La fiche à la une
                if (aLaUne != null) ...[
                  Text('À LA UNE', style: textes.labelSmall),
                  const SizedBox(height: 8),
                  CarteArticle(article: aLaUne),
                  const SizedBox(height: 12),
                ],

                // Les raccourcis
                Text('ACCÈS RAPIDE', style: textes.labelSmall),
                const SizedBox(height: 8),
                // GridView.count = une grille avec 2 colonnes
                GridView.count(
                  crossAxisCount: 2,
                  crossAxisSpacing: 12,
                  mainAxisSpacing: 12,
                  childAspectRatio: 1.5,
                  // Ces 2 lignes sont obligatoires pour une grille DANS une ListView
                  shrinkWrap: true,
                  physics: const NeverScrollableScrollPhysics(),
                  children: const [
                    _Raccourci(icone: Icons.quiz_outlined, titre: 'Tester mes connaissances', chemin: '/questionnaire'),
                    _Raccourci(icone: Icons.edit_note, titre: 'Mon journal', chemin: '/journal'),
                    _Raccourci(icone: Icons.chat_bubble_outline, titre: 'Poser une question', chemin: '/assistant', onglet: true),
                    _Raccourci(icone: Icons.download_outlined, titre: 'Mes contenus enregistrés', chemin: '/enregistres', onglet: true),
                  ],
                ),
                const SizedBox(height: 24),

                // La liste des fiches
                Text('FICHES PRINCIPALES', style: textes.labelSmall),
                const SizedBox(height: 8),
                if (_chargement)
                  const Center(child: Padding(padding: EdgeInsets.all(24), child: CircularProgressIndicator()))
                else if (_articles.isEmpty)
                  Text(
                    "Aucune fiche n'est encore enregistrée sur ce téléphone. Tirez l'écran vers le bas pour les télécharger.",
                    style: textes.bodyMedium,
                  )
                else
                  // take(4) = on prend seulement les 4 premières fiches
                  // map(...) transforme chaque Article en widget CarteArticle
                  ..._articles.take(4).map((a) => CarteArticle(article: a)),

                const SizedBox(height: 16),
                const Encadre(
                  icone: Icons.medical_services_outlined,
                  texte: 'Laafi Rose vous informe et vous oriente. Elle ne remplace jamais un médecin : en cas de doute, consultez un soignant.',
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

// Le bloc rose « Trouver un centre de santé ».
// Les widgets qui commencent par « _ » sont privés : utilisés seulement dans ce fichier.
class _CarteCentres extends StatelessWidget {
  const _CarteCentres();

  @override
  Widget build(BuildContext context) {
    return Material(
      color: Couleurs.rose,
      borderRadius: BorderRadius.circular(16),
      child: InkWell(
        borderRadius: BorderRadius.circular(16),
        // context.go change d'onglet (au lieu d'empiler un écran)
        onTap: () => context.go('/centres'),
        child: const Padding(
          padding: EdgeInsets.all(18),
          child: Row(
            children: [
              Icon(Icons.place, color: Couleurs.blanc, size: 28),
              SizedBox(width: 14),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      'Trouver un centre de santé',
                      style: TextStyle(color: Couleurs.blanc, fontSize: 17, fontWeight: FontWeight.w700),
                    ),
                    SizedBox(height: 2),
                    Text('Dépistage, consultation, rendez-vous', style: TextStyle(color: Couleurs.poudre, fontSize: 14)),
                  ],
                ),
              ),
              Icon(Icons.chevron_right, color: Couleurs.blanc),
            ],
          ),
        ),
      ),
    );
  }
}

// Une case de la grille des raccourcis.
// [onglet] = true si la destination est un onglet du bas (on utilise go),
// sinon on ouvre un écran par-dessus (push).
class _Raccourci extends StatelessWidget {
  const _Raccourci({required this.icone, required this.titre, required this.chemin, this.onglet = false});

  final IconData icone;
  final String titre;
  final String chemin;
  final bool onglet;

  @override
  Widget build(BuildContext context) {
    return Material(
      color: Couleurs.blanc,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(16),
        side: const BorderSide(color: Couleurs.ligne),
      ),
      child: InkWell(
        borderRadius: BorderRadius.circular(16),
        onTap: () {
          if (onglet) {
            context.go(chemin);
          } else {
            context.push(chemin);
          }
        },
        child: Padding(
          padding: const EdgeInsets.all(14),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Icon(icone, color: Couleurs.roseFonce),
              Text(titre, style: const TextStyle(fontWeight: FontWeight.w700, color: Couleurs.prune, fontSize: 14)),
            ],
          ),
        ),
      ),
    );
  }
}

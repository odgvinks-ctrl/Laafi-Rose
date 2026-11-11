import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:provider/provider.dart';

import '../data/categories.dart';
import '../data/depots.dart';
import '../models/article.dart';
import '../theme/couleurs.dart';
import '../theme/theme.dart';
import '../widgets/carte_article.dart';
import '../widgets/encadre.dart';

// ÉCRAN « S'INFORMER » : le catalogue des fiches.
// On peut filtrer par rubrique (les puces) et chercher un mot.
class EcranSinformer extends StatefulWidget {
  // [recherche] arrive quand on cherche depuis l'accueil (ex. /sinformer?q=sein)
  const EcranSinformer({super.key, this.recherche});

  final String? recherche;

  @override
  State<EcranSinformer> createState() => _EcranSinformerState();
}

class _EcranSinformerState extends State<EcranSinformer> {
  // Le contrôleur permet de lire et de modifier le texte du champ de recherche
  late final TextEditingController _champ = TextEditingController(text: widget.recherche ?? '');

  List<Article> _tous = []; // toutes les fiches de la rubrique choisie
  String? _categorie; // null = toutes les rubriques
  bool _chargement = true;

  @override
  void initState() {
    super.initState();
    _charger();
  }

  // dispose est appelé quand l'écran est détruit : on libère le contrôleur
  @override
  void dispose() {
    _champ.dispose();
    super.dispose();
  }

  Future<void> _charger() async {
    setState(() => _chargement = true);
    final articles = await context.read<Depots>().articles.lister(categorie: _categorie);
    if (!mounted) return;
    setState(() {
      _tous = articles;
      _chargement = false;
    });
  }

  Future<void> _actualiser() async {
    try {
      await context.read<Depots>().articles.synchroniser();
    } catch (_) {
      // Pas de réseau : on garde ce qu'on a
    }
    await _charger();
  }

  void _choisirCategorie(String? code) {
    _categorie = code;
    _charger();
  }

  // Enlève les accents et met en minuscules : « Dépistage » devient « depistage ».
  // Comme ça, chercher « depistage » trouve aussi « Dépistage ».
  String _simplifier(String texte) {
    const avec = 'àâäéèêëîïôöùûüç';
    const sans = 'aaaeeeeiioouuuc';
    var resultat = texte.toLowerCase();
    for (var i = 0; i < avec.length; i++) {
      resultat = resultat.replaceAll(avec[i], sans[i]);
    }
    return resultat;
  }

  // La liste filtrée par le texte cherché.
  // C'est un « getter » : il est recalculé à chaque fois qu'on l'utilise.
  List<Article> get _resultats {
    final mot = _simplifier(_champ.text.trim());
    if (mot.isEmpty) return _tous;
    return _tous.where((a) {
      final texte = _simplifier('${a.titre} ${a.resume ?? ''} ${a.contenu}');
      return texte.contains(mot);
    }).toList();
  }

  @override
  Widget build(BuildContext context) {
    final textes = Theme.of(context).textTheme;
    final resultats = _resultats;

    return RefreshIndicator(
      onRefresh: _actualiser,
      child: ListView(
        padding: const EdgeInsets.fromLTRB(20, 16, 20, 32),
        children: [
          Text("S'informer", style: textes.headlineMedium),
          const SizedBox(height: 6),
          Text('Les cancers, les facteurs de risque et les dépistages possibles.', style: textes.bodyMedium),
          const SizedBox(height: 16),

          // Champ de recherche : à chaque lettre tapée, on redessine (setState)
          TextField(
            controller: _champ,
            onChanged: (_) => setState(() {}),
            decoration: decorationChamp('Rechercher une fiche').copyWith(
              prefixIcon: const Icon(Icons.search),
              // Le bouton « x » apparaît seulement s'il y a du texte
              suffixIcon: _champ.text.isEmpty
                  ? null
                  : IconButton(
                      tooltip: 'Effacer',
                      icon: const Icon(Icons.close),
                      onPressed: () => setState(() => _champ.clear()),
                    ),
            ),
          ),
          const SizedBox(height: 12),

          // Les puces des rubriques, qu'on peut faire défiler horizontalement
          SingleChildScrollView(
            scrollDirection: Axis.horizontal,
            child: Row(
              children: [
                _Puce(texte: 'Tout', choisie: _categorie == null, surAppui: () => _choisirCategorie(null)),
                // On crée une puce pour chaque rubrique de categories.dart
                for (final entree in categoriesArticles.entries)
                  _Puce(
                    texte: entree.value,
                    choisie: _categorie == entree.key,
                    surAppui: () => _choisirCategorie(entree.key),
                  ),
              ],
            ),
          ),
          const SizedBox(height: 16),

          // Rappel spécial pour la rubrique « Facteurs de risque »
          if (_categorie == 'facteurs') ...[
            const Encadre(
              icone: Icons.info_outline,
              texte: "Un facteur de risque n'est pas une maladie. Il augmente un risque, il ne veut pas dire qu'un cancer va apparaître.",
            ),
            const SizedBox(height: 16),
          ],

          // Le contenu : chargement, aucun résultat, ou la liste
          if (_chargement)
            const Center(child: Padding(padding: EdgeInsets.all(32), child: CircularProgressIndicator()))
          else if (resultats.isEmpty)
            _AucunResultat(
              recherche: _champ.text,
              surEffacer: () => setState(() => _champ.clear()),
            )
          else ...[
            Text('${resultats.length} fiche(s)', style: textes.bodySmall),
            const SizedBox(height: 8),
            ...resultats.map((a) => CarteArticle(article: a)),
          ],
        ],
      ),
    );
  }
}

// Une puce de filtre (ex. « Dépistage »)
class _Puce extends StatelessWidget {
  const _Puce({required this.texte, required this.choisie, required this.surAppui});

  final String texte;
  final bool choisie;
  final VoidCallback surAppui;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(right: 8),
      // ChoiceChip = une puce qu'on peut sélectionner
      child: ChoiceChip(
        label: Text(texte),
        selected: choisie,
        onSelected: (_) => surAppui(),
        selectedColor: Couleurs.poudre,
        backgroundColor: Couleurs.blanc,
        side: BorderSide(color: choisie ? Couleurs.rose : Couleurs.ligneForte),
        labelStyle: TextStyle(
          color: choisie ? Couleurs.roseFonce : Couleurs.texte2,
          fontWeight: choisie ? FontWeight.w700 : FontWeight.w400,
        ),
      ),
    );
  }
}

// Ce qu'on affiche quand la recherche ne trouve rien
class _AucunResultat extends StatelessWidget {
  const _AucunResultat({required this.recherche, required this.surEffacer});

  final String recherche;
  final VoidCallback surEffacer;

  @override
  Widget build(BuildContext context) {
    final textes = Theme.of(context).textTheme;
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 24),
      child: Column(
        children: [
          const Icon(Icons.search_off, size: 40, color: Couleurs.gris),
          const SizedBox(height: 12),
          Text(
            recherche.isEmpty ? 'Aucune fiche dans cette rubrique pour le moment.' : 'Aucune fiche ne correspond à « $recherche ».',
            style: textes.titleMedium,
            textAlign: TextAlign.center,
          ),
          const SizedBox(height: 6),
          Text('Essayez un mot plus simple, par exemple « sein » ou « col ».', style: textes.bodyMedium, textAlign: TextAlign.center),
          const SizedBox(height: 16),
          FilledButton.icon(
            onPressed: () => context.go('/assistant'),
            icon: const Icon(Icons.chat_bubble_outline),
            label: const Text("Poser la question à l'assistant"),
          ),
          if (recherche.isNotEmpty) ...[
            const SizedBox(height: 8),
            TextButton(onPressed: surEffacer, child: const Text('Effacer la recherche')),
          ],
        ],
      ),
    );
  }
}

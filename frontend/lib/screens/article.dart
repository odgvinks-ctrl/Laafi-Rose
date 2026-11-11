import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:provider/provider.dart';

import '../data/categories.dart';
import '../data/depots.dart';
import '../data/langues.dart';
import '../models/article.dart';
import '../theme/couleurs.dart';
import '../widgets/encadre.dart';
import '../widgets/message_erreur.dart';

// ÉCRAN D'UNE FICHE (ex. « Cancer du sein »)
// [slug] est l'identifiant de la fiche dans l'adresse : /article/cancer-du-sein
class EcranArticle extends StatefulWidget {
  const EcranArticle({super.key, required this.slug});

  final String slug;

  @override
  State<EcranArticle> createState() => _EcranArticleState();
}

class _EcranArticleState extends State<EcranArticle> {
  Article? _article; // null tant que la fiche n'est pas chargée (ou introuvable)
  bool _chargement = true;
  bool _enregistre = false;

  @override
  void initState() {
    super.initState();
    _charger();
  }

  Future<void> _charger() async {
    setState(() => _chargement = true);
    // obtenir() cherche d'abord dans le téléphone, puis sur le serveur
    final article = await context.read<Depots>().articles.obtenir(widget.slug);
    if (!mounted) return;
    setState(() {
      _article = article;
      _enregistre = article?.enregistre ?? false;
      _chargement = false;
    });
  }

  // Ajoute ou retire la fiche des contenus enregistrés
  Future<void> _basculerEnregistrement() async {
    final nouvelleValeur = !_enregistre;
    await context.read<Depots>().articles.enregistrer(widget.slug, nouvelleValeur);
    if (!mounted) return;
    setState(() => _enregistre = nouvelleValeur);

    // Un petit message en bas de l'écran (SnackBar)
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(content: Text(nouvelleValeur ? 'Fiche enregistrée sur le téléphone' : 'Fiche retirée des enregistrés')),
    );
  }

  // Transforme une date en texte « 05/11/2026 »
  String _formaterDate(DateTime date) {
    final jour = date.day.toString().padLeft(2, '0');
    final mois = date.month.toString().padLeft(2, '0');
    return '$jour/$mois/${date.year}';
  }

  @override
  Widget build(BuildContext context) {
    // Scaffold = la structure de base d'un écran : barre du haut + contenu
    return Scaffold(
      appBar: AppBar(
        backgroundColor: Couleurs.fond,
        actions: [
          // Le bouton « enregistrer » n'apparaît que si la fiche est chargée
          if (_article != null)
            IconButton(
              tooltip: _enregistre ? 'Retirer des enregistrés' : 'Enregistrer',
              onPressed: _basculerEnregistrement,
              icon: Icon(_enregistre ? Icons.bookmark : Icons.bookmark_border, color: Couleurs.roseFonce),
            ),
        ],
      ),
      body: _construireContenu(),
    );
  }

  // On sépare le contenu dans une méthode pour que build() reste lisible
  Widget _construireContenu() {
    if (_chargement) {
      return const Center(child: CircularProgressIndicator());
    }

    final article = _article;
    if (article == null) {
      return ListView(
        padding: const EdgeInsets.all(20),
        children: [
          MessageErreur(
            message: "Cette fiche n'est pas enregistrée sur votre téléphone et le service est injoignable.",
            surReessayer: _charger,
          ),
          OutlinedButton(
            onPressed: () => context.go('/enregistres'),
            child: const Text('Voir les fiches disponibles hors connexion'),
          ),
        ],
      );
    }

    final textes = Theme.of(context).textTheme;

    // Le texte est découpé en paragraphes (séparés par une ligne vide)
    final paragraphes = article.contenu.split('\n\n');

    return ListView(
      padding: const EdgeInsets.fromLTRB(20, 4, 20, 40),
      children: [
        Text(libelleCategorie(article.categorie).toUpperCase(), style: textes.labelSmall),
        const SizedBox(height: 6),
        Text(article.titre, style: textes.headlineLarge),
        const SizedBox(height: 10),
        Text(
          '${article.lectureMinutes} min de lecture'
          '${article.reviseLe != null ? ' · Révisée le ${_formaterDate(article.reviseLe!)}' : ''}',
          style: textes.bodySmall,
        ),
        const SizedBox(height: 16),

        // Bouton d'écoute, si un audio existe
        if (article.audios.isNotEmpty) ...[
          OutlinedButton.icon(
            onPressed: () => context.push('/ecouter/${article.slug}'),
            icon: const Icon(Icons.headphones),
            // On liste les langues disponibles : « Français, Mooré »
            label: Text('Écouter · ${article.audios.keys.map((code) => langues[code] ?? code).join(', ')}'),
          ),
          const SizedBox(height: 16),
        ],

        if (article.resume != null) ...[
          Text(article.resume!, style: textes.titleMedium),
          const SizedBox(height: 16),
        ],

        // Chaque paragraphe devient un widget grâce à _Paragraphe
        for (final p in paragraphes) _Paragraphe(texte: p.trim()),

        const SizedBox(height: 8),
        const Encadre(
          icone: Icons.medical_services_outlined,
          titre: 'Quand consulter ?',
          texte: "Si un signe apparaît et dure plus de deux semaines, montrez-vous à un soignant. "
              "La plupart du temps, ce n'est pas un cancer, mais seul un examen permet de le savoir.",
        ),
        const SizedBox(height: 12),
        FilledButton.icon(
          onPressed: () => context.go('/centres'),
          icon: const Icon(Icons.place_outlined),
          label: const Text('Trouver un centre de santé'),
        ),

        // Les sources de la fiche
        if (article.sources.isNotEmpty) ...[
          const SizedBox(height: 28),
          Text('SOURCES', style: textes.labelSmall),
          const SizedBox(height: 8),
          for (final source in article.sources)
            Padding(
              padding: const EdgeInsets.only(bottom: 6),
              child: Text('• ${source.libelle}', style: textes.bodySmall),
            ),
        ],
      ],
    );
  }
}

// Affiche un paragraphe.
// Petite règle d'écriture des fiches :
//   - une ligne qui commence par « ## » est un sous-titre
//   - une ligne qui commence par « - » est un point de liste
class _Paragraphe extends StatelessWidget {
  const _Paragraphe({required this.texte});

  final String texte;

  @override
  Widget build(BuildContext context) {
    final textes = Theme.of(context).textTheme;

    if (texte.isEmpty) return const SizedBox.shrink();

    if (texte.startsWith('## ')) {
      return Padding(
        padding: const EdgeInsets.only(top: 8, bottom: 8),
        child: Text(texte.substring(3), style: textes.headlineSmall),
      );
    }

    // On découpe en lignes pour gérer les listes à puces
    final lignes = texte.split('\n');
    return Padding(
      padding: const EdgeInsets.only(bottom: 14),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          for (final ligne in lignes)
            if (ligne.startsWith('- '))
              Padding(
                padding: const EdgeInsets.only(left: 4, bottom: 4),
                child: Row(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Text('•  ', style: TextStyle(color: Couleurs.rose, fontSize: 16)),
                    Expanded(child: Text(ligne.substring(2), style: textes.bodyLarge)),
                  ],
                ),
              )
            else
              Text(ligne, style: textes.bodyLarge),
        ],
      ),
    );
  }
}

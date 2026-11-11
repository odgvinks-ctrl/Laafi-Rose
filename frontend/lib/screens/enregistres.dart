import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:provider/provider.dart';

import '../data/depots.dart';
import '../data/langues.dart';
import '../models/article.dart';
import '../models/fichier_audio.dart';
import '../theme/couleurs.dart';
import '../widgets/carte_article.dart';
import '../widgets/etat_vide.dart';

// ÉCRAN « ENREGISTRÉS » : tout ce qui est disponible sans internet.
// Les fiches enregistrées et les audios téléchargés.
class EcranEnregistres extends StatefulWidget {
  const EcranEnregistres({super.key});

  @override
  State<EcranEnregistres> createState() => _EcranEnregistresState();
}

class _EcranEnregistresState extends State<EcranEnregistres> {
  List<Article> _articles = [];
  List<FichierAudio> _audios = [];
  int _espace = 0; // en octets
  bool _chargement = true;

  @override
  void initState() {
    super.initState();
    _charger();
  }

  Future<void> _charger() async {
    final depots = context.read<Depots>();
    // On lit les fiches, les audios et l'espace utilisé, l'un après l'autre
    final articles = await depots.articles.enregistres();
    final audios = await depots.audios.lister();
    final espace = await depots.audios.espaceUtilise();
    if (!mounted) return;
    setState(() {
      _articles = articles;
      _audios = audios.where((a) => a.estDisponible).toList();
      _espace = espace;
      _chargement = false;
    });
  }

  // Convertit des octets en texte lisible : « 3,4 Mo »
  String _taille(int octets) {
    if (octets < 1024 * 1024) return '${(octets / 1024).toStringAsFixed(0)} Ko';
    return '${(octets / (1024 * 1024)).toStringAsFixed(1).replaceAll('.', ',')} Mo';
  }

  // Supprime un audio après confirmation
  Future<void> _supprimerAudio(FichierAudio audio) async {
    // showDialog ouvre une fenêtre ; elle renvoie true si on confirme
    final confirme = await showDialog<bool>(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Supprimer cet audio ?'),
        content: const Text("Vous pourrez le télécharger de nouveau plus tard avec une connexion internet."),
        actions: [
          TextButton(onPressed: () => Navigator.pop(context, false), child: const Text('Annuler')),
          TextButton(onPressed: () => Navigator.pop(context, true), child: const Text('Supprimer')),
        ],
      ),
    );
    if (confirme != true) return;
    if (!mounted) return;
    await context.read<Depots>().audios.supprimer(audio);
    await _charger();
  }

  @override
  Widget build(BuildContext context) {
    final textes = Theme.of(context).textTheme;

    return RefreshIndicator(
      onRefresh: _charger,
      child: ListView(
        padding: const EdgeInsets.fromLTRB(20, 16, 20, 32),
        children: [
          Text('Enregistrés', style: textes.headlineMedium),
          const SizedBox(height: 6),
          Text('Consultables sans connexion internet.', style: textes.bodyMedium),
          const SizedBox(height: 16),

          if (_chargement)
            const Center(child: Padding(padding: EdgeInsets.all(32), child: CircularProgressIndicator()))
          else if (_articles.isEmpty && _audios.isEmpty)
            EtatVide(
              icone: Icons.download_outlined,
              titre: 'Rien pour le moment',
              texte: "Enregistrez une fiche (icône signet) ou un audio pour l'avoir avec vous, même sans réseau.",
              action: FilledButton(onPressed: () => context.go('/sinformer'), child: const Text('Parcourir les fiches')),
            )
          else ...[
            // L'espace utilisé par les audios
            Container(
              padding: const EdgeInsets.all(14),
              decoration: BoxDecoration(color: Couleurs.sable, borderRadius: BorderRadius.circular(12)),
              child: Row(
                children: [
                  const Icon(Icons.sd_storage_outlined, color: Couleurs.texte2),
                  const SizedBox(width: 10),
                  Text('Espace utilisé par les audios : ${_taille(_espace)}', style: textes.bodyMedium),
                ],
              ),
            ),
            const SizedBox(height: 20),

            if (_articles.isNotEmpty) ...[
              Text('FICHES (${_articles.length})', style: textes.labelSmall),
              const SizedBox(height: 8),
              ..._articles.map((a) => CarteArticle(article: a)),
              const SizedBox(height: 12),
            ],

            if (_audios.isNotEmpty) ...[
              Text('AUDIOS (${_audios.length})', style: textes.labelSmall),
              const SizedBox(height: 8),
              for (final audio in _audios)
                Card(
                  elevation: 0,
                  color: Couleurs.blanc,
                  margin: const EdgeInsets.only(bottom: 8),
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(12),
                    side: const BorderSide(color: Couleurs.ligne),
                  ),
                  // ListTile = une ligne toute prête : icône, titre, sous-titre, bouton
                  child: ListTile(
                    leading: const Icon(Icons.headphones, color: Couleurs.roseFonce),
                    title: Text(audio.articleSlug.replaceAll('-', ' ')),
                    subtitle: Text('${langues[audio.langue] ?? audio.langue} · ${_taille(audio.tailleOctets ?? 0)}'),
                    onTap: () => context.push('/ecouter/${audio.articleSlug}'),
                    trailing: IconButton(
                      tooltip: 'Supprimer',
                      icon: const Icon(Icons.delete_outline),
                      onPressed: () => _supprimerAudio(audio),
                    ),
                  ),
                ),
            ],
          ],
        ],
      ),
    );
  }
}

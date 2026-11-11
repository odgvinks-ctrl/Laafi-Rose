import 'package:flutter/material.dart';
import 'package:just_audio/just_audio.dart';
import 'package:provider/provider.dart';

import '../core/reseau/etat_connexion.dart';
import '../data/depots.dart';
import '../data/langues.dart';
import '../models/article.dart';
import '../models/fichier_audio.dart';
import '../state/preferences.dart';
import '../theme/couleurs.dart';
import '../widgets/encadre.dart';

// ÉCRAN D'ÉCOUTE : lit l'audio d'une fiche (français, mooré, dioula).
// On utilise le paquet just_audio pour lire le son.
class EcranEcouter extends StatefulWidget {
  const EcranEcouter({super.key, required this.slug});

  final String slug;

  @override
  State<EcranEcouter> createState() => _EcranEcouterState();
}

class _EcranEcouterState extends State<EcranEcouter> {
  // Le lecteur audio. Il faut le libérer dans dispose() !
  final AudioPlayer _lecteur = AudioPlayer();

  Article? _article;
  String _langue = 'fr';
  FichierAudio? _fichierLocal; // l'audio enregistré sur le téléphone, s'il existe
  bool _chargement = true;
  bool _telechargement = false;
  String? _erreur;
  double _vitesse = 1.0;

  @override
  void initState() {
    super.initState();
    _charger();
  }

  @override
  void dispose() {
    _lecteur.dispose();
    super.dispose();
  }

  Future<void> _charger() async {
    final depots = context.read<Depots>();
    final langueFavorite = context.read<Preferences>().langueAudio;

    final article = await depots.articles.obtenir(widget.slug);
    if (!mounted) return;

    if (article == null || article.audios.isEmpty) {
      setState(() {
        _article = article;
        _chargement = false;
      });
      return;
    }

    // On choisit la langue préférée si elle existe, sinon la première disponible
    final langue = article.audioDisponible(langueFavorite) ? langueFavorite : article.audios.keys.first;
    setState(() => _article = article);
    await _choisirLangue(langue);
  }

  // Prépare le lecteur pour une langue
  Future<void> _choisirLangue(String langue) async {
    final article = _article!;
    final depots = context.read<Depots>();

    setState(() {
      _langue = langue;
      _chargement = true;
      _erreur = null;
    });
    await _lecteur.stop();

    // Le fichier est-il déjà sur le téléphone ?
    final local = await depots.audios.obtenir(article.slug, langue);

    try {
      if (local != null && local.estDisponible) {
        await _lecteur.setFilePath(local.cheminLocal!); // lecture sans internet
      } else {
        await _lecteur.setUrl(article.audios[langue]!); // lecture en ligne
      }
    } catch (_) {
      _erreur = "Impossible de charger l'audio. Vérifiez votre connexion ou enregistrez-le quand vous aurez du réseau.";
    }

    if (!mounted) return;
    setState(() {
      _fichierLocal = local;
      _chargement = false;
    });
  }

  // Télécharge l'audio pour l'écouter plus tard sans internet
  Future<void> _telecharger() async {
    final article = _article!;
    setState(() => _telechargement = true);
    try {
      final fichier = await context.read<Depots>().audios.telecharger(
            articleSlug: article.slug,
            langue: _langue,
            url: article.audios[_langue]!,
          );
      if (!mounted) return;
      setState(() => _fichierLocal = fichier);
      ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Audio enregistré sur le téléphone')));
    } catch (e) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(e.toString())));
    } finally {
      if (mounted) setState(() => _telechargement = false);
    }
  }

  // Avance ou recule de [secondes]
  void _deplacer(int secondes) {
    final nouvelle = _lecteur.position + Duration(seconds: secondes);
    _lecteur.seek(nouvelle < Duration.zero ? Duration.zero : nouvelle);
  }

  // Change la vitesse : 1 → 1,25 → 0,75 → 1 ...
  void _changerVitesse() {
    final suivante = _vitesse == 1.0 ? 1.25 : (_vitesse == 1.25 ? 0.75 : 1.0);
    _lecteur.setSpeed(suivante);
    setState(() => _vitesse = suivante);
  }

  // Durée → texte « 02:35 »
  String _temps(Duration d) {
    final minutes = d.inMinutes.toString().padLeft(2, '0');
    final secondes = (d.inSeconds % 60).toString().padLeft(2, '0');
    return '$minutes:$secondes';
  }

  @override
  Widget build(BuildContext context) {
    final textes = Theme.of(context).textTheme;
    final article = _article;
    // context.watch = on écoute l'état du réseau : l'écran se redessine s'il change
    final enLigne = context.watch<EtatConnexion>().enLigne;

    return Scaffold(
      appBar: AppBar(backgroundColor: Couleurs.fond, title: const Text('Écouter')),
      body: article == null && _chargement
          ? const Center(child: CircularProgressIndicator())
          : ListView(
              padding: const EdgeInsets.fromLTRB(20, 8, 20, 40),
              children: [
                if (article != null) Text(article.titre, style: textes.headlineMedium),
                const SizedBox(height: 16),

                // Cas 1 : aucun audio pour cette fiche
                if (article == null || article.audios.isEmpty)
                  const Encadre(
                    icone: Icons.hourglass_empty,
                    titre: 'Version audio en préparation',
                    texte: "L'audio de cette fiche n'est pas encore disponible. Vous pouvez lire le texte en attendant.",
                    fond: Couleurs.ambreFond,
                    couleur: Couleurs.ambre,
                  )
                else ...[
                  // Choix de la langue
                  Wrap(
                    spacing: 8,
                    children: [
                      for (final code in article.audios.keys)
                        ChoiceChip(
                          label: Text(langues[code] ?? code),
                          selected: _langue == code,
                          onSelected: (_) => _choisirLangue(code),
                          selectedColor: Couleurs.poudre,
                        ),
                    ],
                  ),
                  const SizedBox(height: 20),

                  if (_erreur != null)
                    Encadre(icone: Icons.wifi_off, texte: _erreur!, fond: Couleurs.rougeFond, couleur: Couleurs.rouge)
                  else if (_chargement)
                    const Center(child: CircularProgressIndicator())
                  else
                    _lecteurVisuel(),

                  const SizedBox(height: 16),

                  // Bouton de téléchargement
                  if (_fichierLocal != null && _fichierLocal!.estDisponible)
                    const Row(
                      children: [
                        Icon(Icons.download_done, color: Couleurs.vert),
                        SizedBox(width: 8),
                        Text('Enregistré sur le téléphone', style: TextStyle(color: Couleurs.vert, fontWeight: FontWeight.w700)),
                      ],
                    )
                  else
                    OutlinedButton.icon(
                      // On désactive le bouton (null) sans réseau ou pendant le téléchargement
                      onPressed: (!enLigne || _telechargement) ? null : _telecharger,
                      icon: _telechargement
                          ? const SizedBox(width: 18, height: 18, child: CircularProgressIndicator(strokeWidth: 2))
                          : const Icon(Icons.download_outlined),
                      label: Text(_telechargement ? 'Téléchargement…' : 'Enregistrer pour écouter sans internet'),
                    ),
                ],

                // Le texte reste affiché pendant l'écoute
                if (article != null) ...[
                  const SizedBox(height: 28),
                  Text('TEXTE EN FRANÇAIS', style: textes.labelSmall),
                  const SizedBox(height: 8),
                  Text(article.contenu.replaceAll('## ', ''), style: textes.bodyLarge),
                ],
              ],
            ),
    );
  }

  // Le lecteur : barre de progression + boutons
  Widget _lecteurVisuel() {
    final textes = Theme.of(context).textTheme;

    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Couleurs.blanc,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: Couleurs.ligne),
      ),
      child: Column(
        children: [
          // StreamBuilder se redessine à chaque nouvelle valeur du flux (ici la position)
          StreamBuilder<Duration>(
            stream: _lecteur.positionStream,
            builder: (context, snapshot) {
              final position = snapshot.data ?? Duration.zero;
              final total = _lecteur.duration ?? Duration.zero;
              // clamp évite que la valeur dépasse le maximum du Slider
              final valeur = position.inMilliseconds.clamp(0, total.inMilliseconds == 0 ? 1 : total.inMilliseconds);
              return Column(
                children: [
                  Slider(
                    value: valeur.toDouble(),
                    max: total.inMilliseconds == 0 ? 1 : total.inMilliseconds.toDouble(),
                    onChanged: (v) => _lecteur.seek(Duration(milliseconds: v.round())),
                  ),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Text(_temps(position), style: textes.bodySmall),
                      Text(_temps(total), style: textes.bodySmall),
                    ],
                  ),
                ],
              );
            },
          ),
          const SizedBox(height: 8),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceEvenly,
            children: [
              IconButton(tooltip: 'Reculer de 10 secondes', onPressed: () => _deplacer(-10), icon: const Icon(Icons.replay_10, size: 30)),
              // Le gros bouton lecture / pause : il dépend de l'état du lecteur
              StreamBuilder<PlayerState>(
                stream: _lecteur.playerStateStream,
                builder: (context, snapshot) {
                  final enLecture = snapshot.data?.playing ?? false;
                  return IconButton.filled(
                    tooltip: enLecture ? 'Pause' : 'Lecture',
                    iconSize: 40,
                    style: IconButton.styleFrom(backgroundColor: Couleurs.rose),
                    onPressed: () => enLecture ? _lecteur.pause() : _lecteur.play(),
                    icon: Icon(enLecture ? Icons.pause : Icons.play_arrow, color: Couleurs.blanc),
                  );
                },
              ),
              IconButton(tooltip: 'Avancer de 10 secondes', onPressed: () => _deplacer(10), icon: const Icon(Icons.forward_10, size: 30)),
            ],
          ),
          TextButton(onPressed: _changerVitesse, child: Text('Vitesse × ${_vitesse.toString().replaceAll('.', ',')}')),
        ],
      ),
    );
  }
}

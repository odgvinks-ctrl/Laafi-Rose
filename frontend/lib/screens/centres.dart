import 'package:flutter/material.dart';
import 'package:geolocator/geolocator.dart';
import 'package:provider/provider.dart';

import '../core/api/client_api.dart';
import '../data/depots.dart';
import '../models/centre_sante.dart';
import '../theme/couleurs.dart';
import '../theme/theme.dart';
import '../widgets/carte_centre.dart';
import '../widgets/encadre.dart';
import '../widgets/message_erreur.dart';

// ÉCRAN « CENTRES DE SANTÉ » : l'annuaire.
// On peut chercher un nom, garder seulement les infos vérifiées,
// et trier par distance si on active la localisation.
class EcranCentres extends StatefulWidget {
  const EcranCentres({super.key});

  @override
  State<EcranCentres> createState() => _EcranCentresState();
}

class _EcranCentresState extends State<EcranCentres> {
  final _champ = TextEditingController();

  List<CentreSante> _centres = [];
  bool _chargement = true;
  String? _erreur;
  bool _verifiesSeulement = false;
  Position? _position; // la position de l'utilisateur (null = pas de localisation)
  bool _localisationEnCours = false;

  @override
  void initState() {
    super.initState();
    _charger();
  }

  @override
  void dispose() {
    _champ.dispose();
    super.dispose();
  }

  // Demande la liste des centres au backend
  Future<void> _charger() async {
    setState(() {
      _chargement = true;
      _erreur = null;
    });

    try {
      final centres = await context.read<Depots>().centres.lister(
            recherche: _champ.text.trim(),
            verifies: _verifiesSeulement,
            lat: _position?.latitude,
            lng: _position?.longitude,
          );
      if (!mounted) return;
      setState(() => _centres = centres);
    } on ApiException catch (e) {
      // ApiException contient déjà un message clair en français
      if (!mounted) return;
      setState(() => _erreur = e.message);
    } finally {
      if (mounted) setState(() => _chargement = false);
    }
  }

  // Active la localisation pour trier les centres du plus proche au plus loin
  Future<void> _localiser() async {
    setState(() => _localisationEnCours = true);

    try {
      // 1. Le GPS du téléphone est-il allumé ?
      if (!await Geolocator.isLocationServiceEnabled()) {
        _afficherMessage('Activez la localisation (GPS) de votre téléphone, puis réessayez.');
        return;
      }

      // 2. L'application a-t-elle le droit d'utiliser la position ?
      var permission = await Geolocator.checkPermission();
      if (permission == LocationPermission.denied) {
        permission = await Geolocator.requestPermission();
      }
      if (permission == LocationPermission.denied || permission == LocationPermission.deniedForever) {
        _afficherMessage('Sans la localisation, les centres restent classés par nom.');
        return;
      }

      // 3. On récupère la position
      final position = await Geolocator.getCurrentPosition(
        locationSettings: const LocationSettings(accuracy: LocationAccuracy.medium),
      );
      if (!mounted) return;
      setState(() => _position = position);
      await _charger();
    } catch (_) {
      _afficherMessage("Votre position n'a pas pu être trouvée.");
    } finally {
      if (mounted) setState(() => _localisationEnCours = false);
    }
  }

  void _afficherMessage(String texte) {
    if (!mounted) return;
    ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(texte)));
  }

  @override
  Widget build(BuildContext context) {
    final textes = Theme.of(context).textTheme;

    return RefreshIndicator(
      onRefresh: _charger,
      child: ListView(
        padding: const EdgeInsets.fromLTRB(20, 16, 20, 32),
        children: [
          Text('Centres de santé', style: textes.headlineMedium),
          const SizedBox(height: 6),
          Text('Trouvez un centre de dépistage ou de soins près de chez vous.', style: textes.bodyMedium),
          const SizedBox(height: 16),

          TextField(
            controller: _champ,
            textInputAction: TextInputAction.search,
            onSubmitted: (_) => _charger(), // la recherche part quand on valide
            decoration: decorationChamp('Nom du centre, ville, quartier').copyWith(prefixIcon: const Icon(Icons.search)),
          ),
          const SizedBox(height: 12),

          // Les filtres
          Wrap(
            spacing: 8,
            runSpacing: 8,
            children: [
              FilterChip(
                label: const Text('Infos vérifiées'),
                selected: _verifiesSeulement,
                selectedColor: Couleurs.vertFond,
                onSelected: (valeur) {
                  setState(() => _verifiesSeulement = valeur);
                  _charger();
                },
              ),
              ActionChip(
                avatar: _localisationEnCours
                    ? const SizedBox(width: 16, height: 16, child: CircularProgressIndicator(strokeWidth: 2))
                    : Icon(_position == null ? Icons.my_location : Icons.near_me, size: 18),
                label: Text(_position == null ? 'Près de moi' : 'Triés par distance'),
                onPressed: _localisationEnCours ? null : _localiser,
              ),
            ],
          ),
          const SizedBox(height: 12),

          if (_position == null)
            const Encadre(
              icone: Icons.location_off_outlined,
              texte: 'Les centres sont classés par nom. Touchez « Près de moi » pour voir les plus proches. '
                  "Votre position n'est utilisée que sur votre téléphone pour ce tri.",
              fond: Couleurs.sable,
              couleur: Couleurs.texte2,
            ),
          const SizedBox(height: 16),

          // Le contenu selon la situation
          if (_chargement)
            const Padding(
              padding: EdgeInsets.all(32),
              child: Column(
                children: [
                  CircularProgressIndicator(),
                  SizedBox(height: 12),
                  Text('Recherche des centres…'),
                ],
              ),
            )
          else if (_erreur != null)
            MessageErreur(message: _erreur!, surReessayer: _charger)
          else if (_centres.isEmpty)
            Column(
              children: [
                const SizedBox(height: 16),
                Text('Aucun centre trouvé.', style: textes.titleMedium),
                const SizedBox(height: 6),
                Text('Essayez un autre nom ou retirez les filtres.', style: textes.bodyMedium),
                const SizedBox(height: 12),
                OutlinedButton(
                  onPressed: () {
                    _champ.clear();
                    setState(() => _verifiesSeulement = false);
                    _charger();
                  },
                  child: const Text('Réinitialiser la recherche'),
                ),
              ],
            )
          else ...[
            Text('${_centres.length} centre(s)', style: textes.bodySmall),
            const SizedBox(height: 8),
            ..._centres.map((c) => CarteCentre(centre: c)),
          ],
        ],
      ),
    );
  }
}

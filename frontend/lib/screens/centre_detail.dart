import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:provider/provider.dart';
import 'package:url_launcher/url_launcher.dart';

import '../core/api/client_api.dart';
import '../data/depots.dart';
import '../models/centre_sante.dart';
import '../theme/couleurs.dart';
import '../widgets/carte_centre.dart';
import '../widgets/message_erreur.dart';

// FICHE D'UN CENTRE : coordonnées, services, horaires,
// et les actions Appeler / Itinéraire / Rendez-vous.
class EcranCentreDetail extends StatefulWidget {
  const EcranCentreDetail({super.key, required this.id});

  final int id;

  @override
  State<EcranCentreDetail> createState() => _EcranCentreDetailState();
}

class _EcranCentreDetailState extends State<EcranCentreDetail> {
  CentreSante? _centre;
  String? _erreur;

  @override
  void initState() {
    super.initState();
    _charger();
  }

  Future<void> _charger() async {
    setState(() => _erreur = null);
    try {
      final centre = await context.read<Depots>().centres.obtenir(widget.id);
      if (!mounted) return;
      setState(() => _centre = centre);
    } on ApiException catch (e) {
      if (!mounted) return;
      setState(() => _erreur = e.message);
    }
  }

  // Ouvre l'application Téléphone avec le numéro du centre
  Future<void> _appeler(String numero) async {
    await launchUrl(Uri(scheme: 'tel', path: numero));
  }

  // Ouvre Google Maps avec l'itinéraire vers le centre
  Future<void> _itineraire(double lat, double lng) async {
    final lien = Uri.parse('https://www.google.com/maps/dir/?api=1&destination=$lat,$lng');
    await launchUrl(lien, mode: LaunchMode.externalApplication);
  }

  String _formaterDate(DateTime date) =>
      '${date.day.toString().padLeft(2, '0')}/${date.month.toString().padLeft(2, '0')}/${date.year}';

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(backgroundColor: Couleurs.fond),
      body: _construireContenu(),
    );
  }

  Widget _construireContenu() {
    if (_erreur != null) {
      return Padding(
        padding: const EdgeInsets.all(20),
        child: MessageErreur(message: _erreur!, surReessayer: _charger),
      );
    }

    final centre = _centre;
    if (centre == null) return const Center(child: CircularProgressIndicator());

    final textes = Theme.of(context).textTheme;
    final adresse = [centre.adresse, centre.quartier, centre.ville].where((t) => t != null && t.isNotEmpty).join(', ');

    return ListView(
      padding: const EdgeInsets.fromLTRB(20, 4, 20, 40),
      children: [
        if (centre.type != null) Text(centre.type!.toUpperCase(), style: textes.labelSmall),
        const SizedBox(height: 4),
        Text(centre.nom, style: textes.headlineMedium),
        const SizedBox(height: 12),
        Wrap(
          spacing: 8,
          runSpacing: 8,
          children: [
            if (centre.verifie)
              Etiquette(
                texte: centre.verifieLe == null ? 'Infos vérifiées' : 'Vérifié le ${_formaterDate(centre.verifieLe!)}',
                icone: Icons.verified_outlined,
                fond: Couleurs.vertFond,
                couleur: Couleurs.vert,
              )
            else
              const Etiquette(texte: 'Infos à vérifier', icone: Icons.help_outline, fond: Couleurs.ambreFond, couleur: Couleurs.ambre),
            if (centre.rendezVous)
              const Etiquette(texte: 'Accepte les rendez-vous', icone: Icons.event_available, fond: Couleurs.poudre, couleur: Couleurs.roseFonce),
          ],
        ),
        const SizedBox(height: 20),

        // Les 3 boutons d'action
        Row(
          children: [
            Expanded(
              child: OutlinedButton.icon(
                // null = bouton désactivé quand il n'y a pas de numéro
                onPressed: centre.telephone == null ? null : () => _appeler(centre.telephone!),
                icon: const Icon(Icons.call_outlined),
                label: const Text('Appeler'),
              ),
            ),
            const SizedBox(width: 10),
            Expanded(
              child: OutlinedButton.icon(
                onPressed: (centre.latitude == null || centre.longitude == null)
                    ? null
                    : () => _itineraire(centre.latitude!, centre.longitude!),
                icon: const Icon(Icons.directions_outlined),
                label: const Text('Itinéraire'),
              ),
            ),
          ],
        ),
        if (centre.rendezVous) ...[
          const SizedBox(height: 10),
          FilledButton.icon(
            // On ouvre le formulaire : /centre/3/rendez-vous
            onPressed: () => context.push('/centre/${centre.id}/rendez-vous'),
            icon: const Icon(Icons.event_outlined),
            label: const Text('Demander un rendez-vous'),
          ),
        ],
        const SizedBox(height: 24),

        // Les informations pratiques
        if (adresse.isNotEmpty) _Ligne(icone: Icons.place_outlined, titre: 'Adresse', texte: adresse),
        if (centre.telephone != null) _Ligne(icone: Icons.phone_outlined, titre: 'Téléphone', texte: centre.telephone!),
        if (centre.horaires != null) _Ligne(icone: Icons.schedule, titre: 'Horaires', texte: centre.horaires!),

        // Les services proposés
        const SizedBox(height: 12),
        Text('SERVICES', style: textes.labelSmall),
        const SizedBox(height: 8),
        if (centre.services.isEmpty)
          Text('Les services de ce centre ne sont pas encore renseignés.', style: textes.bodyMedium)
        else
          for (final service in centre.services)
            Container(
              margin: const EdgeInsets.only(bottom: 8),
              padding: const EdgeInsets.all(14),
              decoration: BoxDecoration(
                color: Couleurs.blanc,
                borderRadius: BorderRadius.circular(12),
                border: Border.all(color: Couleurs.ligne),
              ),
              child: Row(
                children: [
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(service.nom, style: textes.titleMedium),
                        if (service.description != null) Text(service.description!, style: textes.bodySmall),
                        if (!service.disponible)
                          const Text('Momentanément indisponible', style: TextStyle(color: Couleurs.rouge, fontSize: 13)),
                      ],
                    ),
                  ),
                  if (service.gratuit)
                    const Etiquette(texte: 'Gratuit', icone: Icons.check, fond: Couleurs.vertFond, couleur: Couleurs.vert),
                ],
              ),
            ),
      ],
    );
  }
}

// Une ligne d'information : icône + titre + texte
class _Ligne extends StatelessWidget {
  const _Ligne({required this.icone, required this.titre, required this.texte});

  final IconData icone;
  final String titre;
  final String texte;

  @override
  Widget build(BuildContext context) {
    final textes = Theme.of(context).textTheme;
    return Padding(
      padding: const EdgeInsets.only(bottom: 14),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Icon(icone, color: Couleurs.roseFonce, size: 22),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(titre, style: textes.bodySmall),
                Text(texte, style: textes.bodyLarge),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

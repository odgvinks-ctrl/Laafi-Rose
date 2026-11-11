import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:provider/provider.dart';

import '../data/depots.dart';
import '../data/langues.dart';
import '../models/rendez_vous.dart';
import '../state/preferences.dart';
import '../state/session.dart';
import '../theme/couleurs.dart';
import '../widgets/encadre.dart';

// ÉCRAN PROFIL ET PRÉFÉRENCES
// Il fonctionne SANS compte : langue, taille du texte, Wi-Fi.
// Avec un compte, on voit en plus ses demandes de rendez-vous.
class EcranProfil extends StatefulWidget {
  const EcranProfil({super.key});

  @override
  State<EcranProfil> createState() => _EcranProfilState();
}

class _EcranProfilState extends State<EcranProfil> {
  // Un Future = une valeur qui arrivera plus tard (ici, la liste des demandes)
  Future<List<RendezVous>>? _demandes;

  @override
  void initState() {
    super.initState();
    if (context.read<Session>().connecte) {
      _demandes = context.read<Depots>().rendezVous.mesDemandes();
    }
  }

  Future<void> _deconnecter() async {
    await context.read<Session>().deconnecter();
    if (!mounted) return;
    setState(() => _demandes = null);
  }

  // Traduit le code du statut en texte lisible
  String _libelleStatut(String statut) {
    switch (statut) {
      case 'en_attente':
        return 'En attente';
      case 'confirme':
        return 'Confirmé';
      case 'annule':
        return 'Annulé';
      case 'honore':
        return 'Effectué';
      default:
        return statut;
    }
  }

  @override
  Widget build(BuildContext context) {
    final textes = Theme.of(context).textTheme;
    // watch = l'écran se redessine quand la session ou les préférences changent
    final session = context.watch<Session>();
    final preferences = context.watch<Preferences>();

    return Scaffold(
      appBar: AppBar(backgroundColor: Couleurs.fond, title: const Text('Profil et préférences')),
      body: ListView(
        padding: const EdgeInsets.fromLTRB(20, 8, 20, 40),
        children: [
          // ---------- Le compte ----------
          Text('MON COMPTE', style: textes.labelSmall),
          const SizedBox(height: 8),
          if (session.connecte) ...[
            ListTile(
              contentPadding: EdgeInsets.zero,
              leading: const CircleAvatar(backgroundColor: Couleurs.poudre, child: Icon(Icons.person, color: Couleurs.roseFonce)),
              title: Text(session.utilisateur!.prenom ?? 'Mon compte'),
              subtitle: Text(session.utilisateur!.telephone),
            ),
            const SizedBox(height: 8),
            Text('Mes demandes de rendez-vous', style: textes.titleMedium),
            const SizedBox(height: 8),
            // FutureBuilder affiche quelque chose pendant le chargement,
            // puis se redessine tout seul quand le Future est terminé
            FutureBuilder<List<RendezVous>>(
              future: _demandes,
              builder: (context, snapshot) {
                if (snapshot.connectionState != ConnectionState.done) {
                  return const LinearProgressIndicator();
                }
                if (snapshot.hasError) {
                  return Text('Impossible de charger vos demandes.', style: textes.bodySmall);
                }
                final demandes = snapshot.data ?? [];
                if (demandes.isEmpty) {
                  return Text("Vous n'avez pas encore fait de demande.", style: textes.bodySmall);
                }
                return Column(
                  children: [
                    for (final d in demandes)
                      ListTile(
                        contentPadding: EdgeInsets.zero,
                        leading: Icon(d.enAttente ? Icons.hourglass_top : Icons.event_available, color: Couleurs.roseFonce),
                        title: Text('Réf. ${d.reference}'),
                        subtitle: Text(_libelleStatut(d.statut)),
                        onTap: () => context.push('/centre/${d.centreId}'),
                      ),
                  ],
                );
              },
            ),
            const SizedBox(height: 8),
            OutlinedButton.icon(onPressed: _deconnecter, icon: const Icon(Icons.logout), label: const Text('Se déconnecter')),
          ] else ...[
            Text(
              "Un compte n'est pas nécessaire. Il sert seulement à suivre vos demandes de rendez-vous et à recevoir des notifications.",
              style: textes.bodyMedium,
            ),
            const SizedBox(height: 12),
            FilledButton(onPressed: () => context.push('/connexion'), child: const Text('Se connecter')),
          ],
          const SizedBox(height: 28),

          // ---------- La langue d'écoute ----------
          Text("LANGUE D'ÉCOUTE", style: textes.labelSmall),
          const SizedBox(height: 8),
          // SegmentedButton : un seul choix parmi plusieurs
          SegmentedButton<String>(
            segments: [
              // On crée un segment pour chaque langue de langues.dart
              for (final entree in langues.entries) ButtonSegment(value: entree.key, label: Text(entree.value)),
            ],
            selected: {preferences.langueAudio},
            onSelectionChanged: (choix) => preferences.choisirLangueAudio(choix.first),
          ),
          const SizedBox(height: 24),

          // ---------- La taille du texte ----------
          Text('TAILLE DU TEXTE', style: textes.labelSmall),
          const SizedBox(height: 8),
          SegmentedButton<String>(
            segments: const [
              ButtonSegment(value: 'standard', label: Text('Normal')),
              ButtonSegment(value: 'grand', label: Text('Grand')),
              ButtonSegment(value: 'tres_grand', label: Text('Très grand')),
            ],
            selected: {preferences.tailleTexte},
            onSelectionChanged: (choix) => preferences.choisirTailleTexte(choix.first),
          ),
          const SizedBox(height: 16),

          // ---------- Le Wi-Fi ----------
          SwitchListTile(
            contentPadding: EdgeInsets.zero,
            title: const Text('Télécharger les audios seulement en Wi-Fi'),
            subtitle: const Text('Pour économiser vos données mobiles'),
            value: preferences.wifiSeulement,
            onChanged: preferences.choisirWifiSeulement,
          ),
          const Divider(height: 32),

          // ---------- Les liens ----------
          ListTile(
            contentPadding: EdgeInsets.zero,
            leading: const Icon(Icons.edit_note, color: Couleurs.roseFonce),
            title: const Text('Mon journal'),
            trailing: const Icon(Icons.chevron_right),
            onTap: () => context.push('/journal'),
          ),
          ListTile(
            contentPadding: EdgeInsets.zero,
            leading: const Icon(Icons.notifications_none, color: Couleurs.roseFonce),
            title: const Text('Notifications'),
            trailing: const Icon(Icons.chevron_right),
            onTap: () => context.push('/notifications'),
          ),
          const SizedBox(height: 20),

          // ---------- La confidentialité ----------
          const Encadre(
            icone: Icons.lock_outline,
            titre: 'Confidentialité',
            texte: 'Votre journal et vos fiches enregistrées restent sur votre téléphone. '
                "Les informations de santé viennent de sources reconnues (OMS, ministère de la Santé) et sont relues par des soignants.",
          ),
        ],
      ),
    );
  }
}

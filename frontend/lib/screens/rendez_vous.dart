import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:provider/provider.dart';

import '../core/api/client_api.dart';
import '../core/reseau/etat_connexion.dart';
import '../data/depots.dart';
import '../models/centre_sante.dart';
import '../models/rendez_vous.dart';
import '../state/preferences.dart';
import '../state/session.dart';
import '../theme/couleurs.dart';
import '../theme/theme.dart';
import '../widgets/encadre.dart';
import '../widgets/message_erreur.dart';

// FORMULAIRE DE DEMANDE DE RENDEZ-VOUS
// Aucune information médicale n'est demandée.
// À la fin, on affiche une référence : la demande est EN ATTENTE, pas encore confirmée.
class EcranRendezVous extends StatefulWidget {
  const EcranRendezVous({super.key, required this.centreId});

  final int centreId;

  @override
  State<EcranRendezVous> createState() => _EcranRendezVousState();
}

class _EcranRendezVousState extends State<EcranRendezVous> {
  // La clé du formulaire : elle sert à lancer la vérification de tous les champs
  final _cleFormulaire = GlobalKey<FormState>();
  final _nom = TextEditingController();
  final _telephone = TextEditingController();

  CentreSante? _centre;
  String? _erreurChargement;

  int _serviceId = -1; // -1 = « Je ne sais pas encore »
  DateTime? _date;
  String _contact = 'appel'; // 'appel' ou 'sms'
  bool _accord = false;
  bool _envoi = false;
  String? _erreurEnvoi;

  RendezVous? _demande; // remplie quand la demande est envoyée

  @override
  void initState() {
    super.initState();
    // Si la personne est connectée, on pré-remplit son prénom
    final utilisateur = context.read<Session>().utilisateur;
    if (utilisateur?.prenom != null) _nom.text = utilisateur!.prenom!;
    _charger();
  }

  @override
  void dispose() {
    _nom.dispose();
    _telephone.dispose();
    super.dispose();
  }

  Future<void> _charger() async {
    setState(() => _erreurChargement = null);
    try {
      final centre = await context.read<Depots>().centres.obtenir(widget.centreId);
      if (!mounted) return;
      setState(() => _centre = centre);
    } on ApiException catch (e) {
      if (!mounted) return;
      setState(() => _erreurChargement = e.message);
    }
  }

  // Ouvre le calendrier pour choisir une date
  Future<void> _choisirDate() async {
    final aujourdHui = DateTime.now();
    final choix = await showDatePicker(
      context: context,
      firstDate: aujourdHui.add(const Duration(days: 1)),
      lastDate: aujourdHui.add(const Duration(days: 60)),
      initialDate: _date ?? aujourdHui.add(const Duration(days: 1)),
      helpText: 'Jour souhaité',
    );
    if (choix != null) setState(() => _date = choix);
  }

  Future<void> _envoyer() async {
    // validate() vérifie chaque champ ; s'il y a une erreur, on s'arrête
    if (!_cleFormulaire.currentState!.validate()) return;
    if (!_accord) {
      setState(() => _erreurEnvoi = 'Cochez la case pour accepter que le centre vous contacte.');
      return;
    }

    setState(() {
      _envoi = true;
      _erreurEnvoi = null;
    });

    try {
      final demande = await context.read<Depots>().rendezVous.demander(
            centreId: widget.centreId,
            serviceId: _serviceId == -1 ? null : _serviceId,
            souhaiteLe: _date,
            nom: _nom.text,
            telephone: '+226${_telephone.text.replaceAll(' ', '')}',
            contact: _contact,
            langue: context.read<Preferences>().langueAudio,
            accord: _accord,
          );
      if (!mounted) return;
      setState(() => _demande = demande);
    } on ApiException catch (e) {
      if (!mounted) return;
      setState(() => _erreurEnvoi = e.message);
    } finally {
      if (mounted) setState(() => _envoi = false);
    }
  }

  String _formaterDate(DateTime date) =>
      '${date.day.toString().padLeft(2, '0')}/${date.month.toString().padLeft(2, '0')}/${date.year}';

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(backgroundColor: Couleurs.fond, title: const Text('Demande de rendez-vous')),
      body: _demande != null ? _confirmation() : _formulaire(),
    );
  }

  // ---------- Le formulaire ----------
  Widget _formulaire() {
    if (_erreurChargement != null) {
      return Padding(padding: const EdgeInsets.all(20), child: MessageErreur(message: _erreurChargement!, surReessayer: _charger));
    }
    final centre = _centre;
    if (centre == null) return const Center(child: CircularProgressIndicator());

    final textes = Theme.of(context).textTheme;
    final enLigne = context.watch<EtatConnexion>().enLigne;

    // Form regroupe les champs pour pouvoir les vérifier ensemble
    return Form(
      key: _cleFormulaire,
      child: ListView(
        padding: const EdgeInsets.fromLTRB(20, 8, 20, 40),
        children: [
          Text(centre.nom, style: textes.headlineSmall),
          const SizedBox(height: 6),
          Text('Aucune information médicale ne vous sera demandée.', style: textes.bodyMedium),
          const SizedBox(height: 24),

          // 1. Le motif
          Text('1. MOTIF', style: textes.labelSmall),
          const SizedBox(height: 8),
          // RadioGroup garde le choix ; chaque RadioListTile est une ligne avec un bouton rond.
          // La valeur -1 veut dire « Je ne sais pas encore ».
          RadioGroup<int>(
            groupValue: _serviceId,
            onChanged: (v) => setState(() => _serviceId = v ?? -1),
            child: Column(
              children: [
                for (final service in centre.services.where((s) => s.disponible))
                  RadioListTile<int>(
                    value: service.id,
                    title: Text(service.nom),
                    subtitle: service.gratuit ? const Text('Gratuit') : null,
                    contentPadding: EdgeInsets.zero,
                  ),
                const RadioListTile<int>(
                  value: -1,
                  title: Text('Je ne sais pas encore'),
                  subtitle: Text('Le centre vous orientera'),
                  contentPadding: EdgeInsets.zero,
                ),
              ],
            ),
          ),
          const SizedBox(height: 20),

          // 2. La date
          Text('2. JOUR SOUHAITÉ', style: textes.labelSmall),
          const SizedBox(height: 8),
          OutlinedButton.icon(
            onPressed: _choisirDate,
            icon: const Icon(Icons.calendar_today_outlined),
            label: Text(_date == null ? 'Choisir un jour (facultatif)' : 'Le ${_formaterDate(_date!)}'),
          ),
          const SizedBox(height: 6),
          Text('Le jour reste à confirmer par le centre.', style: textes.bodySmall),
          const SizedBox(height: 20),

          // 3. Les coordonnées
          Text('3. VOS COORDONNÉES', style: textes.labelSmall),
          const SizedBox(height: 8),
          TextFormField(
            controller: _nom,
            textCapitalization: TextCapitalization.words,
            decoration: decorationChamp('Nom ou prénom'),
            // validator renvoie un message d'erreur, ou null si tout va bien
            validator: (texte) => (texte == null || texte.trim().isEmpty) ? 'Indiquez un nom pour que le centre vous reconnaisse.' : null,
          ),
          const SizedBox(height: 12),
          TextFormField(
            controller: _telephone,
            keyboardType: TextInputType.phone,
            decoration: decorationChamp('Numéro de téléphone', prefixe: '+226 ', aide: '8 chiffres, ex. 70 12 34 56'),
            validator: (texte) {
              final chiffres = (texte ?? '').replaceAll(' ', '');
              if (chiffres.length != 8 || int.tryParse(chiffres) == null) {
                return 'Le numéro doit contenir 8 chiffres.';
              }
              return null;
            },
          ),
          const SizedBox(height: 12),
          Text('Comment préférez-vous être contacté(e) ?', style: textes.bodyMedium),
          const SizedBox(height: 8),
          // SegmentedButton = deux boutons collés, un seul choisi
          SegmentedButton<String>(
            segments: const [
              ButtonSegment(value: 'appel', label: Text('Appel'), icon: Icon(Icons.call_outlined)),
              ButtonSegment(value: 'sms', label: Text('SMS'), icon: Icon(Icons.sms_outlined)),
            ],
            selected: {_contact},
            onSelectionChanged: (choix) => setState(() => _contact = choix.first),
          ),
          const SizedBox(height: 20),

          // 4. L'accord
          CheckboxListTile(
            value: _accord,
            onChanged: (v) => setState(() => _accord = v ?? false),
            controlAffinity: ListTileControlAffinity.leading,
            contentPadding: EdgeInsets.zero,
            title: const Text("J'accepte que ce centre utilise mon numéro pour me recontacter au sujet de cette demande."),
          ),

          if (_erreurEnvoi != null) ...[
            const SizedBox(height: 8),
            Encadre(icone: Icons.error_outline, texte: _erreurEnvoi!, fond: Couleurs.rougeFond, couleur: Couleurs.rouge),
          ],
          if (!enLigne) ...[
            const SizedBox(height: 8),
            const Encadre(
              icone: Icons.wifi_off,
              texte: "Vous êtes hors connexion. La demande pourra être envoyée dès que le réseau revient. Vous pouvez aussi appeler le centre.",
              fond: Couleurs.sable,
              couleur: Couleurs.texte2,
            ),
          ],
          const SizedBox(height: 16),
          FilledButton(
            onPressed: (_envoi || !enLigne) ? null : _envoyer,
            child: Text(_envoi ? 'Envoi…' : 'Envoyer la demande'),
          ),
        ],
      ),
    );
  }

  // ---------- L'écran final ----------
  Widget _confirmation() {
    final textes = Theme.of(context).textTheme;
    final demande = _demande!;

    return ListView(
      padding: const EdgeInsets.all(20),
      children: [
        const SizedBox(height: 16),
        // Un sablier, jamais une coche : ce n'est pas encore confirmé
        const Center(
          child: CircleAvatar(
            radius: 36,
            backgroundColor: Couleurs.ambreFond,
            child: Icon(Icons.hourglass_top, color: Couleurs.ambre, size: 36),
          ),
        ),
        const SizedBox(height: 20),
        Text('Demande envoyée', style: textes.headlineMedium, textAlign: TextAlign.center),
        const SizedBox(height: 8),
        Text(
          'Elle est en attente de confirmation. Le centre vous contactera par ${_contact == 'sms' ? 'SMS' : 'appel'} au ${demande.telephone}.',
          style: textes.bodyLarge,
          textAlign: TextAlign.center,
        ),
        const SizedBox(height: 24),
        Container(
          padding: const EdgeInsets.all(16),
          decoration: BoxDecoration(color: Couleurs.blanc, borderRadius: BorderRadius.circular(16), border: Border.all(color: Couleurs.ligne)),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text('RÉFÉRENCE À CONSERVER', style: textes.labelSmall),
              const SizedBox(height: 4),
              // SelectableText = on peut copier la référence
              SelectableText(demande.reference, style: textes.headlineSmall),
              if (demande.souhaiteLe != null) ...[
                const SizedBox(height: 12),
                Text('Jour souhaité : ${_formaterDate(demande.souhaiteLe!)}', style: textes.bodyMedium),
              ],
            ],
          ),
        ),
        const SizedBox(height: 24),
        FilledButton(onPressed: () => context.go('/'), child: const Text("Retour à l'accueil")),
      ],
    );
  }
}

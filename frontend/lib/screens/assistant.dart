import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:provider/provider.dart';

import '../core/api/client_api.dart';
import '../core/reseau/etat_connexion.dart';
import '../data/depots.dart';
import '../models/message_chat.dart';
import '../state/preferences.dart';
import '../theme/couleurs.dart';
import '../theme/theme.dart';
import '../widgets/encadre.dart';

// Questions proposées au-dessus du champ de saisie
const _suggestions = [
  'Quels sont les signes du cancer du sein ?',
  'Où faire un dépistage du col ?',
  "Comment s'examiner les seins ?",
];

// ÉCRAN ASSISTANT : une conversation avec l'assistant d'information (ai-service).
// Ce n'est PAS un médecin : il répond avec les fiches validées et cite ses sources.
class EcranAssistant extends StatefulWidget {
  const EcranAssistant({super.key});

  @override
  State<EcranAssistant> createState() => _EcranAssistantState();
}

class _EcranAssistantState extends State<EcranAssistant> {
  final _champ = TextEditingController();
  // Le ScrollController permet de faire défiler la liste jusqu'en bas
  final _defilement = ScrollController();

  String? _sessionId; // créée au premier message
  final List<MessageChat> _messages = [];
  bool _envoi = false;

  @override
  void dispose() {
    _champ.dispose();
    _defilement.dispose();
    super.dispose();
  }

  Future<void> _envoyer(String question) async {
    question = question.trim();
    if (question.length < 2 || _envoi) return;

    final depots = context.read<Depots>();
    final langue = context.read<Preferences>().langueAudio;

    // 1. On affiche tout de suite la question de l'utilisatrice
    setState(() {
      _messages.add(MessageChat(role: 'user', contenu: question, creeLe: DateTime.now()));
      _envoi = true;
      _champ.clear();
    });
    _allerEnBas();

    try {
      // 2. On crée la conversation si ce n'est pas déjà fait
      _sessionId ??= await depots.assistant.demarrer(langue);
      // 3. On envoie la question et on reçoit la réponse
      final reponse = await depots.assistant.envoyer(_sessionId!, question);
      if (!mounted) return;
      setState(() => _messages.add(reponse));
    } on ApiException catch (e) {
      if (!mounted) return;
      setState(() {
        _messages.add(MessageChat(role: 'assistant', contenu: e.message, creeLe: DateTime.now()));
      });
    } finally {
      if (mounted) setState(() => _envoi = false);
      _allerEnBas();
    }
  }

  // Fait défiler jusqu'au dernier message (après que l'écran soit redessiné)
  void _allerEnBas() {
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (_defilement.hasClients) {
        _defilement.animateTo(
          _defilement.position.maxScrollExtent,
          duration: const Duration(milliseconds: 300),
          curve: Curves.easeOut,
        );
      }
    });
  }

  @override
  Widget build(BuildContext context) {
    final textes = Theme.of(context).textTheme;
    final enLigne = context.watch<EtatConnexion>().enLigne;

    // Column = la liste des messages en haut, le champ de saisie en bas
    return Column(
      children: [
        // L'en-tête avec le rappel des limites
        Padding(
          padding: const EdgeInsets.fromLTRB(20, 16, 20, 8),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text('Assistant', style: textes.headlineMedium),
              const SizedBox(height: 4),
              Text('Informations générales · ne remplace pas un soignant.', style: textes.bodySmall),
            ],
          ),
        ),

        // Expanded = la liste prend toute la hauteur disponible
        Expanded(
          child: !enLigne
              ? _horsConnexion()
              : ListView(
                  controller: _defilement,
                  padding: const EdgeInsets.fromLTRB(20, 8, 20, 16),
                  children: [
                    // Le premier message, toujours affiché
                    const _Bulle(
                      texte: "Bonjour ! Je réponds à vos questions sur les cancers à partir de fiches validées. "
                          "Je ne pose pas de diagnostic. Pour votre situation personnelle, un soignant reste la bonne personne.",
                      utilisateur: false,
                    ),
                    for (final message in _messages) _construireMessage(message),
                    if (_envoi)
                      const Padding(
                        padding: EdgeInsets.all(8),
                        child: Text("L'assistant écrit…", style: TextStyle(color: Couleurs.gris, fontStyle: FontStyle.italic)),
                      ),
                  ],
                ),
        ),

        if (enLigne) ...[
          // Les suggestions, seulement au début de la conversation
          if (_messages.isEmpty)
            SizedBox(
              height: 44,
              child: ListView(
                scrollDirection: Axis.horizontal,
                padding: const EdgeInsets.symmetric(horizontal: 20),
                children: [
                  for (final s in _suggestions)
                    Padding(
                      padding: const EdgeInsets.only(right: 8),
                      child: ActionChip(label: Text(s), onPressed: () => _envoyer(s)),
                    ),
                ],
              ),
            ),
          // Le champ de saisie + le bouton envoyer
          Padding(
            padding: const EdgeInsets.fromLTRB(16, 8, 16, 12),
            child: Row(
              children: [
                Expanded(
                  child: TextField(
                    controller: _champ,
                    minLines: 1,
                    maxLines: 4,
                    textInputAction: TextInputAction.send,
                    onSubmitted: _envoyer,
                    decoration: decorationChamp('Votre question'),
                  ),
                ),
                const SizedBox(width: 8),
                IconButton.filled(
                  tooltip: 'Envoyer',
                  style: IconButton.styleFrom(backgroundColor: Couleurs.rose),
                  onPressed: _envoi ? null : () => _envoyer(_champ.text),
                  icon: const Icon(Icons.send, color: Couleurs.blanc),
                ),
              ],
            ),
          ),
        ],
      ],
    );
  }

  // Construit l'affichage d'un message (bulle + sources + boutons)
  Widget _construireMessage(MessageChat message) {
    // Message urgent : un encadré rouge et une seule action
    if (message.urgent) {
      return Padding(
        padding: const EdgeInsets.only(bottom: 12),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            Encadre(
              icone: Icons.warning_amber_rounded,
              titre: 'Cette situation demande un avis médical rapide',
              texte: message.contenu,
              fond: Couleurs.rougeFond,
              couleur: Couleurs.rouge,
            ),
            const SizedBox(height: 8),
            FilledButton.icon(
              onPressed: () => context.go('/centres'),
              icon: const Icon(Icons.place),
              label: const Text('Trouver un centre proche'),
            ),
          ],
        ),
      );
    }

    return Column(
      crossAxisAlignment: message.estUtilisateur ? CrossAxisAlignment.end : CrossAxisAlignment.start,
      children: [
        _Bulle(texte: message.contenu, utilisateur: message.estUtilisateur),
        if (message.sources.isNotEmpty)
          Padding(
            padding: const EdgeInsets.only(left: 4, bottom: 8),
            child: Text('Sources : ${message.sources.join(' · ')}', style: const TextStyle(fontSize: 12, color: Couleurs.gris)),
          ),
        // Un bouton par fiche citée
        for (final slug in message.documents)
          Padding(
            padding: const EdgeInsets.only(bottom: 8),
            child: OutlinedButton.icon(
              onPressed: () => context.push('/article/$slug'),
              icon: const Icon(Icons.menu_book_outlined, size: 18),
              label: const Text('Lire la fiche'),
            ),
          ),
      ],
    );
  }

  Widget _horsConnexion() {
    return ListView(
      padding: const EdgeInsets.all(20),
      children: [
        const Encadre(
          icone: Icons.wifi_off,
          titre: "L'assistant a besoin d'internet",
          texte: 'En attendant, vos fiches enregistrées restent lisibles. '
              'En cas de saignement important, de forte fièvre ou de douleur intense, rendez-vous au centre de santé le plus proche.',
          fond: Couleurs.sable,
          couleur: Couleurs.texte2,
        ),
        const SizedBox(height: 16),
        OutlinedButton(onPressed: () => context.go('/enregistres'), child: const Text('Voir mes fiches enregistrées')),
      ],
    );
  }
}

// Une bulle de conversation
class _Bulle extends StatelessWidget {
  const _Bulle({required this.texte, required this.utilisateur});

  final String texte;
  final bool utilisateur; // true = message de l'utilisatrice (à droite, en rose)

  @override
  Widget build(BuildContext context) {
    return Align(
      alignment: utilisateur ? Alignment.centerRight : Alignment.centerLeft,
      child: Container(
        margin: const EdgeInsets.only(bottom: 8),
        padding: const EdgeInsets.all(14),
        // La bulle ne dépasse pas 80 % de la largeur de l'écran
        constraints: BoxConstraints(maxWidth: MediaQuery.of(context).size.width * 0.8),
        decoration: BoxDecoration(
          color: utilisateur ? Couleurs.rose : Couleurs.blanc,
          borderRadius: BorderRadius.circular(16),
          border: utilisateur ? null : Border.all(color: Couleurs.ligne),
        ),
        child: Text(
          texte,
          style: TextStyle(color: utilisateur ? Couleurs.blanc : Couleurs.encre, fontSize: 15, height: 1.45),
        ),
      ),
    );
  }
}

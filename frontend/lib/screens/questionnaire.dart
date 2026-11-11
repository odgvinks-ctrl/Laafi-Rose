import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

import '../theme/couleurs.dart';
import '../widgets/encadre.dart';

// Une question du questionnaire : une affirmation, la bonne réponse et l'explication.
class _Question {
  const _Question(this.affirmation, this.vrai, this.explication);

  final String affirmation;
  final bool vrai; // true = l'affirmation est vraie
  final String explication;
}

// Les 6 affirmations. Pour en ajouter, il suffit d'ajouter une ligne ici.
const _questions = [
  _Question(
    'Une boule dans le sein est toujours un cancer.',
    false,
    "La plupart des boules ne sont pas des cancers. Mais seul un examen permet de le savoir : il faut toujours la montrer à un soignant.",
  ),
  _Question(
    'Le cancer du sein peut aussi toucher les hommes.',
    true,
    "C'est rare, mais cela arrive. Un homme qui remarque une boule près du mamelon doit consulter.",
  ),
  _Question(
    'Le dépistage du cancer du col est gratuit dans de nombreux centres de santé.',
    true,
    "L'inspection visuelle (IVA) est proposée gratuitement dans beaucoup de centres et lors des campagnes de dépistage.",
  ),
  _Question(
    "Un vaccin peut aider à prévenir le cancer du col de l'utérus.",
    true,
    'Le vaccin contre le HPV, recommandé aux filles de 9 à 14 ans, protège contre les virus le plus souvent en cause.',
  ),
  _Question(
    "Si l'on ne ressent aucune douleur, il n'y a pas besoin de dépistage.",
    false,
    "Au début, beaucoup de cancers ne font pas mal. C'est justement pour cela que le dépistage est utile.",
  ),
  _Question(
    'Un cancer découvert tôt se soigne mieux.',
    true,
    "Plus un cancer est découvert tôt, plus les traitements sont simples et efficaces.",
  ),
];

// ÉCRAN QUESTIONNAIRE « Vrai ou faux »
// Il porte sur les CONNAISSANCES, jamais sur l'état de santé : pas de score, pas de verdict.
class EcranQuestionnaire extends StatefulWidget {
  const EcranQuestionnaire({super.key});

  @override
  State<EcranQuestionnaire> createState() => _EcranQuestionnaireState();
}

class _EcranQuestionnaireState extends State<EcranQuestionnaire> {
  // -1 = page d'introduction ; de 0 à 5 = les questions ; 6 = la fin
  int _index = -1;

  // La réponse donnée à la question en cours : 'vrai', 'faux', 'nsp' (je ne sais pas) ou null
  String? _reponse;

  // On garde, pour chaque question, si elle a été bien comprise
  final List<bool> _bienCompris = [];

  void _repondre(String reponse) {
    final question = _questions[_index];
    final juste = (reponse == 'vrai' && question.vrai) || (reponse == 'faux' && !question.vrai);
    setState(() {
      _reponse = reponse;
      _bienCompris.add(juste);
    });
  }

  void _suivante() {
    setState(() {
      _index++;
      _reponse = null;
    });
  }

  void _recommencer() {
    setState(() {
      _index = 0;
      _reponse = null;
      _bienCompris.clear();
    });
  }

  @override
  Widget build(BuildContext context) {
    // On choisit quoi afficher selon _index
    Widget contenu;
    if (_index == -1) {
      contenu = _introduction();
    } else if (_index < _questions.length) {
      contenu = _question();
    } else {
      contenu = _fin();
    }

    return Scaffold(
      appBar: AppBar(backgroundColor: Couleurs.fond, title: const Text('Vrai ou faux ?')),
      body: contenu,
    );
  }

  Widget _introduction() {
    final textes = Theme.of(context).textTheme;
    return ListView(
      padding: const EdgeInsets.all(20),
      children: [
        Text('Testez ce que vous savez sur les cancers.', style: textes.headlineMedium),
        const SizedBox(height: 12),
        Text('${_questions.length} affirmations, environ 3 minutes.', style: textes.bodyLarge),
        const SizedBox(height: 16),
        const Encadre(
          icone: Icons.lock_outline,
          texte: "Ce questionnaire informe. Il n'évalue pas votre état de santé. Vos réponses ne sont ni envoyées ni enregistrées.",
        ),
        const SizedBox(height: 24),
        FilledButton(onPressed: _suivante, child: const Text('Commencer')),
      ],
    );
  }

  Widget _question() {
    final textes = Theme.of(context).textTheme;
    final question = _questions[_index];

    return ListView(
      padding: const EdgeInsets.all(20),
      children: [
        // La barre de progression
        Text('Question ${_index + 1} sur ${_questions.length}', style: textes.bodySmall),
        const SizedBox(height: 8),
        LinearProgressIndicator(
          value: (_index + 1) / _questions.length,
          backgroundColor: Couleurs.poudre,
          borderRadius: BorderRadius.circular(4),
        ),
        const SizedBox(height: 24),
        Text(question.affirmation, style: textes.headlineSmall),
        const SizedBox(height: 24),

        // Avant de répondre : les 3 boutons
        if (_reponse == null) ...[
          _BoutonReponse(texte: 'Vrai', surAppui: () => _repondre('vrai')),
          _BoutonReponse(texte: 'Faux', surAppui: () => _repondre('faux')),
          _BoutonReponse(texte: 'Je ne sais pas', surAppui: () => _repondre('nsp')),
        ]
        // Après avoir répondu : l'explication
        else ...[
          Encadre(
            icone: _bienCompris.last ? Icons.check_circle_outline : Icons.lightbulb_outline,
            titre: 'La bonne réponse : ${question.vrai ? 'VRAI' : 'FAUX'}',
            texte: question.explication,
            fond: _bienCompris.last ? Couleurs.vertFond : Couleurs.ambreFond,
            couleur: _bienCompris.last ? Couleurs.vert : Couleurs.ambre,
          ),
          const SizedBox(height: 8),
          Text(
            'Votre réponse : ${_reponse == 'vrai' ? 'Vrai' : _reponse == 'faux' ? 'Faux' : 'Je ne sais pas'}',
            style: textes.bodySmall,
          ),
          const SizedBox(height: 24),
          FilledButton(
            onPressed: _suivante,
            child: Text(_index == _questions.length - 1 ? 'Voir les points clés' : 'Question suivante'),
          ),
        ],
      ],
    );
  }

  Widget _fin() {
    final textes = Theme.of(context).textTheme;
    return ListView(
      padding: const EdgeInsets.all(20),
      children: [
        Text('Les points clés', style: textes.headlineMedium),
        const SizedBox(height: 16),
        // Pour chaque question : « Bien compris » ou « À revoir » (jamais de note)
        for (var i = 0; i < _questions.length; i++)
          Padding(
            padding: const EdgeInsets.only(bottom: 12),
            child: Row(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Icon(
                  _bienCompris[i] ? Icons.check_circle : Icons.replay_circle_filled,
                  color: _bienCompris[i] ? Couleurs.vert : Couleurs.ambre,
                ),
                const SizedBox(width: 10),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(_bienCompris[i] ? 'Bien compris' : 'À revoir', style: textes.labelSmall),
                      Text(_questions[i].explication, style: textes.bodyMedium),
                    ],
                  ),
                ),
              ],
            ),
          ),
        const SizedBox(height: 8),
        const Encadre(
          icone: Icons.medical_services_outlined,
          texte: "Vous avez une question sur votre santé ? Parlez-en à un soignant, c'est son rôle.",
        ),
        const SizedBox(height: 16),
        FilledButton.icon(
          onPressed: () => context.go('/centres'),
          icon: const Icon(Icons.place_outlined),
          label: const Text('Trouver un centre de dépistage'),
        ),
        const SizedBox(height: 8),
        OutlinedButton(onPressed: _recommencer, child: const Text('Recommencer')),
      ],
    );
  }
}

// Un grand bouton de réponse
class _BoutonReponse extends StatelessWidget {
  const _BoutonReponse({required this.texte, required this.surAppui});

  final String texte;
  final VoidCallback surAppui;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 12),
      child: OutlinedButton(
        style: OutlinedButton.styleFrom(minimumSize: const Size.fromHeight(56)),
        onPressed: surAppui,
        child: Text(texte, style: const TextStyle(fontSize: 17)),
      ),
    );
  }
}

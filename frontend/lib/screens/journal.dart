import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:provider/provider.dart';

import '../data/depots.dart';
import '../models/entree_journal.dart';
import '../theme/couleurs.dart';
import '../theme/theme.dart';
import '../widgets/encadre.dart';
import '../widgets/etat_vide.dart';

// ÉCRAN « MON JOURNAL » : la personne note comment elle se sent.
// Tout reste sur le téléphone (table journal_entries), rien n'est envoyé.
class EcranJournal extends StatefulWidget {
  const EcranJournal({super.key});

  @override
  State<EcranJournal> createState() => _EcranJournalState();
}

class _EcranJournalState extends State<EcranJournal> {
  List<EntreeJournal> _entrees = [];
  bool _chargement = true;

  @override
  void initState() {
    super.initState();
    _charger();
  }

  Future<void> _charger() async {
    final entrees = await context.read<Depots>().journal.lister();
    if (!mounted) return;
    setState(() {
      _entrees = entrees;
      _chargement = false;
    });
  }

  // Ouvre le formulaire en bas de l'écran, puis enregistre la note
  Future<void> _ajouter() async {
    // showModalBottomSheet renvoie ce que le formulaire donne à Navigator.pop
    final entree = await showModalBottomSheet<EntreeJournal>(
      context: context,
      isScrollControlled: true, // le formulaire peut prendre presque tout l'écran
      backgroundColor: Couleurs.fond,
      builder: (context) => const _FormulaireJournal(),
    );
    if (entree == null) return; // la personne a fermé sans enregistrer
    if (!mounted) return;

    await context.read<Depots>().journal.ajouter(entree);
    await _charger();

    // Si un signe inquiétant a été noté, on le rappelle tout de suite
    if (!mounted) return;
    if (entree.signeInquietant) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Vous avez noté un signe qui mérite un avis médical. Parlez-en vite à un soignant.'),
          duration: Duration(seconds: 6),
        ),
      );
    }
  }

  Future<void> _supprimer(EntreeJournal entree) async {
    final depots = context.read<Depots>();
    // On retire la note de la liste tout de suite (Flutter l'exige après un glissement),
    // puis on la supprime de la base du téléphone
    setState(() => _entrees.remove(entree));
    await depots.journal.supprimer(entree.id!);
  }

  String _formaterDate(DateTime date) =>
      '${date.day.toString().padLeft(2, '0')}/${date.month.toString().padLeft(2, '0')}/${date.year}';

  @override
  Widget build(BuildContext context) {
    final textes = Theme.of(context).textTheme;

    return Scaffold(
      appBar: AppBar(backgroundColor: Couleurs.fond, title: const Text('Mon journal')),
      // Le bouton rond en bas à droite
      floatingActionButton: FloatingActionButton.extended(
        onPressed: _ajouter,
        backgroundColor: Couleurs.rose,
        foregroundColor: Couleurs.blanc,
        icon: const Icon(Icons.add),
        label: const Text("Noter aujourd'hui"),
      ),
      body: ListView(
        padding: const EdgeInsets.fromLTRB(20, 8, 20, 100),
        children: [
          Text('Notez comment vous vous sentez. Ces notes restent sur votre téléphone.', style: textes.bodyMedium),
          const SizedBox(height: 16),
          if (_chargement)
            const Center(child: CircularProgressIndicator())
          else if (_entrees.isEmpty)
            const EtatVide(
              icone: Icons.edit_note,
              titre: 'Aucune note pour le moment',
              texte: 'Une note par jour aide à expliquer au soignant comment vous allez.',
            )
          else
            for (final entree in _entrees)
              // Dismissible = on peut glisser la carte vers la gauche pour la supprimer
              Dismissible(
                key: ValueKey(entree.id),
                direction: DismissDirection.endToStart,
                background: Container(
                  alignment: Alignment.centerRight,
                  padding: const EdgeInsets.only(right: 20),
                  color: Couleurs.rougeFond,
                  child: const Icon(Icons.delete_outline, color: Couleurs.rouge),
                ),
                onDismissed: (_) => _supprimer(entree),
                child: _CarteEntree(entree: entree, date: _formaterDate(entree.date)),
              ),
          const SizedBox(height: 16),
          const Encadre(
            icone: Icons.info_outline,
            texte: "Ce journal ne remplace pas un suivi médical. Montrez-le à votre soignant lors de vos rendez-vous.",
          ),
          const SizedBox(height: 8),
          TextButton(onPressed: () => context.go('/centres'), child: const Text('Trouver un centre de santé')),
        ],
      ),
    );
  }
}

// Une note du journal dans la liste
class _CarteEntree extends StatelessWidget {
  const _CarteEntree({required this.entree, required this.date});

  final EntreeJournal entree;
  final String date;

  @override
  Widget build(BuildContext context) {
    final textes = Theme.of(context).textTheme;

    // Les petites informations à afficher (seulement celles qui ont été remplies)
    final details = <String>[
      if (entree.humeur != null) 'Moral ${entree.humeur}/10',
      if (entree.fatigue != null) 'Fatigue ${entree.fatigue}/10',
      if (entree.douleur != null) 'Douleur ${entree.douleur}/10',
      if (entree.fievre) 'Fièvre',
      if (entree.saignement) 'Saignement',
    ];

    return Container(
      margin: const EdgeInsets.only(bottom: 10),
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: Couleurs.blanc,
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: entree.signeInquietant ? Couleurs.rouge : Couleurs.ligne),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Text(date, style: textes.titleMedium),
              const Spacer(),
              if (entree.signeInquietant) const Icon(Icons.warning_amber_rounded, color: Couleurs.rouge, size: 20),
            ],
          ),
          if (details.isNotEmpty) ...[
            const SizedBox(height: 4),
            Text(details.join(' · '), style: textes.bodyMedium),
          ],
          if (entree.note != null && entree.note!.isNotEmpty) ...[
            const SizedBox(height: 6),
            Text(entree.note!, style: textes.bodySmall),
          ],
        ],
      ),
    );
  }
}

// Le formulaire pour ajouter une note
class _FormulaireJournal extends StatefulWidget {
  const _FormulaireJournal();

  @override
  State<_FormulaireJournal> createState() => _FormulaireJournalState();
}

class _FormulaireJournalState extends State<_FormulaireJournal> {
  double _humeur = 5;
  double _fatigue = 5;
  double _douleur = 0;
  bool _fievre = false;
  bool _saignement = false;
  final _note = TextEditingController();

  @override
  void dispose() {
    _note.dispose();
    super.dispose();
  }

  void _enregistrer() {
    final maintenant = DateTime.now();
    final entree = EntreeJournal(
      date: maintenant,
      creeLe: maintenant,
      humeur: _humeur.round(),
      fatigue: _fatigue.round(),
      douleur: _douleur.round(),
      fievre: _fievre,
      saignement: _saignement,
      note: _note.text.trim().isEmpty ? null : _note.text.trim(),
    );
    // On ferme le formulaire en renvoyant la note à l'écran du journal
    Navigator.pop(context, entree);
  }

  @override
  Widget build(BuildContext context) {
    final textes = Theme.of(context).textTheme;

    return Padding(
      // viewInsets.bottom = la hauteur du clavier, pour que le formulaire remonte
      padding: EdgeInsets.fromLTRB(20, 20, 20, 20 + MediaQuery.of(context).viewInsets.bottom),
      child: SingleChildScrollView(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text("Comment allez-vous aujourd'hui ?", style: textes.headlineSmall),
            const SizedBox(height: 16),
            _Curseur(libelle: 'Moral', valeur: _humeur, surChangement: (v) => setState(() => _humeur = v)),
            _Curseur(libelle: 'Fatigue', valeur: _fatigue, surChangement: (v) => setState(() => _fatigue = v)),
            _Curseur(libelle: 'Douleur', valeur: _douleur, surChangement: (v) => setState(() => _douleur = v)),
            // SwitchListTile = une ligne avec un interrupteur oui/non
            SwitchListTile(
              contentPadding: EdgeInsets.zero,
              title: const Text("J'ai de la fièvre"),
              value: _fievre,
              onChanged: (v) => setState(() => _fievre = v),
            ),
            SwitchListTile(
              contentPadding: EdgeInsets.zero,
              title: const Text("J'ai un saignement inhabituel"),
              value: _saignement,
              onChanged: (v) => setState(() => _saignement = v),
            ),
            const SizedBox(height: 8),
            TextField(controller: _note, maxLines: 3, decoration: decorationChamp('Une remarque ? (facultatif)')),
            const SizedBox(height: 16),
            SizedBox(
              width: double.infinity,
              child: FilledButton(onPressed: _enregistrer, child: const Text('Enregistrer')),
            ),
          ],
        ),
      ),
    );
  }
}

// Un curseur de 0 à 10 avec son libellé
class _Curseur extends StatelessWidget {
  const _Curseur({required this.libelle, required this.valeur, required this.surChangement});

  final String libelle;
  final double valeur;
  final ValueChanged<double> surChangement; // une fonction qui reçoit la nouvelle valeur

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text('$libelle : ${valeur.round()}/10', style: Theme.of(context).textTheme.titleMedium),
        Slider(value: valeur, min: 0, max: 10, divisions: 10, label: '${valeur.round()}', onChanged: surChangement),
      ],
    );
  }
}

import '../core/cache/base_locale.dart';
import '../models/entree_journal.dart';

class JournalDepot {
  Future<List<EntreeJournal>> lister({int limite = 60}) async {
    final db = await BaseLocale.ouvrir();
    final lignes = await db.query('journal_entries', orderBy: 'date DESC', limit: limite);
    return lignes.map(EntreeJournal.fromLigne).toList();
  }

  Future<EntreeJournal> ajouter(EntreeJournal entree) async {
    final db = await BaseLocale.ouvrir();
    final id = await db.insert('journal_entries', entree.versLigne());
    final lignes = await db.query('journal_entries', where: 'id = ?', whereArgs: [id]);
    return EntreeJournal.fromLigne(lignes.first);
  }

  Future<void> supprimer(int id) async {
    final db = await BaseLocale.ouvrir();
    await db.delete('journal_entries', where: 'id = ?', whereArgs: [id]);
  }

  Future<void> toutEffacer() async {
    final db = await BaseLocale.ouvrir();
    await db.delete('journal_entries');
  }
}

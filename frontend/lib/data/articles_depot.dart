import 'package:shared_preferences/shared_preferences.dart';
import 'package:sqflite/sqflite.dart';

import '../core/api/client_api.dart';
import '../core/cache/base_locale.dart';
import '../models/article.dart';

class ArticlesDepot {
  ArticlesDepot(this._api);

  static const _cleSynchro = 'laafi-articles-synchro';
  final ClientApi _api;

  Future<int> synchroniser() async {
    final prefs = await SharedPreferences.getInstance();
    final depuis = prefs.getString(_cleSynchro);
    final debut = DateTime.now().toUtc();
    final liste = await _api.get('/articles/', params: {if (depuis != null) 'depuis': depuis}, auth: false) as List;
    final retires = List<String>.from(await _api.get('/articles/retires', auth: false));
    final db = await BaseLocale.ouvrir();
    await db.transaction((txn) async {
      for (final json in liste) {
        final article = Article.fromApi(Map<String, dynamic>.from(json));
        final existant = await txn.query('articles', columns: ['enregistre'], where: 'slug = ?', whereArgs: [article.slug]);
        final ligne = article.versLigne()..['enregistre'] = existant.isEmpty ? 0 : existant.first['enregistre'];
        await txn.insert('articles', ligne, conflictAlgorithm: ConflictAlgorithm.replace);
      }
      for (final slug in retires) {
        await txn.delete('articles', where: 'slug = ?', whereArgs: [slug]);
      }
    });
    await prefs.setString(_cleSynchro, debut.toIso8601String());
    return liste.length;
  }

  Future<List<Article>> lister({String? categorie, String? recherche}) async {
    final db = await BaseLocale.ouvrir();
    final conditions = <String>[];
    final valeurs = <Object>[];
    if (categorie != null) {
      conditions.add('categorie = ?');
      valeurs.add(categorie);
    }
    if (recherche != null && recherche.trim().isNotEmpty) {
      conditions.add('(titre LIKE ? OR resume LIKE ? OR contenu LIKE ?)');
      final motif = '%${recherche.trim()}%';
      valeurs.addAll([motif, motif, motif]);
    }
    final lignes = await db.query(
      'articles',
      where: conditions.isEmpty ? null : conditions.join(' AND '),
      whereArgs: valeurs.isEmpty ? null : valeurs,
      orderBy: 'titre',
    );
    return lignes.map(Article.fromLigne).toList();
  }

  Future<Article?> obtenir(String slug) async {
    final db = await BaseLocale.ouvrir();
    final lignes = await db.query('articles', where: 'slug = ?', whereArgs: [slug]);
    if (lignes.isNotEmpty) return Article.fromLigne(lignes.first);
    try {
      final article = Article.fromApi(await _api.get('/articles/$slug', auth: false));
      await db.insert('articles', article.versLigne(), conflictAlgorithm: ConflictAlgorithm.replace);
      return article;
    } on ApiException {
      return null;
    }
  }

  Future<void> enregistrer(String slug, bool valeur) async {
    final db = await BaseLocale.ouvrir();
    await db.update('articles', {'enregistre': valeur ? 1 : 0}, where: 'slug = ?', whereArgs: [slug]);
  }

  Future<List<Article>> enregistres() async {
    final db = await BaseLocale.ouvrir();
    final lignes = await db.query('articles', where: 'enregistre = 1', orderBy: 'titre');
    return lignes.map(Article.fromLigne).toList();
  }
}

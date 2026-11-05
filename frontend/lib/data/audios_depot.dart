import 'dart:io';

import 'package:http/http.dart' as http;
import 'package:path/path.dart' as p;
import 'package:path_provider/path_provider.dart';
import 'package:sqflite/sqflite.dart';

import '../core/api/client_api.dart';
import '../core/cache/base_locale.dart';
import '../models/fichier_audio.dart';

class AudiosDepot {
  Future<List<FichierAudio>> lister() async {
    final db = await BaseLocale.ouvrir();
    final lignes = await db.query('audio_files', orderBy: 'telecharge_le DESC');
    return lignes.map(FichierAudio.fromLigne).toList();
  }

  Future<FichierAudio?> obtenir(String articleSlug, String langue) async {
    final db = await BaseLocale.ouvrir();
    final lignes = await db.query('audio_files', where: 'article_slug = ? AND langue = ?', whereArgs: [articleSlug, langue]);
    return lignes.isEmpty ? null : FichierAudio.fromLigne(lignes.first);
  }

  Future<FichierAudio> telecharger({required String articleSlug, required String langue, required String url}) async {
    final db = await BaseLocale.ouvrir();
    final base = FichierAudio(articleSlug: articleSlug, langue: langue, url: url, statut: 'en_cours');
    await db.insert('audio_files', base.versLigne(), conflictAlgorithm: ConflictAlgorithm.replace);
    try {
      final reponse = await http.get(Uri.parse(url));
      if (reponse.statusCode != 200) throw ApiException('Le fichier audio est indisponible.');
      final dossier = Directory(p.join((await getApplicationDocumentsDirectory()).path, 'audios'));
      await dossier.create(recursive: true);
      final fichier = File(p.join(dossier.path, '$articleSlug-$langue${p.extension(Uri.parse(url).path).isEmpty ? '.mp3' : p.extension(Uri.parse(url).path)}'));
      await fichier.writeAsBytes(reponse.bodyBytes);
      final termine = FichierAudio(
        articleSlug: articleSlug,
        langue: langue,
        url: url,
        cheminLocal: fichier.path,
        tailleOctets: reponse.bodyBytes.length,
        statut: 'telecharge',
        telechargeLe: DateTime.now(),
      );
      await db.insert('audio_files', termine.versLigne(), conflictAlgorithm: ConflictAlgorithm.replace);
      return (await obtenir(articleSlug, langue))!;
    } catch (e) {
      await db.update('audio_files', {'statut': 'erreur'}, where: 'article_slug = ? AND langue = ?', whereArgs: [articleSlug, langue]);
      if (e is ApiException) rethrow;
      throw ApiException('Le téléchargement a échoué. Vérifiez votre connexion.');
    }
  }

  Future<void> supprimer(FichierAudio audio) async {
    if (audio.cheminLocal != null) {
      final fichier = File(audio.cheminLocal!);
      if (await fichier.exists()) await fichier.delete();
    }
    final db = await BaseLocale.ouvrir();
    await db.delete('audio_files', where: 'id = ?', whereArgs: [audio.id]);
  }

  Future<int> espaceUtilise() async {
    final db = await BaseLocale.ouvrir();
    final resultat = await db.rawQuery("SELECT COALESCE(SUM(taille_octets), 0) AS total FROM audio_files WHERE statut = 'telecharge'");
    return (resultat.first['total'] as int?) ?? 0;
  }
}

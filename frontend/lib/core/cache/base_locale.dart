import 'package:path/path.dart';
import 'package:sqflite/sqflite.dart';

class BaseLocale {
  static Database? _base;

  static Future<Database> ouvrir() async {
    return _base ??= await openDatabase(
      join(await getDatabasesPath(), 'laafi_rose.db'),
      version: 1,
      onCreate: (db, version) async {
        await db.execute('''
          CREATE TABLE articles (
            slug TEXT PRIMARY KEY,
            titre TEXT NOT NULL,
            categorie TEXT NOT NULL,
            resume TEXT,
            contenu TEXT NOT NULL,
            langue TEXT NOT NULL DEFAULT 'fr',
            lecture_minutes INTEGER NOT NULL DEFAULT 4,
            audios TEXT NOT NULL DEFAULT '{}',
            sources TEXT NOT NULL DEFAULT '[]',
            revise_le TEXT,
            mis_a_jour_le TEXT NOT NULL,
            enregistre INTEGER NOT NULL DEFAULT 0
          )
        ''');
        await db.execute('''
          CREATE TABLE audio_files (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            article_slug TEXT NOT NULL,
            langue TEXT NOT NULL,
            url TEXT NOT NULL,
            chemin_local TEXT,
            taille_octets INTEGER,
            statut TEXT NOT NULL DEFAULT 'a_telecharger',
            telecharge_le TEXT,
            UNIQUE (article_slug, langue)
          )
        ''');
        await db.execute('''
          CREATE TABLE journal_entries (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            date TEXT NOT NULL,
            humeur INTEGER,
            fatigue INTEGER,
            douleur INTEGER,
            fievre INTEGER NOT NULL DEFAULT 0,
            saignement INTEGER NOT NULL DEFAULT 0,
            note TEXT,
            cree_le TEXT NOT NULL
          )
        ''');
      },
    );
  }
}

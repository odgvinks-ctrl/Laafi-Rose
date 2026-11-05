import 'dart:convert';

class SourceArticle {
  const SourceArticle({required this.titre, this.organisation, this.url});

  final String titre;
  final String? organisation;
  final String? url;

  factory SourceArticle.fromJson(Map<String, dynamic> json) => SourceArticle(
        titre: json['title'] ?? json['titre'] ?? '',
        organisation: json['organisation'],
        url: json['url'],
      );

  Map<String, dynamic> toJson() => {'titre': titre, 'organisation': organisation, 'url': url};

  String get libelle => organisation == null ? titre : '$organisation — $titre';
}

class Article {
  const Article({
    required this.slug,
    required this.titre,
    required this.categorie,
    required this.contenu,
    required this.misAJourLe,
    this.resume,
    this.langue = 'fr',
    this.lectureMinutes = 4,
    this.audios = const {},
    this.sources = const [],
    this.reviseLe,
    this.enregistre = false,
  });

  final String slug;
  final String titre;
  final String categorie;
  final String? resume;
  final String contenu;
  final String langue;
  final int lectureMinutes;
  final Map<String, String> audios;
  final List<SourceArticle> sources;
  final DateTime? reviseLe;
  final DateTime misAJourLe;
  final bool enregistre;

  factory Article.fromApi(Map<String, dynamic> json) => Article(
        slug: json['slug'],
        titre: json['titre'],
        categorie: json['categorie'],
        resume: json['resume'],
        contenu: json['contenu'],
        langue: json['langue'] ?? 'fr',
        lectureMinutes: json['lecture_minutes'] ?? 4,
        audios: Map<String, String>.from(json['audios'] ?? {}),
        sources: (json['sources'] as List? ?? []).map((s) => SourceArticle.fromJson(Map<String, dynamic>.from(s))).toList(),
        reviseLe: json['revise_le'] == null ? null : DateTime.parse(json['revise_le']),
        misAJourLe: DateTime.parse(json['mis_a_jour_le']),
      );

  factory Article.fromLigne(Map<String, Object?> ligne) => Article(
        slug: ligne['slug'] as String,
        titre: ligne['titre'] as String,
        categorie: ligne['categorie'] as String,
        resume: ligne['resume'] as String?,
        contenu: ligne['contenu'] as String,
        langue: ligne['langue'] as String,
        lectureMinutes: ligne['lecture_minutes'] as int,
        audios: Map<String, String>.from(jsonDecode(ligne['audios'] as String)),
        sources: (jsonDecode(ligne['sources'] as String) as List).map((s) => SourceArticle.fromJson(Map<String, dynamic>.from(s))).toList(),
        reviseLe: ligne['revise_le'] == null ? null : DateTime.parse(ligne['revise_le'] as String),
        misAJourLe: DateTime.parse(ligne['mis_a_jour_le'] as String),
        enregistre: ligne['enregistre'] == 1,
      );

  Map<String, Object?> versLigne() => {
        'slug': slug,
        'titre': titre,
        'categorie': categorie,
        'resume': resume,
        'contenu': contenu,
        'langue': langue,
        'lecture_minutes': lectureMinutes,
        'audios': jsonEncode(audios),
        'sources': jsonEncode(sources.map((s) => s.toJson()).toList()),
        'revise_le': reviseLe?.toIso8601String(),
        'mis_a_jour_le': misAJourLe.toIso8601String(),
        'enregistre': enregistre ? 1 : 0,
      };

  bool audioDisponible(String langue) => audios.containsKey(langue);
}

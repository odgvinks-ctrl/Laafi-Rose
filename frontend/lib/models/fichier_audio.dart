class FichierAudio {
  const FichierAudio({
    this.id,
    required this.articleSlug,
    required this.langue,
    required this.url,
    this.cheminLocal,
    this.tailleOctets,
    this.statut = 'a_telecharger',
    this.telechargeLe,
  });

  final int? id;
  final String articleSlug;
  final String langue;
  final String url;
  final String? cheminLocal;
  final int? tailleOctets;
  final String statut;
  final DateTime? telechargeLe;

  bool get estDisponible => statut == 'telecharge' && cheminLocal != null;

  factory FichierAudio.fromLigne(Map<String, Object?> ligne) => FichierAudio(
        id: ligne['id'] as int?,
        articleSlug: ligne['article_slug'] as String,
        langue: ligne['langue'] as String,
        url: ligne['url'] as String,
        cheminLocal: ligne['chemin_local'] as String?,
        tailleOctets: ligne['taille_octets'] as int?,
        statut: ligne['statut'] as String,
        telechargeLe: ligne['telecharge_le'] == null ? null : DateTime.parse(ligne['telecharge_le'] as String),
      );

  Map<String, Object?> versLigne() => {
        if (id != null) 'id': id,
        'article_slug': articleSlug,
        'langue': langue,
        'url': url,
        'chemin_local': cheminLocal,
        'taille_octets': tailleOctets,
        'statut': statut,
        'telecharge_le': telechargeLe?.toIso8601String(),
      };
}

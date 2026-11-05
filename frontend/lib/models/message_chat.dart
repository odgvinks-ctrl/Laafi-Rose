class MessageChat {
  const MessageChat({
    required this.role,
    required this.contenu,
    required this.creeLe,
    this.id,
    this.sources = const [],
    this.documents = const [],
    this.urgent = false,
  });

  final int? id;
  final String role;
  final String contenu;
  final List<String> sources;
  final List<String> documents;
  final bool urgent;
  final DateTime creeLe;

  bool get estUtilisateur => role == 'user';

  factory MessageChat.fromApi(Map<String, dynamic> json) => MessageChat(
        id: json['id'],
        role: json['role'],
        contenu: json['content'],
        sources: List<String>.from(json['sources'] ?? []),
        documents: List<String>.from(json['document_slugs'] ?? []),
        urgent: json['is_urgent'] ?? false,
        creeLe: DateTime.parse(json['created_at']),
      );
}

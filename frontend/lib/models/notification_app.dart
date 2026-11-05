class NotificationApp {
  const NotificationApp({required this.id, required this.type, required this.titre, required this.creeLe, this.corps, this.lien, this.lueLe});

  final int id;
  final String type;
  final String titre;
  final String? corps;
  final String? lien;
  final DateTime? lueLe;
  final DateTime creeLe;

  bool get lue => lueLe != null;

  factory NotificationApp.fromApi(Map<String, dynamic> json) => NotificationApp(
        id: json['id'],
        type: json['type'],
        titre: json['title'],
        corps: json['body'],
        lien: json['link'],
        lueLe: json['read_at'] == null ? null : DateTime.parse(json['read_at']),
        creeLe: DateTime.parse(json['created_at']),
      );
}

class Utilisateur {
  const Utilisateur({required this.id, required this.telephone, required this.role, this.prenom, this.ville, this.langue = 'fr'});

  final int id;
  final String telephone;
  final String role;
  final String? prenom;
  final String? ville;
  final String langue;

  factory Utilisateur.fromApi(Map<String, dynamic> json) {
    final profil = json['profile'] as Map<String, dynamic>?;
    return Utilisateur(
      id: json['id'],
      telephone: json['phone'],
      role: json['role']['code'],
      prenom: profil?['first_name'],
      ville: profil?['city'],
      langue: profil?['language'] ?? 'fr',
    );
  }
}

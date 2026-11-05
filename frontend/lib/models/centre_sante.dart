class ServiceSante {
  const ServiceSante({required this.id, required this.nom, required this.categorie, this.description, this.gratuit = false, this.disponible = true});

  final int id;
  final String nom;
  final String categorie;
  final String? description;
  final bool gratuit;
  final bool disponible;

  factory ServiceSante.fromApi(Map<String, dynamic> json) => ServiceSante(
        id: json['id'],
        nom: json['name'],
        categorie: json['category'],
        description: json['description'],
        gratuit: json['is_free'] ?? false,
        disponible: json['available'] ?? true,
      );
}

class CentreSante {
  const CentreSante({
    required this.id,
    required this.nom,
    this.type,
    this.ville,
    this.quartier,
    this.adresse,
    this.telephone,
    this.latitude,
    this.longitude,
    this.horaires,
    this.rendezVous = false,
    this.verifie = false,
    this.verifieLe,
    this.services = const [],
    this.distanceKm,
  });

  final int id;
  final String nom;
  final String? type;
  final String? ville;
  final String? quartier;
  final String? adresse;
  final String? telephone;
  final double? latitude;
  final double? longitude;
  final String? horaires;
  final bool rendezVous;
  final bool verifie;
  final DateTime? verifieLe;
  final List<ServiceSante> services;
  final double? distanceKm;

  factory CentreSante.fromApi(Map<String, dynamic> json) => CentreSante(
        id: json['id'],
        nom: json['name'],
        type: json['type'],
        ville: json['city'],
        quartier: json['district'],
        adresse: json['address'],
        telephone: json['phone'],
        latitude: (json['latitude'] as num?)?.toDouble(),
        longitude: (json['longitude'] as num?)?.toDouble(),
        horaires: json['opening_hours'],
        rendezVous: json['accepts_appointments'] ?? false,
        verifie: json['verified'] ?? false,
        verifieLe: json['verified_at'] == null ? null : DateTime.parse(json['verified_at']),
        services: (json['services'] as List? ?? []).map((s) => ServiceSante.fromApi(Map<String, dynamic>.from(s))).toList(),
        distanceKm: (json['distance_km'] as num?)?.toDouble(),
      );
}

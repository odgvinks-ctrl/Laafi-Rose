class RendezVous {
  const RendezVous({
    required this.reference,
    required this.centreId,
    required this.statut,
    required this.nom,
    required this.telephone,
    required this.creeLe,
    this.serviceId,
    this.souhaiteLe,
    this.confirmeLe,
  });

  final String reference;
  final int centreId;
  final int? serviceId;
  final DateTime? souhaiteLe;
  final DateTime? confirmeLe;
  final String statut;
  final String nom;
  final String telephone;
  final DateTime creeLe;

  bool get enAttente => statut == 'en_attente';

  factory RendezVous.fromApi(Map<String, dynamic> json) => RendezVous(
        reference: json['reference'],
        centreId: json['health_center_id'],
        serviceId: json['service_id'],
        souhaiteLe: json['desired_at'] == null ? null : DateTime.parse(json['desired_at']),
        confirmeLe: json['confirmed_at'] == null ? null : DateTime.parse(json['confirmed_at']),
        statut: json['status'],
        nom: json['name'],
        telephone: json['phone'],
        creeLe: DateTime.parse(json['created_at']),
      );
}

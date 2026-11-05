import '../core/api/client_api.dart';
import '../models/rendez_vous.dart';

class RendezVousDepot {
  RendezVousDepot(this._api);

  final ClientApi _api;

  Future<RendezVous> demander({
    required int centreId,
    int? serviceId,
    DateTime? souhaiteLe,
    required String nom,
    required String telephone,
    String contact = 'appel',
    String langue = 'fr',
    required bool accord,
  }) async {
    final reponse = await _api.post('/appointments/', corps: {
      'health_center_id': centreId,
      'service_id': serviceId,
      'desired_at': souhaiteLe?.toIso8601String(),
      'name': nom.trim(),
      'phone': telephone.trim(),
      'contact_method': contact,
      'language': langue,
      'consent': accord,
    });
    return RendezVous.fromApi(reponse);
  }

  Future<List<RendezVous>> mesDemandes() async {
    final liste = await _api.get('/appointments/mes-demandes') as List;
    return liste.map((r) => RendezVous.fromApi(Map<String, dynamic>.from(r))).toList();
  }

  Future<RendezVous> statut(String reference, String telephone) async =>
      RendezVous.fromApi(await _api.get('/appointments/$reference', params: {'phone': telephone}, auth: false));
}

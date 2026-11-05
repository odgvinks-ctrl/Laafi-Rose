import '../core/api/client_api.dart';
import '../models/centre_sante.dart';

class CentresDepot {
  CentresDepot(this._api);

  final ClientApi _api;

  Future<List<CentreSante>> lister({String? ville, String? categorie, String? recherche, bool verifies = false, double? lat, double? lng}) async {
    final params = <String, String>{
      if (ville != null) 'city': ville,
      if (categorie != null) 'category': categorie,
      if (recherche != null && recherche.isNotEmpty) 'q': recherche,
      if (verifies) 'verified': 'true',
      if (lat != null && lng != null) 'lat': '$lat',
      if (lat != null && lng != null) 'lng': '$lng',
    };
    final liste = await _api.get('/health-centers/', params: params, auth: false) as List;
    return liste.map((c) => CentreSante.fromApi(Map<String, dynamic>.from(c))).toList();
  }

  Future<CentreSante> obtenir(int id) async => CentreSante.fromApi(await _api.get('/health-centers/$id', auth: false));

  Future<List<String>> categories() async => List<String>.from(await _api.get('/services/categories', auth: false));
}

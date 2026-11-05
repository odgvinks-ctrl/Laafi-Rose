import 'dart:async';
import 'dart:convert';

import 'package:http/http.dart' as http;

import 'stockage_jeton.dart';

class ApiException implements Exception {
  ApiException(this.message, {this.statut});

  final String message;
  final int? statut;

  @override
  String toString() => message;
}

class ClientApi {
  ClientApi({required this.base, required this.jeton, http.Client? client}) : _client = client ?? http.Client();

  final String base;
  final StockageJeton jeton;
  final http.Client _client;

  Future<dynamic> get(String chemin, {Map<String, String>? params, bool auth = true}) =>
      _envoyer('GET', chemin, params: params, auth: auth);

  Future<dynamic> post(String chemin, {Object? corps, bool auth = true}) => _envoyer('POST', chemin, corps: corps, auth: auth);

  Future<dynamic> patch(String chemin, {Object? corps, bool auth = true}) => _envoyer('PATCH', chemin, corps: corps, auth: auth);

  Future<dynamic> delete(String chemin, {bool auth = true}) => _envoyer('DELETE', chemin, auth: auth);

  Future<dynamic> _envoyer(String methode, String chemin, {Map<String, String>? params, Object? corps, bool auth = true}) async {
    final uri = Uri.parse('$base$chemin').replace(queryParameters: params?.isEmpty ?? true ? null : params);
    final requete = http.Request(methode, uri);
    requete.headers['Accept'] = 'application/json';
    if (corps != null) {
      requete.headers['Content-Type'] = 'application/json';
      requete.body = jsonEncode(corps);
    }
    if (auth) {
      final valeur = await jeton.lire();
      if (valeur != null) requete.headers['Authorization'] = 'Bearer $valeur';
    }

    http.Response reponse;
    try {
      reponse = await http.Response.fromStream(await _client.send(requete).timeout(const Duration(seconds: 20)));
    } on TimeoutException {
      throw ApiException('Le service met trop de temps à répondre. Réessayez dans un instant.');
    } catch (_) {
      throw ApiException('Impossible de joindre le service. Vérifiez votre connexion.');
    }

    if (reponse.statusCode == 204 || reponse.bodyBytes.isEmpty) return null;
    dynamic donnees;
    try {
      donnees = jsonDecode(utf8.decode(reponse.bodyBytes));
    } catch (_) {
      donnees = null;
    }

    if (reponse.statusCode >= 400) {
      if (reponse.statusCode == 401 && auth) await jeton.effacer();
      throw ApiException(_messageErreur(reponse.statusCode, donnees), statut: reponse.statusCode);
    }
    return donnees;
  }

  String _messageErreur(int statut, dynamic corps) {
    final detail = corps is Map ? corps['detail'] : null;
    if (detail is String) return detail;
    if (detail is List && detail.isNotEmpty) return 'Certaines informations sont invalides.';
    if (statut >= 500) return 'Le service rencontre un problème. Réessayez dans un instant.';
    return 'Une erreur est survenue.';
  }
}

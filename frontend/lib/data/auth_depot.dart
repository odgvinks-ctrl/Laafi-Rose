import '../core/api/client_api.dart';
import '../core/api/stockage_jeton.dart';
import '../models/utilisateur.dart';

class AuthDepot {
  AuthDepot(this._api, this._jeton);

  final ClientApi _api;
  final StockageJeton _jeton;

  Future<bool> aUneSession() async => await _jeton.lire() != null;

  Future<Utilisateur> moi() async => Utilisateur.fromApi(await _api.get('/users/me'));

  Future<Utilisateur> connexion(String telephone, String motDePasse) async {
    final reponse = await _api.post('/auth/login', corps: {'phone': telephone.trim(), 'password': motDePasse}, auth: false);
    await _jeton.ecrire(reponse['access_token']);
    return moi();
  }

  Future<Utilisateur> inscription({required String telephone, required String motDePasse, required String prenom, String? ville, String langue = 'fr'}) async {
    final reponse = await _api.post(
      '/auth/register',
      corps: {'phone': telephone.trim(), 'password': motDePasse, 'first_name': prenom.trim(), 'city': ville, 'language': langue},
      auth: false,
    );
    await _jeton.ecrire(reponse['access_token']);
    return moi();
  }

  Future<void> modifierProfil(Map<String, dynamic> champs) => _api.patch('/users/me/profile', corps: champs);

  Future<void> deconnexion() => _jeton.effacer();
}

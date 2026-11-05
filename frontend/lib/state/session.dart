import 'package:flutter/foundation.dart';

import '../data/auth_depot.dart';
import '../models/utilisateur.dart';

class Session extends ChangeNotifier {
  Session(this._auth);

  final AuthDepot _auth;
  Utilisateur? _utilisateur;

  Utilisateur? get utilisateur => _utilisateur;
  bool get connecte => _utilisateur != null;

  Future<void> restaurer() async {
    if (!await _auth.aUneSession()) return;
    try {
      _utilisateur = await _auth.moi();
      notifyListeners();
    } catch (_) {
      _utilisateur = null;
    }
  }

  Future<void> connecter(String telephone, String motDePasse) async {
    _utilisateur = await _auth.connexion(telephone, motDePasse);
    notifyListeners();
  }

  Future<void> inscrire({required String telephone, required String motDePasse, required String prenom, String? ville, String langue = 'fr'}) async {
    _utilisateur = await _auth.inscription(telephone: telephone, motDePasse: motDePasse, prenom: prenom, ville: ville, langue: langue);
    notifyListeners();
  }

  Future<void> deconnecter() async {
    await _auth.deconnexion();
    _utilisateur = null;
    notifyListeners();
  }
}

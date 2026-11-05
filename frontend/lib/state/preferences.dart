import 'package:flutter/foundation.dart';
import 'package:shared_preferences/shared_preferences.dart';

class Preferences extends ChangeNotifier {
  Preferences._(this._prefs);

  final SharedPreferences _prefs;

  static Future<Preferences> charger() async => Preferences._(await SharedPreferences.getInstance());

  bool get introVue => _prefs.getBool('intro-vue') ?? false;
  String get langueAudio => _prefs.getString('langue-audio') ?? 'fr';
  String get tailleTexte => _prefs.getString('taille-texte') ?? 'standard';
  bool get wifiSeulement => _prefs.getBool('wifi-seulement') ?? true;

  double get echelleTexte => switch (tailleTexte) {
        'grand' => 1.12,
        'tres_grand' => 1.25,
        _ => 1.0,
      };

  Future<void> marquerIntroVue() async {
    await _prefs.setBool('intro-vue', true);
    notifyListeners();
  }

  Future<void> choisirLangueAudio(String langue) async {
    await _prefs.setString('langue-audio', langue);
    notifyListeners();
  }

  Future<void> choisirTailleTexte(String taille) async {
    await _prefs.setString('taille-texte', taille);
    notifyListeners();
  }

  Future<void> choisirWifiSeulement(bool valeur) async {
    await _prefs.setBool('wifi-seulement', valeur);
    notifyListeners();
  }
}

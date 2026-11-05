import 'dart:async';

import 'package:connectivity_plus/connectivity_plus.dart';
import 'package:flutter/foundation.dart';

class EtatConnexion extends ChangeNotifier {
  bool _enLigne = true;
  StreamSubscription<List<ConnectivityResult>>? _abonnement;

  bool get enLigne => _enLigne;

  Future<void> ecouter() async {
    _appliquer(await Connectivity().checkConnectivity());
    _abonnement = Connectivity().onConnectivityChanged.listen(_appliquer);
  }

  void _appliquer(List<ConnectivityResult> resultats) {
    final enLigne = resultats.any((r) => r != ConnectivityResult.none);
    if (enLigne != _enLigne) {
      _enLigne = enLigne;
      notifyListeners();
    }
  }

  @override
  void dispose() {
    _abonnement?.cancel();
    super.dispose();
  }
}

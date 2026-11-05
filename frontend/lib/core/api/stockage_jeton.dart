import 'package:flutter_secure_storage/flutter_secure_storage.dart';

class StockageJeton {
  static const _cle = 'laafi-jeton';
  final _stockage = const FlutterSecureStorage();
  String? _cache;

  Future<String?> lire() async => _cache ??= await _stockage.read(key: _cle);

  Future<void> ecrire(String jeton) async {
    _cache = jeton;
    await _stockage.write(key: _cle, value: jeton);
  }

  Future<void> effacer() async {
    _cache = null;
    await _stockage.delete(key: _cle);
  }
}

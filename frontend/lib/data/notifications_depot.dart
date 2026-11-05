import '../core/api/client_api.dart';
import '../models/notification_app.dart';

class NotificationsDepot {
  NotificationsDepot(this._api);

  final ClientApi _api;

  Future<List<NotificationApp>> lister({bool nonLues = false}) async {
    final liste = await _api.get('/notifications/', params: {if (nonLues) 'unread_only': 'true'}) as List;
    return liste.map((n) => NotificationApp.fromApi(Map<String, dynamic>.from(n))).toList();
  }

  Future<void> marquerLue(int id) => _api.post('/notifications/$id/lue');

  Future<void> toutMarquerLu() => _api.post('/notifications/tout-lire');

  Future<void> supprimer(int id) => _api.delete('/notifications/$id');
}

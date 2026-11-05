import '../core/api/client_api.dart';
import '../models/message_chat.dart';

class AssistantDepot {
  AssistantDepot(this._api);

  final ClientApi _api;

  Future<String> demarrer(String langue) async {
    final reponse = await _api.post('/chat/sessions', corps: {'language': langue});
    return reponse['id'] as String;
  }

  Future<MessageChat> envoyer(String sessionId, String question) async =>
      MessageChat.fromApi(await _api.post('/chat/sessions/$sessionId/messages', corps: {'content': question}));

  Future<List<MessageChat>> historique(String sessionId) async {
    final liste = await _api.get('/chat/sessions/$sessionId/messages') as List;
    return liste.map((m) => MessageChat.fromApi(Map<String, dynamic>.from(m))).toList();
  }
}

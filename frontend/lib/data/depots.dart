import '../core/api/client_api.dart';
import '../core/api/stockage_jeton.dart';
import 'articles_depot.dart';
import 'assistant_depot.dart';
import 'audios_depot.dart';
import 'auth_depot.dart';
import 'centres_depot.dart';
import 'journal_depot.dart';
import 'notifications_depot.dart';
import 'rendez_vous_depot.dart';

class Depots {
  Depots({required ClientApi backend, required ClientApi ia, required StockageJeton jeton})
      : auth = AuthDepot(backend, jeton),
        centres = CentresDepot(backend),
        rendezVous = RendezVousDepot(backend),
        notifications = NotificationsDepot(backend),
        articles = ArticlesDepot(ia),
        assistant = AssistantDepot(ia),
        audios = AudiosDepot(),
        journal = JournalDepot();

  final AuthDepot auth;
  final CentresDepot centres;
  final RendezVousDepot rendezVous;
  final NotificationsDepot notifications;
  final ArticlesDepot articles;
  final AssistantDepot assistant;
  final AudiosDepot audios;
  final JournalDepot journal;
}

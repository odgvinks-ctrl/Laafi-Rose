import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:provider/provider.dart';

import '../core/api/client_api.dart';
import '../data/depots.dart';
import '../models/notification_app.dart';
import '../state/session.dart';
import '../theme/couleurs.dart';
import '../widgets/etat_vide.dart';
import '../widgets/message_erreur.dart';

// ÉCRAN NOTIFICATIONS (réponses des centres, rappels…)
// Il faut être connecté, car les notifications sont liées au compte.
class EcranNotifications extends StatefulWidget {
  const EcranNotifications({super.key});

  @override
  State<EcranNotifications> createState() => _EcranNotificationsState();
}

class _EcranNotificationsState extends State<EcranNotifications> {
  List<NotificationApp> _notifications = [];
  bool _chargement = true;
  String? _erreur;

  @override
  void initState() {
    super.initState();
    if (context.read<Session>().connecte) {
      _charger();
    } else {
      _chargement = false;
    }
  }

  Future<void> _charger() async {
    setState(() {
      _chargement = true;
      _erreur = null;
    });
    try {
      final liste = await context.read<Depots>().notifications.lister();
      if (!mounted) return;
      setState(() => _notifications = liste);
    } on ApiException catch (e) {
      if (!mounted) return;
      setState(() => _erreur = e.message);
    } finally {
      if (mounted) setState(() => _chargement = false);
    }
  }

  // Quand on touche une notification : on la marque comme lue et on suit son lien
  Future<void> _ouvrir(NotificationApp notification) async {
    final depots = context.read<Depots>();
    if (!notification.lue) {
      try {
        await depots.notifications.marquerLue(notification.id);
      } catch (_) {
        // pas grave si ça échoue
      }
    }
    if (!mounted) return;
    if (notification.lien != null) {
      await context.push(notification.lien!);
    }
    await _charger();
  }

  Future<void> _toutLire() async {
    await context.read<Depots>().notifications.toutMarquerLu();
    await _charger();
  }

  // Affiche « il y a 5 min », « il y a 2 h », ou la date
  String _quand(DateTime date) {
    final ecart = DateTime.now().difference(date.toLocal());
    if (ecart.inMinutes < 60) return 'il y a ${ecart.inMinutes} min';
    if (ecart.inHours < 24) return 'il y a ${ecart.inHours} h';
    return '${date.day.toString().padLeft(2, '0')}/${date.month.toString().padLeft(2, '0')}/${date.year}';
  }

  @override
  Widget build(BuildContext context) {
    final connecte = context.watch<Session>().connecte;
    final aDesNonLues = _notifications.any((n) => !n.lue);

    return Scaffold(
      appBar: AppBar(
        backgroundColor: Couleurs.fond,
        title: const Text('Notifications'),
        actions: [
          if (connecte && aDesNonLues) TextButton(onPressed: _toutLire, child: const Text('Tout lire')),
        ],
      ),
      body: _construireContenu(connecte),
    );
  }

  Widget _construireContenu(bool connecte) {
    if (!connecte) {
      return ListView(
        padding: const EdgeInsets.all(20),
        children: [
          EtatVide(
            icone: Icons.notifications_none,
            titre: 'Connectez-vous pour voir vos notifications',
            texte: 'Les réponses des centres à vos demandes de rendez-vous arrivent ici.',
            action: FilledButton(onPressed: () => context.push('/connexion'), child: const Text('Se connecter')),
          ),
        ],
      );
    }
    if (_chargement) return const Center(child: CircularProgressIndicator());
    if (_erreur != null) {
      return Padding(padding: const EdgeInsets.all(20), child: MessageErreur(message: _erreur!, surReessayer: _charger));
    }
    if (_notifications.isEmpty) {
      return const Padding(
        padding: EdgeInsets.all(20),
        child: EtatVide(icone: Icons.notifications_none, titre: 'Aucune notification', texte: 'Vous êtes à jour.'),
      );
    }

    final textes = Theme.of(context).textTheme;
    return RefreshIndicator(
      onRefresh: _charger,
      // ListView.separated = une liste avec un séparateur entre chaque élément
      child: ListView.separated(
        padding: const EdgeInsets.symmetric(vertical: 8),
        itemCount: _notifications.length,
        separatorBuilder: (context, index) => const Divider(height: 1),
        itemBuilder: (context, index) {
          final n = _notifications[index];
          return ListTile(
            // Les notifications non lues ont un fond rosé
            tileColor: n.lue ? null : Couleurs.voile,
            leading: Icon(n.lue ? Icons.notifications_none : Icons.notifications_active, color: Couleurs.roseFonce),
            title: Text(n.titre, style: TextStyle(fontWeight: n.lue ? FontWeight.w400 : FontWeight.w700)),
            subtitle: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                if (n.corps != null) Text(n.corps!),
                Text(_quand(n.creeLe), style: textes.bodySmall),
              ],
            ),
            onTap: () => _ouvrir(n),
          );
        },
      ),
    );
  }
}

import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:provider/provider.dart';

import '../state/session.dart';
import '../theme/couleurs.dart';
import '../theme/theme.dart';
import '../widgets/logo_laafi.dart';

class EcranConnexion extends StatefulWidget {
  const EcranConnexion({super.key});

  @override
  State<EcranConnexion> createState() => _EcranConnexionState();
}

class _EcranConnexionState extends State<EcranConnexion> {
  final _telephone = TextEditingController();
  final _motDePasse = TextEditingController();
  String _erreur = '';
  bool _chargement = false;

  @override
  void dispose() {
    _telephone.dispose();
    _motDePasse.dispose();
    super.dispose();
  }

  Future<void> _seConnecter() async {
    setState(() {
      _chargement = true;
      _erreur = '';
    });
    try {
      await context.read<Session>().connecter(_telephone.text, _motDePasse.text);
      if (mounted) context.go('/');
    } catch (e) {
      setState(() => _erreur = e.toString());
    } finally {
      if (mounted) setState(() => _chargement = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final textes = Theme.of(context).textTheme;
    return Scaffold(
      appBar: AppBar(backgroundColor: Couleurs.fond),
      body: ListView(
        padding: const EdgeInsets.all(20),
        children: [
          const LogoLaafi(),
          const SizedBox(height: 24),
          Text('Connexion', style: textes.headlineMedium),
          const SizedBox(height: 8),
          Text('Pour retrouver vos demandes de rendez-vous et vos notifications.', style: textes.bodyMedium),
          const SizedBox(height: 24),
          TextField(controller: _telephone, keyboardType: TextInputType.phone, decoration: decorationChamp('Numéro de téléphone', prefixe: '+226 ')),
          const SizedBox(height: 16),
          TextField(controller: _motDePasse, obscureText: true, decoration: decorationChamp('Mot de passe')),
          if (_erreur.isNotEmpty) ...[
            const SizedBox(height: 16),
            Container(
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(color: Couleurs.rougeFond, borderRadius: BorderRadius.circular(12)),
              child: Text(_erreur, style: const TextStyle(color: Color(0xFF7A2424))),
            ),
          ],
          const SizedBox(height: 24),
          FilledButton(onPressed: _chargement ? null : _seConnecter, child: Text(_chargement ? 'Connexion...' : 'Se connecter')),
        ],
      ),
    );
  }
}

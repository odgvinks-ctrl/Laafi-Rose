import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

import 'bande_hors_connexion.dart';

class CoquilleNavigation extends StatelessWidget {
  const CoquilleNavigation({super.key, required this.shell});

  final StatefulNavigationShell shell;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: SafeArea(
        bottom: false,
        child: Column(
          children: [
            const BandeHorsConnexion(),
            Expanded(child: shell),
          ],
        ),
      ),
      bottomNavigationBar: NavigationBar(
        selectedIndex: shell.currentIndex,
        onDestinationSelected: (index) => shell.goBranch(index, initialLocation: index == shell.currentIndex),
        destinations: const [
          NavigationDestination(icon: Icon(Icons.home_outlined), selectedIcon: Icon(Icons.home), label: 'Accueil'),
          NavigationDestination(icon: Icon(Icons.menu_book_outlined), selectedIcon: Icon(Icons.menu_book), label: "S'informer"),
          NavigationDestination(icon: Icon(Icons.place_outlined), selectedIcon: Icon(Icons.place), label: 'Centres'),
          NavigationDestination(icon: Icon(Icons.chat_bubble_outline), selectedIcon: Icon(Icons.chat_bubble), label: 'Assistant'),
          NavigationDestination(icon: Icon(Icons.download_outlined), selectedIcon: Icon(Icons.download), label: 'Enregistrés'),
        ],
      ),
    );
  }
}

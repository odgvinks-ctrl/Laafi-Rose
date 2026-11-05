import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:laafi_rose/models/entree_journal.dart';
import 'package:laafi_rose/widgets/logo_laafi.dart';

void main() {
  testWidgets('Le logo affiche le nom de l\'application', (tester) async {
    await tester.pumpWidget(const MaterialApp(home: Scaffold(body: LogoLaafi())));
    expect(find.textContaining('Laafi'), findsOneWidget);
  });

  test('Une fièvre est un signe inquiétant dans le journal', () {
    final entree = EntreeJournal(date: DateTime(2026, 11, 4), creeLe: DateTime(2026, 11, 4), fievre: true);
    expect(entree.signeInquietant, isTrue);
  });
}

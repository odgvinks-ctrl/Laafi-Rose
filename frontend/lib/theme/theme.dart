import 'package:flutter/material.dart';

import 'couleurs.dart';

TextStyle _serif(double taille, double hauteur) => TextStyle(
      fontFamily: 'Fraunces',
      fontSize: taille,
      height: hauteur,
      fontWeight: FontWeight.w500,
      fontVariations: const [FontVariation('wght', 500)],
      color: Couleurs.prune,
      letterSpacing: -0.2,
    );

ThemeData construireTheme() {
  final schema = ColorScheme.fromSeed(
    seedColor: Couleurs.rose,
    primary: Couleurs.rose,
    onPrimary: Couleurs.blanc,
    secondary: Couleurs.prune,
    surface: Couleurs.fond,
    error: Couleurs.rouge,
  );

  return ThemeData(
    useMaterial3: true,
    colorScheme: schema,
    scaffoldBackgroundColor: Couleurs.fond,
    fontFamily: 'Atkinson',
    textTheme: TextTheme(
      headlineLarge: _serif(29, 1.2),
      headlineMedium: _serif(26, 1.25),
      headlineSmall: _serif(21, 1.3),
      titleLarge: const TextStyle(fontSize: 18, height: 1.35, fontWeight: FontWeight.w700, color: Couleurs.prune),
      titleMedium: const TextStyle(fontSize: 16, height: 1.4, fontWeight: FontWeight.w700, color: Couleurs.prune),
      bodyLarge: const TextStyle(fontSize: 16, height: 1.5, color: Couleurs.encre),
      bodyMedium: const TextStyle(fontSize: 15, height: 1.5, color: Couleurs.texte2),
      bodySmall: const TextStyle(fontSize: 13, height: 1.4, color: Couleurs.gris),
      labelLarge: const TextStyle(fontSize: 16, fontWeight: FontWeight.w700),
      labelSmall: const TextStyle(fontSize: 12, fontWeight: FontWeight.w700, letterSpacing: 0.7, color: Couleurs.roseFonce),
    ),
    filledButtonTheme: FilledButtonThemeData(
      style: FilledButton.styleFrom(
        backgroundColor: Couleurs.rose,
        foregroundColor: Couleurs.blanc,
        minimumSize: const Size(48, 52),
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
        textStyle: const TextStyle(fontFamily: 'Atkinson', fontSize: 16, fontWeight: FontWeight.w700),
      ),
    ),
    outlinedButtonTheme: OutlinedButtonThemeData(
      style: OutlinedButton.styleFrom(
        foregroundColor: Couleurs.prune,
        minimumSize: const Size(48, 48),
        side: const BorderSide(color: Couleurs.ligneForte),
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
        textStyle: const TextStyle(fontFamily: 'Atkinson', fontSize: 15, fontWeight: FontWeight.w700),
      ),
    ),
    navigationBarTheme: NavigationBarThemeData(
      backgroundColor: Couleurs.blanc,
      indicatorColor: Couleurs.poudre,
      height: 72,
      labelTextStyle: WidgetStateProperty.resolveWith(
        (etats) => TextStyle(
          fontFamily: 'Atkinson',
          fontSize: 12,
          fontWeight: etats.contains(WidgetState.selected) ? FontWeight.w700 : FontWeight.w400,
          color: etats.contains(WidgetState.selected) ? Couleurs.prune : Couleurs.gris,
        ),
      ),
      iconTheme: WidgetStateProperty.resolveWith(
        (etats) => IconThemeData(color: etats.contains(WidgetState.selected) ? Couleurs.roseFonce : Couleurs.gris),
      ),
    ),
  );
}

InputDecoration decorationChamp(String libelle, {String? aide, String? prefixe}) => InputDecoration(
      labelText: libelle,
      helperText: aide,
      prefixText: prefixe,
      filled: true,
      fillColor: Couleurs.blanc,
      border: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: const BorderSide(color: Couleurs.ligneForte)),
      enabledBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: const BorderSide(color: Couleurs.ligneForte)),
      focusedBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: const BorderSide(color: Couleurs.rose, width: 2)),
    );

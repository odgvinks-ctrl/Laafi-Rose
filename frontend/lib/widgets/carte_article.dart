import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

import '../data/categories.dart';
import '../models/article.dart';
import '../theme/couleurs.dart';

// Une carte qui présente une fiche (titre, résumé, durée de lecture).
// Quand on appuie dessus, on ouvre la fiche complète.
class CarteArticle extends StatelessWidget {
  const CarteArticle({super.key, required this.article});

  final Article article;

  @override
  Widget build(BuildContext context) {
    final textes = Theme.of(context).textTheme;

    return Card(
      elevation: 0,
      color: Couleurs.blanc,
      margin: const EdgeInsets.only(bottom: 12),
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(16),
        side: const BorderSide(color: Couleurs.ligne),
      ),
      // InkWell rend la carte « cliquable » avec un petit effet visuel
      child: InkWell(
        borderRadius: BorderRadius.circular(16),
        // context.push ouvre un nouvel écran par-dessus l'écran actuel
        onTap: () => context.push('/article/${article.slug}'),
        child: Padding(
          padding: const EdgeInsets.all(16),
          child: Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Le monogramme : la première lettre du titre dans un carré rose
              Container(
                width: 44,
                height: 44,
                alignment: Alignment.center,
                decoration: BoxDecoration(color: Couleurs.poudre, borderRadius: BorderRadius.circular(12)),
                child: Text(
                  article.titre.isEmpty ? '?' : article.titre[0].toUpperCase(),
                  style: textes.headlineSmall?.copyWith(color: Couleurs.roseFonce),
                ),
              ),
              const SizedBox(width: 14),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(libelleCategorie(article.categorie).toUpperCase(), style: textes.labelSmall),
                    const SizedBox(height: 4),
                    Text(article.titre, style: textes.titleMedium),
                    if (article.resume != null) ...[
                      const SizedBox(height: 4),
                      // maxLines + ellipsis = on coupe le texte avec « … » s'il est trop long
                      Text(article.resume!, style: textes.bodySmall, maxLines: 2, overflow: TextOverflow.ellipsis),
                    ],
                    const SizedBox(height: 8),
                    Row(
                      children: [
                        const Icon(Icons.schedule, size: 14, color: Couleurs.gris),
                        const SizedBox(width: 4),
                        Text('${article.lectureMinutes} min', style: textes.bodySmall),
                        // Si un audio existe, on l'indique
                        if (article.audios.isNotEmpty) ...[
                          const SizedBox(width: 12),
                          const Icon(Icons.headphones, size: 14, color: Couleurs.gris),
                          const SizedBox(width: 4),
                          Text('Audio', style: textes.bodySmall),
                        ],
                        if (article.enregistre) ...[
                          const SizedBox(width: 12),
                          const Icon(Icons.download_done, size: 14, color: Couleurs.vert),
                        ],
                      ],
                    ),
                  ],
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

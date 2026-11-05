import 'package:flutter/material.dart';

import '../theme/couleurs.dart';

class SymboleLaafi extends StatelessWidget {
  const SymboleLaafi({super.key, this.taille = 30});

  final double taille;

  @override
  Widget build(BuildContext context) => CustomPaint(size: Size.square(taille), painter: _PeintreSymbole());
}

class _PeintreSymbole extends CustomPainter {
  @override
  void paint(Canvas canvas, Size size) {
    final e = size.width / 40;
    canvas.drawRRect(
      RRect.fromRectAndRadius(Offset.zero & size, Radius.circular(11 * e)),
      Paint()..color = Couleurs.rose,
    );
    final clair = Paint()..color = Couleurs.fond;
    final bourgeon = Path()
      ..moveTo(20 * e, 33 * e)
      ..cubicTo(12.5 * e, 29 * e, 10.5 * e, 20.5 * e, 14.5 * e, 12.5 * e)
      ..cubicTo(16.8 * e, 16.5 * e, 18.6 * e, 18.2 * e, 20 * e, 19 * e)
      ..cubicTo(21.4 * e, 18.2 * e, 23.2 * e, 16.5 * e, 25.5 * e, 12.5 * e)
      ..cubicTo(29.5 * e, 20.5 * e, 27.5 * e, 29 * e, 20 * e, 33 * e)
      ..close();
    canvas.drawPath(bourgeon, clair);
    canvas.drawCircle(Offset(20 * e, 8.6 * e), 2.6 * e, clair);
  }

  @override
  bool shouldRepaint(covariant CustomPainter oldDelegate) => false;
}

class LogoLaafi extends StatelessWidget {
  const LogoLaafi({super.key, this.taille = 30});

  final double taille;

  @override
  Widget build(BuildContext context) {
    return Row(
      mainAxisSize: MainAxisSize.min,
      children: [
        SymboleLaafi(taille: taille),
        SizedBox(width: taille / 3),
        Text.rich(
          const TextSpan(
            text: 'Laafi ',
            children: [
              TextSpan(text: 'Rose', style: TextStyle(fontStyle: FontStyle.italic, color: Couleurs.rose, fontVariations: [FontVariation('wght', 400)])),
            ],
          ),
          style: TextStyle(
            fontFamily: 'Fraunces',
            fontSize: taille * 0.7,
            fontWeight: FontWeight.w500,
            fontVariations: const [FontVariation('wght', 500)],
            color: Couleurs.prune,
          ),
        ),
      ],
    );
  }
}

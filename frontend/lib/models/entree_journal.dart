class EntreeJournal {
  const EntreeJournal({
    this.id,
    required this.date,
    required this.creeLe,
    this.humeur,
    this.fatigue,
    this.douleur,
    this.fievre = false,
    this.saignement = false,
    this.note,
  });

  final int? id;
  final DateTime date;
  final int? humeur;
  final int? fatigue;
  final int? douleur;
  final bool fievre;
  final bool saignement;
  final String? note;
  final DateTime creeLe;

  bool get signeInquietant => fievre || saignement || (douleur ?? 0) >= 8;

  factory EntreeJournal.fromLigne(Map<String, Object?> ligne) => EntreeJournal(
        id: ligne['id'] as int?,
        date: DateTime.parse(ligne['date'] as String),
        humeur: ligne['humeur'] as int?,
        fatigue: ligne['fatigue'] as int?,
        douleur: ligne['douleur'] as int?,
        fievre: ligne['fievre'] == 1,
        saignement: ligne['saignement'] == 1,
        note: ligne['note'] as String?,
        creeLe: DateTime.parse(ligne['cree_le'] as String),
      );

  Map<String, Object?> versLigne() => {
        if (id != null) 'id': id,
        'date': date.toIso8601String(),
        'humeur': humeur,
        'fatigue': fatigue,
        'douleur': douleur,
        'fievre': fievre ? 1 : 0,
        'saignement': saignement ? 1 : 0,
        'note': note,
        'cree_le': creeLe.toIso8601String(),
      };
}

class WeightRecord {
  final String id;
  final String petId;
  final double weight;
  final DateTime date;

  WeightRecord({
    required this.id,
    required this.petId,
    required this.weight,
    required this.date,
  });

  String get formattedWeight => '${weight.toStringAsFixed(1)} kg';
  String get formattedDate => '${date.month}月${date.day}日';

  factory WeightRecord.fromJson(Map<String, dynamic> json) {
    return WeightRecord(
      id: json['id'] as String,
      petId: json['petId'] as String,
      weight: (json['weight'] as num).toDouble(),
      date: DateTime.parse(json['recordDate'] as String),
    );
  }

  Map<String, dynamic> toJson() => {
        'id': id,
        'petId': petId,
        'weight': weight,
        'recordDate':
            '${date.year}-${date.month.toString().padLeft(2, '0')}-${date.day.toString().padLeft(2, '0')}',
      };

  WeightRecord copyWith({
    String? id,
    String? petId,
    double? weight,
    DateTime? date,
  }) {
    return WeightRecord(
      id: id ?? this.id,
      petId: petId ?? this.petId,
      weight: weight ?? this.weight,
      date: date ?? this.date,
    );
  }
}

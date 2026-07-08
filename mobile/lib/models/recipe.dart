class RecipeEntry {
  final String id;
  final String petId;
  final String food;
  final DateTime time;
  final String amount;
  final String frequency;

  RecipeEntry({
    required this.id,
    required this.petId,
    required this.food,
    required this.time,
    required this.amount,
    required this.frequency,
  });

  String get formattedTime => '${time.year}年${time.month}月${time.day}日 ${time.hour.toString().padLeft(2, '0')}:${time.minute.toString().padLeft(2, '0')}';

  factory RecipeEntry.fromJson(Map<String, dynamic> json) {
    return RecipeEntry(
      id: json['id'] as String,
      petId: json['petId'] as String,
      food: json['food'] as String,
      time: DateTime.parse(json['feedTime'] as String),
      amount: (json['amount'] as String?) ?? '',
      frequency: (json['frequency'] as String?) ?? '',
    );
  }

  Map<String, dynamic> toJson() => {
        'id': id,
        'petId': petId,
        'food': food,
        'feedTime': time.toIso8601String(),
        'amount': amount,
        'frequency': frequency,
      };

  RecipeEntry copyWith({
    String? id,
    String? petId,
    String? food,
    DateTime? time,
    String? amount,
    String? frequency,
  }) {
    return RecipeEntry(
      id: id ?? this.id,
      petId: petId ?? this.petId,
      food: food ?? this.food,
      time: time ?? this.time,
      amount: amount ?? this.amount,
      frequency: frequency ?? this.frequency,
    );
  }
}

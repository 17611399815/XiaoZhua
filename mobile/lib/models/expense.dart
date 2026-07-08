class Expense {
  final String id;
  final String petId;
  final String category;
  final double amount;
  final String note;
  final DateTime date;

  Expense({
    required this.id,
    required this.petId,
    required this.category,
    required this.amount,
    required this.note,
    required this.date,
  });

  String get formattedAmount => '¥${amount.toStringAsFixed(2)}';
  String get formattedDate => '${date.year}年${date.month}月${date.day}日';

  factory Expense.fromJson(Map<String, dynamic> json) {
    return Expense(
      id: json['id'] as String,
      petId: json['petId'] as String,
      category: json['category'] as String,
      amount: (json['amount'] as num).toDouble(),
      note: (json['note'] as String?) ?? '',
      date: DateTime.parse(json['expenseDate'] as String),
    );
  }

  Map<String, dynamic> toJson() => {
        'id': id,
        'petId': petId,
        'category': category,
        'amount': amount,
        'note': note,
        'expenseDate':
            '${date.year}-${date.month.toString().padLeft(2, '0')}-${date.day.toString().padLeft(2, '0')}',
      };

  Expense copyWith({
    String? id,
    String? petId,
    String? category,
    double? amount,
    String? note,
    DateTime? date,
  }) {
    return Expense(
      id: id ?? this.id,
      petId: petId ?? this.petId,
      category: category ?? this.category,
      amount: amount ?? this.amount,
      note: note ?? this.note,
      date: date ?? this.date,
    );
  }
}

class ExpenseCategory {
  static const String food = '食品';
  static const String medical = '医疗';
  static const String toy = '玩具';
  static const String bath = '洗护';
  static const String insurance = '保险';
  static const String other = '其他';

  static const List<String> all = [food, medical, toy, bath, insurance, other];

  static String getEmoji(String category) {
    switch (category) {
      case food:
        return '🦴';
      case medical:
        return '💊';
      case toy:
        return '🎾';
      case bath:
        return '🛁';
      case insurance:
        return '📋';
      case other:
        return '💰';
      default:
        return '💳';
    }
  }

  static String getIconColor(String category) {
    switch (category) {
      case food:
        return '#FF9A3C';
      case medical:
        return '#FF6B6B';
      case toy:
        return '#4DABF7';
      case bath:
        return '#339AF0';
      case insurance:
        return '#40C057';
      case other:
        return '#9775FA';
      default:
        return '#868E96';
    }
  }
}

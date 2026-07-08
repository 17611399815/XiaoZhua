class StockItem {
  final String id;
  final String petId;
  final String name;
  final String brand;
  final String category;
  final int remaining;
  final int total;
  final String unit;

  StockItem({
    required this.id,
    required this.petId,
    required this.name,
    required this.brand,
    required this.category,
    required this.remaining,
    required this.total,
    required this.unit,
  });

  double get percentage => total > 0 ? remaining / total : 0.0;
  String get stockLabel => '$remaining / $total $unit';
  bool get isLow => percentage < 0.3;

  factory StockItem.fromJson(Map<String, dynamic> json) {
    return StockItem(
      id: json['id'] as String,
      petId: json['petId'] as String,
      name: json['name'] as String,
      brand: (json['brand'] as String?) ?? '',
      category: json['category'] as String,
      remaining: (json['remaining'] as num?)?.toInt() ?? 0,
      total: (json['total'] as num?)?.toInt() ?? 0,
      unit: (json['unit'] as String?) ?? '个',
    );
  }

  Map<String, dynamic> toJson() => {
        'id': id,
        'petId': petId,
        'name': name,
        'brand': brand,
        'category': category,
        'remaining': remaining,
        'total': total,
        'unit': unit,
      };

  StockItem copyWith({
    String? id,
    String? petId,
    String? name,
    String? brand,
    String? category,
    int? remaining,
    int? total,
    String? unit,
  }) {
    return StockItem(
      id: id ?? this.id,
      petId: petId ?? this.petId,
      name: name ?? this.name,
      brand: brand ?? this.brand,
      category: category ?? this.category,
      remaining: remaining ?? this.remaining,
      total: total ?? this.total,
      unit: unit ?? this.unit,
    );
  }
}

class StockCategory {
  static const String food = '食品';
  static const String supplies = '用品';
  static const String medicine = '药品';
  static const String toy = '玩具';

  static const List<String> all = [food, supplies, medicine, toy];

  static String getEmoji(String category) {
    switch (category) {
      case food:
        return '🦴';
      case supplies:
        return '🧴';
      case medicine:
        return '💊';
      case toy:
        return '🎾';
      default:
        return '📦';
    }
  }
}

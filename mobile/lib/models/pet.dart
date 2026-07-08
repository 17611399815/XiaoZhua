class Pet {
  final String id;
  final String name;
  final String gender; // '男孩' 或 '女孩'
  final String type; // '猫咪' 或 '狗狗' 或 '其他'
  final DateTime meetDate; // 到家时间
  final String emoji; // 用于头像展示的 emoji
  final String breed; // 品种
  final String? birthday; // 生日（中文格式：YYYY年M月D日）
  final double weight; // 体重（kg）
  final bool isNeutered; // 是否绝育

  Pet({
    required this.id,
    required this.name,
    required this.gender,
    required this.type,
    required this.meetDate,
    this.emoji = '🐶',
    this.breed = '',
    this.birthday,
    this.weight = 0.0,
    this.isNeutered = false,
  });

  // 计算相伴天数
  int get daysTogether {
    return DateTime.now().difference(meetDate).inDays + 1;
  }

  // JSON 序列化
  factory Pet.fromJson(Map<String, dynamic> json) {
    return Pet(
      id: json['id'] as String,
      name: json['name'] as String,
      gender: json['gender'] as String,
      type: json['type'] as String,
      meetDate: DateTime.parse(json['meetDate'] as String),
      emoji: (json['emoji'] as String?) ?? '🐶',
      breed: (json['breed'] as String?) ?? '',
      birthday: json['birthday'] as String?,
      weight: (json['weight'] as num?)?.toDouble() ?? 0.0,
      isNeutered: (json['isNeutered'] as bool?) ?? false,
    );
  }

  Map<String, dynamic> toJson() => {
        'id': id,
        'name': name,
        'gender': gender,
        'type': type,
        'meetDate': meetDate.toIso8601String(),
        'emoji': emoji,
        'breed': breed,
        'birthday': birthday,
        'weight': weight,
        'isNeutered': isNeutered,
      };

  // 复制并更新字段的方法
  Pet copyWith({
    String? id,
    String? name,
    String? gender,
    String? type,
    DateTime? meetDate,
    String? emoji,
    String? breed,
    String? birthday,
    double? weight,
    bool? isNeutered,
  }) {
    return Pet(
      id: id ?? this.id,
      name: name ?? this.name,
      gender: gender ?? this.gender,
      type: type ?? this.type,
      meetDate: meetDate ?? this.meetDate,
      emoji: emoji ?? this.emoji,
      breed: breed ?? this.breed,
      birthday: birthday ?? this.birthday,
      weight: weight ?? this.weight,
      isNeutered: isNeutered ?? this.isNeutered,
    );
  }
}

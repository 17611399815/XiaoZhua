import 'package:flutter/material.dart';

class Reminder {
  final String id;
  final String petId;
  final String title;
  final String type;
  final String? description;
  final DateTime date;
  final TimeOfDay time;
  final bool isCompleted;

  Reminder({
    required this.id,
    required this.petId,
    required this.title,
    required this.type,
    this.description,
    required this.date,
    required this.time,
    this.isCompleted = false,
  });

  String get formattedTime =>
      '${time.hour.toString().padLeft(2, '0')}:${time.minute.toString().padLeft(2, '0')}';

  String get formattedDate => '${date.year}年${date.month}月${date.day}日';

  factory Reminder.fromJson(Map<String, dynamic> json) {
    return Reminder(
      id: json['id'] as String,
      petId: json['petId'] as String,
      title: json['title'] as String,
      type: json['type'] as String,
      description: json['description'] as String?,
      date: DateTime.parse(json['remindDate'] as String),
      time: _parseTime(json['remindTime'] as String?),
      isCompleted: (json['isCompleted'] as bool?) ?? false,
    );
  }

  static TimeOfDay _parseTime(String? timeStr) {
    if (timeStr == null) return const TimeOfDay(hour: 9, minute: 0);
    final parts = timeStr.split(':');
    return TimeOfDay(
      hour: int.tryParse(parts[0]) ?? 0,
      minute: int.tryParse(parts.length > 1 ? parts[1] : '0') ?? 0,
    );
  }

  Map<String, dynamic> toJson() => {
        'id': id,
        'petId': petId,
        'title': title,
        'type': type,
        'description': description,
        'remindDate':
            '${date.year}-${date.month.toString().padLeft(2, '0')}-${date.day.toString().padLeft(2, '0')}',
        'remindTime': formattedTime,
        'isCompleted': isCompleted,
      };

  Reminder copyWith({
    String? id,
    String? petId,
    String? title,
    String? type,
    String? description,
    DateTime? date,
    TimeOfDay? time,
    bool? isCompleted,
  }) {
    return Reminder(
      id: id ?? this.id,
      petId: petId ?? this.petId,
      title: title ?? this.title,
      type: type ?? this.type,
      description: description ?? this.description,
      date: date ?? this.date,
      time: time ?? this.time,
      isCompleted: isCompleted ?? this.isCompleted,
    );
  }
}

class ReminderType {
  static const String birthday = '生日';
  static const String vaccine = '疫苗';
  static const String deworm = '驱虫';
  static const String bath = '洗澡';
  static const String medical = '就医';
  static const String custom = '自定义';

  static const List<String> all = [
    birthday,
    vaccine,
    deworm,
    bath,
    medical,
    custom,
  ];

  static String getEmoji(String type) {
    switch (type) {
      case birthday:
        return '🎂';
      case vaccine:
        return '💉';
      case deworm:
        return '🪱';
      case bath:
        return '🛁';
      case medical:
        return '🏥';
      case custom:
        return '✨';
      default:
        return '📌';
    }
  }

  static Color getColor(String type) {
    switch (type) {
      case birthday:
        return const Color(0xFFFFE8E8);
      case vaccine:
        return const Color(0xFFFFF0CC);
      case deworm:
        return const Color(0xFFE6FFF0);
      case bath:
        return const Color(0xFFE8F3FF);
      case medical:
        return const Color(0xFFFFF0CC);
      case custom:
        return const Color(0xFFF0E8FF);
      default:
        return const Color(0xFFFFE8D2);
    }
  }

  static Color getIconColor(String type) {
    switch (type) {
      case birthday:
        return const Color(0xFFFF6B6B);
      case vaccine:
        return const Color(0xFFE67700);
      case deworm:
        return const Color(0xFF40C057);
      case bath:
        return const Color(0xFF339AF0);
      case medical:
        return const Color(0xFFFF9A3C);
      case custom:
        return const Color(0xFF9775FA);
      default:
        return const Color(0xFFFF9A3C);
    }
  }
}

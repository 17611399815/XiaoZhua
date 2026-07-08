class NoteEntry {
  final String id;
  final String petId;
  final String title;
  final String content;
  final DateTime updatedAt;

  NoteEntry({
    required this.id,
    required this.petId,
    required this.title,
    required this.content,
    required this.updatedAt,
  });

  String get formattedDate => '${updatedAt.year}年${updatedAt.month}月${updatedAt.day}日 ${updatedAt.hour.toString().padLeft(2, '0')}:${updatedAt.minute.toString().padLeft(2, '0')}';

  factory NoteEntry.fromJson(Map<String, dynamic> json) {
    return NoteEntry(
      id: json['id'] as String,
      petId: json['petId'] as String,
      title: json['title'] as String,
      content: json['content'] as String,
      updatedAt: DateTime.parse(json['updatedAt'] as String),
    );
  }

  Map<String, dynamic> toJson() => {
        'id': id,
        'petId': petId,
        'title': title,
        'content': content,
        'updatedAt': updatedAt.toIso8601String(),
      };

  NoteEntry copyWith({
    String? id,
    String? petId,
    String? title,
    String? content,
    DateTime? updatedAt,
  }) {
    return NoteEntry(
      id: id ?? this.id,
      petId: petId ?? this.petId,
      title: title ?? this.title,
      content: content ?? this.content,
      updatedAt: updatedAt ?? this.updatedAt,
    );
  }
}

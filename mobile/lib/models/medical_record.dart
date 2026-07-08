class MedicalRecord {
  final String id;
  final String petId;
  final String title;
  final DateTime date;
  final String hospital;
  final String symptoms;
  final String diagnosis;
  final String treatment;
  final String cost;

  MedicalRecord({
    required this.id,
    required this.petId,
    required this.title,
    required this.date,
    required this.hospital,
    required this.symptoms,
    required this.diagnosis,
    required this.treatment,
    required this.cost,
  });

  String get formattedDate => '${date.year}年${date.month}月${date.day}日';

  factory MedicalRecord.fromJson(Map<String, dynamic> json) {
    return MedicalRecord(
      id: json['id'] as String,
      petId: json['petId'] as String,
      title: json['title'] as String,
      date: DateTime.parse(json['visitDate'] as String),
      hospital: (json['hospital'] as String?) ?? '',
      symptoms: (json['symptoms'] as String?) ?? '',
      diagnosis: (json['diagnosis'] as String?) ?? '',
      treatment: (json['treatment'] as String?) ?? '',
      cost: (json['cost'] as String?) ?? '',
    );
  }

  Map<String, dynamic> toJson() => {
        'id': id,
        'petId': petId,
        'title': title,
        'visitDate':
            '${date.year}-${date.month.toString().padLeft(2, '0')}-${date.day.toString().padLeft(2, '0')}',
        'hospital': hospital,
        'symptoms': symptoms,
        'diagnosis': diagnosis,
        'treatment': treatment,
        'cost': cost,
      };

  MedicalRecord copyWith({
    String? id,
    String? petId,
    String? title,
    DateTime? date,
    String? hospital,
    String? symptoms,
    String? diagnosis,
    String? treatment,
    String? cost,
  }) {
    return MedicalRecord(
      id: id ?? this.id,
      petId: petId ?? this.petId,
      title: title ?? this.title,
      date: date ?? this.date,
      hospital: hospital ?? this.hospital,
      symptoms: symptoms ?? this.symptoms,
      diagnosis: diagnosis ?? this.diagnosis,
      treatment: treatment ?? this.treatment,
      cost: cost ?? this.cost,
    );
  }
}

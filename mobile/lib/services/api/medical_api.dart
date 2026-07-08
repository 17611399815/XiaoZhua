import '../../models/medical_record.dart';
import '../api_client.dart';

class MedicalApi {
  final ApiClient _client;
  MedicalApi(this._client);

  Future<List<MedicalRecord>> getMedicalRecords(String petId) async {
    final res = await _client.get('/pets/$petId/medical-records');
    final list = res['data'] as List<dynamic>? ?? [];
    final records = list.map((e) => MedicalRecord.fromJson(e as Map<String, dynamic>)).toList();
    records.sort((a, b) => b.date.compareTo(a.date));
    return records;
  }

  Future<MedicalRecord> createMedicalRecord(String petId, Map<String, dynamic> data) async {
    final res = await _client.post('/pets/$petId/medical-records', body: data);
    return MedicalRecord.fromJson(res['data'] as Map<String, dynamic>);
  }

  Future<void> deleteMedicalRecord(String id) async {
    await _client.delete('/medical-records/$id');
  }
}

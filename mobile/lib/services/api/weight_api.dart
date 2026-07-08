import '../../models/weight_record.dart';
import '../api_client.dart';

class WeightApi {
  final ApiClient _client;
  WeightApi(this._client);

  Future<List<WeightRecord>> getWeightRecords(String petId) async {
    final res = await _client.get('/pets/$petId/weight-records');
    final list = res['data'] as List<dynamic>? ?? [];
    final records = list.map((e) => WeightRecord.fromJson(e as Map<String, dynamic>)).toList();
    records.sort((a, b) => a.date.compareTo(b.date));
    return records;
  }

  Future<WeightRecord> createWeightRecord(String petId, Map<String, dynamic> data) async {
    final res = await _client.post('/pets/$petId/weight-records', body: data);
    return WeightRecord.fromJson(res['data'] as Map<String, dynamic>);
  }

  Future<void> deleteWeightRecord(String id) async {
    await _client.delete('/weight-records/$id');
  }
}

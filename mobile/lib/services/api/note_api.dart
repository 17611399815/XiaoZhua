import '../../models/note.dart';
import '../api_client.dart';

class NoteApi {
  final ApiClient _client;
  NoteApi(this._client);

  Future<List<NoteEntry>> getNotes(String petId) async {
    final res = await _client.get('/pets/$petId/notes');
    final list = res['data'] as List<dynamic>? ?? [];
    return list.map((e) => NoteEntry.fromJson(e as Map<String, dynamic>)).toList();
  }

  Future<NoteEntry> createNote(String petId, Map<String, dynamic> data) async {
    final res = await _client.post('/pets/$petId/notes', body: data);
    return NoteEntry.fromJson(res['data'] as Map<String, dynamic>);
  }

  Future<NoteEntry> updateNote(String id, Map<String, dynamic> data) async {
    final res = await _client.put('/notes/$id', body: data);
    return NoteEntry.fromJson(res['data'] as Map<String, dynamic>);
  }

  Future<void> deleteNote(String id) async {
    await _client.delete('/notes/$id');
  }
}

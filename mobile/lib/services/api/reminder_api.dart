import '../../models/reminder.dart';
import '../api_client.dart';

class ReminderApi {
  final ApiClient _client;

  ReminderApi(this._client);

  Future<List<Reminder>> getReminders(String petId) async {
    final res = await _client.get('/pets/$petId/reminders');
    final list = res['data'] as List<dynamic>? ?? [];
    return list.map((e) => Reminder.fromJson(e as Map<String, dynamic>)).toList();
  }

  Future<Reminder> createReminder(String petId, Map<String, dynamic> data) async {
    final res = await _client.post('/pets/$petId/reminders', body: data);
    return Reminder.fromJson(res['data'] as Map<String, dynamic>);
  }

  Future<Reminder> updateReminder(String id, Map<String, dynamic> data) async {
    final res = await _client.put('/reminders/$id', body: data);
    return Reminder.fromJson(res['data'] as Map<String, dynamic>);
  }

  Future<Reminder> toggleComplete(String id) async {
    final res = await _client.patch('/reminders/$id/toggle');
    return Reminder.fromJson(res['data'] as Map<String, dynamic>);
  }

  Future<void> deleteReminder(String id) async {
    await _client.delete('/reminders/$id');
  }
}

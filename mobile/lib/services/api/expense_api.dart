import '../../models/expense.dart';
import '../api_client.dart';

class ExpenseApi {
  final ApiClient _client;

  ExpenseApi(this._client);

  Future<List<Expense>> getExpenses(String petId) async {
    final res = await _client.get('/pets/$petId/expenses');
    final list = res['data'] as List<dynamic>? ?? [];
    return list.map((e) => Expense.fromJson(e as Map<String, dynamic>)).toList();
  }

  Future<Map<String, dynamic>> getSummary(String petId) async {
    final res = await _client.get('/pets/$petId/expenses/summary');
    return res['data'] as Map<String, dynamic>? ?? {};
  }

  Future<Expense> createExpense(String petId, Map<String, dynamic> data) async {
    final res = await _client.post('/pets/$petId/expenses', body: data);
    return Expense.fromJson(res['data'] as Map<String, dynamic>);
  }

  Future<void> deleteExpense(String id) async {
    await _client.delete('/expenses/$id');
  }
}

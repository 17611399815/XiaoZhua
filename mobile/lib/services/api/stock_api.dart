import '../../models/stock_item.dart';
import '../api_client.dart';

class StockApi {
  final ApiClient _client;
  StockApi(this._client);

  Future<List<StockItem>> getStockItems(String petId) async {
    final res = await _client.get('/pets/$petId/stock-items');
    final list = res['data'] as List<dynamic>? ?? [];
    return list.map((e) => StockItem.fromJson(e as Map<String, dynamic>)).toList();
  }

  Future<StockItem> createStockItem(String petId, Map<String, dynamic> data) async {
    final res = await _client.post('/pets/$petId/stock-items', body: data);
    return StockItem.fromJson(res['data'] as Map<String, dynamic>);
  }

  Future<StockItem> updateStockItem(String id, Map<String, dynamic> data) async {
    final res = await _client.put('/stock-items/$id', body: data);
    return StockItem.fromJson(res['data'] as Map<String, dynamic>);
  }

  Future<StockItem> decrementStock(String id, {int amount = 1}) async {
    final res = await _client.patch('/stock-items/$id/decrement', body: {'amount': amount});
    return StockItem.fromJson(res['data'] as Map<String, dynamic>);
  }

  Future<void> deleteStockItem(String id) async {
    await _client.delete('/stock-items/$id');
  }
}

import '../../models/pet.dart';
import '../api_client.dart';

class PetApi {
  final ApiClient _client;

  PetApi(this._client);

  /// 获取用户所有宠物
  Future<List<Pet>> getPets() async {
    final res = await _client.get('/pets');
    final list = res['data'] as List<dynamic>? ?? [];
    return list.map((e) => Pet.fromJson(e as Map<String, dynamic>)).toList();
  }

  /// 创建宠物（建档流程完成时调用）
  Future<Pet> createPet(Map<String, dynamic> data) async {
    final res = await _client.post('/pets', body: data);
    return Pet.fromJson(res['data'] as Map<String, dynamic>);
  }

  /// 获取宠物详情
  Future<Pet> getPet(String petId) async {
    final res = await _client.get('/pets/$petId');
    return Pet.fromJson(res['data'] as Map<String, dynamic>);
  }

  /// 更新宠物信息
  Future<Pet> updatePet(String petId, Map<String, dynamic> data) async {
    final res = await _client.put('/pets/$petId', body: data);
    return Pet.fromJson(res['data'] as Map<String, dynamic>);
  }

  /// 删除宠物
  Future<void> deletePet(String petId) async {
    await _client.delete('/pets/$petId');
  }

  /// 切换当前宠物
  Future<Pet> switchPet(String petId) async {
    final res = await _client.put('/pets/$petId/switch');
    return Pet.fromJson(res['data'] as Map<String, dynamic>);
  }
}

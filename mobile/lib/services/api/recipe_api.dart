import '../../models/recipe.dart';
import '../api_client.dart';

class RecipeApi {
  final ApiClient _client;
  RecipeApi(this._client);

  Future<List<RecipeEntry>> getRecipes(String petId) async {
    final res = await _client.get('/pets/$petId/recipes');
    final list = res['data'] as List<dynamic>? ?? [];
    return list.map((e) => RecipeEntry.fromJson(e as Map<String, dynamic>)).toList();
  }

  Future<RecipeEntry> createRecipe(String petId, Map<String, dynamic> data) async {
    final res = await _client.post('/pets/$petId/recipes', body: data);
    return RecipeEntry.fromJson(res['data'] as Map<String, dynamic>);
  }

  Future<void> deleteRecipe(String id) async {
    await _client.delete('/recipes/$id');
  }
}

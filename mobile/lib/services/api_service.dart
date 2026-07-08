import 'api_client.dart';
import 'api/auth_api.dart';
import 'api/pet_api.dart';
import 'api/reminder_api.dart';
import 'api/expense_api.dart';
import 'api/recipe_api.dart';
import 'api/note_api.dart';
import 'api/weight_api.dart';
import 'api/medical_api.dart';
import 'api/stock_api.dart';
import 'api/album_api.dart';
import 'api/shop_api.dart';
import 'api/ai_api.dart';

/// 统一 API 服务入口，管理所有模块的 API 调用。
class ApiService {
  final ApiClient client;

  late final AuthApi auth;
  late final PetApi pet;
  late final ReminderApi reminder;
  late final ExpenseApi expense;
  late final RecipeApi recipe;
  late final NoteApi note;
  late final WeightApi weight;
  late final MedicalApi medical;
  late final StockApi stock;
  late final AlbumApi album;
  late final ShopApi shop;
  late final AiApi ai;

  ApiService({String? token})
      : client = ApiClient(token: token) {
    auth = AuthApi(client);
    pet = PetApi(client);
    reminder = ReminderApi(client);
    expense = ExpenseApi(client);
    recipe = RecipeApi(client);
    note = NoteApi(client);
    weight = WeightApi(client);
    medical = MedicalApi(client);
    stock = StockApi(client);
    album = AlbumApi(client);
    shop = ShopApi(client);
    ai = AiApi(client);
  }

  /// 登录后设置 token
  void authenticate(String token) => client.setToken(token);

  /// 登出
  void logout() => client.clearToken();

  /// 是否已登录
  bool get isLoggedIn => client.isLoggedIn;
}

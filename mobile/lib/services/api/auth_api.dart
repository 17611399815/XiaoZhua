import '../api_client.dart';

class AuthApi {
  final ApiClient _client;

  AuthApi(this._client);

  /// 发送验证码
  Future<Map<String, dynamic>> sendCode(String phone) async {
    return _client.post('/auth/send-code', body: {'phone': phone});
  }

  /// 验证码登录
  /// 返回: { token, refreshToken, user }
  Future<Map<String, dynamic>> login(String phone, String code) async {
    return _client.post('/auth/login', body: {'phone': phone, 'code': code});
  }

  /// 刷新 Token
  Future<Map<String, dynamic>> refreshToken(String refreshToken) async {
    return _client.post('/auth/refresh', body: {'refreshToken': refreshToken});
  }

  /// 登出
  Future<void> logout() async {
    await _client.post('/auth/logout');
  }
}

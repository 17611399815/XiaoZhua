import 'dart:convert';
import 'package:http/http.dart' as http;

/// 统一 API 客户端，负责 Token 注入、请求/响应处理、错误拦截。
class ApiClient {
  static const String _baseUrl = 'http://localhost:3000/api/v1';

  String? _token;
  final http.Client _client;

  ApiClient({String? token, http.Client? client})
      : _token = token,
        _client = client ?? http.Client();

  String? get token => _token;
  bool get isLoggedIn => _token != null;

  void setToken(String token) => _token = token;
  void clearToken() => _token = null;

  // ── 通用请求方法 ──

  Map<String, String> get _headers => {
        'Content-Type': 'application/json',
        if (_token != null) 'Authorization': 'Bearer $_token',
      };

  Future<Map<String, dynamic>> get(String path,
      {Map<String, String>? query}) async {
    final uri =
        Uri.parse('$_baseUrl$path').replace(queryParameters: query);
    final res = await _client.get(uri, headers: _headers);
    return _handleResponse(res);
  }

  Future<Map<String, dynamic>> post(String path,
      {Map<String, dynamic>? body}) async {
    final uri = Uri.parse('$_baseUrl$path');
    final res = await _client.post(uri,
        headers: _headers, body: body != null ? jsonEncode(body) : null);
    return _handleResponse(res);
  }

  Future<Map<String, dynamic>> put(String path,
      {Map<String, dynamic>? body}) async {
    final uri = Uri.parse('$_baseUrl$path');
    final res = await _client.put(uri,
        headers: _headers, body: body != null ? jsonEncode(body) : null);
    return _handleResponse(res);
  }

  Future<Map<String, dynamic>> patch(String path,
      {Map<String, dynamic>? body}) async {
    final uri = Uri.parse('$_baseUrl$path');
    final res = await _client.patch(uri,
        headers: _headers, body: body != null ? jsonEncode(body) : null);
    return _handleResponse(res);
  }

  Future<Map<String, dynamic>> delete(String path) async {
    final uri = Uri.parse('$_baseUrl$path');
    final res = await _client.delete(uri, headers: _headers);
    return _handleResponse(res);
  }

  /// Multipart 上传
  Future<Map<String, dynamic>> upload(
      String path, String fieldName, String filePath,
      {Map<String, String>? fields}) async {
    final uri = Uri.parse('$_baseUrl$path');
    final request = http.MultipartRequest('POST', uri);
    if (_token != null) request.headers['Authorization'] = 'Bearer $_token';
    request.files.add(await http.MultipartFile.fromPath(fieldName, filePath));
    if (fields != null) request.fields.addAll(fields);
    final streamed = await _client.send(request);
    final res = await http.Response.fromStream(streamed);
    return _handleResponse(res);
  }

  // ── 响应处理 ──

  Map<String, dynamic> _handleResponse(http.Response res) {
    final body = jsonDecode(res.body) as Map<String, dynamic>;
    if (res.statusCode >= 400 || (body['code'] != null && body['code'] != 0)) {
      throw ApiException(
        code: body['code'] ?? res.statusCode,
        message: body['message'] ?? '请求失败',
      );
    }
    return body;
  }
}

class ApiException implements Exception {
  final int code;
  final String message;
  ApiException({required this.code, required this.message});

  @override
  String toString() => 'ApiException($code): $message';
}

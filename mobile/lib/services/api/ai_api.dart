import '../api_client.dart';

/// AI 助手 API 服务
///
/// 对应服务端路由: POST /api/v1/ai/chat
class AiApi {
  final ApiClient _client;

  AiApi(this._client);

  /// 发送聊天消息
  ///
  /// [message] 用户输入的消息
  /// [history] 可选的历史对话（用于多轮上下文）
  /// [petId] 可选指定宠物ID，不传则使用当前宠物
  ///
  /// 返回:
  /// {
  ///   "reply": "AI回复内容",
  ///   "intent_blocked": false,
  ///   "fallback_type": null,
  ///   "pet_name": "豆豆",
  ///   "usage": { "prompt_tokens": 100, "completion_tokens": 50, "total_tokens": 150 }
  /// }
  Future<AiChatResponse> chat({
    required String message,
    List<AiChatMessage>? history,
    String? petId,
  }) async {
    final body = <String, dynamic>{
      'message': message,
    };
    if (history != null && history.isNotEmpty) {
      body['history'] = history.map((m) => m.toJson()).toList();
    }
    if (petId != null) {
      body['petId'] = petId;
    }

    final res = await _client.post('/ai/chat', body: body);
    return AiChatResponse.fromJson(res['data'] as Map<String, dynamic>? ?? res);
  }
}

/// 聊天消息
class AiChatMessage {
  final String role; // 'user' | 'assistant'
  final String content;

  AiChatMessage({required this.role, required this.content});

  Map<String, dynamic> toJson() => {
        'role': role,
        'content': content,
      };

  factory AiChatMessage.fromJson(Map<String, dynamic> json) {
    return AiChatMessage(
      role: json['role'] as String,
      content: json['content'] as String,
    );
  }
}

/// AI 聊天响应
class AiChatResponse {
  final String reply;
  final bool intentBlocked;
  final String? fallbackType;
  final String? petName;
  final AiUsage? usage;

  AiChatResponse({
    required this.reply,
    required this.intentBlocked,
    this.fallbackType,
    this.petName,
    this.usage,
  });

  factory AiChatResponse.fromJson(Map<String, dynamic> json) {
    return AiChatResponse(
      reply: json['reply'] as String? ?? '',
      intentBlocked: json['intent_blocked'] as bool? ?? false,
      fallbackType: json['fallback_type'] as String?,
      petName: json['pet_name'] as String?,
      usage: json['usage'] != null
          ? AiUsage.fromJson(json['usage'] as Map<String, dynamic>)
          : null,
    );
  }
}

/// Token 用量
class AiUsage {
  final int promptTokens;
  final int completionTokens;
  final int totalTokens;

  AiUsage({
    required this.promptTokens,
    required this.completionTokens,
    required this.totalTokens,
  });

  factory AiUsage.fromJson(Map<String, dynamic> json) {
    return AiUsage(
      promptTokens: json['prompt_tokens'] as int? ?? 0,
      completionTokens: json['completion_tokens'] as int? ?? 0,
      totalTokens: json['total_tokens'] as int? ?? 0,
    );
  }
}

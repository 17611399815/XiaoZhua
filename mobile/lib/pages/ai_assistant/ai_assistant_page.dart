import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../theme/app_theme.dart';
import '../../services/app_provider.dart';
import '../../services/api_service.dart';
import '../../services/api/ai_api.dart';

class AiAssistantPage extends StatefulWidget {
  const AiAssistantPage({super.key});

  @override
  State<AiAssistantPage> createState() => _AiAssistantPageState();
}

class _AiAssistantPageState extends State<AiAssistantPage> {
  final TextEditingController _inputController = TextEditingController();
  final ScrollController _scrollController = ScrollController();
  final FocusNode _inputFocusNode = FocusNode();

  /// 对话消息列表
  final List<Map<String, dynamic>> _messages = [
    {
      'role': 'assistant',
      'content': '你好！我是小爪AI助手 🐾\n请问有什么可以帮你的吗？我可以帮你解答养宠问题、推荐宠物食谱、分析健康数据等～',
    },
  ];

  /// 是否正在等待 AI 回复
  bool _isLoading = false;

  /// API 服务实例
  final ApiService _apiService = ApiService();

  /// 建议问题列表
  final List<Map<String, String>> _suggestions = [
    {'icon': '🍽️', 'text': '我家宠物每天吃多少合适？'},
    {'icon': '🏥', 'text': '常见宠物疾病怎么预防？'},
    {'icon': '🛁', 'text': '多久给宠物洗澡合适？'},
    {'icon': '🐾', 'text': '新宠到家需要注意什么？'},
    {'icon': '💊', 'text': '驱虫药多久用一次？'},
    {'icon': '✂️', 'text': '宠物美容频率建议'},
  ];

  @override
  void dispose() {
    _inputController.dispose();
    _scrollController.dispose();
    _inputFocusNode.dispose();
    super.dispose();
  }

  // ── 发送消息（主逻辑） ──

  Future<void> _sendMessage() async {
    final text = _inputController.text.trim();
    if (text.isEmpty || _isLoading) return;

    // 添加用户消息
    setState(() {
      _messages.add({'role': 'user', 'content': text});
      _inputController.clear();
      _isLoading = true;
    });

    _scrollToBottom();

    // 构建历史消息（最近6轮，不含欢迎消息）
    final history = _buildHistory();

    try {
      final response = await _apiService.ai.chat(
        message: text,
        history: history,
      );

      if (!mounted) return;

      setState(() {
        _isLoading = false;
        _messages.add({
          'role': 'assistant',
          'content': response.reply,
        });
      });
    } catch (e) {
      if (!mounted) return;

      setState(() {
        _isLoading = false;
        _messages.add({
          'role': 'assistant',
          'content': _getOfflineReply(),
        });
      });

      // 只在 debug 模式下打印错误
      debugPrint('AI API error: $e');
    }

    _scrollToBottom();
  }

  /// 构建历史消息（用于多轮对话上下文）
  List<AiChatMessage> _buildHistory() {
    // 跳过第一条欢迎消息
    if (_messages.length <= 1) return [];

    final allConversation = _messages.sublist(1);

    // 排除最后一条（刚刚添加的当前用户消息，会作为 message 参数单独发送）
    final lastMsg = allConversation.last;
    final history = lastMsg['role'] == 'user'
        ? allConversation.sublist(0, allConversation.length - 1)
        : List<Map<String, dynamic>>.from(allConversation);

    if (history.isEmpty) return [];

    // 过滤掉旧的离线模式兜底回复（避免污染上下文）
    final cleaned = history
        .where((m) {
          if (m['role'] == 'assistant') {
            final content = m['content'].toString();
            if (content.startsWith('这是个很好的问题！由于我目前是离线模式')) return false;
            if (content.startsWith('🐾 不好意思，AI服务暂时连接不上')) return false;
          }
          return true;
        })
        .map((m) => AiChatMessage(
              role: m['role'] as String,
              content: m['content'] as String,
            ))
        .toList();

    // 保留最近 10 条（5 轮对话）
    if (cleaned.length > 10) {
      return cleaned.sublist(cleaned.length - 10);
    }
    return cleaned;
  }

  /// 离线/API失败时的降级回复
  String _getOfflineReply() {
    final pet = context.read<AppProvider>().currentPet;
    final petName = pet?.name ?? '你的宠物';

    final replies = [
      '🐾 不好意思，AI服务暂时连接不上～\n\n不过别担心！你可以先查看"$petName"的健康记录和待办提醒，或者换个时间再问我。',
      '🐾 网络好像开小差了…\n\n作为$petName的贴心管家，建议你先检查一下：\n• 最近体重记录\n• 待办提醒事项\n• 健康档案\n\n我马上就能恢复啦！',
      '🐾 哎呀，AI大脑需要休息一下～\n\n在这期间，你可以试试问一些简单的问题，比如"狗狗吃什么好"、"猫咪疫苗什么时候打"等。',
    ];

    // 伪随机选择一条（基于时间戳避免重复）
    final idx = DateTime.now().millisecond % replies.length;
    return replies[idx];
  }

  // ── 建议问题点击 ──

  void _tapSuggestion(String text) {
    _inputController.text = text;
    _sendMessage();
  }

  // ── 滚动到底部 ──

  void _scrollToBottom() {
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (_scrollController.hasClients) {
        _scrollController.animateTo(
          _scrollController.position.maxScrollExtent,
          duration: const Duration(milliseconds: 300),
          curve: Curves.easeOut,
        );
      }
    });
  }

  // ── UI ──

  @override
  Widget build(BuildContext context) {
    final pet = context.watch<AppProvider>().currentPet;
    final onlineBadge = _apiService.isLoggedIn;

    return Scaffold(
      backgroundColor: AppColors.backgroundLight,
      body: Column(
        children: [
          _buildHeader(isOnline: onlineBadge, petName: pet?.name),
          // Chat messages
          Expanded(
            child: _messages.length <= 1
                ? _buildWelcomeView()
                : Column(
                    children: [
                      Expanded(
                        child: ListView.builder(
                          controller: _scrollController,
                          padding: const EdgeInsets.all(16),
                          itemCount: _messages.length + (_isLoading ? 1 : 0),
                          itemBuilder: (context, index) {
                            // Loading indicator
                            if (_isLoading && index == _messages.length) {
                              return _buildLoadingBubble();
                            }
                            final msg = _messages[index];
                            final isUser = msg['role'] == 'user';
                            return _buildMessageBubble(msg['content'], isUser);
                          },
                        ),
                      ),
                    ],
                  ),
          ),
          // Input area
          _buildInputArea(),
        ],
      ),
    );
  }

  Widget _buildHeader({required bool isOnline, String? petName}) {
    return Container(
      padding: const EdgeInsets.fromLTRB(18, 54, 18, 18),
      decoration: BoxDecoration(
        gradient: const LinearGradient(
          colors: [AppColors.ai, AppColors.coral],
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
        borderRadius: const BorderRadius.vertical(bottom: Radius.circular(28)),
        boxShadow: [
          BoxShadow(
            color: AppColors.ai.withValues(alpha: 0.26),
            blurRadius: 22,
            offset: const Offset(0, 10),
          ),
        ],
      ),
      child: Row(
        children: [
          Container(
            width: 54,
            height: 54,
            decoration: BoxDecoration(
              color: Colors.white.withValues(alpha: 0.2),
              borderRadius: BorderRadius.circular(18),
              border: Border.all(color: Colors.white.withValues(alpha: 0.35)),
            ),
            child: const Icon(Icons.auto_awesome, color: Colors.white, size: 28),
          ),
          const SizedBox(width: 14),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Text(
                  '小爪 AI 助理',
                  style: TextStyle(
                    fontSize: 22,
                    fontWeight: FontWeight.w900,
                    color: Colors.white,
                  ),
                ),
                const SizedBox(height: 4),
                Text(
                  petName != null
                      ? '正在为 $petName 提供专属建议 ✨'
                      : '养宠问题、健康提醒、食谱建议都可以问我',
                  style: const TextStyle(
                    fontSize: 13,
                    height: 1.35,
                    color: Color(0xEFFFFFFF),
                  ),
                ),
              ],
            ),
          ),
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
            decoration: BoxDecoration(
              color: Colors.white.withValues(alpha: 0.18),
              borderRadius: BorderRadius.circular(12),
              border: Border.all(color: Colors.white.withValues(alpha: 0.25)),
            ),
            child: Text(
              isOnline ? '在线' : '离线演示',
              style: const TextStyle(
                fontSize: 11,
                fontWeight: FontWeight.w800,
                color: Colors.white,
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildWelcomeView() {
    return SingleChildScrollView(
      padding: const EdgeInsets.all(16),
      child: Column(
        children: [
          const SizedBox(height: 22),
          Container(
            width: 92,
            height: 92,
            decoration: BoxDecoration(
              gradient: const LinearGradient(
                colors: [AppColors.ai, AppColors.coral],
                begin: Alignment.topLeft,
                end: Alignment.bottomRight,
              ),
              borderRadius: BorderRadius.circular(30),
              boxShadow: [
                BoxShadow(
                  color: AppColors.ai.withValues(alpha: 0.28),
                  blurRadius: 20,
                  offset: const Offset(0, 8),
                ),
              ],
            ),
            alignment: Alignment.center,
            child: const Icon(Icons.auto_awesome, color: Colors.white, size: 44),
          ),
          const SizedBox(height: 16),
          const Text(
            '今天想照顾好哪一件事？',
            style: TextStyle(
              fontSize: 21,
              fontWeight: FontWeight.w900,
              color: AppColors.textDark,
            ),
          ),
          const SizedBox(height: 4),
          const Text(
            '选择一个问题开始，或者直接输入你的疑问',
            style: TextStyle(fontSize: 13, color: AppColors.textMuted),
          ),
          const SizedBox(height: 24),
          // Suggestion chips
          Wrap(
            spacing: 10,
            runSpacing: 10,
            children: _suggestions.map((s) {
              final index = _suggestions.indexOf(s);
              final highlighted = index == 0 || index == 1;
              return Material(
                color: Colors.transparent,
                child: InkWell(
                  borderRadius: BorderRadius.circular(18),
                  onTap: () => _tapSuggestion(s['text']!),
                  child: Container(
                    padding: const EdgeInsets.symmetric(
                      horizontal: 14,
                      vertical: 12,
                    ),
                    decoration: BoxDecoration(
                      color: highlighted ? AppColors.aiLight : Colors.white,
                      borderRadius: BorderRadius.circular(18),
                      border: Border.all(
                        color: highlighted
                            ? AppColors.ai.withValues(alpha: 0.28)
                            : Colors.grey.shade200,
                      ),
                      boxShadow: const [
                        BoxShadow(
                          color: AppColors.cardShadow,
                          blurRadius: 12,
                          offset: Offset(0, 5),
                        ),
                      ],
                    ),
                    child: Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        Text(s['icon']!, style: const TextStyle(fontSize: 16)),
                        const SizedBox(width: 6),
                        Text(
                          s['text']!,
                          style: TextStyle(
                            fontSize: 13,
                            color: highlighted
                                ? AppColors.ai
                                : AppColors.textDark,
                            fontWeight: highlighted
                                ? FontWeight.w800
                                : FontWeight.w600,
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
              );
            }).toList(),
          ),
        ],
      ),
    );
  }

  Widget _buildInputArea() {
    return Container(
      padding: const EdgeInsets.fromLTRB(16, 8, 16, 16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: const BorderRadius.vertical(top: Radius.circular(24)),
        boxShadow: const [
          BoxShadow(
            color: AppColors.cardShadow,
            blurRadius: 18,
            offset: Offset(0, -6),
          ),
        ],
      ),
      child: SafeArea(
        child: Row(
          children: [
            Expanded(
              child: Container(
                padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 4),
                decoration: BoxDecoration(
                  color: AppColors.backgroundLight,
                  borderRadius: BorderRadius.circular(24),
                  border: Border.all(color: AppColors.divider),
                ),
                child: TextField(
                  controller: _inputController,
                  focusNode: _inputFocusNode,
                  style: const TextStyle(
                    fontSize: 15,
                    color: AppColors.textDark,
                  ),
                  decoration: const InputDecoration(
                    hintText: '输入你的问题...',
                    hintStyle: TextStyle(
                      fontSize: 15,
                      color: AppColors.textMuted,
                    ),
                    border: InputBorder.none,
                    contentPadding: EdgeInsets.symmetric(vertical: 10),
                  ),
                  textInputAction: TextInputAction.send,
                  onSubmitted: (_) => _sendMessage(),
                  enabled: !_isLoading,
                ),
              ),
            ),
            const SizedBox(width: 10),
            GestureDetector(
              onTap: _isLoading ? null : _sendMessage,
              child: AnimatedContainer(
                duration: const Duration(milliseconds: 200),
                width: 44,
                height: 44,
                decoration: BoxDecoration(
                  gradient: _isLoading
                      ? const LinearGradient(
                          colors: [AppColors.textMuted, AppColors.textMuted],
                        )
                      : const LinearGradient(
                          colors: [AppColors.ai, AppColors.coral],
                          begin: Alignment.topLeft,
                          end: Alignment.bottomRight,
                        ),
                  borderRadius: BorderRadius.circular(16),
                  boxShadow: _isLoading
                      ? null
                      : [
                          BoxShadow(
                            color: AppColors.ai.withValues(alpha: 0.28),
                            blurRadius: 12,
                            offset: const Offset(0, 5),
                          ),
                        ],
                ),
                child: Icon(
                  _isLoading ? Icons.hourglass_top : Icons.send,
                  color: Colors.white,
                  size: 20,
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildMessageBubble(String text, bool isUser) {
    return Align(
      alignment: isUser ? Alignment.centerRight : Alignment.centerLeft,
      child: Container(
        margin: const EdgeInsets.only(bottom: 12),
        padding: const EdgeInsets.all(14),
        constraints: BoxConstraints(
          maxWidth: MediaQuery.of(context).size.width * 0.78,
        ),
        decoration: BoxDecoration(
          gradient: isUser
              ? const LinearGradient(
                  colors: [AppColors.ai, AppColors.coral],
                  begin: Alignment.topLeft,
                  end: Alignment.bottomRight,
                )
              : null,
          color: isUser ? null : Colors.white,
          borderRadius: BorderRadius.circular(18).copyWith(
            bottomRight: isUser ? const Radius.circular(4) : null,
            bottomLeft: isUser ? null : const Radius.circular(4),
          ),
          boxShadow: const [
            BoxShadow(
              color: AppColors.cardShadow,
              blurRadius: 12,
              offset: Offset(0, 5),
            ),
          ],
        ),
        child: Text(
          text,
          style: TextStyle(
            fontSize: 14,
            color: isUser ? Colors.white : AppColors.textDark,
            height: 1.5,
          ),
        ),
      ),
    );
  }

  /// AI 思考中的加载气泡
  Widget _buildLoadingBubble() {
    return Align(
      alignment: Alignment.centerLeft,
      child: Container(
        margin: const EdgeInsets.only(bottom: 12),
        padding: const EdgeInsets.symmetric(horizontal: 18, vertical: 16),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(18).copyWith(
            bottomLeft: const Radius.circular(4),
          ),
          boxShadow: const [
            BoxShadow(
              color: AppColors.cardShadow,
              blurRadius: 12,
              offset: Offset(0, 5),
            ),
          ],
        ),
        child: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            _LoadingDot(delay: 0),
            const SizedBox(width: 5),
            _LoadingDot(delay: 200),
            const SizedBox(width: 5),
            _LoadingDot(delay: 400),
            const SizedBox(width: 8),
            const Text(
              '小爪思考中...',
              style: TextStyle(
                fontSize: 13,
                color: AppColors.textMuted,
              ),
            ),
          ],
        ),
      ),
    );
  }
}

/// 加载动画小圆点
class _LoadingDot extends StatefulWidget {
  final int delay;
  const _LoadingDot({required this.delay});

  @override
  State<_LoadingDot> createState() => _LoadingDotState();
}

class _LoadingDotState extends State<_LoadingDot>
    with SingleTickerProviderStateMixin {
  late AnimationController _controller;
  late Animation<double> _animation;

  @override
  void initState() {
    super.initState();
    _controller = AnimationController(
      duration: const Duration(milliseconds: 800),
      vsync: this,
    );

    _animation = Tween<double>(begin: 0.3, end: 1.0).animate(
      CurvedAnimation(parent: _controller, curve: Curves.easeInOut),
    );

    Future.delayed(Duration(milliseconds: widget.delay), () {
      if (mounted) {
        _controller.repeat(reverse: true);
      }
    });
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return AnimatedBuilder(
      animation: _animation,
      builder: (context, child) {
        return Opacity(
          opacity: _animation.value,
          child: Container(
            width: 8,
            height: 8,
            decoration: BoxDecoration(
              color: AppColors.ai,
              shape: BoxShape.circle,
            ),
          ),
        );
      },
    );
  }
}

import 'package:flutter/material.dart';
import '../../theme/app_theme.dart';

class VerifyCodePage extends StatefulWidget {
  final String phoneNumber;
  const VerifyCodePage({super.key, required this.phoneNumber});

  @override
  State<VerifyCodePage> createState() => _VerifyCodePageState();
}

class _VerifyCodePageState extends State<VerifyCodePage> {
  static const int _codeLength = 6;
  final List<TextEditingController> _controllers =
      List.generate(_codeLength, (_) => TextEditingController());
  final List<FocusNode> _focusNodes =
      List.generate(_codeLength, (_) => FocusNode());

  int _countdown = 60;
  bool _isCountingDown = true;

  @override
  void initState() {
    super.initState();
    _startCountdown();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      FocusScope.of(context).requestFocus(_focusNodes[0]);
    });
  }

  void _startCountdown() {
    Future.delayed(const Duration(seconds: 1), () {
      if (!mounted) return;
      if (_countdown > 1) {
        setState(() => _countdown--);
        _startCountdown();
      } else {
        setState(() {
          _countdown = 0;
          _isCountingDown = false;
        });
      }
    });
  }

  void _resendCode() {
    for (var c in _controllers) {
      c.clear();
    }
    setState(() {
      _countdown = 60;
      _isCountingDown = true;
    });
    _startCountdown();
    _focusNodes[0].requestFocus();
  }

  bool get _isCodeComplete =>
      _controllers.every((c) => c.text.isNotEmpty);

  @override
  void dispose() {
    for (var c in _controllers) {
      c.dispose();
    }
    for (var f in _focusNodes) {
      f.dispose();
    }
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: LoginGradientBackground(
        child: SafeArea(
          child: Padding(
            padding: const EdgeInsets.symmetric(horizontal: 24),
            child: Column(
              children: [
                Expanded(
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Container(
                        width: 96,
                        height: 96,
                        decoration: BoxDecoration(
                          color: AppColors.primary,
                          borderRadius: BorderRadius.circular(24),
                          boxShadow: const [
                            BoxShadow(
                              color: Color(0x66F5A821),
                              blurRadius: 40,
                              spreadRadius: -4,
                              offset: Offset(0, 12),
                            ),
                          ],
                        ),
                        alignment: Alignment.center,
                        child: const Text('🐾', style: TextStyle(fontSize: 48)),
                      ),
                      const SizedBox(height: 32),
                      const Text(
                        '小爪',
                        style: TextStyle(
                          fontSize: 36,
                          fontWeight: FontWeight.w900,
                          color: AppColors.textPrimary,
                        ),
                      ),
                      const SizedBox(height: 4),
                      const Text(
                        '记录每一个爪印时刻',
                        style: AppTextStyles.heroSlogan,
                      ),
                    ],
                  ),
                ),
                AppCard(
                  padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                  child: Row(
                    children: [
                      const Text(
                        '🇨🇳 +86',
                        style: TextStyle(
                          fontSize: 14,
                          fontWeight: FontWeight.w600,
                          color: Color(0xFF6A7282),
                        ),
                      ),
                      Container(
                        width: 1,
                        height: 20,
                        color: AppColors.divider,
                        margin: const EdgeInsets.symmetric(horizontal: 12),
                      ),
                      Expanded(
                        child: Text(
                          widget.phoneNumber,
                          style: const TextStyle(
                            fontSize: 16,
                            color: Color(0xFF364153),
                            fontWeight: FontWeight.w500,
                          ),
                        ),
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: 12),
                AppCard(
                  padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                  child: Row(
                    children: [
                      Expanded(
                        child: Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: List.generate(_codeLength, _buildCodeBox),
                        ),
                      ),
                      const SizedBox(width: 12),
                      GestureDetector(
                        onTap: _isCountingDown ? null : _resendCode,
                        child: Text(
                          _isCountingDown ? '${_countdown}s' : '重新获取',
                          style: TextStyle(
                            fontSize: 14,
                            fontWeight: FontWeight.w700,
                            color: _isCountingDown
                                ? const Color(0xFF99A1AF)
                                : AppColors.primaryDark,
                          ),
                        ),
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: 24),
                PrimaryButton(
                  text: '登录 →',
                  enabled: _isCodeComplete,
                  onPressed: _isCodeComplete
                      ? () {
                          Navigator.of(context).pushNamed('/profile-setup');
                        }
                      : null,
                ),
                const SizedBox(height: 20),
                RichText(
                  text: const TextSpan(
                    style: TextStyle(
                      fontSize: 12,
                      color: Color(0xFF99A1AF),
                    ),
                    children: [
                      TextSpan(text: '登录即代表同意 '),
                      TextSpan(
                        text: '用户协议',
                        style: TextStyle(
                          color: AppColors.primaryDark,
                          fontWeight: FontWeight.w600,
                        ),
                      ),
                      TextSpan(text: ' 和 '),
                      TextSpan(
                        text: '隐私政策',
                        style: TextStyle(
                          color: AppColors.primaryDark,
                          fontWeight: FontWeight.w600,
                        ),
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: 32),
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceAround,
                  children: const ['🐕', '🐱', '🐰', '🐹']
                      .map((e) => Text(
                            e,
                            style: TextStyle(
                              fontSize: 36,
                              color: AppColors.textDark,
                              shadows: [
                                BoxShadow(
                                  color: Color(0x1A000000),
                                  blurRadius: 16,
                                  offset: Offset(0, 4),
                                )
                              ],
                            ),
                          ))
                      .toList(),
                ),
                const SizedBox(height: 24),
              ],
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildCodeBox(int index) {
    return Container(
      width: 40,
      height: 44,
      decoration: BoxDecoration(
        color: AppColors.backgroundStart.withValues(alpha: 0.5),
        borderRadius: BorderRadius.circular(12),
        border: Border.all(
          color: _controllers[index].text.isNotEmpty
              ? AppColors.primary
              : Colors.transparent,
          width: 2,
        ),
      ),
      alignment: Alignment.center,
      child: TextField(
        controller: _controllers[index],
        focusNode: _focusNodes[index],
        keyboardType: TextInputType.number,
        maxLength: 1,
        textAlign: TextAlign.center,
        style: const TextStyle(
          fontSize: 20,
          fontWeight: FontWeight.w700,
          color: Color(0xFF364153),
        ),
        decoration: const InputDecoration(
          border: InputBorder.none,
          counterText: '',
          isDense: true,
          contentPadding: EdgeInsets.zero,
        ),
        onChanged: (value) {
          setState(() {
            if (value.isNotEmpty && index < _codeLength - 1) {
              _focusNodes[index + 1].requestFocus();
            } else if (value.isEmpty && index > 0) {
              _focusNodes[index - 1].requestFocus();
            }
          });
        },
      ),
    );
  }
}

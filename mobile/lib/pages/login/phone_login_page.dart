import 'dart:async';
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../services/app_provider.dart';
import '../../services/api_service.dart';
import '../../models/pet.dart';

class PhoneLoginPage extends StatefulWidget {
  const PhoneLoginPage({super.key});

  @override
  State<PhoneLoginPage> createState() => _PhoneLoginPageState();
}

class _PhoneLoginPageState extends State<PhoneLoginPage> {
  final _phoneCtrl = TextEditingController();
  final _codeCtrl = TextEditingController();
  int _countdown = 0;
  Timer? _timer;
  bool _loading = false;

  @override
  void dispose() {
    _phoneCtrl.dispose();
    _codeCtrl.dispose();
    _timer?.cancel();
    super.dispose();
  }

  void _sendCode() {
    final phone = _phoneCtrl.text.trim();
    if (phone.length != 11 || int.tryParse(phone) == null) {
      ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('请输入11位中国手机号')));
      return;
    }
    setState(() {
      _countdown = 60;
    });
    _timer?.cancel();
    _timer = Timer.periodic(const Duration(seconds: 1), (t) {
      setState(() {
        if (_countdown > 0) {
          _countdown--;
        } else {
          t.cancel();
        }
      });
    });
    ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('验证码 1234 已发送（测试默认 1234 登录）')));
  }

  Future<void> _login() async {
    final phone = _phoneCtrl.text.trim();
    final code = _codeCtrl.text.trim();
    if (phone.isEmpty || code.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('请输入手机号和验证码')));
      return;
    }
    if (code != '1234') {
      ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('验证码错误，测试请输入 1234')));
      return;
    }
    setState(() => _loading = true);
    try {
      final apiService = ApiService();
      final res = await apiService.auth.login(phone, code);
      final data = res['data'] as Map<String, dynamic>? ?? {};
      final userMap = data['user'] as Map<String, dynamic>? ?? {};
      final petsList = userMap['pets'] as List<dynamic>? ?? [];

      if (!mounted) return;
      setState(() => _loading = false);

      final provider = context.read<AppProvider>();
      
      if (petsList.isNotEmpty) {
        // Log in with the first pet
        final firstPetJson = petsList[0] as Map<String, dynamic>;
        final pet = Pet.fromJson(firstPetJson);
        provider.loginWithFirstPet(pet);
        provider.seedDemoData();
        ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('登录成功！欢迎回来，${pet.name}的铲屎官～ 🐾')));
        Navigator.of(context).pushNamedAndRemoveUntil('/home', (route) => false);
      } else {
        // Go to onboarding flow (/profile-setup) and pass phone
        ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('登录成功！请先为您的爱宠建档～ ✨')));
        Navigator.of(context).pushNamed('/profile-setup', arguments: phone);
      }
    } catch (e) {
      if (!mounted) return;
      setState(() => _loading = false);
      ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('登录失败，已开启离线建档体验: $e')));
      // Graceful fallback to onboarding flow
      Navigator.of(context).pushNamed('/profile-setup', arguments: phone);
    }
  }

  void _quickLogin(String phone) {
    _phoneCtrl.text = phone;
    _codeCtrl.text = '1234';
    setState(() {});
    ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('已填入账号 $phone，点击登录即可')));
  }

  void _startDemo() {
    final provider = context.read<AppProvider>();
    final demoPet = Pet(
      id: 'demo_pet',
      name: '小爪',
      gender: '男孩',
      type: '狗狗',
      meetDate: DateTime.now().subtract(const Duration(days: 128)),
      emoji: '🐶',
      breed: '柴犬',
      birthday: '2023年5月20日',
      weight: 14.5,
      isNeutered: true,
    );
    provider.loginWithFirstPet(demoPet);
    provider.seedDemoData();
    Navigator.of(context).pushNamedAndRemoveUntil('/home', (route) => false);
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFFAF6F0),
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.symmetric(horizontal: 24),
          child: Column(
            children: [
              const SizedBox(height: 60),
              // App icon
              Container(
                width: 64, height: 64,
                decoration: BoxDecoration(
                  borderRadius: BorderRadius.circular(18),
                  gradient: const LinearGradient(colors: [Color(0xFFFFB23F), Color(0xFFFF8A3D)]),
                  boxShadow: const [BoxShadow(color: Color(0x33FF8A3D), blurRadius: 20, offset: Offset(0, 8))],
                ),
                child: const Icon(Icons.pets, color: Colors.white, size: 32),
              ),
              const SizedBox(height: 16),
              const Text('小爪 · 宠物管家', style: TextStyle(fontSize: 22, fontWeight: FontWeight.w900, color: Color(0xFF2D2621), letterSpacing: 1)),
              const SizedBox(height: 6),
              const Text('像家人一样守护您的爱宠', style: TextStyle(fontSize: 13, color: Color(0xFF8C6239), fontWeight: FontWeight.w500)),
              const SizedBox(height: 40),
              // Login card
              Container(
                padding: const EdgeInsets.all(24),
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(24),
                  boxShadow: const [BoxShadow(color: Color(0x0A2D2621), blurRadius: 30)],
                  border: Border.all(color: const Color(0xFFEADEC9)),
                ),
                child: Column(
                  children: [
                    // Phone input
                    _buildLabel('中国大陆手机号'),
                    const SizedBox(height: 8),
                    TextField(
                      controller: _phoneCtrl,
                      keyboardType: TextInputType.phone,
                      maxLength: 11,
                      style: const TextStyle(fontSize: 16),
                      decoration: _inputDecoration('请输入您的手机号'),
                      onChanged: (_) => setState(() {}),
                    ),
                    const SizedBox(height: 20),
                    // Code input
                    _buildLabel('短信验证码'),
                    const SizedBox(height: 8),
                    Row(
                      children: [
                        Expanded(
                          child: TextField(
                            controller: _codeCtrl,
                            keyboardType: TextInputType.number,
                            maxLength: 4,
                            style: const TextStyle(fontSize: 16),
                            decoration: _inputDecoration('4位验证码'),
                          ),
                        ),
                        const SizedBox(width: 10),
                        SizedBox(
                          height: 46,
                          child: ElevatedButton(
                            onPressed: _countdown > 0 ? null : _sendCode,
                            style: ElevatedButton.styleFrom(
                              backgroundColor: _countdown > 0 ? const Color(0xFFFAF6F0) : const Color(0xFFFF8A3D),
                              foregroundColor: _countdown > 0 ? const Color(0xFFA8621B) : Colors.white,
                              disabledBackgroundColor: const Color(0xFFFAF6F0),
                              disabledForegroundColor: const Color(0xFFA8621B),
                              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12), side: BorderSide(color: _countdown > 0 ? const Color(0xFFEADEC9) : const Color(0xFFFF8A3D))),
                              elevation: 0,
                              padding: const EdgeInsets.symmetric(horizontal: 18),
                            ),
                            child: Text(_countdown > 0 ? '${_countdown}s' : '发送', style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w700)),
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 28),
                    // Login button
                    SizedBox(
                      width: double.infinity,
                      height: 48,
                      child: Container(
                        decoration: BoxDecoration(
                          gradient: const LinearGradient(colors: [Color(0xFFFFB23F), Color(0xFFFF8A3D)]),
                          borderRadius: BorderRadius.circular(14),
                          boxShadow: const [BoxShadow(color: Color(0x26FF8A3D), blurRadius: 12, offset: Offset(0, 4))],
                        ),
                        child: Material(
                          color: Colors.transparent,
                          child: InkWell(
                            borderRadius: BorderRadius.circular(14),
                            onTap: _loading ? null : _login,
                            child: Center(
                              child: _loading
                                  ? const SizedBox(width: 22, height: 22, child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2))
                                  : const Text('验证并登录', style: TextStyle(fontSize: 15, fontWeight: FontWeight.w800, color: Colors.white)),
                            ),
                          ),
                        ),
                      ),
                    ),
                    const SizedBox(height: 16),
                    // Quick login buttons
                    SizedBox(
                      width: double.infinity,
                      child: OutlinedButton(
                        onPressed: () => _quickLogin('13800138000'),
                        style: OutlinedButton.styleFrom(
                          foregroundColor: const Color(0xFF8C6239),
                          side: const BorderSide(color: Color(0xFFFFB23F)),
                          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                          padding: const EdgeInsets.symmetric(vertical: 12),
                        ),
                        child: const Text('🐱 快速登录：旺财麻麻 (13800138000)', style: TextStyle(fontSize: 12)),
                      ),
                    ),
                    const SizedBox(height: 8),
                    SizedBox(
                      width: double.infinity,
                      child: OutlinedButton(
                        onPressed: () => _quickLogin('13912345678'),
                        style: OutlinedButton.styleFrom(
                          foregroundColor: const Color(0xFF8C6239),
                          side: const BorderSide(color: Color(0xFFFFB23F)),
                          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                          padding: const EdgeInsets.symmetric(vertical: 12),
                        ),
                        child: const Text('🐶 快速登录：喵星人守护者 (13912345678)', style: TextStyle(fontSize: 12)),
                      ),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 16),
              // Demo button
              TextButton.icon(
                onPressed: _startDemo,
                icon: const Icon(Icons.play_circle_outline, size: 18),
                label: const Text('立即体验演示数据'),
                style: TextButton.styleFrom(foregroundColor: const Color(0xFFE8791A)),
              ),
              const SizedBox(height: 8),
              const Text('登录即代表同意 用户协议 和 隐私政策', style: TextStyle(fontSize: 11, color: Color(0xFF99A1AF))),
              const SizedBox(height: 24),
              // Pet emoji row
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceAround,
                children: ['🐕', '🐱', '🐰', '🐹'].map((e) => Text(e, style: const TextStyle(fontSize: 32))).toList(),
              ),
              const SizedBox(height: 40),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildLabel(String text) {
    return Text(text, style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w700, color: Color(0xFF8C6239), letterSpacing: 0.5));
  }

  InputDecoration _inputDecoration(String hint) {
    return InputDecoration(
      hintText: hint,
      hintStyle: const TextStyle(color: Color(0xFFC0A080), fontSize: 14),
      border: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: const BorderSide(color: Color(0xFFEADEC9))),
      enabledBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: const BorderSide(color: Color(0xFFEADEC9))),
      focusedBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: const BorderSide(color: Color(0xFFFF8A3D), width: 1.5)),
      contentPadding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
      counterText: '',
      isDense: true,
    );
  }
}

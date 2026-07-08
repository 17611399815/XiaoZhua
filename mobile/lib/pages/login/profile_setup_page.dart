import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../services/app_provider.dart';
import '../../services/api_service.dart';
import '../../models/pet.dart';

class ProfileSetupPage extends StatefulWidget {
  const ProfileSetupPage({super.key});

  @override
  State<ProfileSetupPage> createState() => _ProfileSetupPageState();
}

class _ProfileSetupPageState extends State<ProfileSetupPage> {
  int _step = 1; // 1-7
  String _userNickname = '';
  String _type = '猫咪';
  String _name = '';
  String _breed = '';
  String _birthday = '';
  String _meetDate = DateTime.now().toString().split(' ')[0]; // yyyy-MM-dd
  String _gender = '男孩';
  double _weight = 4.5;
  String _emoji = '🐱';

  final _nicknameCtrl = TextEditingController();
  final _nameCtrl = TextEditingController();
  final _breedCtrl = TextEditingController();

  final List<String> _emojis = ['🐱', '🐶', '🐰', '🐹', '🐻', '🐼', '🐨', '🐯', '🦊', '🐮', '🐷', '🐸'];
  final List<String> _emojiLabels = ['猫咪', '狗狗', '小兔', '仓鼠', '小熊', '熊猫', '考拉', '老虎', '狐狸', '小牛', '小猪', '青蛙'];
  final List<String> _petTypes = ['猫咪', '狗狗', '小兔'];

  @override
  void dispose() {
    _nicknameCtrl.dispose();
    _nameCtrl.dispose();
    _breedCtrl.dispose();
    super.dispose();
  }

  bool get _canNext {
    switch (_step) {
      case 1:
        return _userNickname.trim().isNotEmpty;
      case 2:
        return _type.trim().isNotEmpty;
      case 3:
        return _name.trim().isNotEmpty;
      default:
        return true;
    }
  }

  void _next() {
    if (_step < 7) {
      setState(() => _step++);
    } else {
      _complete();
    }
  }

  void _prev() {
    if (_step > 1) {
      setState(() => _step--);
    }
  }

  Future<void> _selectDate(BuildContext context, bool isBirthday) async {
    final DateTime? picked = await showDatePicker(
      context: context,
      initialDate: DateTime.now(),
      firstDate: DateTime(2000),
      lastDate: DateTime.now(),
      builder: (context, child) {
        return Theme(
          data: Theme.of(context).copyWith(
            colorScheme: const ColorScheme.light(
              primary: Color(0xFFFF8A3D),
              onPrimary: Colors.white,
              onSurface: Color(0xFF2D2621),
            ),
          ),
          child: child!,
        );
      },
    );
    if (picked != null) {
      setState(() {
        final dateStr = "${picked.year}年${picked.month}月${picked.day}日";
        if (isBirthday) {
          _birthday = dateStr;
        } else {
          _meetDate = picked.toString().split(' ')[0];
        }
      });
    }
  }

  Future<void> _complete() async {
    final provider = context.read<AppProvider>();
    final defaultBreeds = {'猫咪': '英国短毛猫', '狗狗': '金毛巡回猎犬', '小兔': '侏儒兔'};
    final finalBreed = _breed.trim().isNotEmpty ? _breed.trim() : defaultBreeds[_type] ?? '';

    // Retrieve phone from navigation arguments, default to a simulation phone
    final String phone = (ModalRoute.of(context)?.settings.arguments as String?) ?? '13800138000';

    try {
      final apiService = ApiService();
      final petModel = await apiService.pet.createPet({
        'phone': phone,
        'name': _name.trim(),
        'type': _type,
        'breed': finalBreed,
        'gender': _gender,
        'weight': _weight,
        'emoji': _emoji,
        'meetDate': _meetDate,
      });

      if (!mounted) return;
      
      // Update local state in AppProvider
      provider.loginWithFirstPet(petModel);
      provider.seedDemoData();
      
      ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('宠物 ${petModel.name} 档案创建成功！🎉')));
      Navigator.of(context).pushNamedAndRemoveUntil('/home', (route) => false);
    } catch (e) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('创建在线档案失败，已开启本地体验模式: $e')));
      
      // Fallback: local creation
      provider.startNewPet(
        name: _name.trim(),
        type: _type,
        gender: _gender,
        meetDate: DateTime.tryParse(_meetDate) ?? DateTime.now(),
        breed: finalBreed,
        birthday: _birthday.isNotEmpty ? _birthday : null,
        emoji: _emoji,
      );
      provider.updatePendingPet(weight: _weight);
      provider.completeRegistration();
      provider.seedDemoData();
      Navigator.of(context).pushNamedAndRemoveUntil('/home', (route) => false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFFAF6F0),
      body: SafeArea(
        child: Column(
          children: [
            // Header bar
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
              child: Row(
                children: [
                  if (_step > 1)
                    GestureDetector(
                      onTap: _prev,
                      child: const Icon(Icons.arrow_back_ios, size: 20, color: Color(0xFF8C6239)),
                    )
                  else
                    const SizedBox(width: 20),
                  const Spacer(),
                  Text('新建宠物档案 ($_step/7)', style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w900, color: Color(0xFFA8621B))),
                  const Spacer(),
                  const SizedBox(width: 20),
                ],
              ),
            ),
            // Progress dots
            Row(
              mainAxisAlignment: MainAxisAlignment.center,
              children: List.generate(
                7,
                (i) => Container(
                  width: i + 1 == _step ? 24 : 8,
                  height: 8,
                  margin: const EdgeInsets.symmetric(horizontal: 4),
                  decoration: BoxDecoration(
                    color: i < _step ? const Color(0xFFE8791A) : const Color(0xFFFFE6A8),
                    borderRadius: BorderRadius.circular(4),
                  ),
                ),
              ),
            ),
            const SizedBox(height: 24),
            // Step content
            Expanded(child: _buildStep()),
            // Next button
            Padding(
              padding: const EdgeInsets.all(20),
              child: SizedBox(
                width: double.infinity,
                height: 48,
                child: Container(
                  decoration: BoxDecoration(
                    gradient: _canNext ? const LinearGradient(colors: [Color(0xFFFFB23F), Color(0xFFFF8A3D)]) : null,
                    color: _canNext ? null : const Color(0x66FFB23F),
                    borderRadius: BorderRadius.circular(14),
                    boxShadow: _canNext ? const [BoxShadow(color: Color(0x26FF8A3D), blurRadius: 12, offset: Offset(0, 4))] : null,
                  ),
                  child: Material(
                    color: Colors.transparent,
                    child: InkWell(
                      borderRadius: BorderRadius.circular(14),
                      onTap: _canNext ? _next : null,
                      child: Center(
                        child: Text(
                          _step == 7 ? '开启小爪管家生活 🎉' : '下一步 →',
                          style: const TextStyle(fontSize: 15, fontWeight: FontWeight.w800, color: Colors.white),
                        ),
                      ),
                    ),
                  ),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildStep() {
    switch (_step) {
      case 1:
        return _buildNicknameStep();
      case 2:
        return _buildTypeStep();
      case 3:
        return _buildDetailStep();
      case 4:
        return _buildGenderStep();
      case 5:
        return _buildWeightStep();
      case 6:
        return _buildAvatarStep();
      case 7:
        return _buildPreviewStep();
      default:
        return const SizedBox();
    }
  }

  // ── Step 1: Owner Nickname ──
  Widget _buildNicknameStep() {
    return SingleChildScrollView(
      padding: const EdgeInsets.all(24),
      child: Column(
        children: [
          Container(
            width: 72,
            height: 72,
            decoration: BoxDecoration(
              borderRadius: BorderRadius.circular(24),
              gradient: const LinearGradient(colors: [Color(0xFFFFB23F), Color(0xFFFF8A3D)]),
              boxShadow: const [BoxShadow(color: Color(0x33FF8A3D), blurRadius: 20, offset: Offset(0, 8))],
            ),
            child: const Icon(Icons.person, color: Colors.white, size: 32),
          ),
          const SizedBox(height: 16),
          const Text('欢迎使用小爪！', style: TextStyle(fontSize: 18, fontWeight: FontWeight.w900, color: Color(0xFF2D2621))),
          const SizedBox(height: 4),
          const Text('先告诉我们关于你的信息', style: TextStyle(fontSize: 12, color: Color(0xFF8C6239))),
          const SizedBox(height: 24),
          Container(
            padding: const EdgeInsets.all(20),
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(24),
              border: Border.all(color: const Color(0xFFEADEC9)),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Text('你的昵称', style: TextStyle(fontSize: 12, fontWeight: FontWeight.w700, color: Color(0xFF8C6239))),
                const SizedBox(height: 8),
                TextField(
                  controller: _nicknameCtrl,
                  style: const TextStyle(fontSize: 15, fontWeight: FontWeight.w600),
                  decoration: InputDecoration(
                    hintText: '如：小宝妈妈、旺财铲屎官…',
                    hintStyle: const TextStyle(color: Color(0xFFC0A080), fontSize: 14),
                    border: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: const BorderSide(color: Color(0xFFEADEC9))),
                    focusedBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: const BorderSide(color: Color(0xFFFF8A3D))),
                    contentPadding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
                  ),
                  onChanged: (v) => setState(() => _userNickname = v),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  // ── Step 2: Pet Type ──
  Widget _buildTypeStep() {
    return SingleChildScrollView(
      padding: const EdgeInsets.symmetric(horizontal: 24),
      child: Column(
        children: [
          const SizedBox(height: 12),
          const Text('毛孩子是哪一类星人？', style: TextStyle(fontSize: 18, fontWeight: FontWeight.w900, color: Color(0xFF2D2621))),
          const SizedBox(height: 20),
          ...['猫咪', '狗狗', '小兔', '其他'].map((t) {
            final selected = t == '其他' ? !_petTypes.contains(_type) : _type == t;
            return Padding(
              padding: const EdgeInsets.only(bottom: 12),
              child: SizedBox(
                width: double.infinity,
                height: 50,
                child: OutlinedButton(
                  onPressed: () {
                    if (t == '其他') {
                      setState(() {
                        _type = '';
                        _emoji = '🐾';
                      });
                    } else {
                      final defaultBreed = {'猫咪': '英国短毛猫', '狗狗': '金毛巡回猎犬', '小兔': '侏儒兔'};
                      setState(() {
                        _type = t;
                        _breed = defaultBreed[t] ?? '';
                        _emoji = {'猫咪': '🐱', '狗狗': '🐶', '小兔': '🐰'}[t] ?? '🐾';
                      });
                    }
                  },
                  style: OutlinedButton.styleFrom(
                    backgroundColor: selected ? const Color(0xFFFFF4DE) : Colors.white,
                    foregroundColor: selected ? const Color(0xFFFF8A3D) : const Color(0xFF8C6239),
                    side: BorderSide(color: selected ? const Color(0xFFFFB23F) : const Color(0xFFEADEC9), width: selected ? 2 : 1),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                  ),
                  child: Text(
                    t == '猫咪'
                        ? '猫咪家族'
                        : t == '狗狗'
                            ? '狗狗家族'
                            : t == '小兔'
                                ? '兔兔家族'
                                : '其他品种',
                    style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w900),
                  ),
                ),
              ),
            );
          }),
          if (!_petTypes.contains(_type)) ...[
            const SizedBox(height: 8),
            Align(
              alignment: Alignment.centerLeft,
              child: Text('手动填写宠物种类', style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w700, color: Color(0xFF8C6239))),
            ),
            const SizedBox(height: 6),
            TextField(
              decoration: InputDecoration(
                hintText: '如：仓鼠、龙猫、爬宠、鹦鹉',
                hintStyle: const TextStyle(color: Color(0xFFC0A080), fontSize: 14),
                border: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: const BorderSide(color: Color(0xFFEADEC9))),
                focusedBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: const BorderSide(color: Color(0xFFFF8A3D))),
                contentPadding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
              ),
              onChanged: (v) => setState(() => _type = v),
            ),
          ],
        ],
      ),
    );
  }

  // ── Step 3: Pet Name, Breed, Birthday, Arrival date ──
  Widget _buildDetailStep() {
    return SingleChildScrollView(
      padding: const EdgeInsets.symmetric(horizontal: 24),
      child: Column(
        children: [
          const Text('让我们更了解它', style: TextStyle(fontSize: 18, fontWeight: FontWeight.w900, color: Color(0xFF2D2621))),
          const SizedBox(height: 16),
          Container(
            padding: const EdgeInsets.all(20),
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(24),
              border: Border.all(color: const Color(0xFFEADEC9)),
              boxShadow: const [BoxShadow(color: Color(0x052D2621), blurRadius: 12)],
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Text('🏷️ 它的名字', style: TextStyle(fontSize: 12, fontWeight: FontWeight.w700, color: Color(0xFF8C6239))),
                const SizedBox(height: 8),
                TextField(
                  controller: _nameCtrl,
                  decoration: InputDecoration(
                    hintText: '例如：旺财、咪咪、大白',
                    hintStyle: const TextStyle(color: Color(0xFFC0A080), fontSize: 14),
                    border: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: const BorderSide(color: Color(0xFFEADEC9))),
                    focusedBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: const BorderSide(color: Color(0xFFFF8A3D))),
                    contentPadding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
                  ),
                  onChanged: (v) => setState(() => _name = v),
                ),
                const SizedBox(height: 14),
                const Text('🏷️ 品种', style: TextStyle(fontSize: 12, fontWeight: FontWeight.w700, color: Color(0xFF8C6239))),
                const SizedBox(height: 8),
                TextField(
                  controller: _breedCtrl,
                  decoration: InputDecoration(
                    hintText: _type == '狗狗'
                        ? '如：金毛、柯基、柴犬...'
                        : _type == '猫咪'
                            ? '如：英短、布偶、暹罗...'
                            : '请输入宠物品种',
                    hintStyle: const TextStyle(color: Color(0xFFC0A080), fontSize: 14),
                    border: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: const BorderSide(color: Color(0xFFEADEC9))),
                    focusedBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: const BorderSide(color: Color(0xFFFF8A3D))),
                    contentPadding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
                  ),
                  onChanged: (v) => setState(() => _breed = v),
                ),
                const SizedBox(height: 14),
                const Text('🎂 宠物生日', style: TextStyle(fontSize: 12, fontWeight: FontWeight.w700, color: Color(0xFF8C6239))),
                const SizedBox(height: 8),
                GestureDetector(
                  onTap: () => _selectDate(context, true),
                  child: Container(
                    height: 42,
                    padding: const EdgeInsets.symmetric(horizontal: 12),
                    decoration: BoxDecoration(
                      color: Colors.white,
                      borderRadius: BorderRadius.circular(12),
                      border: Border.all(color: const Color(0xFFEADEC9)),
                    ),
                    child: Row(
                      children: [
                        Text(
                          _birthday.isNotEmpty ? _birthday : '选择日期',
                          style: TextStyle(
                            fontSize: 15,
                            color: _birthday.isNotEmpty ? const Color(0xFF2D2621) : const Color(0xFFC0A080),
                            fontWeight: _birthday.isNotEmpty ? FontWeight.w600 : FontWeight.w400,
                          ),
                        ),
                        const Spacer(),
                        const Icon(Icons.calendar_today, size: 16, color: Color(0xFFC0A080)),
                      ],
                    ),
                  ),
                ),
                const SizedBox(height: 14),
                const Text('🏠 到家时间', style: TextStyle(fontSize: 12, fontWeight: FontWeight.w700, color: Color(0xFF8C6239))),
                const SizedBox(height: 8),
                GestureDetector(
                  onTap: () => _selectDate(context, false),
                  child: Container(
                    height: 42,
                    padding: const EdgeInsets.symmetric(horizontal: 12),
                    decoration: BoxDecoration(
                      color: Colors.white,
                      borderRadius: BorderRadius.circular(12),
                      border: Border.all(color: const Color(0xFFEADEC9)),
                    ),
                    child: Row(
                      children: [
                        Text(
                          _meetDate,
                          style: const TextStyle(
                            fontSize: 15,
                            color: Color(0xFF2D2621),
                            fontWeight: FontWeight.w600,
                          ),
                        ),
                        const Spacer(),
                        const Icon(Icons.calendar_today, size: 16, color: Color(0xFFC0A080)),
                      ],
                    ),
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  // ── Step 4: Gender ──
  Widget _buildGenderStep() {
    return Center(
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          const Text('毛孩子的性别是？', style: TextStyle(fontSize: 18, fontWeight: FontWeight.w900, color: Color(0xFF2D2621))),
          const SizedBox(height: 24),
          Row(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              _genderCard('男孩', '小正太 (男孩)', '👦', const Color(0xFF0284C7), const Color(0xFFE0F2FE), _gender == '男孩'),
              const SizedBox(width: 20),
              _genderCard('女孩', '小公主 (女孩)', '👧', const Color(0xFFDB2777), const Color(0xFFFCE7F3), _gender == '女孩'),
            ],
          ),
        ],
      ),
    );
  }

  Widget _genderCard(String value, String label, String emoji, Color color, Color bg, bool selected) {
    return GestureDetector(
      onTap: () => setState(() => _gender = value),
      child: Container(
        width: 120,
        height: 130,
        decoration: BoxDecoration(
          color: selected ? bg : Colors.white,
          border: Border.all(color: selected ? color : const Color(0xFFEADEC9), width: selected ? 2 : 1),
          borderRadius: BorderRadius.circular(24),
          boxShadow: selected ? [BoxShadow(color: color.withValues(alpha: 0.15), blurRadius: 15)] : null,
        ),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Container(
              width: 44,
              height: 44,
              decoration: BoxDecoration(shape: BoxShape.circle, color: selected ? Colors.white.withValues(alpha: 0.8) : bg),
              alignment: Alignment.center,
              child: Text(emoji, style: const TextStyle(fontSize: 22)),
            ),
            const SizedBox(height: 12),
            Text(label, style: TextStyle(fontSize: 13, fontWeight: FontWeight.w800, color: color)),
          ],
        ),
      ),
    );
  }

  // ── Step 5: Weight ──
  Widget _buildWeightStep() {
    return Center(
      child: Padding(
        padding: const EdgeInsets.symmetric(horizontal: 24),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            const Text('当前体重是多少？', style: TextStyle(fontSize: 18, fontWeight: FontWeight.w900, color: Color(0xFF2D2621))),
            const SizedBox(height: 20),
            Container(
              padding: const EdgeInsets.all(24),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(24),
                border: Border.all(color: const Color(0xFFEADEC9)),
                boxShadow: const [BoxShadow(color: Color(0x052D2621), blurRadius: 12)],
              ),
              child: Column(
                children: [
                  Container(
                    width: 120,
                    height: 110,
                    decoration: BoxDecoration(
                      color: const Color(0xFFFFF9F5),
                      border: Border.all(color: const Color(0xFFFFE2C4)),
                      borderRadius: BorderRadius.circular(20),
                    ),
                    alignment: Alignment.center,
                    child: Row(
                      mainAxisAlignment: MainAxisAlignment.center,
                      crossAxisAlignment: CrossAxisAlignment.baseline,
                      textBaseline: TextBaseline.alphabetic,
                      children: [
                        Text(_weight.toStringAsFixed(1), style: const TextStyle(fontSize: 36, fontWeight: FontWeight.w900, color: Color(0xFFFF8A3D))),
                        const SizedBox(width: 4),
                        const Text('KG', style: TextStyle(fontSize: 16, fontWeight: FontWeight.w800, color: Color(0xFFC0A080))),
                      ],
                    ),
                  ),
                  const SizedBox(height: 20),
                  Slider(
                    value: _weight,
                    min: 0.1,
                    max: 80,
                    divisions: 799,
                    activeColor: const Color(0xFFFF8A3D),
                    inactiveColor: const Color(0xFFFFE7D1),
                    onChanged: (v) => setState(() => _weight = v),
                  ),
                  const SizedBox(height: 8),
                  const Text('滑动选择体重', style: TextStyle(fontSize: 12, color: Color(0xFF8C6239), fontWeight: FontWeight.w700)),
                  const SizedBox(height: 12),
                  const Text('精确的体重能帮我们计算更合理的食谱成分哦', style: TextStyle(fontSize: 11, color: Color(0xFF8C6239))),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  // ── Step 6: Avatar ──
  Widget _buildAvatarStep() {
    return SingleChildScrollView(
      padding: const EdgeInsets.symmetric(horizontal: 24),
      child: Column(
        children: [
          const Text('宠物头像', style: TextStyle(fontSize: 18, fontWeight: FontWeight.w900, color: Color(0xFF2D2621))),
          const SizedBox(height: 4),
          const Text('选一个可爱的代表性头像', style: TextStyle(fontSize: 12, color: Color(0xFFA8621B))),
          const SizedBox(height: 16),
          // Circular Preview Card
          Container(
            width: 88,
            height: 88,
            decoration: BoxDecoration(
              shape: BoxShape.circle,
              color: const Color(0xFFFEF3C6),
              border: Border.all(color: const Color(0xFFFFB23F), width: 4),
              boxShadow: const [BoxShadow(color: Color(0x40FFB23F), blurRadius: 20, offset: Offset(0, 6))],
            ),
            alignment: Alignment.center,
            child: Text(_emoji, style: const TextStyle(fontSize: 42)),
          ),
          const SizedBox(height: 24),
          // Emoji selection grid
          Wrap(
            spacing: 12,
            runSpacing: 12,
            children: _emojis.asMap().entries.map((e) {
              final i = e.key;
              final emoji = e.value;
              final selected = _emoji == emoji;
              return GestureDetector(
                onTap: () => setState(() => _emoji = emoji),
                child: Container(
                  width: 70,
                  height: 62,
                  decoration: BoxDecoration(
                    color: selected ? const Color(0xFFFEF3C6) : Colors.white,
                    border: Border.all(color: selected ? const Color(0xFFFFB23F) : const Color(0xFFFFE7D1), width: selected ? 2 : 1),
                    borderRadius: BorderRadius.circular(16),
                    boxShadow: selected ? const [BoxShadow(color: Color(0x3FFFB23F), blurRadius: 10, offset: Offset(0, 3))] : null,
                  ),
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Text(emoji, style: const TextStyle(fontSize: 24)),
                      const SizedBox(height: 2),
                      Text(_emojiLabels[i], style: const TextStyle(fontSize: 10, fontWeight: FontWeight.w700, color: Color(0xFFA8621B))),
                    ],
                  ),
                ),
              );
            }).toList(),
          ),
        ],
      ),
    );
  }

  // ── Step 7: Profile Preview ──
  Widget _buildPreviewStep() {
    return SingleChildScrollView(
      padding: const EdgeInsets.symmetric(horizontal: 24),
      child: Column(
        children: [
          const Text('确认档案信息 🎉', style: TextStyle(fontSize: 18, fontWeight: FontWeight.w900, color: Color(0xFF2D2621))),
          const SizedBox(height: 4),
          const Text('检查一下，没问题就开启小爪之旅吧', style: TextStyle(fontSize: 12, color: Color(0xFF8C6239))),
          const SizedBox(height: 20),
          Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(20),
              border: Border.all(color: const Color(0xFFFFE7D1)),
              boxShadow: const [BoxShadow(color: Color(0x052D2621), blurRadius: 12)],
            ),
            child: Column(
              children: [
                // Owner info
                if (_userNickname.isNotEmpty)
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                    decoration: BoxDecoration(
                      color: const Color(0xFFFFFDF5),
                      border: Border.all(color: const Color(0xFFFFE7D1)),
                      borderRadius: BorderRadius.circular(12),
                    ),
                    child: Row(
                      children: [
                        const Icon(Icons.person, color: Color(0xFFFF8A3D), size: 16),
                        const SizedBox(width: 8),
                        Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            const Text('铲屎官', style: TextStyle(fontSize: 10, color: Colors.grey)),
                            Text(_userNickname, style: const TextStyle(fontSize: 13, fontWeight: FontWeight.bold, color: Color(0xFF2D2621))),
                          ],
                        ),
                      ],
                    ),
                  ),
                const SizedBox(height: 12),
                // Pet info
                Container(
                  padding: const EdgeInsets.all(12),
                  decoration: BoxDecoration(
                    color: const Color(0xFFFFFDF9),
                    border: Border.all(color: const Color(0xFFFFE7D1), width: 2),
                    borderRadius: BorderRadius.circular(16),
                  ),
                  child: Row(
                    children: [
                      Container(
                        width: 60,
                        height: 60,
                        decoration: BoxDecoration(
                          color: const Color(0xFFFFF4DE),
                          borderRadius: BorderRadius.circular(16),
                        ),
                        alignment: Alignment.center,
                        child: Text(_emoji, style: const TextStyle(fontSize: 32)),
                      ),
                      const SizedBox(width: 14),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Row(
                              children: [
                                Text(_name.isNotEmpty ? _name : '未命名', style: const TextStyle(fontSize: 16, fontWeight: FontWeight.w900, color: Color(0xFF2D2621))),
                                const SizedBox(width: 6),
                                Text(
                                  _gender == '男孩' ? '♂' : '♀',
                                  style: TextStyle(
                                    fontSize: 14,
                                    color: _gender == '男孩' ? const Color(0xFF0284C7) : const Color(0xFFDB2777),
                                    fontWeight: FontWeight.bold,
                                  ),
                                ),
                              ],
                            ),
                            const SizedBox(height: 4),
                            Text(
                              '🐾 $_type   🏷️ ${_breed.isNotEmpty ? _breed : '未设置'}   ⚖️ ${_weight.toStringAsFixed(1)} KG',
                              style: const TextStyle(fontSize: 11, color: Color(0xFF8C6239), fontWeight: FontWeight.w600),
                            ),
                            if (_birthday.isNotEmpty) ...[
                              const SizedBox(height: 4),
                              Text('🎂 生日: $_birthday', style: const TextStyle(fontSize: 10, color: Colors.grey)),
                            ],
                            const SizedBox(height: 2),
                            Text('🏠 到家: $_meetDate', style: const TextStyle(fontSize: 10, color: Colors.grey)),
                          ],
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

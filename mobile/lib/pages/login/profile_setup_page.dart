import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../services/app_provider.dart';

class ProfileSetupPage extends StatefulWidget {
  const ProfileSetupPage({super.key});

  @override
  State<ProfileSetupPage> createState() => _ProfileSetupPageState();
}

class _ProfileSetupPageState extends State<ProfileSetupPage> {
  int _step = 1; // 1-5
  String _emoji = '🐶';
  String _type = '猫咪';
  String _gender = '男孩';
  String _name = '';
  String _breed = '';
  double _weight = 4.5;

  final _nameCtrl = TextEditingController();
  final _breedCtrl = TextEditingController();

  final List<String> _emojis = ['🐶', '🐱', '🐰', '🐹', '🐻', '🐼', '🐨', '🐯', '🦊', '🐮', '🐷', '🐸'];
  final List<String> _emojiLabels = ['狗狗', '猫咪', '小兔', '仓鼠', '小熊', '熊猫', '考拉', '老虎', '狐狸', '小牛', '小猪', '青蛙'];
  final List<String> _petTypes = ['猫咪', '狗狗', '小兔'];
  final List<String> _presetPhotos = [
    'https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&w=120&q=80',
    'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&w=120&q=80',
    'https://images.unsplash.com/photo-1522850959074-3a7507729a9c?auto=format&fit=crop&w=120&q=80',
    'https://images.unsplash.com/photo-1504450758481-7338eba7524a?auto=format&fit=crop&w=120&q=80',
  ];
  @override
  void dispose() {
    _nameCtrl.dispose();
    _breedCtrl.dispose();
    super.dispose();
  }

  bool get _canNext {
    switch (_step) {
      case 2: return _type.isNotEmpty;
      case 4: return _name.trim().isNotEmpty;
      default: return true;
    }
  }

  void _next() {
    if (_step < 5) {
      setState(() => _step++);
    } else {
      _complete();
    }
  }

  void _prev() {
    if (_step > 1) setState(() => _step--);
  }

  void _complete() {
    final provider = context.read<AppProvider>();
    final defaultBreeds = {'猫咪': '英国短毛猫', '狗狗': '金毛巡回猎犬', '小兔': '侏儒兔'};
    provider.startNewPet(
      name: _name.trim(),
      type: _type,
      gender: _gender,
      meetDate: DateTime.now(),
      breed: _breed.trim().isNotEmpty ? _breed.trim() : defaultBreeds[_type] ?? '',
      emoji: _emoji,
    );
    provider.updatePendingPet(weight: _weight);
    provider.completeRegistration();
    provider.seedDemoData();
    Navigator.of(context).pushNamedAndRemoveUntil('/home', (route) => false);
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
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
              child: Row(
                children: [
                  if (_step > 1)
                    GestureDetector(onTap: _prev, child: const Icon(Icons.arrow_back_ios, size: 20, color: Color(0xFF8C6239)))
                  else
                    const SizedBox(width: 20),
                  const Spacer(),
                  Text('新建宠物卡片 ($_step/5)', style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w900, color: Color(0xFFA8621B))),
                  const Spacer(),
                  const SizedBox(width: 20),
                ],
              ),
            ),
            // Progress dots
            Row(
              mainAxisAlignment: MainAxisAlignment.center,
              children: List.generate(5, (i) => Container(
                width: i + 1 == _step ? 24 : 8, height: 8,
                margin: const EdgeInsets.symmetric(horizontal: 4),
                decoration: BoxDecoration(
                  color: i < _step ? const Color(0xFFE8791A) : const Color(0xFFFFE6A8),
                  borderRadius: BorderRadius.circular(4),
                ),
              )),
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
                        child: Text(_step == 5 ? '开启小爪管家生活' : '下一步', style: const TextStyle(fontSize: 15, fontWeight: FontWeight.w800, color: Colors.white)),
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
      case 1: return _buildEmojiStep();
      case 2: return _buildTypeStep();
      case 3: return _buildGenderStep();
      case 4: return _buildNameStep();
      case 5: return _buildWeightStep();
      default: return const SizedBox();
    }
  }

  // ── Step 1: Emoji/Photo selection ──
  Widget _buildEmojiStep() {
    return SingleChildScrollView(
      padding: const EdgeInsets.all(16),
      child: Column(
        children: [
          const Text('为毛孩子选个代表头像 🐾', style: TextStyle(fontSize: 18, fontWeight: FontWeight.w900, color: Color(0xFF8C6239))),
          const SizedBox(height: 16),
          // Emoji grid 4 columns
          Wrap(
            spacing: 10, runSpacing: 10,
            children: _emojis.asMap().entries.map((e) {
              final i = e.key; final emoji = e.value;
              final selected = _emoji == emoji;
              return GestureDetector(
                onTap: () => setState(() => _emoji = emoji),
                child: Container(
                  width: 70, height: 70,
                  decoration: BoxDecoration(
                    color: selected ? const Color(0xFFFFF4DE) : Colors.white,
                    border: Border.all(color: selected ? const Color(0xFFFFB23F) : const Color(0xFFFFE7D1), width: selected ? 2 : 1),
                    borderRadius: BorderRadius.circular(16),
                    boxShadow: selected ? const [BoxShadow(color: Color(0x26FFB23F), blurRadius: 10)] : null,
                  ),
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Text(emoji, style: const TextStyle(fontSize: 28)),
                      Text(_emojiLabels[i], style: const TextStyle(fontSize: 9, color: Color(0xFFA8621B))),
                    ],
                  ),
                ),
              );
            }).toList(),
          ),
          const SizedBox(height: 20),
          const Divider(color: Color(0xFFFFE7D1)),
          const SizedBox(height: 12),
          const Align(alignment: Alignment.centerLeft, child: Text('📷 预设照片', style: TextStyle(fontSize: 12, fontWeight: FontWeight.w700, color: Color(0xFFA8621B)))),
          const SizedBox(height: 8),
          // Preset photos
          Row(
            children: _presetPhotos.asMap().entries.map((e) {
              final url = e.value;
              final selected = _emoji == url;
              return GestureDetector(
                onTap: () => setState(() => _emoji = url),
                child: Container(
                  width: 60, height: 60, margin: const EdgeInsets.only(right: 8),
                  decoration: BoxDecoration(
                    borderRadius: BorderRadius.circular(12),
                    border: Border.all(color: selected ? const Color(0xFFFFB23F) : const Color(0xFFFFE7D1), width: selected ? 2 : 1),
                    image: DecorationImage(image: NetworkImage(url), fit: BoxFit.cover),
                  ),
                  child: selected ? const Positioned(
                    bottom: 0, left: 0, right: 0,
                    child: ColoredBox(color: Color(0x80000000), child: Text('已选', textAlign: TextAlign.center, style: TextStyle(fontSize: 8, color: Colors.white))),
                  ) : null,
                ),
              );
            }).toList(),
          ),
        ],
      ),
    );
  }

  // ── Step 2: Pet type ──
  Widget _buildTypeStep() {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(24),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            const Text('毛孩子是哪一类星人？', style: TextStyle(fontSize: 18, fontWeight: FontWeight.w900, color: Color(0xFF2D2621))),
            const SizedBox(height: 20),
            ...['猫咪', '狗狗', '小兔', '其他'].map((t) {
              final selected = t == '其他' ? !_petTypes.contains(_type) : _type == t;
              return Padding(
                padding: const EdgeInsets.only(bottom: 10),
                child: SizedBox(
                  width: double.infinity,
                  height: 48,
                  child: OutlinedButton(
                    onPressed: () {
                      if (t == '其他') {
                        setState(() => _type = '其他');
                      } else {
                        final defaultBreed = {'猫咪': '英国短毛猫', '狗狗': '金毛巡回猎犬', '小兔': '侏儒兔'};
                        setState(() { _type = t; _breed = defaultBreed[t] ?? ''; _emoji = {'猫咪': '🐱', '狗狗': '🐶', '小兔': '🐰'}[t] ?? '🐾'; });
                      }
                    },
                    style: OutlinedButton.styleFrom(
                      backgroundColor: selected ? const Color(0xFFFFF4DE) : Colors.white,
                      foregroundColor: selected ? const Color(0xFFFF8A3D) : const Color(0xFF8C6239),
                      side: BorderSide(color: selected ? const Color(0xFFFFB23F) : const Color(0xFFEADEC9), width: selected ? 2 : 1),
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                    ),
                    child: Text(
                      {'猫咪': '🐱 猫咪家族', '狗狗': '🐶 狗狗家族', '小兔': '🐰 兔兔家族', '其他': '✨ 其他品种'}[t] ?? '',
                      style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w900),
                    ),
                  ),
                ),
              );
            }),
            if (!_petTypes.contains(_type))
              TextField(
                decoration: InputDecoration(
                  hintText: '如：仓鼠、龙猫、爬宠、鹦鹉',
                  border: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: const BorderSide(color: Color(0xFFEADEC9))),
                ),
                onChanged: (v) => setState(() => _type = v),
              ),
          ],
        ),
      ),
    );
  }

  // ── Step 3: Gender ──
  Widget _buildGenderStep() {
    return Center(
      child: Row(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          _genderCard('boy', '小正太 (男孩)', '👦', const Color(0xFF0284C7), const Color(0xFFE0F2FE), _gender == '男孩'),
          const SizedBox(width: 20),
          _genderCard('girl', '小公主 (女孩)', '👧', const Color(0xFFDB2777), const Color(0xFFFCE7F3), _gender == '女孩'),
        ],
      ),
    );
  }

  Widget _genderCard(String value, String label, String emoji, Color color, Color bg, bool selected) {
    return GestureDetector(
      onTap: () => setState(() => _gender = value == 'boy' ? '男孩' : '女孩'),
      child: Container(
        width: 120, height: 150,
        decoration: BoxDecoration(
          color: selected ? bg : Colors.white,
          border: Border.all(color: selected ? color : const Color(0xFFEADEC9), width: selected ? 2 : 1),
          borderRadius: BorderRadius.circular(24),
          boxShadow: selected ? [BoxShadow(color: color.withValues(alpha: 0.15), blurRadius: 15)] : null,
        ),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Text(emoji, style: const TextStyle(fontSize: 48)),
            const SizedBox(height: 8),
            Text(label, style: TextStyle(fontSize: 13, fontWeight: FontWeight.w800, color: color)),
          ],
        ),
      ),
    );
  }

  // ── Step 4: Name + breed ──
  Widget _buildNameStep() {
    return Padding(
      padding: const EdgeInsets.all(24),
      child: Column(
        children: [
          const Text('如何称呼它呢？', style: TextStyle(fontSize: 18, fontWeight: FontWeight.w900, color: Color(0xFF2D2621))),
          const SizedBox(height: 20),
          Container(
            padding: const EdgeInsets.all(20),
            decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(24), border: Border.all(color: const Color(0xFFEADEC9))),
            child: Column(
              children: [
                _stepLabel('它的名字'),
                const SizedBox(height: 8),
                TextField(
                  controller: _nameCtrl,
                  decoration: _stepInputDeco('例如：旺财、咪咪、大白'),
                  onChanged: (v) => setState(() => _name = v),
                ),
                const SizedBox(height: 16),
                _stepLabel('宠物品种'),
                const SizedBox(height: 8),
                TextField(
                  controller: _breedCtrl,
                  decoration: _stepInputDeco('例如：英国短毛猫、金毛巡回猎犬'),
                  onChanged: (v) => setState(() => _breed = v),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  // ── Step 5: Weight ──
  Widget _buildWeightStep() {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(24),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            const Text('最后，确认当前体重', style: TextStyle(fontSize: 18, fontWeight: FontWeight.w900, color: Color(0xFF2D2621))),
            const SizedBox(height: 16),
            Container(
              padding: const EdgeInsets.all(24),
              decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(24), border: Border.all(color: const Color(0xFFEADEC9))),
              child: Column(
                children: [
                  const Icon(Icons.monitor_weight_outlined, size: 36, color: Color(0xFFFF8A3D)),
                  const SizedBox(height: 12),
                  const Text('点击下方数字选择体重', style: TextStyle(fontSize: 12, color: Color(0xFF8C6239))),
                  const SizedBox(height: 8),
                  GestureDetector(
                    onTap: _showWeightPicker,
                    child: Text(
                      '${_weight.toStringAsFixed(1)} KG',
                      style: const TextStyle(fontSize: 32, fontWeight: FontWeight.w900, color: Color(0xFFFF8A3D), decoration: TextDecoration.underline, decorationStyle: TextDecorationStyle.dashed, decorationColor: Color(0xFFFFB23F)),
                    ),
                  ),
                  const SizedBox(height: 16),
                  const Text('精确的体重能帮我们计算更合理的食谱成分哦', style: TextStyle(fontSize: 11, color: Color(0xFF8C6239))),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  void _showWeightPicker() {
    double temp = _weight;
    showModalBottomSheet(
      context: context,
      shape: const RoundedRectangleBorder(borderRadius: BorderRadius.vertical(top: Radius.circular(24))),
      builder: (ctx) => StatefulBuilder(
        builder: (context, setModalState) => Container(
          padding: const EdgeInsets.all(24),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Text('${temp.toStringAsFixed(1)} KG', style: const TextStyle(fontSize: 28, fontWeight: FontWeight.w900, color: Color(0xFFFF8A3D))),
              Slider(value: temp, min: 0.1, max: 80, divisions: 799, activeColor: const Color(0xFFFF8A3D), onChanged: (v) => setModalState(() => temp = v)),
              const SizedBox(height: 12),
              SizedBox(
                width: double.infinity,
                child: ElevatedButton(
                  onPressed: () { setState(() => _weight = temp); Navigator.of(ctx).pop(); },
                  style: ElevatedButton.styleFrom(backgroundColor: const Color(0xFFFFB23F), foregroundColor: Colors.white, shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12))),
                  child: const Text('确定'),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _stepLabel(String text) => Text(text, style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w700, color: Color(0xFF8C6239)));
  InputDecoration _stepInputDeco(String hint) => InputDecoration(hintText: hint, hintStyle: const TextStyle(color: Color(0xFFC0A080)), border: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: const BorderSide(color: Color(0xFFEADEC9))), focusedBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: const BorderSide(color: Color(0xFFFF8A3D))), contentPadding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12));
}

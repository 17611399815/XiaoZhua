import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../theme/app_theme.dart';
import '../../services/app_provider.dart';
import '../../widgets/wheel_time_picker.dart';

class WeightPage extends StatefulWidget {
  const WeightPage({super.key});

  @override
  State<WeightPage> createState() => _WeightPageState();
}

class _WeightPageState extends State<WeightPage> {
  int _weightKg = 4;

  @override
  void initState() {
    super.initState();
    final existing = context.read<AppProvider>().pendingPet;
    if (existing != null && existing.weight > 0) {
      _weightKg = existing.weight.round().clamp(1, 50);
    }
  }

  void _increment() {
    if (_weightKg < 50) {
      setState(() => _weightKg++);
    }
  }

  void _decrement() {
    if (_weightKg > 1) {
      setState(() => _weightKg--);
    }
  }

  Future<void> _openWheelPicker() async {
    final result = await showDialog<int>(
      context: context,
      builder: (ctx) => _WeightPickerDialog(initialWeight: _weightKg),
    );
    if (result != null) {
      setState(() => _weightKg = result.clamp(1, 50));
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: LoginGradientBackground(
        child: SafeArea(
          child: Padding(
            padding: const EdgeInsets.symmetric(horizontal: 24),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const SizedBox(height: 16),
                Row(
                  children: const [
                    BackCircleButton(),
                    Spacer(),
                    ProgressDots(total: 7, current: 5),
                    Spacer(),
                    SizedBox(width: 40),
                  ],
                ),
                const SizedBox(height: 20),
                const Text(
                  '当前体重是多少？',
                  style: TextStyle(
                    fontSize: 18,
                    fontWeight: FontWeight.w900,
                    color: Color(0xFF2D2621),
                  ),
                ),
                const SizedBox(height: 28),

                // Weight display card
                Container(
                  padding: const EdgeInsets.all(24),
                  decoration: BoxDecoration(
                    color: Colors.white,
                    borderRadius: BorderRadius.circular(24),
                    border: Border.all(color: const Color(0xFFEADEC9)),
                    boxShadow: const [
                      BoxShadow(
                        color: Color(0x0A000000),
                        blurRadius: 12,
                        offset: Offset(0, 4),
                      ),
                    ],
                  ),
                  child: Column(
                    children: [
                      // Large weight display with +/- buttons
                      Row(
                        mainAxisAlignment: MainAxisAlignment.center,
                        crossAxisAlignment: CrossAxisAlignment.center,
                        children: [
                          // Minus button
                          GestureDetector(
                            onTap: _decrement,
                            child: Container(
                              width: 48,
                              height: 48,
                              decoration: BoxDecoration(
                                color: _weightKg > 1
                                    ? const Color(0xFFFFF4DE)
                                    : const Color(0xFFF5F5F5),
                                borderRadius: BorderRadius.circular(16),
                                border: Border.all(
                                  color: _weightKg > 1
                                      ? const Color(0xFFFFE7D1)
                                      : const Color(0xFFE5E5E5),
                                ),
                              ),
                              child: Icon(
                                Icons.remove,
                                size: 24,
                                color: _weightKg > 1
                                    ? const Color(0xFFFF8A3D)
                                    : const Color(0xFFBBBBBB),
                              ),
                            ),
                          ),
                          const SizedBox(width: 16),

                          // Center weight number
                          Container(
                            width: 130,
                            height: 110,
                            decoration: BoxDecoration(
                              color: const Color(0xFFFFF9F5),
                              borderRadius: BorderRadius.circular(20),
                              border: Border.all(
                                color: const Color(0xFFFFE2C4),
                              ),
                              boxShadow: const [
                                BoxShadow(
                                  color: Color(0x0AFF8A3D),
                                  blurRadius: 10,
                                  offset: Offset(0, 4),
                                ),
                              ],
                            ),
                            child: Row(
                              mainAxisAlignment: MainAxisAlignment.center,
                              crossAxisAlignment: CrossAxisAlignment.center,
                              children: [
                                Text(
                                  '$_weightKg',
                                  style: const TextStyle(
                                    fontSize: 40,
                                    fontWeight: FontWeight.w900,
                                    color: Color(0xFFFF8A3D),
                                    height: 1,
                                  ),
                                ),
                                const SizedBox(width: 4),
                                const Padding(
                                  padding: EdgeInsets.only(top: 8),
                                  child: Text(
                                    'KG',
                                    style: TextStyle(
                                      fontSize: 18,
                                      fontWeight: FontWeight.w800,
                                      color: Color(0xFFC0A080),
                                    ),
                                  ),
                                ),
                              ],
                            ),
                          ),
                          const SizedBox(width: 16),

                          // Plus button
                          GestureDetector(
                            onTap: _increment,
                            child: Container(
                              width: 48,
                              height: 48,
                              decoration: BoxDecoration(
                                color: _weightKg < 50
                                    ? const Color(0xFFFFF4DE)
                                    : const Color(0xFFF5F5F5),
                                borderRadius: BorderRadius.circular(16),
                                border: Border.all(
                                  color: _weightKg < 50
                                      ? const Color(0xFFFFE7D1)
                                      : const Color(0xFFE5E5E5),
                                ),
                              ),
                              child: Icon(
                                Icons.add,
                                size: 24,
                                color: _weightKg < 50
                                    ? const Color(0xFFFF8A3D)
                                    : const Color(0xFFBBBBBB),
                              ),
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 16),

                      // Scroll picker button
                      GestureDetector(
                        onTap: _openWheelPicker,
                        child: Container(
                          padding: const EdgeInsets.symmetric(
                            horizontal: 20,
                            vertical: 10,
                          ),
                          decoration: BoxDecoration(
                            borderRadius: BorderRadius.circular(10),
                            border: Border.all(
                              color: const Color(0xFFFFB23F),
                              style: BorderStyle.solid,
                            ),
                          ),
                          child: const Row(
                            mainAxisSize: MainAxisSize.min,
                            children: [
                              Icon(
                                Icons.tune,
                                size: 16,
                                color: Color(0xFFFF8A3D),
                              ),
                              SizedBox(width: 6),
                              Text(
                                '滑动选择体重',
                                style: TextStyle(
                                  fontSize: 13,
                                  fontWeight: FontWeight.w700,
                                  color: Color(0xFFFF8A3D),
                                ),
                              ),
                            ],
                          ),
                        ),
                      ),
                      const SizedBox(height: 12),
                      const Text(
                        '精确的体重能帮我们计算更合理的食谱成分哦',
                        style: TextStyle(
                          fontSize: 11,
                          color: Color(0xFF8C6239),
                        ),
                      ),
                    ],
                  ),
                ),

                const SizedBox(height: 28),
                PrimaryButton(
                  text: '下一步 →',
                  onPressed: () {
                    context.read<AppProvider>().updatePendingPet(
                          weight: _weightKg.toDouble(),
                        );
                    Navigator.of(context).pushNamed('/avatar');
                  },
                ),
                const SizedBox(height: 24),
              ],
            ),
          ),
        ),
      ),
    );
  }
}

// ── Wheel Weight Picker Modal (matching admin design) ──
class _WeightPickerDialog extends StatefulWidget {
  final int initialWeight;
  const _WeightPickerDialog({required this.initialWeight});

  @override
  State<_WeightPickerDialog> createState() => _WeightPickerDialogState();
}

class _WeightPickerDialogState extends State<_WeightPickerDialog> {
  late FixedExtentScrollController _controller;
  late int _selectedWeight;

  @override
  void initState() {
    super.initState();
    _selectedWeight = widget.initialWeight.clamp(1, 50);
    _controller = FixedExtentScrollController(
      initialItem: _selectedWeight - 1,
    );
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final weights = List<String>.generate(50, (i) => '${i + 1}');

    return Dialog(
      backgroundColor: const Color(0xFFFFFDF9),
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(24)),
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 24),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            const Text(
              '⚖️ 滚动选择宠物体重',
              style: TextStyle(
                fontSize: 18,
                fontWeight: FontWeight.w900,
                color: Color(0xFF2D2621),
              ),
            ),
            const SizedBox(height: 20),
            // Wheel picker row
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 10),
              decoration: BoxDecoration(
                color: const Color(0xFFFFF9F5),
                borderRadius: BorderRadius.circular(16),
                border: Border.all(color: const Color(0xFFFFE2C4)),
              ),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.center,
                mainAxisSize: MainAxisSize.min,
                children: [
                  SizedBox(
                    width: 80,
                    height: 44 * 3,
                    child: Stack(
                      alignment: Alignment.center,
                      children: [
                        Container(
                          height: 44,
                          margin: const EdgeInsets.symmetric(horizontal: 4),
                          decoration: BoxDecoration(
                            color: const Color(0xFFFEF3C8).withValues(alpha: 0.5),
                            borderRadius: BorderRadius.circular(12),
                          ),
                        ),
                        ListWheelScrollView.useDelegate(
                          controller: _controller,
                          itemExtent: 44,
                          diameterRatio: 1.5,
                          perspective: 0.005,
                          physics: const FixedExtentScrollPhysics(),
                          onSelectedItemChanged: (index) {
                            _selectedWeight = index + 1;
                          },
                          childDelegate: ListWheelChildBuilderDelegate(
                            childCount: 50,
                            builder: (context, index) {
                              final isSelected =
                                  index == _controller.selectedItem;
                              return Center(
                                child: Text(
                                  weights[index],
                                  style: TextStyle(
                                    fontSize: isSelected ? 22 : 18,
                                    fontWeight: isSelected
                                        ? FontWeight.w800
                                        : FontWeight.w500,
                                    color: isSelected
                                        ? const Color(0xFF2D2621)
                                        : const Color(0xFFC0A080),
                                  ),
                                ),
                              );
                            },
                          ),
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(width: 6),
                  const Text(
                    'KG',
                    style: TextStyle(
                      fontSize: 20,
                      fontWeight: FontWeight.w800,
                      color: Color(0xFFFF8A3D),
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 8),
            const Text(
              '上下滚动选择整数体重值',
              style: TextStyle(
                fontSize: 12,
                fontWeight: FontWeight.w600,
                color: Color(0xFFC0A080),
              ),
            ),
            const SizedBox(height: 24),
            Row(
              children: [
                Expanded(
                  child: TextButton(
                    onPressed: () => Navigator.of(context).pop(),
                    style: TextButton.styleFrom(
                      padding: const EdgeInsets.symmetric(vertical: 14),
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(14),
                      ),
                    ),
                    child: const Text(
                      '取消',
                      style: TextStyle(
                        fontSize: 15,
                        fontWeight: FontWeight.w700,
                        color: Color(0xFF999999),
                      ),
                    ),
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: Container(
                    decoration: BoxDecoration(
                      gradient: const LinearGradient(
                        colors: [Color(0xFFFFB23F), Color(0xFFFF8A3D)],
                      ),
                      borderRadius: BorderRadius.circular(14),
                    ),
                    child: Material(
                      color: Colors.transparent,
                      child: InkWell(
                        borderRadius: BorderRadius.circular(14),
                        onTap: () {
                          Navigator.of(context).pop(_selectedWeight);
                        },
                        child: Container(
                          padding: const EdgeInsets.symmetric(vertical: 14),
                          alignment: Alignment.center,
                          child: const Text(
                            '确定',
                            style: TextStyle(
                              fontSize: 15,
                              fontWeight: FontWeight.w800,
                              color: Colors.white,
                            ),
                          ),
                        ),
                      ),
                    ),
                  ),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }
}

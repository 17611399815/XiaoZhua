import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../theme/app_theme.dart';
import '../../services/app_provider.dart';

class WeightPage extends StatefulWidget {
  const WeightPage({super.key});

  @override
  State<WeightPage> createState() => _WeightPageState();
}

class _WeightPageState extends State<WeightPage> {
  double _weight = 5.0; // 默认5kg
  final FixedExtentScrollController _kgController =
      FixedExtentScrollController(initialItem: 5);
  final FixedExtentScrollController _decimalController =
      FixedExtentScrollController(initialItem: 0);

  @override
  void dispose() {
    _kgController.dispose();
    _decimalController.dispose();
    super.dispose();
  }

  double _getCurrentWeight() {
    final kg = _kgController.selectedItem;
    final decimal = _decimalController.selectedItem;
    return kg + (decimal / 10);
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
                    ProgressDots(total: 5, current: 4),
                    Spacer(),
                  ],
                ),
                const SizedBox(height: 24),
                const Text(
                  '体重记录',
                  style: AppTextStyles.titleLarge,
                ),
                const SizedBox(height: 4),
                const Text(
                  '记录初始体重，开始健康管理',
                  style: AppTextStyles.subtitle,
                ),
                const SizedBox(height: 28),

                // 体重选择卡片
                AppCard(
                  padding: const EdgeInsets.symmetric(vertical: 32, horizontal: 16),
                  color: Colors.white,
                  child: Column(
                    children: [
                      const Icon(
                        Icons.balance,
                        size: 48,
                        color: AppColors.primary,
                      ),
                      const SizedBox(height: 16),
                      Row(
                        mainAxisAlignment: MainAxisAlignment.center,
                        crossAxisAlignment: CrossAxisAlignment.end,
                        children: [
                          // 公斤整数部分
                          SizedBox(
                            height: 120,
                            width: 80,
                            child: ListWheelScrollView.useDelegate(
                              controller: _kgController,
                              itemExtent: 40,
                              perspective: 0.01,
                              diameterRatio: 1.5,
                              onSelectedItemChanged: (_) {
                                setState(() {
                                  _weight = _getCurrentWeight();
                                });
                              },
                              childDelegate: ListWheelChildBuilderDelegate(
                                builder: (context, index) {
                                  final isSelected =
                                      _kgController.selectedItem == index;
                                  return Center(
                                    child: Text(
                                      '$index',
                                      style: TextStyle(
                                        fontSize: isSelected ? 48 : 36,
                                        fontWeight: isSelected
                                            ? FontWeight.w900
                                            : FontWeight.w500,
                                        color: isSelected
                                            ? AppColors.textPrimary
                                            : AppColors.textMuted,
                                      ),
                                    ),
                                  );
                                },
                                childCount: 50,
                              ),
                            ),
                          ),
                          const Padding(
                            padding: EdgeInsets.only(bottom: 12),
                            child: Text(
                              '.',
                              style: TextStyle(
                                fontSize: 48,
                                fontWeight: FontWeight.w900,
                                color: AppColors.textPrimary,
                              ),
                            ),
                          ),
                          // 小数部分
                          SizedBox(
                            height: 120,
                            width: 60,
                            child: ListWheelScrollView.useDelegate(
                              controller: _decimalController,
                              itemExtent: 40,
                              perspective: 0.01,
                              diameterRatio: 1.5,
                              onSelectedItemChanged: (_) {
                                setState(() {
                                  _weight = _getCurrentWeight();
                                });
                              },
                              childDelegate: ListWheelChildBuilderDelegate(
                                builder: (context, index) {
                                  final isSelected =
                                      _decimalController.selectedItem == index;
                                  return Center(
                                    child: Text(
                                      '$index',
                                      style: TextStyle(
                                        fontSize: isSelected ? 48 : 36,
                                        fontWeight: isSelected
                                            ? FontWeight.w900
                                            : FontWeight.w500,
                                        color: isSelected
                                            ? AppColors.textPrimary
                                            : AppColors.textMuted,
                                      ),
                                    ),
                                  );
                                },
                                childCount: 10,
                              ),
                            ),
                          ),
                          const SizedBox(width: 8),
                          const Padding(
                            padding: EdgeInsets.only(bottom: 14),
                            child: Text(
                              'kg',
                              style: TextStyle(
                                fontSize: 24,
                                fontWeight: FontWeight.w700,
                                color: AppColors.primaryDark,
                              ),
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 12),
                      const Text(
                        '今日体重',
                        style: TextStyle(
                          fontSize: 14,
                          color: AppColors.primaryDark,
                          fontWeight: FontWeight.w600,
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
                          weight: _weight,
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

import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../theme/app_theme.dart';
import '../../services/app_provider.dart';

class GenderPage extends StatefulWidget {
  const GenderPage({super.key});

  @override
  State<GenderPage> createState() => _GenderPageState();
}

class _GenderPageState extends State<GenderPage> {
  String? _selectedGender;
  bool? _selectedNeutered;

  bool get _canProceed => _selectedGender != null && _selectedNeutered != null;

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
                  '性别信息',
                  style: AppTextStyles.titleLarge,
                ),
                const SizedBox(height: 4),
                const Text(
                  '告诉我们更多',
                  style: AppTextStyles.subtitle,
                ),
                const SizedBox(height: 24),

                // 性别选择
                const Text(
                  '性别',
                  style: TextStyle(
                    fontSize: 14,
                    fontWeight: FontWeight.w700,
                    color: AppColors.textPrimary,
                  ),
                ),
                const SizedBox(height: 12),
                Row(
                  children: [
                    Expanded(
                      child: _OptionCard(
                        isSelected: _selectedGender == '男孩',
                        onTap: () => setState(() => _selectedGender = '男孩'),
                        child: Column(
                          children: [
                            const Icon(
                              Icons.male,
                              size: 28,
                              color: Color(0xFF4DABF7),
                            ),
                            const SizedBox(height: 6),
                            const Text(
                              '男孩',
                              style: TextStyle(
                                fontSize: 14,
                                fontWeight: FontWeight.w700,
                                color: AppColors.textDark,
                              ),
                            ),
                          ],
                        ),
                      ),
                    ),
                    const SizedBox(width: 12),
                    Expanded(
                      child: _OptionCard(
                        isSelected: _selectedGender == '女孩',
                        onTap: () => setState(() => _selectedGender = '女孩'),
                        child: Column(
                          children: [
                            const Icon(
                              Icons.female,
                              size: 28,
                              color: Color(0xFFFF8787),
                            ),
                            const SizedBox(height: 6),
                            const Text(
                              '女孩',
                              style: TextStyle(
                                fontSize: 14,
                                fontWeight: FontWeight.w700,
                                color: AppColors.textDark,
                              ),
                            ),
                          ],
                        ),
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 24),

                // 是否绝育
                const Text(
                  '是否已绝育',
                  style: TextStyle(
                    fontSize: 14,
                    fontWeight: FontWeight.w700,
                    color: AppColors.textPrimary,
                  ),
                ),
                const SizedBox(height: 12),
                Row(
                  children: [
                    Expanded(
                      child: _OptionCard(
                        isSelected: _selectedNeutered == true,
                        onTap: () => setState(() => _selectedNeutered = true),
                        child: Column(
                          children: [
                            const Icon(
                              Icons.check_circle,
                              size: 28,
                              color: Color(0xFF51CF66),
                            ),
                            const SizedBox(height: 6),
                            const Text(
                              '已绝育',
                              style: TextStyle(
                                fontSize: 14,
                                fontWeight: FontWeight.w700,
                                color: AppColors.textDark,
                              ),
                            ),
                          ],
                        ),
                      ),
                    ),
                    const SizedBox(width: 12),
                    Expanded(
                      child: _OptionCard(
                        isSelected: _selectedNeutered == false,
                        onTap: () => setState(() => _selectedNeutered = false),
                        child: Column(
                          children: [
                            const Icon(
                              Icons.cancel,
                              size: 28,
                              color: Color(0xFFFF6B6B),
                            ),
                            const SizedBox(height: 6),
                            const Text(
                              '未绝育',
                              style: TextStyle(
                                fontSize: 14,
                                fontWeight: FontWeight.w700,
                                color: AppColors.textDark,
                              ),
                            ),
                          ],
                        ),
                      ),
                    ),
                  ],
                ),

                const Spacer(),

                PrimaryButton(
                  text: '下一步 →',
                  enabled: _canProceed,
                  onPressed: _canProceed
                      ? () {
                          context.read<AppProvider>().updatePendingPet(
                                gender: _selectedGender,
                                isNeutered: _selectedNeutered,
                              );
                          Navigator.of(context).pushNamed('/weight');
                        }
                      : null,
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

class _OptionCard extends StatelessWidget {
  final bool isSelected;
  final VoidCallback onTap;
  final Widget child;

  const _OptionCard({
    required this.isSelected,
    required this.onTap,
    required this.child,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: BoxDecoration(
        color: isSelected ? const Color(0xFFFFF1B3) : Colors.white,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(
          color: isSelected ? AppColors.primary : Colors.transparent,
          width: 2,
        ),
        boxShadow: const [
          BoxShadow(
            color: Color(0x1A000000),
            blurRadius: 3,
            offset: Offset(0, 1),
          ),
        ],
      ),
      child: Material(
        color: Colors.transparent,
        child: InkWell(
          borderRadius: BorderRadius.circular(16),
          onTap: onTap,
          child: Padding(
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 20),
            child: child,
          ),
        ),
      ),
    );
  }
}

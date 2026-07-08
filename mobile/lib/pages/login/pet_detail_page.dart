import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../theme/app_theme.dart';
import '../../services/app_provider.dart';
import '../../widgets/wheel_time_picker.dart';
import 'gender_page.dart';

class PetDetailPage extends StatefulWidget {
  final String petType;
  final String petName;
  const PetDetailPage({
    super.key,
    required this.petType,
    required this.petName,
  });

  @override
  State<PetDetailPage> createState() => _PetDetailPageState();
}

class _PetDetailPageState extends State<PetDetailPage> {
  final TextEditingController _breedController = TextEditingController();
  DateTime? _birthday;
  DateTime? _arrivalDate;

  bool get _canProceed =>
      _breedController.text.trim().isNotEmpty &&
      _birthday != null &&
      _arrivalDate != null;

  @override
  void dispose() {
    _breedController.dispose();
    super.dispose();
  }

  Future<void> _pickBirthday() async {
    final now = DateTime.now();
    final picked = await WheelDateTimePicker.showDatePicker(
      context: context,
      initialDate: _birthday ?? now,
      firstDate: DateTime(now.year - 30, 1, 1),
      lastDate: now,
    );
    if (picked != null) {
      setState(() => _birthday = picked);
    }
  }

  Future<void> _pickArrivalDate() async {
    final now = DateTime.now();
    final picked = await WheelDateTimePicker.showDatePicker(
      context: context,
      initialDate: _arrivalDate ?? now,
      firstDate: _birthday ?? DateTime(now.year - 30, 1, 1),
      lastDate: now,
    );
    if (picked != null) {
      setState(() => _arrivalDate = picked);
    }
  }

  String _formatDate(DateTime? date) {
    if (date == null) return '';
    return '${date.year}年${date.month}月${date.day}日';
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
                  children: [
                    GestureDetector(
                      onTap: () => Navigator.of(context).maybePop(),
                      child: Container(
                        width: 40,
                        height: 40,
                        decoration: BoxDecoration(
                          color: Colors.white,
                          borderRadius: BorderRadius.circular(12),
                          boxShadow: const [
                            BoxShadow(
                              color: Color(0x1A000000),
                              blurRadius: 4,
                              offset: Offset(0, 1),
                            ),
                          ],
                        ),
                        child: const Icon(
                          Icons.arrow_back_ios_new,
                          color: AppColors.textDark,
                          size: 18,
                        ),
                      ),
                    ),
                    const Spacer(),
                    const ProgressDots(total: 5, current: 3),
                    const Spacer(),
                    const SizedBox(width: 40),
                  ],
                ),
                const SizedBox(height: 16),
                const Text(
                  '详细信息',
                  style: TextStyle(
                    fontSize: 24,
                    fontWeight: FontWeight.w900,
                    color: AppColors.textPrimary,
                  ),
                ),
                const SizedBox(height: 4),
                Text(
                  '让我们更了解 ${widget.petName}',
                  style: const TextStyle(
                    fontSize: 14,
                    color: AppColors.textHint,
                  ),
                ),
                const SizedBox(height: 28),
                InputField(
                  label: '🏷️ 品种',
                  placeholder: widget.petType == '其他'
                      ? '请输入宠物品种，如：仓鼠、兔子...'
                      : widget.petType == '狗狗'
                          ? '如：金毛、柯基、柴犬...'
                          : '如：英短、布偶、暹罗...',
                  controller: _breedController,
                  onChanged: (_) => setState(() {}),
                ),
                const SizedBox(height: 12),
                _DatePickerField(
                  label: '🎂 宠物生日',
                  value: _formatDate(_birthday),
                  placeholder: '选择日期',
                  onTap: _pickBirthday,
                ),
                const SizedBox(height: 12),
                _DatePickerField(
                  label: '🏠 到家时间',
                  value: _formatDate(_arrivalDate),
                  placeholder: '选择日期',
                  onTap: _pickArrivalDate,
                ),
                const SizedBox(height: 28),
                PrimaryButton(
                  text: '下一步 →',
                  enabled: _canProceed,
                  onPressed: _canProceed
                      ? () {
                          final emoji = widget.petType == '狗狗'
                              ? '🐶'
                              : widget.petType == '猫咪'
                                  ? '🐱'
                                  : '🐾';
                          context.read<AppProvider>().startNewPet(
                                name: widget.petName,
                                type: widget.petType,
                                gender: '男孩',
                                meetDate: _arrivalDate!,
                                breed: _breedController.text.trim(),
                                birthday: _formatDate(_birthday),
                                emoji: emoji,
                              );
                          Navigator.of(context).push(
                            MaterialPageRoute(
                              builder: (_) => const GenderPage(),
                            ),
                          );
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

class _DatePickerField extends StatelessWidget {
  final String label;
  final String value;
  final String placeholder;
  final VoidCallback onTap;

  const _DatePickerField({
    required this.label,
    required this.value,
    required this.placeholder,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    final isEmpty = value.isEmpty;
    return GestureDetector(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(16),
          boxShadow: const [
            BoxShadow(
              color: Color(0x1A000000),
              blurRadius: 3,
              offset: Offset(0, 1),
            ),
          ],
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              label,
              style: const TextStyle(
                fontSize: 12,
                fontWeight: FontWeight.w700,
                color: AppColors.textFieldLabel,
              ),
            ),
            const SizedBox(height: 8),
            Row(
              children: [
                Expanded(
                  child: Text(
                    isEmpty ? placeholder : value,
                    style: isEmpty
                        ? const TextStyle(
                            fontSize: 16,
                            color: Color(0x801E2939),
                          )
                        : const TextStyle(
                            fontSize: 16,
                            color: Color(0xFF1E2939),
                            fontWeight: FontWeight.w500,
                          ),
                  ),
                ),
                const Icon(
                  Icons.keyboard_arrow_down,
                  color: AppColors.textMuted,
                  size: 22,
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }
}

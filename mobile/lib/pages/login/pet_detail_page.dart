import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../theme/app_theme.dart';
import '../../services/app_provider.dart';
import '../../widgets/wheel_time_picker.dart';

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
                    const ProgressDots(total: 7, current: 3),
                    const Spacer(),
                    const SizedBox(width: 40),
                  ],
                ),
                const SizedBox(height: 16),
                const Text(
                  '让我们更了解它',
                  style: TextStyle(
                    fontSize: 18,
                    fontWeight: FontWeight.w900,
                    color: Color(0xFF2D2621),
                  ),
                ),
                const SizedBox(height: 20),

                // Name input
                InputField(
                  label: '🏷️ 它的名字',
                  placeholder: '例如：旺财、咪咪、大白',
                  controller: TextEditingController(text: widget.petName),
                  onChanged: (_) {},
                ),
                const SizedBox(height: 12),

                // Breed input
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

                // Birthday picker
                _DatePickerField(
                  label: '🎂 宠物生日',
                  value: _formatDate(_birthday),
                  placeholder: '选择日期',
                  onTap: _pickBirthday,
                ),
                const SizedBox(height: 12),

                // Arrival date picker
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
                          Navigator.of(context).pushNamed('/gender');
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

/// Date picker field matching admin design — card with label, value and calendar icon
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
          border: Border.all(color: const Color(0xFFEADEC9)),
          boxShadow: const [
            BoxShadow(
              color: Color(0x0A000000),
              blurRadius: 4,
              offset: Offset(0, 2),
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
                color: Color(0xFF8C6239),
              ),
            ),
            const SizedBox(height: 6),
            Row(
              children: [
                Expanded(
                  child: Text(
                    isEmpty ? placeholder : value,
                    style: TextStyle(
                      fontSize: 15,
                      color: isEmpty
                          ? const Color(0xFFC0A080)
                          : const Color(0xFF2D2621),
                      fontWeight: isEmpty ? FontWeight.w400 : FontWeight.w600,
                    ),
                  ),
                ),
                const Icon(
                  Icons.calendar_today,
                  color: Color(0xFFC0A080),
                  size: 18,
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }
}

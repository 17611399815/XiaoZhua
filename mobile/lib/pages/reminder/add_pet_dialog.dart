import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../theme/app_theme.dart';
import '../../services/app_provider.dart';
import '../../models/pet.dart';
import '../../widgets/wheel_time_picker.dart';

class AddPetDialog extends StatefulWidget {
  const AddPetDialog({super.key});

  @override
  State<AddPetDialog> createState() => _AddPetDialogState();
}

class _AddPetDialogState extends State<AddPetDialog> {
  final TextEditingController _nameController = TextEditingController();
  final TextEditingController _breedController = TextEditingController();
  String _type = '猫咪';
  String _gender = '男孩';
  double _weight = 4.5;
  String _emoji = '🐱';
  DateTime? _meetDate;

  final List<Map<String, String>> _typeOptions = [
    {'label': '猫咪', 'emoji': '🐱'},
    {'label': '狗狗', 'emoji': '🐶'},
    {'label': '仓鼠', 'emoji': '🐹'},
    {'label': '兔子', 'emoji': '🐰'},
    {'label': '其他', 'emoji': '🐾'},
  ];

  @override
  void initState() {
    super.initState();
    _meetDate = DateTime.now();
  }

  @override
  void dispose() {
    _nameController.dispose();
    _breedController.dispose();
    super.dispose();
  }

  bool get _canSave => _nameController.text.trim().isNotEmpty;

  Future<void> _pickDate() async {
    final now = DateTime.now();
    final picked = await WheelDateTimePicker.showDatePicker(
      context: context,
      initialDate: _meetDate ?? now,
      firstDate: DateTime(now.year - 30),
      lastDate: now,
    );
    if (picked != null) {
      setState(() => _meetDate = picked);
    }
  }

  String _formatDate(DateTime? d) {
    if (d == null) return '选择日期';
    return '${d.year}年${d.month}月${d.day}日';
  }

  void _savePet() {
    if (!_canSave) return;
    final provider = context.read<AppProvider>();
    final pet = Pet(
      id: 'pet_${DateTime.now().millisecondsSinceEpoch}',
      name: _nameController.text.trim(),
      gender: _gender,
      type: _type,
      meetDate: _meetDate ?? DateTime.now(),
      breed: _breedController.text.trim(),
      emoji: _emoji,
      weight: _weight,
    );
    provider.addPet(pet);
    Navigator.of(context).pop();
  }

  @override
  Widget build(BuildContext context) {
    return Dialog(
      backgroundColor: Colors.white,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(24)),
      child: Container(
        padding: const EdgeInsets.all(20),
        child: SingleChildScrollView(
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Header
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  const Text(
                    '➕ 添加新宠物',
                    style: TextStyle(
                      fontSize: 18,
                      fontWeight: FontWeight.w900,
                      color: Color(0xFF8C6239),
                    ),
                  ),
                  GestureDetector(
                    onTap: () => Navigator.of(context).pop(),
                    child: Container(
                      width: 32,
                      height: 32,
                      decoration: BoxDecoration(
                        color: Colors.grey.shade100,
                        borderRadius: BorderRadius.circular(10),
                      ),
                      child: const Icon(Icons.close,
                          color: AppColors.textMuted, size: 18),
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 16),

              // ── Name ──
              _FieldLabel('🐾 宠物名字'),
              const SizedBox(height: 6),
              _StyledInput(
                controller: _nameController,
                placeholder: '给宝贝起个好听的名字',
                onChanged: (_) => setState(() {}),
              ),
              const SizedBox(height: 12),

              // ── Type ──
              _FieldLabel('🐕 种类'),
              const SizedBox(height: 6),
              Wrap(
                spacing: 8,
                runSpacing: 6,
                children: _typeOptions.map((opt) {
                  final selected = _type == opt['label'];
                  return GestureDetector(
                    onTap: () {
                      setState(() {
                        _type = opt['label']!;
                        _emoji = opt['emoji']!;
                      });
                    },
                    child: Container(
                      padding: const EdgeInsets.symmetric(
                          horizontal: 14, vertical: 8),
                      decoration: BoxDecoration(
                        color: selected
                            ? const Color(0xFFFFF4DE)
                            : Colors.grey.shade50,
                        borderRadius: BorderRadius.circular(12),
                        border: Border.all(
                          color: selected
                              ? const Color(0xFFFFB23F)
                              : const Color(0xFFFFE7D1),
                          width: selected ? 2 : 1,
                        ),
                      ),
                      child: Text(
                        '${opt['emoji']} ${opt['label']}',
                        style: TextStyle(
                          fontSize: 12,
                          fontWeight: FontWeight.w700,
                          color: selected
                              ? const Color(0xFFFF8A3D)
                              : const Color(0xFF8C6239),
                        ),
                      ),
                    ),
                  );
                }).toList(),
              ),
              const SizedBox(height: 12),

              // ── Breed ──
              _FieldLabel('🏷️ 品种'),
              const SizedBox(height: 6),
              _StyledInput(
                controller: _breedController,
                placeholder: '例如：英国短毛猫、金毛',
              ),
              const SizedBox(height: 12),

              // ── Gender ──
              _FieldLabel('⚤ 性别'),
              const SizedBox(height: 6),
              Row(
                children: [
                  Expanded(
                    child: _GenderChip('男孩', '♂',
                        const Color(0xFFE0F2FE), const Color(0xFF0284C7),
                        _gender == '男孩',
                        () => setState(() => _gender = '男孩')),
                  ),
                  const SizedBox(width: 10),
                  Expanded(
                    child: _GenderChip('女孩', '♀',
                        const Color(0xFFFCE7F3), const Color(0xFFDB2777),
                        _gender == '女孩',
                        () => setState(() => _gender = '女孩')),
                  ),
                ],
              ),
              const SizedBox(height: 12),

              // ── Weight ──
              _FieldLabel('⚖️ 体重 (kg)'),
              const SizedBox(height: 6),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 4),
                decoration: BoxDecoration(
                  color: const Color(0xFFFFFAF0),
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(color: const Color(0xFFFFE2C4)),
                ),
                child: Row(
                  children: [
                    GestureDetector(
                      onTap: () {
                        if (_weight > 1) {
                          setState(() => _weight = (_weight - 0.5)
                              .clamp(1.0, 50.0));
                        }
                      },
                      child: Container(
                        width: 32, height: 32,
                        decoration: BoxDecoration(
                          color: const Color(0xFFFFF4DE),
                          borderRadius: BorderRadius.circular(8),
                        ),
                        child: const Icon(Icons.remove,
                            size: 18, color: Color(0xFFFF8A3D)),
                      ),
                    ),
                    Expanded(
                      child: Text(
                        '${_weight.toStringAsFixed(1)} kg',
                        textAlign: TextAlign.center,
                        style: const TextStyle(
                          fontSize: 18,
                          fontWeight: FontWeight.w900,
                          color: Color(0xFFFF8A3D),
                        ),
                      ),
                    ),
                    GestureDetector(
                      onTap: () {
                        if (_weight < 50) {
                          setState(() => _weight = (_weight + 0.5)
                              .clamp(1.0, 50.0));
                        }
                      },
                      child: Container(
                        width: 32, height: 32,
                        decoration: BoxDecoration(
                          color: const Color(0xFFFFF4DE),
                          borderRadius: BorderRadius.circular(8),
                        ),
                        child: const Icon(Icons.add,
                            size: 18, color: const Color(0xFFFF8A3D)),
                      ),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 12),

              // ── Arrival Date ──
              _FieldLabel('📅 到家日期'),
              const SizedBox(height: 6),
              GestureDetector(
                onTap: _pickDate,
                child: Container(
                  padding:
                      const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
                  decoration: BoxDecoration(
                    color: const Color(0xFFFFFAF0),
                    borderRadius: BorderRadius.circular(12),
                    border: Border.all(color: const Color(0xFFFFE2C4)),
                  ),
                  child: Row(
                    children: [
                      Text(
                        _formatDate(_meetDate),
                        style: const TextStyle(
                          fontSize: 14,
                          fontWeight: FontWeight.w600,
                          color: Color(0xFF2D2621),
                        ),
                      ),
                      const Spacer(),
                      const Icon(Icons.calendar_today,
                          color: Color(0xFFC0A080), size: 18),
                    ],
                  ),
                ),
              ),
              const SizedBox(height: 20),

              // ── Buttons ──
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
                    child: PrimaryButton(
                      text: '完成建档',
                      enabled: _canSave,
                      onPressed: _canSave ? _savePet : null,
                    ),
                  ),
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }
}

// ── Helper Widgets ──

class _FieldLabel extends StatelessWidget {
  final String text;
  const _FieldLabel(this.text);

  @override
  Widget build(BuildContext context) {
    return Text(
      text,
      style: const TextStyle(
        fontSize: 11,
        fontWeight: FontWeight.w700,
        color: Color(0xFFA8621B),
      ),
    );
  }
}

class _StyledInput extends StatelessWidget {
  final TextEditingController controller;
  final String placeholder;
  final ValueChanged<String>? onChanged;

  const _StyledInput({
    required this.controller,
    required this.placeholder,
    this.onChanged,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 4),
      decoration: BoxDecoration(
        color: const Color(0xFFFFFAF0),
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: const Color(0xFFFFE2C4)),
      ),
      child: TextField(
        controller: controller,
        onChanged: onChanged,
        style: const TextStyle(
          fontSize: 14,
          fontWeight: FontWeight.w500,
          color: Color(0xFF2D2621),
        ),
        decoration: InputDecoration(
          border: InputBorder.none,
          hintText: placeholder,
          hintStyle: const TextStyle(
            fontSize: 13,
            color: Color(0xFFC0A080),
          ),
        ),
      ),
    );
  }
}

class _GenderChip extends StatelessWidget {
  final String label;
  final String symbol;
  final Color bg;
  final Color fg;
  final bool selected;
  final VoidCallback onTap;

  const _GenderChip(
      this.label, this.symbol, this.bg, this.fg, this.selected, this.onTap);

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.symmetric(vertical: 10),
        decoration: BoxDecoration(
          color: selected ? bg : Colors.grey.shade50,
          borderRadius: BorderRadius.circular(12),
          border: Border.all(
            color: selected ? fg : const Color(0xFFFFE7D1),
            width: selected ? 2 : 1,
          ),
        ),
        alignment: Alignment.center,
        child: Text(
          '$symbol $label',
          style: TextStyle(
            fontSize: 13,
            fontWeight: FontWeight.w800,
            color: selected ? fg : const Color(0xFF8C6239),
          ),
        ),
      ),
    );
  }
}

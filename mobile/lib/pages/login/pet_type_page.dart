import 'package:flutter/material.dart';
import '../../theme/app_theme.dart';

class PetTypePage extends StatefulWidget {
  const PetTypePage({super.key});

  @override
  State<PetTypePage> createState() => _PetTypePageState();
}

class _PetTypePageState extends State<PetTypePage> {
  final List<Map<String, String>> _petTypes = const [
    {'emoji': '🐕', 'label': '狗狗'},
    {'emoji': '🐱', 'label': '猫咪'},
    {'emoji': '🐾', 'label': '其他'},
  ];

  int _selectedType = 0;
  final TextEditingController _nameController = TextEditingController();

  bool get _canProceed => _nameController.text.trim().isNotEmpty;

  @override
  void dispose() {
    _nameController.dispose();
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
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const SizedBox(height: 16),
                Row(
                  children: const [
                    BackCircleButton(),
                    Spacer(),
                    ProgressDots(total: 5, current: 2),
                    Spacer(),
                  ],
                ),
                const SizedBox(height: 16),
                const Text(
                  '你的毛孩子是？',
                  style: AppTextStyles.titleLarge,
                ),
                const SizedBox(height: 4),
                const Text(
                  '选择类型，开始建立专属档案',
                  style: AppTextStyles.subtitle,
                ),
                const SizedBox(height: 28),
                Row(
                  children: List.generate(_petTypes.length, (index) {
                    final isSelected = _selectedType == index;
                    final isLast = index == _petTypes.length - 1;
                    return Expanded(
                      child: Padding(
                        padding: EdgeInsets.only(right: isLast ? 0 : 8),
                        child: GestureDetector(
                          onTap: () => setState(() => _selectedType = index),
                          child: AnimatedContainer(
                            duration: const Duration(milliseconds: 200),
                            padding: const EdgeInsets.symmetric(vertical: 24),
                            decoration: BoxDecoration(
                              color: Colors.white,
                              borderRadius: BorderRadius.circular(24),
                              border: Border.all(
                                color: isSelected
                                    ? AppColors.primary
                                    : Colors.transparent,
                                width: 2,
                              ),
                              boxShadow: const [
                                BoxShadow(
                                  color: Color(0x1A000000),
                                  blurRadius: 3,
                                  offset: Offset(0, 1),
                                ),
                                BoxShadow(
                                  color: Color(0x0D000000),
                                  blurRadius: 2,
                                  offset: Offset(0, 1),
                                ),
                              ],
                            ),
                            child: Column(
                              mainAxisSize: MainAxisSize.min,
                              children: [
                                Text(
                                  _petTypes[index]['emoji']!,
                                  style: const TextStyle(fontSize: 36),
                                ),
                                const SizedBox(height: 10),
                                Text(
                                  _petTypes[index]['label']!,
                                  style: AppTextStyles.petTypeLabel,
                                ),
                              ],
                            ),
                          ),
                        ),
                      ),
                    );
                  }),
                ),
                const SizedBox(height: 28),
                InputField(
                  label: '宠物名字',
                  placeholder: '给你的毛孩子起个名字 ✨',
                  controller: _nameController,
                  onChanged: (_) => setState(() {}),
                ),
                const SizedBox(height: 28),
                PrimaryButton(
                  text: '下一步 →',
                  enabled: _canProceed,
                  onPressed: _canProceed
                      ? () {
                          Navigator.of(context).pushNamed(
                            '/pet-detail',
                            arguments: {
                              'type': _petTypes[_selectedType]['label']!,
                              'name': _nameController.text.trim(),
                            },
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

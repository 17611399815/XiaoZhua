import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../theme/app_theme.dart';
import '../../services/app_provider.dart';

class PetEditPage extends StatefulWidget {
  const PetEditPage({super.key});

  @override
  State<PetEditPage> createState() => _PetEditPageState();
}

class _PetEditPageState extends State<PetEditPage> {
  late TextEditingController _nameController;
  late TextEditingController _breedController;
  String _type = '';
  String _gender = '';
  double _weight = 0;
  String _birthday = '';
  String _emoji = '';

  final List<String> _petTypes = ['猫咪', '狗狗', '兔兔', '其他'];
  final List<String> _genders = ['男孩', '女孩'];
  final List<String> _emojis = ['🐶', '🐱', '🐰', '🐹', '🐻', '🐼', '🐨', '🐯', '🦊', '🐮', '🐷', '🐸'];

  @override
  void initState() {
    super.initState();
    final pet = context.read<AppProvider>().currentPet;
    _nameController = TextEditingController(text: pet?.name ?? '');
    _breedController = TextEditingController(text: pet?.breed ?? '');
    _type = pet?.type ?? '';
    _gender = pet?.gender ?? '';
    _weight = pet?.weight ?? 0;
    _birthday = pet?.birthday ?? '';
    _emoji = pet?.emoji ?? '🐶';
  }

  @override
  void dispose() {
    _nameController.dispose();
    _breedController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.backgroundLight,
      appBar: AppBar(
        leading: const BackCircleButton(),
        title: const Text(
          '编辑宠物信息',
          style: TextStyle(fontSize: 18, fontWeight: FontWeight.w900, color: AppColors.primaryDark),
        ),
        centerTitle: true,
        backgroundColor: Colors.transparent,
        elevation: 0,
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          children: [
            // Avatar / emoji picker
            GestureDetector(
              onTap: () => _showEmojiPicker(context),
              child: Container(
                width: 100,
                height: 100,
                decoration: BoxDecoration(
                  color: AppColors.primaryLight,
                  borderRadius: BorderRadius.circular(28),
                  border: Border.all(color: AppColors.primary, width: 3),
                ),
                alignment: Alignment.center,
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Text(_emoji, style: const TextStyle(fontSize: 42)),
                    const SizedBox(height: 4),
                    const Text('点击更换', style: TextStyle(fontSize: 10, color: AppColors.textMuted, fontWeight: FontWeight.w600)),
                  ],
                ),
              ),
            ),
            const SizedBox(height: 24),

            // Name field
            InputField(
              label: '宠物名称',
              placeholder: '给毛孩子取个名字',
              controller: _nameController,
            ),
            const SizedBox(height: 14),

            // Breed field
            InputField(
              label: '品种',
              placeholder: '例如：金毛、英短',
              controller: _breedController,
            ),
            const SizedBox(height: 14),

            // Type picker
            PickerField(
              label: '宠物类型',
              value: _type,
              placeholder: '选择宠物类型',
              onTap: () => _showPicker(context, '宠物类型', _petTypes, _type, (v) => setState(() => _type = v)),
            ),
            const SizedBox(height: 14),

            // Gender picker
            PickerField(
              label: '性别',
              value: _gender,
              placeholder: '选择性别',
              onTap: () => _showPicker(context, '性别', _genders, _gender, (v) => setState(() => _gender = v)),
            ),
            const SizedBox(height: 14),

            // Weight picker
            GestureDetector(
              onTap: () => _showWeightPicker(context),
              child: AppCard(
                padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                child: Row(
                  children: [
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          const Text('体重', style: AppTextStyles.fieldLabel),
                          const SizedBox(height: 8),
                          Text(
                            _weight > 0 ? '${_weight.toStringAsFixed(1)} kg' : '设置体重',
                            style: _weight > 0 ? AppTextStyles.fieldValue : AppTextStyles.fieldPlaceholder,
                          ),
                        ],
                      ),
                    ),
                    const Icon(Icons.keyboard_arrow_down, color: AppColors.textMuted, size: 22),
                  ],
                ),
              ),
            ),
            const SizedBox(height: 14),

            // Birthday picker
            GestureDetector(
              onTap: () => _showDatePicker(context),
              child: AppCard(
                padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                child: Row(
                  children: [
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          const Text('生日', style: AppTextStyles.fieldLabel),
                          const SizedBox(height: 8),
                          Text(
                            _birthday.isNotEmpty ? _birthday : '设置生日',
                            style: _birthday.isNotEmpty ? AppTextStyles.fieldValue : AppTextStyles.fieldPlaceholder,
                          ),
                        ],
                      ),
                    ),
                    const Icon(Icons.keyboard_arrow_down, color: AppColors.textMuted, size: 22),
                  ],
                ),
              ),
            ),
            const SizedBox(height: 32),

            // Save button
            PrimaryButton(
              text: '保存修改',
              onPressed: () => _saveChanges(context),
            ),
            const SizedBox(height: 40),
          ],
        ),
      ),
    );
  }

  void _showPicker(BuildContext context, String title, List<String> items, String current, ValueChanged<String> onSelected) {
    showModalBottomSheet(
      context: context,
      shape: const RoundedRectangleBorder(borderRadius: BorderRadius.vertical(top: Radius.circular(24))),
      builder: (ctx) => Container(
        padding: const EdgeInsets.all(20),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Center(
              child: Container(
                width: 40, height: 4,
                decoration: BoxDecoration(color: Colors.grey.shade300, borderRadius: BorderRadius.circular(2)),
              ),
            ),
            const SizedBox(height: 16),
            Text(title, style: const TextStyle(fontSize: 18, fontWeight: FontWeight.w900, color: AppColors.textDark)),
            const SizedBox(height: 16),
            ...items.map((item) => ListTile(
              title: Text(item, style: TextStyle(fontSize: 16, fontWeight: FontWeight.w700, color: item == current ? AppColors.primaryDark : AppColors.textDark)),
              trailing: item == current ? const Icon(Icons.check, color: AppColors.primary, size: 22) : null,
              onTap: () {
                onSelected(item);
                Navigator.of(ctx).pop();
              },
            )),
            const SizedBox(height: 12),
          ],
        ),
      ),
    );
  }

  void _showWeightPicker(BuildContext context) {
    double tempWeight = _weight > 0 ? _weight : 10.0;
    showModalBottomSheet(
      context: context,
      shape: const RoundedRectangleBorder(borderRadius: BorderRadius.vertical(top: Radius.circular(24))),
      builder: (ctx) => StatefulBuilder(
        builder: (context, setModalState) => Container(
          padding: const EdgeInsets.all(20),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Center(
                child: Container(
                  width: 40, height: 4,
                  decoration: BoxDecoration(color: Colors.grey.shade300, borderRadius: BorderRadius.circular(2)),
                ),
              ),
              const SizedBox(height: 16),
              const Text('体重', style: TextStyle(fontSize: 18, fontWeight: FontWeight.w900, color: AppColors.textDark)),
              const SizedBox(height: 8),
              Text('${tempWeight.toStringAsFixed(1)} kg', style: const TextStyle(fontSize: 28, fontWeight: FontWeight.w900, color: AppColors.primaryDark)),
              const SizedBox(height: 12),
              Slider(
                value: tempWeight,
                min: 0.1,
                max: 80,
                divisions: 799,
                activeColor: AppColors.primary,
                onChanged: (v) => setModalState(() => tempWeight = v),
              ),
              const SizedBox(height: 12),
              PrimaryButton(
                text: '确定',
                onPressed: () {
                  setState(() => _weight = tempWeight);
                  Navigator.of(ctx).pop();
                },
              ),
              const SizedBox(height: 12),
            ],
          ),
        ),
      ),
    );
  }

  void _showEmojiPicker(BuildContext context) {
    showModalBottomSheet(
      context: context,
      shape: const RoundedRectangleBorder(borderRadius: BorderRadius.vertical(top: Radius.circular(24))),
      builder: (ctx) => Container(
        padding: const EdgeInsets.all(20),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Center(
              child: Container(
                width: 40, height: 4,
                decoration: BoxDecoration(color: Colors.grey.shade300, borderRadius: BorderRadius.circular(2)),
              ),
            ),
            const SizedBox(height: 16),
            const Text('选择头像', style: TextStyle(fontSize: 18, fontWeight: FontWeight.w900, color: AppColors.textDark)),
            const SizedBox(height: 16),
            Wrap(
              spacing: 12,
              runSpacing: 12,
              children: _emojis.map((emoji) => GestureDetector(
                onTap: () {
                  setState(() => _emoji = emoji);
                  Navigator.of(ctx).pop();
                },
                child: Container(
                  width: 56,
                  height: 56,
                  decoration: BoxDecoration(
                    color: _emoji == emoji ? AppColors.primaryLight : Colors.grey.shade50,
                    borderRadius: BorderRadius.circular(16),
                    border: Border.all(
                      color: _emoji == emoji ? AppColors.primary : Colors.transparent,
                      width: 2,
                    ),
                  ),
                  alignment: Alignment.center,
                  child: Text(emoji, style: const TextStyle(fontSize: 30)),
                ),
              )).toList(),
            ),
            const SizedBox(height: 20),
          ],
        ),
      ),
    );
  }

  void _showDatePicker(BuildContext context) {
    showModalBottomSheet(
      context: context,
      shape: const RoundedRectangleBorder(borderRadius: BorderRadius.vertical(top: Radius.circular(24))),
      builder: (ctx) {
        final now = DateTime.now();
        final years = List.generate(30, (i) => '${now.year - i}年');
        final currentYear = _birthday.isNotEmpty ? _birthday.split('年')[0] : '${now.year - 2}';
        final months = List.generate(12, (i) => '${i + 1}月');
        final currentMonth = _birthday.isNotEmpty ? _birthday.split('年')[1].split('月')[0] : '1';
        final days = List.generate(31, (i) => '${i + 1}日');
        final currentDay = _birthday.isNotEmpty ? _birthday.split('月')[1].split('日')[0] : '1';

        String selectedYear = '$currentYear年';
        String selectedMonth = '$currentMonth月';
        String selectedDay = '$currentDay日';

        return StatefulBuilder(
          builder: (context, setModalState) => Container(
            padding: const EdgeInsets.all(20),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                Center(
                  child: Container(
                    width: 40, height: 4,
                    decoration: BoxDecoration(color: Colors.grey.shade300, borderRadius: BorderRadius.circular(2)),
                  ),
                ),
                const SizedBox(height: 16),
                const Text('选择生日', style: TextStyle(fontSize: 18, fontWeight: FontWeight.w900, color: AppColors.textDark)),
                const SizedBox(height: 16),
                Row(
                  children: [
                    Expanded(child: _buildWheelList(years, selectedYear, (v) => setModalState(() => selectedYear = v))),
                    Expanded(child: _buildWheelList(months, selectedMonth, (v) => setModalState(() => selectedMonth = v))),
                    Expanded(child: _buildWheelList(days, selectedDay, (v) => setModalState(() => selectedDay = v))),
                  ],
                ),
                const SizedBox(height: 12),
                PrimaryButton(
                  text: '确定',
                  onPressed: () {
                    setState(() => _birthday = '$selectedYear$selectedMonth$selectedDay');
                    Navigator.of(ctx).pop();
                  },
                ),
                const SizedBox(height: 12),
              ],
            ),
          ),
        );
      },
    );
  }

  Widget _buildWheelList(List<String> items, String currentValue, ValueChanged<String> onChanged) {
    final controller = ScrollController();
    final itemH = 40.0;
    final idx = items.indexOf(currentValue);

    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (idx >= 0) {
        controller.jumpTo(idx * itemH);
      }
    });

    return SizedBox(
      height: itemH * 5,
      child: ListView.builder(
        controller: controller,
        itemCount: items.length,
        itemExtent: itemH,
        itemBuilder: (context, index) {
          final isSelected = items[index] == currentValue;
          return GestureDetector(
            onTap: () => onChanged(items[index]),
            child: Container(
              alignment: Alignment.center,
              decoration: BoxDecoration(
                color: isSelected ? AppColors.primaryLight.withValues(alpha: 0.5) : Colors.transparent,
                borderRadius: BorderRadius.circular(10),
              ),
              child: Text(
                items[index],
                style: TextStyle(
                  fontSize: 15,
                  fontWeight: isSelected ? FontWeight.w900 : FontWeight.w600,
                  color: isSelected ? AppColors.primaryDark : AppColors.textMuted,
                ),
              ),
            ),
          );
        },
      ),
    );
  }

  void _saveChanges(BuildContext context) {
    final provider = context.read<AppProvider>();
    final currentPet = provider.currentPet;

    if (currentPet == null) return;

    final updatedPet = currentPet.copyWith(
      name: _nameController.text.trim().isNotEmpty ? _nameController.text.trim() : null,
      breed: _breedController.text.trim(),
      type: _type.isNotEmpty ? _type : null,
      gender: _gender.isNotEmpty ? _gender : null,
      weight: _weight > 0 ? _weight : null,
      birthday: _birthday.isNotEmpty ? _birthday : null,
      emoji: _emoji,
    );

    // Update pet in provider
    provider.updatePet(updatedPet);

    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: const Text('宠物信息已更新 ✨'),
        backgroundColor: AppColors.teal,
        behavior: SnackBarBehavior.floating,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
      ),
    );
    Navigator.of(context).pop();
  }
}

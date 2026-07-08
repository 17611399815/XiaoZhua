import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../theme/app_theme.dart';
import '../../services/app_provider.dart';
import '../../models/recipe.dart';
import '../../widgets/wheel_time_picker.dart';

class RecipePage extends StatefulWidget {
  const RecipePage({super.key});

  @override
  State<RecipePage> createState() => _RecipePageState();
}

class _RecipePageState extends State<RecipePage> {
  @override
  Widget build(BuildContext context) {
    final provider = context.watch<AppProvider>();
    final recipes = provider.currentPetRecipes;
    final sorted = List<RecipeEntry>.from(recipes);
    sorted.sort((a, b) => b.time.compareTo(a.time));

    return Scaffold(
      backgroundColor: AppColors.backgroundLight,
      appBar: AppBar(
        title: const Text(
          '宠物食谱',
          style: TextStyle(fontSize: 18, fontWeight: FontWeight.w900, color: AppColors.primaryDark),
        ),
        centerTitle: true,
        backgroundColor: Colors.transparent,
        elevation: 0,
        leading: GestureDetector(
          onTap: () => Navigator.of(context).maybePop(),
          child: Container(
            margin: const EdgeInsets.all(8),
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(12),
              boxShadow: const [
                BoxShadow(color: Color(0x1A000000), blurRadius: 4, offset: Offset(0, 1)),
              ],
            ),
            child: const Icon(Icons.arrow_back_ios_new, color: AppColors.textDark, size: 16),
          ),
        ),
      ),
      body: sorted.isEmpty
          ? _buildEmptyState()
          : ListView.separated(
              padding: const EdgeInsets.all(16),
              itemCount: sorted.length,
              separatorBuilder: (_, __) => const SizedBox(height: 10),
              itemBuilder: (context, index) => _buildRecipeItem(sorted[index]),
            ),
      floatingActionButton: GestureDetector(
        onTap: () {
          showDialog(context: context, builder: (_) => const AddRecipeDialog());
        },
        child: Container(
          width: 56, height: 56,
          decoration: BoxDecoration(
            color: AppColors.primary,
            borderRadius: BorderRadius.circular(16),
            boxShadow: const [
              BoxShadow(color: Color(0x40FFB900), blurRadius: 12, offset: Offset(0, 4)),
            ],
          ),
          child: const Icon(Icons.add, color: Colors.white, size: 28),
        ),
      ),
    );
  }

  Widget _buildEmptyState() {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Container(
            width: 80, height: 80,
            decoration: BoxDecoration(color: AppColors.primaryLight, borderRadius: BorderRadius.circular(24)),
            child: const Icon(Icons.restaurant_menu, size: 40, color: AppColors.primaryDark),
          ),
          const SizedBox(height: 16),
          const Text('还没有食谱记录', style: TextStyle(fontSize: 16, fontWeight: FontWeight.w700, color: AppColors.textDark)),
          const SizedBox(height: 4),
          const Text('记录毛孩子的饮食日常～', style: TextStyle(fontSize: 13, color: AppColors.textMuted)),
        ],
      ),
    );
  }

  Widget _buildRecipeItem(RecipeEntry recipe) {
    return Container(
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        boxShadow: const [
          BoxShadow(color: Color(0x1A000000), blurRadius: 4, offset: Offset(0, 1)),
        ],
      ),
      child: Row(
        children: [
          Container(
            width: 44, height: 44,
            decoration: BoxDecoration(color: const Color(0xFFFFF0CC), borderRadius: BorderRadius.circular(12)),
            alignment: Alignment.center,
            child: const Text('🍽️', style: TextStyle(fontSize: 22)),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(recipe.food, style: const TextStyle(fontSize: 15, fontWeight: FontWeight.w700, color: AppColors.textDark)),
                const SizedBox(height: 4),
                Row(
                  children: [
                    _buildTag(recipe.amount, const Color(0xFFFFF0CC), const Color(0xFFE67700)),
                    const SizedBox(width: 8),
                    _buildTag(recipe.frequency, const Color(0xFFE8F3FF), const Color(0xFF4DABF7)),
                  ],
                ),
              ],
            ),
          ),
          Text(
            recipe.formattedTime,
            style: const TextStyle(fontSize: 11, color: AppColors.textMuted),
          ),
        ],
      ),
    );
  }

  Widget _buildTag(String text, Color bgColor, Color textColor) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
      decoration: BoxDecoration(color: bgColor, borderRadius: BorderRadius.circular(8)),
      child: Text(text, style: TextStyle(fontSize: 11, fontWeight: FontWeight.w600, color: textColor)),
    );
  }
}

class AddRecipeDialog extends StatefulWidget {
  const AddRecipeDialog({super.key});

  @override
  State<AddRecipeDialog> createState() => _AddRecipeDialogState();
}

class _AddRecipeDialogState extends State<AddRecipeDialog> {
  final TextEditingController _foodController = TextEditingController();
  final TextEditingController _amountController = TextEditingController();
  final TextEditingController _freqController = TextEditingController();
  DateTime _time = DateTime.now();

  bool get _canSave => _foodController.text.trim().isNotEmpty;

  @override
  void dispose() {
    _foodController.dispose();
    _amountController.dispose();
    _freqController.dispose();
    super.dispose();
  }

  Future<void> _pickTime() async {
    final result = await WheelDateTimePicker.showDateTimePicker(
      context: context, initialDate: _time,
    );
    if (result != null) {
      setState(() {
        _time = result['date'] as DateTime;
        final time = result['time'] as TimeOfDay;
        _time = DateTime(_time.year, _time.month, _time.day, time.hour, time.minute);
      });
    }
  }

  void _save() {
    if (!_canSave) return;
    final provider = context.read<AppProvider>();
    final pet = provider.currentPet;
    if (pet == null) return;

    provider.addRecipe(RecipeEntry(
      id: 'rec_${DateTime.now().millisecondsSinceEpoch}',
      petId: pet.id,
      food: _foodController.text.trim(),
      time: _time,
      amount: _amountController.text.trim().isEmpty ? '适量' : _amountController.text.trim(),
      frequency: _freqController.text.trim().isEmpty ? '不定期' : _freqController.text.trim(),
    ));
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
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  const Text('记录饮食', style: TextStyle(fontSize: 20, fontWeight: FontWeight.w800, color: AppColors.textDark)),
                  GestureDetector(
                    onTap: () => Navigator.of(context).pop(),
                    child: Container(
                      width: 32, height: 32,
                      decoration: BoxDecoration(color: Colors.grey.shade100, borderRadius: BorderRadius.circular(10)),
                      child: const Icon(Icons.close, color: AppColors.textMuted, size: 18),
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 16),
              _buildField('食物内容', '如：鸡胸肉 + 南瓜...', _foodController, onChanged: (_) => setState(() {})),
              const SizedBox(height: 12),
              _buildField('分量', '如：200g', _amountController),
              const SizedBox(height: 12),
              _buildField('频率', '如：每日一次 / 每周三次', _freqController),
              const SizedBox(height: 16),
              GestureDetector(
                onTap: _pickTime,
                child: Container(
                  padding: const EdgeInsets.all(12),
                  decoration: BoxDecoration(color: AppColors.backgroundLight, borderRadius: BorderRadius.circular(14)),
                  child: Row(
                    children: [
                      const Icon(Icons.access_time, size: 14, color: AppColors.textMuted),
                      const SizedBox(width: 4),
                      const Text('时间', style: TextStyle(fontSize: 11, color: AppColors.textMuted)),
                      const Spacer(),
                      Text(
                        '${_time.year}年${_time.month}月${_time.day}日 ${_time.hour.toString().padLeft(2, '0')}:${_time.minute.toString().padLeft(2, '0')}',
                        style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w700, color: AppColors.textDark),
                      ),
                      const SizedBox(width: 4),
                      const Icon(Icons.chevron_right, color: AppColors.textMuted, size: 18),
                    ],
                  ),
                ),
              ),
              const SizedBox(height: 20),
              Row(
                children: [
                  Expanded(
                    child: TextButton(
                      onPressed: () => Navigator.of(context).pop(),
                      child: const Text('取消', style: TextStyle(fontSize: 16, fontWeight: FontWeight.w700, color: AppColors.textMuted)),
                    ),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: PrimaryButton(text: '保存', enabled: _canSave, onPressed: _save),
                  ),
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildField(String label, String hint, TextEditingController controller, {ValueChanged<String>? onChanged}) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(label, style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w700, color: AppColors.textDark)),
        const SizedBox(height: 8),
        Container(
          padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 4),
          decoration: BoxDecoration(color: AppColors.backgroundLight, borderRadius: BorderRadius.circular(14)),
          child: TextField(
            controller: controller,
            style: const TextStyle(fontSize: 15, color: AppColors.textDark),
            decoration: InputDecoration(
              border: InputBorder.none,
              hintText: hint,
              hintStyle: const TextStyle(fontSize: 14, color: AppColors.textMuted),
            ),
            onChanged: onChanged,
          ),
        ),
      ],
    );
  }
}

import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../theme/app_theme.dart';
import '../../services/app_provider.dart';
import '../../models/stock_item.dart';

class StockPage extends StatefulWidget {
  const StockPage({super.key});

  @override
  State<StockPage> createState() => _StockPageState();
}

class _StockPageState extends State<StockPage> {
  @override
  Widget build(BuildContext context) {
    final provider = context.watch<AppProvider>();
    final items = provider.currentPetStockItems;
    final lowStockItems = items.where((s) => s.isLow).toList();

    return Scaffold(
      backgroundColor: AppColors.backgroundLight,
      appBar: AppBar(
        title: const Text(
          '囤货管理',
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
      body: Column(
        children: [
          // Low stock alert
          if (lowStockItems.isNotEmpty) _buildLowStockAlert(lowStockItems),
          // Items grouped by category
          Expanded(
            child: items.isEmpty
                ? _buildEmptyState()
                : _buildItemList(items),
          ),
        ],
      ),
      floatingActionButton: GestureDetector(
        onTap: () {
          showDialog(context: context, builder: (_) => const AddStockDialog());
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

  Widget _buildLowStockAlert(List<StockItem> items) {
    return Container(
      margin: const EdgeInsets.fromLTRB(16, 8, 16, 8),
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: const Color(0xFFFFF3E0),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: const Color(0xFFFF9A3C), width: 1),
      ),
      child: Row(
        children: [
          const Text('⚠️', style: TextStyle(fontSize: 20)),
          const SizedBox(width: 8),
          Expanded(
            child: Text(
              '有 ${items.length} 件物品库存不足，请及时补货',
              style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w600, color: AppColors.textDark),
            ),
          ),
          const Icon(Icons.chevron_right, color: AppColors.textMuted, size: 18),
        ],
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
            decoration: BoxDecoration(color: const Color(0xFFFFF4E6), borderRadius: BorderRadius.circular(24)),
            child: const Icon(Icons.inventory_2_outlined, size: 40, color: Color(0xFFF08C00)),
          ),
          const SizedBox(height: 16),
          const Text('还没有库存记录', style: TextStyle(fontSize: 16, fontWeight: FontWeight.w700, color: AppColors.textDark)),
          const SizedBox(height: 4),
          const Text('管理TA的日常用品～', style: TextStyle(fontSize: 13, color: AppColors.textMuted)),
        ],
      ),
    );
  }

  Widget _buildItemList(List<StockItem> items) {
    // Group by category
    final grouped = <String, List<StockItem>>{};
    for (final item in items) {
      grouped.putIfAbsent(item.category, () => []).add(item);
    }

    final categories = StockCategory.all.where((c) => grouped.containsKey(c)).toList();

    return ListView(
      padding: const EdgeInsets.symmetric(horizontal: 16),
      children: categories.map((cat) {
        final catItems = grouped[cat]!;
        return Padding(
          padding: const EdgeInsets.only(bottom: 16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Padding(
                padding: const EdgeInsets.only(bottom: 8),
                child: Row(
                  children: [
                    Text(StockCategory.getEmoji(cat), style: const TextStyle(fontSize: 18)),
                    const SizedBox(width: 6),
                    Text(cat, style: const TextStyle(fontSize: 16, fontWeight: FontWeight.w800, color: AppColors.textDark)),
                  ],
                ),
              ),
              ...catItems.map((item) {
                final pct = item.percentage;
                final isLow = item.isLow;
                return Container(
                  margin: const EdgeInsets.only(bottom: 8),
                  padding: const EdgeInsets.all(14),
                  decoration: BoxDecoration(
                    color: Colors.white,
                    borderRadius: BorderRadius.circular(16),
                    boxShadow: const [
                      BoxShadow(color: Color(0x1A000000), blurRadius: 4, offset: Offset(0, 1)),
                    ],
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        children: [
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(item.name, style: const TextStyle(fontSize: 15, fontWeight: FontWeight.w700, color: AppColors.textDark)),
                                const SizedBox(height: 2),
                                Text(item.brand, style: const TextStyle(fontSize: 12, color: AppColors.textMuted)),
                              ],
                            ),
                          ),
                          Text(
                            item.stockLabel,
                            style: TextStyle(
                              fontSize: 13,
                              fontWeight: FontWeight.w700,
                              color: isLow ? const Color(0xFFFF6B6B) : AppColors.textDark,
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 10),
                      // Progress bar
                      ClipRRect(
                        borderRadius: BorderRadius.circular(4),
                        child: LinearProgressIndicator(
                          value: pct,
                          minHeight: 6,
                          backgroundColor: Colors.grey.shade100,
                          valueColor: AlwaysStoppedAnimation<Color>(
                            isLow ? const Color(0xFFFF6B6B) : const Color(0xFF40C057),
                          ),
                        ),
                      ),
                      const SizedBox(height: 8),
                      Row(
                        mainAxisAlignment: MainAxisAlignment.end,
                        children: [
                          GestureDetector(
                            onTap: () {
                              context.read<AppProvider>().decrementStock(item.id);
                            },
                            child: Container(
                              padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                              decoration: BoxDecoration(
                                color: AppColors.primaryLight,
                                borderRadius: BorderRadius.circular(10),
                              ),
                              child: const Text('-1', style: TextStyle(fontSize: 13, fontWeight: FontWeight.w700, color: AppColors.primaryDark)),
                            ),
                          ),
                        ],
                      ),
                    ],
                  ),
                );
              }),
            ],
          ),
        );
      }).toList(),
    );
  }
}

class AddStockDialog extends StatefulWidget {
  const AddStockDialog({super.key});

  @override
  State<AddStockDialog> createState() => _AddStockDialogState();
}

class _AddStockDialogState extends State<AddStockDialog> {
  String _category = StockCategory.food;
  final TextEditingController _nameController = TextEditingController();
  final TextEditingController _brandController = TextEditingController();
  final TextEditingController _totalController = TextEditingController();
  final TextEditingController _unitController = TextEditingController();

  bool get _canSave => _nameController.text.trim().isNotEmpty &&
      _totalController.text.trim().isNotEmpty &&
      int.tryParse(_totalController.text.trim()) != null;

  @override
  void dispose() {
    _nameController.dispose();
    _brandController.dispose();
    _totalController.dispose();
    _unitController.dispose();
    super.dispose();
  }

  void _save() {
    if (!_canSave) return;
    final provider = context.read<AppProvider>();
    final pet = provider.currentPet;
    if (pet == null) return;

    final total = int.parse(_totalController.text.trim());
    provider.addStockItem(StockItem(
      id: 'stock_${DateTime.now().millisecondsSinceEpoch}',
      petId: pet.id,
      name: _nameController.text.trim(),
      brand: _brandController.text.trim().isEmpty ? '通用' : _brandController.text.trim(),
      category: _category,
      remaining: total,
      total: total,
      unit: _unitController.text.trim().isEmpty ? '个' : _unitController.text.trim(),
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
                  const Text('新增物品', style: TextStyle(fontSize: 20, fontWeight: FontWeight.w800, color: AppColors.textDark)),
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
              const Text('选择分类', style: TextStyle(fontSize: 14, fontWeight: FontWeight.w700, color: AppColors.textDark)),
              const SizedBox(height: 10),
              GridView.builder(
                shrinkWrap: true,
                physics: const NeverScrollableScrollPhysics(),
                gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                  crossAxisCount: 4, mainAxisSpacing: 8, crossAxisSpacing: 8, childAspectRatio: 1.2,
                ),
                itemCount: StockCategory.all.length,
                itemBuilder: (context, index) {
                  final cat = StockCategory.all[index];
                  final selected = _category == cat;
                  return GestureDetector(
                    onTap: () => setState(() => _category = cat),
                    child: Container(
                      decoration: BoxDecoration(
                        color: selected ? AppColors.primaryLight : Colors.white,
                        borderRadius: BorderRadius.circular(14),
                        border: Border.all(color: selected ? AppColors.primary : Colors.grey.shade200, width: selected ? 2 : 1),
                      ),
                      child: Column(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          Text(StockCategory.getEmoji(cat), style: const TextStyle(fontSize: 22)),
                          const SizedBox(height: 4),
                          Text(cat, style: TextStyle(fontSize: 11, fontWeight: FontWeight.w600, color: selected ? AppColors.primaryDark : AppColors.textDark)),
                        ],
                      ),
                    ),
                  );
                },
              ),
              const SizedBox(height: 16),
              _buildField('物品名称 *', '如：进口天然粮', _nameController, onChanged: (_) => setState(() {})),
              const SizedBox(height: 12),
              _buildField('品牌', '如：皇家', _brandController),
              const SizedBox(height: 12),
              Row(
                children: [
                  Expanded(flex: 3, child: _buildField('总数量 *', '如：5', _totalController, keyboardType: TextInputType.number, onChanged: (_) => setState(() {}))),
                  const SizedBox(width: 10),
                  Expanded(flex: 2, child: _buildField('单位', '袋/瓶/个', _unitController)),
                ],
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

  Widget _buildField(String label, String hint, TextEditingController controller, {TextInputType? keyboardType, ValueChanged<String>? onChanged}) {
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
            keyboardType: keyboardType,
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

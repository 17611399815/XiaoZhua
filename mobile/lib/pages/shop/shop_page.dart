import 'package:flutter/material.dart';
import '../../theme/app_theme.dart';

class ShopPage extends StatefulWidget {
  const ShopPage({super.key});

  @override
  State<ShopPage> createState() => _ShopPageState();
}

class _ShopPageState extends State<ShopPage> {
  String _selectedCategory = 'all';
  String _query = '';
  final Map<String, int> _cart = {};

  int get _cartCount => _cart.values.fold(0, (a, b) => a + b);

  void _addToCart(String productId, String name) {
    setState(() {
      _cart[productId] = (_cart[productId] ?? 0) + 1;
    });
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text('已添加 $name 到购物车 🛒'),
        behavior: SnackBarBehavior.floating,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final visible = _visibleProducts;

    return Scaffold(
      backgroundColor: const Color(0xFFFAF6F0),
      body: SafeArea(
        child: Column(
          children: [
            // ── Search bar (matching admin) ──
            Padding(
              padding:
                  const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
              child: SizedBox(
                height: 42,
                child: TextField(
                  onChanged: (v) => setState(() => _query = v.trim()),
                  decoration: InputDecoration(
                    filled: true,
                    fillColor: Colors.white,
                    hintText: '🔍 搜索商品名字/描述...',
                    hintStyle: const TextStyle(
                      fontSize: 13,
                      color: Color(0xFFFF8A3D),
                    ),
                    prefixIcon: const Icon(Icons.search,
                        color: Color(0xFFFFB23F), size: 20),
                    suffixIcon: _query.isNotEmpty
                        ? GestureDetector(
                            onTap: () =>
                                setState(() => _query = ''),
                            child: const Icon(Icons.close,
                                color: Color(0xFF999999), size: 18),
                          )
                        : null,
                    contentPadding:
                        const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
                    border: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(12),
                      borderSide: BorderSide.none,
                    ),
                  ),
                ),
              ),
            ),

            // ── Category pills (matching admin: emoji + label) ──
            SizedBox(
              height: 38,
              child: ListView(
                scrollDirection: Axis.horizontal,
                padding: const EdgeInsets.symmetric(horizontal: 12),
                children: [
                  _CatPill('all', '✨ 全部', _selectedCategory == 'all',
                      () => setState(() => _selectedCategory = 'all')),
                  _CatPill('food', '🍗 主粮', _selectedCategory == 'food',
                      () => setState(() => _selectedCategory = 'food')),
                  _CatPill('snack', '🍖 零食', _selectedCategory == 'snack',
                      () => setState(() => _selectedCategory = 'snack')),
                  _CatPill(
                      'supplement',
                      '🧪 补剂',
                      _selectedCategory == 'supplement',
                      () =>
                          setState(() => _selectedCategory = 'supplement')),
                  _CatPill('toy', '🎾 玩具', _selectedCategory == 'toy',
                      () => setState(() => _selectedCategory = 'toy')),
                  _CatPill(
                      'supplies',
                      '🛹 日用品',
                      _selectedCategory == 'supplies',
                      () =>
                          setState(() => _selectedCategory = 'supplies')),
                  _CatPill('medicine', '💊 医疗',
                      _selectedCategory == 'medicine',
                      () =>
                          setState(() => _selectedCategory = 'medicine')),
                ],
              ),
            ),
            const SizedBox(height: 4),

            // ── Product list ──
            Expanded(
              child: visible.isEmpty
                  ? _buildEmpty()
                  : ListView.builder(
                      padding: const EdgeInsets.symmetric(
                          horizontal: 12, vertical: 4),
                      itemCount: visible.length,
                      itemBuilder: (context, index) =>
                          _buildProductCard(visible[index]),
                    ),
            ),

            // ── Bottom cart bar (matching admin) ──
            if (_cartCount > 0)
              Container(
                margin:
                    const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                padding:
                    const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
                decoration: BoxDecoration(
                  color: const Color(0xFFFFECE0),
                  borderRadius: BorderRadius.circular(16),
                  border: Border.all(color: const Color(0xFFFFE2C4)),
                ),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text(
                      '🛒 购物车: $_cartCount 件',
                      style: const TextStyle(
                        fontSize: 12,
                        fontWeight: FontWeight.w900,
                        color: Color(0xFFC2410C),
                      ),
                    ),
                    GestureDetector(
                      onTap: () => _checkout(context),
                      child: Container(
                        padding: const EdgeInsets.symmetric(
                            horizontal: 16, vertical: 8),
                        decoration: BoxDecoration(
                          gradient: const LinearGradient(
                            colors: [Color(0xFFFFB23F), Color(0xFFFF8A3D)],
                          ),
                          borderRadius: BorderRadius.circular(10),
                        ),
                        child: const Text(
                          '立即下单',
                          style: TextStyle(
                            fontSize: 12,
                            fontWeight: FontWeight.w800,
                            color: Colors.white,
                          ),
                        ),
                      ),
                    ),
                  ],
                ),
              ),
          ],
        ),
      ),
    );
  }

  Widget _buildEmpty() {
    return Center(
      child: Container(
        margin: const EdgeInsets.all(12),
        padding: const EdgeInsets.all(36),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(16),
          border: Border.all(color: const Color(0xFFFFE7D1)),
        ),
        child: const Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Text('🔍', style: TextStyle(fontSize: 32)),
            SizedBox(height: 10),
            Text(
              '没有找到相关商品 🐾',
              style: TextStyle(
                fontSize: 12,
                fontWeight: FontWeight.w700,
                color: Color(0xFF8C6239),
              ),
            ),
            SizedBox(height: 4),
            Text(
              '换个关键词或选择其他分类试试吧',
              style: TextStyle(fontSize: 10, color: Color(0xFF999999)),
            ),
          ],
        ),
      ),
    );
  }

  // ── Product card (list style, matching admin) ──
  Widget _buildProductCard(Map<String, String> p) {
    return Container(
      margin: const EdgeInsets.only(bottom: 10),
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: const Color(0xFFFFE7D1)),
      ),
      child: Row(
        children: [
          // Emoji icon
          Container(
            width: 44,
            height: 44,
            decoration: BoxDecoration(
              color: const Color(0xFFFFF7ED),
              borderRadius: BorderRadius.circular(10),
            ),
            alignment: Alignment.center,
            child: Text(
              p['emoji'] ?? '📦',
              style: const TextStyle(fontSize: 24),
            ),
          ),
          const SizedBox(width: 10),
          // Info
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  p['name'] ?? '',
                  style: const TextStyle(
                    fontSize: 13,
                    fontWeight: FontWeight.w900,
                    color: Color(0xFF333333),
                  ),
                ),
                const SizedBox(height: 2),
                Text(
                  p['desc'] ?? '养宠囤货优选',
                  style: const TextStyle(
                    fontSize: 10,
                    color: Color(0xFF888888),
                  ),
                ),
                const SizedBox(height: 4),
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text(
                      p['price'] ?? '',
                      style: const TextStyle(
                        fontSize: 14,
                        fontWeight: FontWeight.w900,
                        color: Color(0xFFEF4444),
                      ),
                    ),
                    Text(
                      '库存: ${p['stock'] ?? '0'}',
                      style: TextStyle(
                        fontSize: 10,
                        color: (int.tryParse(p['stock'] ?? '0') ?? 0) < 10
                            ? const Color(0xFFEF4444)
                            : const Color(0xFF999999),
                      ),
                    ),
                  ],
                ),
              ],
            ),
          ),
          const SizedBox(width: 8),
          // Add button
          GestureDetector(
            onTap: () => _addToCart(p['id']!, p['name']!),
            child: Container(
              width: 36,
              height: 36,
              decoration: BoxDecoration(
                color: const Color(0xFFFFB23F),
                borderRadius: BorderRadius.circular(18),
              ),
              child: const Icon(Icons.add, color: Colors.white, size: 20),
            ),
          ),
        ],
      ),
    );
  }

  void _checkout(BuildContext context) {
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        backgroundColor: Colors.white,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
        title: const Text(
          '确认下单',
          style: TextStyle(
            fontWeight: FontWeight.w800,
            color: AppColors.textDark,
          ),
        ),
        content: Text(
          '购物车共 $_cartCount 件商品，确认立即下单？',
          style: const TextStyle(color: AppColors.textMuted),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.of(ctx).pop(),
            child: const Text(
              '取消',
              style: TextStyle(
                color: AppColors.textMuted,
                fontWeight: FontWeight.w600,
              ),
            ),
          ),
          TextButton(
            onPressed: () {
              Navigator.of(ctx).pop();
              setState(() => _cart.clear());
              ScaffoldMessenger.of(context).showSnackBar(
                SnackBar(
                  content: const Text('下单成功！可在「个人-我的订单」中查看 🐾'),
                  behavior: SnackBarBehavior.floating,
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(12),
                  ),
                ),
              );
            },
            child: const Text(
              '立即下单',
              style: TextStyle(
                color: AppColors.primaryDark,
                fontWeight: FontWeight.w700,
              ),
            ),
          ),
        ],
      ),
    );
  }

  // ── Filtered products ──
  List<Map<String, String>> get _visibleProducts {
    return _products.where((p) {
      final matchCat =
          _selectedCategory == 'all' || p['category'] == _selectedCategory;
      final matchQuery = _query.isEmpty ||
          (p['name']?.contains(_query) == true) ||
          (p['desc']?.contains(_query) == true);
      return matchCat && matchQuery;
    }).toList();
  }

  final List<Map<String, String>> _products = [
    {
      'id': 'prod-1',
      'emoji': '🦴',
      'name': '无谷全价全期猫粮 10kg',
      'desc': '精选优质肉源，高蛋白，无谷低敏。',
      'price': '¥299',
      'stock': '150',
      'category': 'food'
    },
    {
      'id': 'prod-2',
      'emoji': '🍖',
      'name': '冻干鸡肉粒宠物零食 500g',
      'desc': '低温冷冻干燥技术，保留新鲜营养，酥脆可口。',
      'price': '¥59.90',
      'stock': '450',
      'category': 'snack'
    },
    {
      'id': 'prod-3',
      'emoji': '🛹',
      'name': '剑麻耐磨猫抓板 L号',
      'desc': '天然环保剑麻，不飞屑，保护家具。',
      'price': '¥39',
      'stock': '80',
      'category': 'supplies'
    },
    {
      'id': 'prod-4',
      'emoji': '🎾',
      'name': '电动趣味逗猫棒',
      'desc': '不规则旋转，红外感应，猫咪的最爱。',
      'price': '¥29.90',
      'stock': '120',
      'category': 'toy'
    },
    {
      'id': 'prod-5',
      'emoji': '💊',
      'name': '宠物体内外一体驱虫药',
      'desc': '快速起效，全面驱杀体内外寄生虫。',
      'price': '¥88',
      'stock': '200',
      'category': 'medicine'
    },
    {
      'id': 'prod-6',
      'emoji': '🧪',
      'name': '赖氨酸宠物营养膏 120g',
      'desc': '补充成长所需赖氨酸，增强自体免疫。',
      'price': '¥49',
      'stock': '180',
      'category': 'supplement'
    },
    {
      'id': 'prod-7',
      'emoji': '🐟',
      'name': '深海高纯度 Omega-3 鱼油 100粒',
      'desc': '高含量EPA/DHA，护肤美毛，爆毛亮眼。',
      'price': '¥128',
      'stock': '95',
      'category': 'supplement'
    },
  ];
}

// ── Category Pill Widget ──
class _CatPill extends StatelessWidget {
  final String key_;
  final String label;
  final bool isSelected;
  final VoidCallback onTap;

  const _CatPill(this.key_, this.label, this.isSelected, this.onTap);

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(right: 6),
      child: GestureDetector(
        onTap: onTap,
        child: Container(
          padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
          decoration: BoxDecoration(
            gradient: isSelected
                ? const LinearGradient(
                    colors: [Color(0xFFFFB23F), Color(0xFFFF8A3D)])
                : null,
            color: isSelected ? null : Colors.white,
            borderRadius: BorderRadius.circular(20),
            border: Border.all(
              color: isSelected ? Colors.transparent : const Color(0xFFFFE7D1),
            ),
            boxShadow: isSelected
                ? const [
                    BoxShadow(
                      color: Color(0x33FF8A3D),
                      blurRadius: 6,
                      offset: Offset(0, 2),
                    )
                  ]
                : null,
          ),
          child: Text(
            label,
            style: TextStyle(
              fontSize: 11,
              fontWeight: isSelected ? FontWeight.w900 : FontWeight.w700,
              color: isSelected ? Colors.white : const Color(0xFF8C6239),
            ),
          ),
        ),
      ),
    );
  }
}

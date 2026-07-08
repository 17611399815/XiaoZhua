import 'package:flutter/material.dart';
import '../../theme/app_theme.dart';

class ShopPage extends StatefulWidget {
  const ShopPage({super.key});

  @override
  State<ShopPage> createState() => _ShopPageState();
}

class _ShopPageState extends State<ShopPage> {
  String _selectedCategory = '全部';
  String _query = '';
  int _cartCount = 0;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.backgroundLight,
      appBar: AppBar(
        title: const Text(
          '宠物商城',
          style: TextStyle(fontSize: 18, fontWeight: FontWeight.w900, color: AppColors.primaryDark),
        ),
        centerTitle: true,
        backgroundColor: Colors.transparent,
        elevation: 0,
        actions: [
          Padding(
            padding: const EdgeInsets.only(right: 12),
            child: Container(
              width: 36, height: 36,
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(12),
                boxShadow: const [
                  BoxShadow(color: Color(0x1A000000), blurRadius: 4, offset: Offset(0, 1)),
                ],
              ),
              child: Stack(
                alignment: Alignment.center,
                children: [
                  const Icon(Icons.shopping_cart_outlined, size: 20, color: AppColors.primaryDark),
                  if (_cartCount > 0)
                    Positioned(
                      right: 5,
                      top: 5,
                      child: Container(
                        padding: const EdgeInsets.all(3),
                        decoration: const BoxDecoration(color: Color(0xFFFF6B6B), shape: BoxShape.circle),
                        child: Text('', style: const TextStyle(fontSize: 9, color: Colors.white, fontWeight: FontWeight.w800)),
                      ),
                    ),
                ],
              ),
            ),
          ),
        ],
      ),
      body: Column(
        children: [
          // Search bar
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
            child: Container(
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 4),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(16),
                boxShadow: const [
                  BoxShadow(color: Color(0x1A000000), blurRadius: 4, offset: Offset(0, 1)),
                ],
              ),
              child: Row(
                children: [
                  const Icon(Icons.search, color: AppColors.textMuted, size: 20),
                  const SizedBox(width: 8),
                  Expanded(
                    child: TextField(
                      onChanged: (value) => setState(() => _query = value.trim()),
                      decoration: InputDecoration(
                        border: InputBorder.none,
                        hintText: '搜索宠物用品...',
                        hintStyle: TextStyle(fontSize: 14, color: AppColors.textMuted),
                        isDense: true,
                        contentPadding: EdgeInsets.symmetric(vertical: 12),
                      ),
                    ),
                  ),
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
                    decoration: BoxDecoration(
                      color: AppColors.primaryLight,
                      borderRadius: BorderRadius.circular(10),
                    ),
                    child: const Row(
                      children: [
                        Icon(Icons.tune, size: 16, color: AppColors.primaryDark),
                        SizedBox(width: 4),
                        Text('筛选', style: TextStyle(fontSize: 12, fontWeight: FontWeight.w600, color: AppColors.primaryDark)),
                      ],
                    ),
                  ),
                ],
              ),
            ),
          ),
          // Category tabs
          SizedBox(
            height: 50,
            child: ListView(
              scrollDirection: Axis.horizontal,
              padding: const EdgeInsets.symmetric(horizontal: 16),
              children: _buildCategories(),
            ),
          ),
          // Product grid
          Expanded(
            child: GridView.builder(
              padding: const EdgeInsets.all(16),
              gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                crossAxisCount: 2,
                mainAxisSpacing: 12,
                crossAxisSpacing: 12,
                childAspectRatio: 0.68,
              ),
              itemCount: _visibleProducts.length,
              itemBuilder: (context, index) {
                final p = _visibleProducts[index];
                return _buildProductCard(p);
              },
            ),
          ),
        ],
      ),
    );
  }

  List<Widget> _buildCategories() {
    final cats = ['全部', '主粮', '零食', '补剂', '用品', '玩具', '药品', '服饰'];
    return cats.map((c) {
      final isActive = c == _selectedCategory;
      return Padding(
        padding: const EdgeInsets.only(right: 10),
        child: GestureDetector(
          onTap: () => setState(() => _selectedCategory = c),
          child: Container(
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
            decoration: BoxDecoration(
              color: isActive ? AppColors.primary : Colors.white,
              borderRadius: BorderRadius.circular(14),
              boxShadow: const [
                BoxShadow(color: Color(0x1A000000), blurRadius: 4, offset: Offset(0, 1)),
              ],
            ),
            alignment: Alignment.center,
            child: Text(
              c,
              style: TextStyle(
                fontSize: 13,
                fontWeight: FontWeight.w700,
                color: isActive ? Colors.white : AppColors.textDark,
              ),
            ),
          ),
        ),
      );
    }).toList();
  }

  List<Map<String, String>> get _visibleProducts {
    return _products.where((p) {
      final matchesCategory = _selectedCategory == '全部' || p['category'] == _selectedCategory;
      final matchesQuery = _query.isEmpty || p['name']!.contains(_query) || p['desc']!.contains(_query);
      return matchesCategory && matchesQuery;
    }).toList();
  }

  Widget _buildProductCard(Map<String, String> product) {
    final colors = [
      const Color(0xFFFFE8D2), const Color(0xFFE8F3FF),
      const Color(0xFFF0E8FF), const Color(0xFFFFF0CC),
      const Color(0xFFE6FFF0), const Color(0xFFFFE8E8),
    ];
    final colorIndex = _products.indexOf(product) % colors.length;

    return Container(
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(20),
        boxShadow: const [
          BoxShadow(color: Color(0x1A000000), blurRadius: 4, offset: Offset(0, 1)),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Product image placeholder
          Container(
            height: 130,
            decoration: BoxDecoration(
              color: colors[colorIndex],
              borderRadius: const BorderRadius.vertical(top: Radius.circular(20)),
            ),
            alignment: Alignment.center,
            child: Text(product['emoji']!, style: const TextStyle(fontSize: 48)),
          ),
          Padding(
            padding: const EdgeInsets.all(12),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  product['name']!,
                  style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w700, color: AppColors.textDark),
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                ),
                const SizedBox(height: 4),
                Text(
                  product['desc']!,
                  style: const TextStyle(fontSize: 11, color: AppColors.textMuted),
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                ),
                const SizedBox(height: 8),
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text(
                      product['price']!,
                      style: const TextStyle(fontSize: 16, fontWeight: FontWeight.w800, color: AppColors.primaryDark),
                    ),
                    Container(
                      width: 30, height: 30,
                      decoration: BoxDecoration(
                        color: AppColors.primary,
                        borderRadius: BorderRadius.circular(10),
                      ),
                      child: IconButton(
                        padding: EdgeInsets.zero,
                        icon: const Icon(Icons.add, color: Colors.white, size: 18),
                        onPressed: () => _addToCart(product),
                      ),
                    ),
                  ],
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  void _addToCart(Map<String, String> product) {
    setState(() => _cartCount++);
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(content: Text('${product['name']} 已加入购物车')),
    );
  }
  final List<Map<String, String>> _products = const [
    {'emoji': '🦴', 'name': '天然狗粮 5kg', 'desc': '进口无谷配方', 'price': '¥258', 'category': '主粮'},
    {'emoji': '🐟', 'name': '三文鱼猫粮', 'desc': '高蛋白美毛', 'price': '¥198', 'category': '主粮'},
    {'emoji': '🎾', 'name': '耐咬橡胶球', 'desc': '互动磨牙玩具', 'price': '¥39', 'category': '玩具'},
    {'emoji': '🧪', 'name': '全能维生素营养片', 'desc': '增强免疫力 靓丽毛发', 'price': '¥89', 'category': '补剂'},
    {'emoji': '🧴', 'name': '宠物沐浴露', 'desc': '温和不刺激', 'price': '¥68', 'category': '用品'},
    {'emoji': '💊', 'name': '体内驱虫药', 'desc': '三月一次', 'price': '¥45', 'category': '药品'},
    {'emoji': '🧸', 'name': '毛绒公仔', 'desc': '陪伴安抚玩具', 'price': '¥29', 'category': '玩具'},
    {'emoji': '👔', 'name': '宠物小衣服', 'desc': '纯棉透气', 'price': '¥55', 'category': '服饰'},
    {'emoji': '🍖', 'name': '鸡肉零食棒', 'desc': '训练奖励', 'price': '¥25', 'category': '零食'},
  ];
}


import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../theme/app_theme.dart';
import '../services/app_provider.dart';
import '../models/pet.dart';
import 'reminder/reminder_list_page.dart';
import 'reminder/add_pet_dialog.dart';
import 'accounting/accounting_page.dart';
import 'recipe/recipe_page.dart';
import 'notes/notes_page.dart';
import 'weight/weight_page.dart';
import 'medical/medical_page.dart';
import 'stock/stock_page.dart';
import 'album/album_page.dart';
import 'shop/shop_page.dart';
import 'device/device_page.dart';
import 'spa/spa_page.dart';

class HomePage extends StatelessWidget {
  final VoidCallback onOpenAi;
  const HomePage({super.key, required this.onOpenAi});

  @override
  Widget build(BuildContext context) {
    final pet = context.watch<AppProvider>().currentPet;

    return Scaffold(
      backgroundColor: const Color(0xFFFAF6F0),
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.fromLTRB(12, 12, 12, 10),
          child: Column(
            children: [
              _buildPetHeader(pet, context),
              const SizedBox(height: 12),
              _buildStatusPills(context),
              const SizedBox(height: 12),
              _buildAdBanner(context),
              const SizedBox(height: 12),
              _buildDevicesCard(context),
              const SizedBox(height: 14),
              _buildFeatureGrid(context),
              const SizedBox(height: 16),
            ],
          ),
        ),
      ),
    );
  }

  void _openPage(BuildContext context, Widget page) {
    Navigator.of(context).push(MaterialPageRoute(builder: (_) => page));
  }

  // ── 1. Pet Header (matching admin design exactly) ──
  Widget _buildPetHeader(Pet? pet, BuildContext context) {
    final provider = context.read<AppProvider>();
    final name = pet?.name ?? '毛孩子';
    final emoji = pet?.emoji ?? '🐾';
    final gender = pet?.gender ?? '男孩';
    final breed = pet?.breed.isNotEmpty == true ? pet!.breed : '未设置品种';
    final days = pet?.daysTogether ?? 0;
    final pets = provider.pets;

    return Row(
      children: [
        // Avatar — label-based matching simulator's PetAvatar
        _PetLabelAvatar(emojiOrUrl: emoji, size: 48, radius: 24),
        const SizedBox(width: 12),
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                children: [
                  Flexible(
                    child: Text(
                      name,
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                      style: const TextStyle(
                        fontSize: 16,
                        fontWeight: FontWeight.w900,
                        color: Color(0xFF2D2621),
                      ),
                    ),
                  ),
                  const SizedBox(width: 6),
                  // GG / MM badge
                  Container(
                    padding:
                        const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                    decoration: BoxDecoration(
                      color: gender == '男孩'
                          ? const Color(0xFFFEF3C7)
                          : const Color(0xFFFCE7F3),
                      borderRadius: BorderRadius.circular(4),
                    ),
                    child: Text(
                      gender == '男孩' ? 'GG' : 'MM',
                      style: TextStyle(
                        fontSize: 11,
                        fontWeight: FontWeight.w800,
                        color: gender == '男孩'
                            ? const Color(0xFFEAB308)
                            : const Color(0xFFEC4899),
                      ),
                    ),
                  ),
                  const SizedBox(width: 6),
                  Flexible(
                    child: Text(
                      breed,
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                      style: const TextStyle(
                        fontSize: 12,
                        color: Color(0xFF8C6239),
                        fontWeight: FontWeight.w500,
                      ),
                    ),
                  ),
                  // Dropdown to switch pets
                  if (pets.length > 1)
                    GestureDetector(
                      onTap: () => _showPetSwitchSheet(context),
                      child: const Padding(
                        padding: EdgeInsets.all(4),
                        child: Icon(
                          Icons.arrow_drop_down,
                          color: Color(0xFFFF8A3D),
                          size: 18,
                        ),
                      ),
                    ),
                ],
              ),
              const SizedBox(height: 2),
              Text(
                '相伴 $days 天 · 与你相伴${days}天',
                style: const TextStyle(
                  fontSize: 11,
                  color: Color(0xFF999999),
                ),
              ),
            ],
          ),
        ),
        // "+ 新的成员" button
        GestureDetector(
          onTap: () => _quickAddPet(context),
          child: Container(
            padding:
                const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
            decoration: BoxDecoration(
              color: const Color(0xFFFFF4DE),
              borderRadius: BorderRadius.circular(8),
              border: Border.all(color: const Color(0xFFFFE7D1)),
            ),
            child: const Row(
              mainAxisSize: MainAxisSize.min,
              children: [
                Icon(Icons.add, size: 12, color: Color(0xFFFF8A3D)),
                SizedBox(width: 2),
                Text(
                  '新的成员',
                  style: TextStyle(
                    fontSize: 11,
                    fontWeight: FontWeight.w700,
                    color: Color(0xFFFF8A3D),
                  ),
                ),
              ],
            ),
          ),
        ),
      ],
    );
  }

  // ── 2. Status Pills (3-column, matching admin) ──
  Widget _buildStatusPills(BuildContext context) {
    final provider = context.watch<AppProvider>();
    final undoneReminders =
        provider.currentPetReminders.where((r) => !r.isCompleted).length;
    final totalExpense = provider.currentPetTotalExpense;
    final lowStock =
        provider.currentPetStockItems.where((s) => s.remaining == 0).length;

    return Row(
      children: [
        Expanded(
          child: _StatusPill(
            icon: Icons.notifications_outlined,
            label: '疫苗接种',
            value: undoneReminders > 0 ? '$undoneReminders 项未完' : '无事务',
            color: const Color(0xFFD97706),
            onTap: () => _openPage(context, const ReminderListPage()),
          ),
        ),
        const SizedBox(width: 8),
        Expanded(
          child: _StatusPill(
            icon: Icons.payment_outlined,
            label: '本月花费',
            value: '¥${totalExpense.toStringAsFixed(0)}',
            color: const Color(0xFF10B981),
            onTap: () => _openPage(context, const AccountingPage()),
          ),
        ),
        const SizedBox(width: 8),
        Expanded(
          child: _StatusPill(
            icon: Icons.inventory_2_outlined,
            label: '囤货提醒',
            value: lowStock > 0 ? '$lowStock 项断货' : '储备充足',
            color: const Color(0xFF0EA5E9),
            onTap: () => _openPage(context, const StockPage()),
          ),
        ),
      ],
    );
  }

  // ── 3. Ad Banner (matching admin SPA banner) ──
  Widget _buildAdBanner(BuildContext context) {
    return GestureDetector(
      onTap: () => _openPage(context, const SpaPage()),
      child: Container(
        height: 100,
        decoration: BoxDecoration(
          borderRadius: BorderRadius.circular(20),
          image: const DecorationImage(
            image: NetworkImage(
                'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=400'),
            fit: BoxFit.cover,
          ),
          boxShadow: const [
            BoxShadow(
              color: Color(0x1A2D2621),
              blurRadius: 12,
              offset: Offset(0, 4),
            ),
          ],
        ),
        child: Container(
          decoration: BoxDecoration(
            borderRadius: BorderRadius.circular(20),
            gradient: const LinearGradient(
              colors: [Color(0xF20F172A), Color(0x800F172A)],
              begin: Alignment.centerLeft,
              end: Alignment.centerRight,
            ),
          ),
          padding: const EdgeInsets.all(14),
          child: Stack(
            children: [
              // Top-left badge
              Positioned(
                top: 0,
                left: 0,
                child: Container(
                  padding:
                      const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                  decoration: BoxDecoration(
                    color: const Color(0xFFFFB23F),
                    borderRadius: BorderRadius.circular(6),
                  ),
                  child: const Text(
                    '特惠预约',
                    style: TextStyle(
                      fontSize: 9,
                      fontWeight: FontWeight.w900,
                      color: Color(0xFF2D2621),
                    ),
                  ),
                ),
              ),
              // Center text
              const Positioned(
                left: 0,
                bottom: 24,
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      '👑 皇家夏季草本深层芳疗 SPA',
                      style: TextStyle(
                        fontSize: 13,
                        fontWeight: FontWeight.w900,
                        color: Colors.white,
                        shadows: [
                          Shadow(color: Colors.black54, blurRadius: 4),
                        ],
                      ),
                    ),
                    SizedBox(height: 2),
                    Text(
                      '瑞士负离子防静电防虫尊享大促，全国...',
                      style: TextStyle(
                        fontSize: 9,
                        color: Color(0xFFCDD5E0),
                        shadows: [
                          Shadow(color: Colors.black54, blurRadius: 4),
                        ],
                      ),
                    ),
                  ],
                ),
              ),
              // Right arrow circle
              Positioned(
                right: 0,
                top: 28,
                child: Container(
                  width: 28,
                  height: 28,
                  decoration: BoxDecoration(
                    shape: BoxShape.circle,
                    color: const Color(0xFFFF8A3D),
                    boxShadow: const [
                      BoxShadow(
                        color: Color(0x66FF8A3D),
                        blurRadius: 6,
                      ),
                    ],
                  ),
                  child: const Icon(
                    Icons.chevron_right,
                    color: Colors.white,
                    size: 16,
                  ),
                ),
              ),
              // Bottom dots
              const Positioned(
                bottom: 0,
                left: 0,
                right: 0,
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    _Dot(size: 5, active: false),
                    SizedBox(width: 4),
                    _Dot(size: 12, active: true),
                    SizedBox(width: 4),
                    _Dot(size: 5, active: false),
                  ],
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  // ── 4. Devices Card (matching admin dark card) ──
  Widget _buildDevicesCard(BuildContext context) {
    return GestureDetector(
      onTap: () => _openPage(context, const DevicePage()),
      child: Container(
        padding: const EdgeInsets.all(14),
        decoration: BoxDecoration(
          gradient: const LinearGradient(
            colors: [Color(0xFF1F2937), Color(0xFF111827)],
            begin: Alignment.topLeft,
            end: Alignment.bottomRight,
          ),
          borderRadius: BorderRadius.circular(20),
          boxShadow: const [
            BoxShadow(
              color: Color(0x1F000000),
              blurRadius: 18,
              offset: Offset(0, 6),
            ),
          ],
        ),
        child: Row(
          children: [
            Container(
              width: 40,
              height: 40,
              decoration: BoxDecoration(
                borderRadius: BorderRadius.circular(12),
                gradient: const LinearGradient(
                  colors: [Color(0xFFFFB23F), Color(0xFFFF8A3D)],
                ),
                boxShadow: const [
                  BoxShadow(
                    color: Color(0x33FF8A3D),
                    blurRadius: 10,
                  ),
                ],
              ),
              child: const Icon(Icons.sensors, color: Colors.white, size: 20),
            ),
            const SizedBox(width: 12),
            const Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      Text(
                        '您的设备',
                        style: TextStyle(
                          fontSize: 14,
                          fontWeight: FontWeight.w900,
                          color: Color(0xFFFFF8F0),
                        ),
                      ),
                      SizedBox(width: 6),
                      _OnlineBadge(),
                    ],
                  ),
                  SizedBox(height: 2),
                  Text(
                    '绑定宠物监控、GPS定位器、智能水机等',
                    style: TextStyle(
                      fontSize: 11,
                      color: Color(0xFF9CA3AF),
                    ),
                  ),
                ],
              ),
            ),
            const Icon(
              Icons.chevron_right,
              color: Color(0xCCFFB23F),
              size: 18,
            ),
          ],
        ),
      ),
    );
  }

  // ── 5. Feature Grid (9 items, 4 columns, matching admin exactly) ──
  Widget _buildFeatureGrid(BuildContext context) {
    final features = [
      _Feat('提醒', Icons.notifications_outlined, const Color(0xFFD97706),
          const Color(0xFFFEF3C7),
          () => _openPage(context, const ReminderListPage())),
      _Feat('记账', Icons.payment_outlined, const Color(0xFF10B981),
          const Color(0xFFD1FAE5),
          () => _openPage(context, const AccountingPage())),
      _Feat('食谱', Icons.restaurant, const Color(0xFF3B82F6),
          const Color(0xFFDBEAFE),
          () => _openPage(context, const RecipePage())),
      _Feat('囤货', Icons.inventory_2_outlined, const Color(0xFF14B8A6),
          const Color(0xFFCCFBF1),
          () => _openPage(context, const StockPage())),
      _Feat('记事', Icons.edit_note, const Color(0xFF8B5CF6),
          const Color(0xFFF3E8FF),
          () => _openPage(context, const NotesPage())),
      _Feat('体重', Icons.monitor_weight_outlined,
          const Color(0xFFFF8A3D), const Color(0xFFFFF4DE),
          () => _openPage(context, const WeightPage())),
      _Feat('病历', Icons.medical_services_outlined,
          const Color(0xFFEC4899), const Color(0xFFFCE7F3),
          () => _openPage(context, const MedicalPage())),
      _Feat('商城', Icons.shopping_bag_outlined, const Color(0xFFFF8A3D),
          const Color(0xFFFFF4DE),
          () => _openPage(context, const ShopPage())),
      _Feat('相册', Icons.photo_camera_outlined, const Color(0xFF6366F1),
          const Color(0xFFE0E7FF),
          () => _openPage(context, const AlbumPage())),
    ];

    return GridView.builder(
      shrinkWrap: true,
      physics: const NeverScrollableScrollPhysics(),
      gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
        crossAxisCount: 4,
        mainAxisSpacing: 16,
        crossAxisSpacing: 6,
        childAspectRatio: 0.78,
      ),
      itemCount: features.length,
      itemBuilder: (context, index) => _buildFeatureItem(features[index]),
    );
  }

  Widget _buildFeatureItem(_Feat feat) {
    return GestureDetector(
      onTap: feat.onTap,
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          // Circle icon container
          Container(
            width: 52,
            height: 52,
            decoration: BoxDecoration(
              shape: BoxShape.circle,
              color: feat.bg,
              border: Border.all(
                color: Colors.black.withValues(alpha: 0.02),
              ),
              boxShadow: const [
                BoxShadow(
                  color: Color(0x05000000),
                  blurRadius: 6,
                ),
              ],
            ),
            child: Icon(feat.icon, color: feat.color, size: 22),
          ),
          const SizedBox(height: 6),
          Text(
            feat.label,
            style: const TextStyle(
              fontSize: 11,
              fontWeight: FontWeight.w700,
              color: Color(0xFF4A3E3D),
            ),
            textAlign: TextAlign.center,
            maxLines: 1,
            overflow: TextOverflow.ellipsis,
          ),
        ],
      ),
    );
  }

  // ── Quick add pet ──
  void _quickAddPet(BuildContext context) {
    final names = ['蛋挞', '奶酪', '雪饼', '摩卡', '奥利奥', '布丁'];
    final emojis = ['🐱', '🐶', '🐰', '🐹'];
    final breeds = ['英国短毛猫', '金毛犬', '侏儒兔', '仓鼠'];
    final rand = DateTime.now().millisecond % names.length;

    final provider = context.read<AppProvider>();
    final pet = Pet(
      id: 'pet_${DateTime.now().millisecondsSinceEpoch}',
      name: names[rand],
      gender: rand % 2 == 0 ? '男孩' : '女孩',
      type: emojis[rand] == '🐱'
          ? '猫咪'
          : emojis[rand] == '🐰'
              ? '小兔'
              : '狗狗',
      meetDate: DateTime.now(),
      breed: breeds[rand],
      emoji: emojis[rand],
      weight: (rand + 2) * 2.5,
      isNeutered: false,
    );
    provider.addPet(pet);
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text('已添加 ${pet.name} 🐾'),
        behavior: SnackBarBehavior.floating,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
      ),
    );
  }

  void _showPetSwitchSheet(BuildContext context) {
    final provider = context.read<AppProvider>();
    final pets = provider.pets;
    final currentPet = provider.currentPet;

    showModalBottomSheet(
      context: context,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
      ),
      builder: (ctx) => Container(
        padding: const EdgeInsets.all(20),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Center(
              child: Container(
                width: 40,
                height: 4,
                decoration: BoxDecoration(
                  color: Colors.grey.shade300,
                  borderRadius: BorderRadius.circular(2),
                ),
              ),
            ),
            const SizedBox(height: 20),
            const Text(
              '切换宠物',
              style: TextStyle(
                fontSize: 20,
                fontWeight: FontWeight.w900,
                color: AppColors.textDark,
              ),
            ),
            const SizedBox(height: 16),
            ...pets.map((pet) {
              final isActive = currentPet?.id == pet.id;
              return GestureDetector(
                onTap: () {
                  provider.switchPet(pet);
                  Navigator.of(ctx).pop();
                },
                child: Container(
                  margin: const EdgeInsets.only(bottom: 8),
                  padding: const EdgeInsets.all(12),
                  decoration: BoxDecoration(
                    color: isActive
                        ? const Color(0xFFFFF4DE)
                        : Colors.grey.shade50,
                    borderRadius: BorderRadius.circular(16),
                    border: Border.all(
                      color: isActive
                          ? const Color(0xFFFFB23F)
                          : Colors.transparent,
                      width: 2,
                    ),
                  ),
                  child: Row(
                    children: [
                      _PetLabelAvatar(
                        emojiOrUrl: pet.emoji,
                        size: 44,
                        radius: 12,
                      ),
                      const SizedBox(width: 12),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              pet.name,
                              style: const TextStyle(
                                fontSize: 15,
                                fontWeight: FontWeight.w700,
                                color: AppColors.textDark,
                              ),
                            ),
                            Text(
                              '${pet.type} · 相伴 ${pet.daysTogether} 天',
                              style: const TextStyle(
                                fontSize: 12,
                                color: AppColors.textMuted,
                              ),
                            ),
                          ],
                        ),
                      ),
                      if (isActive)
                        const Icon(
                          Icons.check_circle,
                          color: Color(0xFFFFB23F),
                          size: 24,
                        ),
                    ],
                  ),
                ),
              );
            }),
            const SizedBox(height: 8),
            GestureDetector(
              onTap: () {
                Navigator.of(ctx).pop();
                showDialog(
                  context: context,
                  builder: (_) => const AddPetDialog(),
                );
              },
              child: Container(
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(16),
                  border: Border.all(color: const Color(0xFFFFE6A8), width: 2),
                ),
                child: const Row(
                  children: [
                    _PetLabelAvatar(
                      emojiOrUrl: '',
                      size: 44,
                      radius: 12,
                    ),
                    SizedBox(width: 12),
                    Text(
                      '添加新宠物',
                      style: TextStyle(
                        fontSize: 15,
                        fontWeight: FontWeight.w700,
                        color: Color(0xFFE8791A),
                      ),
                    ),
                  ],
                ),
              ),
            ),
            const SizedBox(height: 20),
          ],
        ),
      ),
    );
  }
}

// ── Helper Widgets ──

/// Label-based pet avatar matching the simulator's PetAvatar component
class _PetLabelAvatar extends StatelessWidget {
  final String emojiOrUrl;
  final double size;
  final double radius;

  const _PetLabelAvatar({
    required this.emojiOrUrl,
    required this.size,
    required this.radius,
  });

  @override
  Widget build(BuildContext context) {
    if (emojiOrUrl.startsWith('http') || emojiOrUrl.startsWith('data:')) {
      return ClipRRect(
        borderRadius: BorderRadius.circular(radius),
        child: Image.network(
          emojiOrUrl,
          width: size,
          height: size,
          fit: BoxFit.cover,
          errorBuilder: (context, error, stackTrace) => _buildLabel(),
        ),
      );
    }
    return _buildLabel();
  }

  Widget _buildLabel() {
    String label;
    Color bg;
    Color fg;
    switch (emojiOrUrl) {
      case '🐱':
        label = 'CAT';
        bg = const Color(0xFFFFF4DE);
        fg = const Color(0xFFFF8A3D);
        break;
      case '🐶':
        label = 'DOG';
        bg = const Color(0xFFE0F2FE);
        fg = const Color(0xFF0284C7);
        break;
      case '🐰':
        label = 'RAB';
        bg = const Color(0xFFFCE7F3);
        fg = const Color(0xFFDB2777);
        break;
      case '🐹':
        label = 'HAM';
        bg = const Color(0xFFFEF3C7);
        fg = const Color(0xFFD97706);
        break;
      case '🐻':
      case '🐼':
        label = 'BER';
        bg = const Color(0xFFF3F4F6);
        fg = const Color(0xFF4B5563);
        break;
      case '🐾':
        label = 'PET';
        bg = const Color(0xFFF5ECE1);
        fg = const Color(0xFFB45309);
        break;
      default:
        label = emojiOrUrl.isNotEmpty
            ? emojiOrUrl
                .substring(
                  0,
                  emojiOrUrl.length > 3 ? 3 : emojiOrUrl.length,
                )
                .toUpperCase()
            : 'PET';
        bg = const Color(0xFFFFF4DE);
        fg = const Color(0xFFFF8A3D);
    }

    return Container(
      width: size,
      height: size,
      decoration: BoxDecoration(
        color: bg,
        borderRadius: BorderRadius.circular(radius),
        border: Border.all(color: const Color(0x14B45309)),
      ),
      alignment: Alignment.center,
      child: Text(
        label,
        style: TextStyle(
          fontSize: size > 40 ? 12 : 9,
          fontWeight: FontWeight.w800,
          color: fg,
          letterSpacing: 0.5,
        ),
      ),
    );
  }
}

class _StatusPill extends StatelessWidget {
  final IconData icon;
  final String label;
  final String value;
  final Color color;
  final VoidCallback onTap;

  const _StatusPill({
    required this.icon,
    required this.label,
    required this.value,
    required this.color,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 10),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(16),
          border: Border.all(color: const Color(0xFFEADEC9)),
          boxShadow: const [
            BoxShadow(
              color: Color(0x02000000),
              blurRadius: 6,
            ),
          ],
        ),
        child: Column(
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Icon(icon, size: 11, color: color),
                const SizedBox(width: 4),
                Text(
                  label,
                  style: const TextStyle(
                    fontSize: 11,
                    fontWeight: FontWeight.w700,
                    color: Color(0xFF8C6239),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 3),
            Text(
              value,
              style: TextStyle(
                fontSize: 13,
                fontWeight: FontWeight.w900,
                color: color,
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _OnlineBadge extends StatelessWidget {
  const _OnlineBadge();

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 5, vertical: 1),
      decoration: BoxDecoration(
        color: const Color(0xFF10B981),
        borderRadius: BorderRadius.circular(4),
      ),
      child: const Text(
        'ONLINE',
        style: TextStyle(
          fontSize: 8,
          fontWeight: FontWeight.w900,
          color: Colors.white,
        ),
      ),
    );
  }
}

class _Dot extends StatelessWidget {
  final double size;
  final bool active;

  const _Dot({required this.size, required this.active});

  @override
  Widget build(BuildContext context) {
    return Container(
      width: size,
      height: size > 6 ? 4 : size,
      decoration: BoxDecoration(
        shape: size > 6 ? BoxShape.rectangle : BoxShape.circle,
        borderRadius: size > 6 ? BorderRadius.circular(2) : null,
        color: active
            ? const Color(0xFFFFB23F)
            : const Color(0x66FFFFFF),
      ),
    );
  }
}

class _Feat {
  final String label;
  final IconData icon;
  final Color color;
  final Color bg;
  final VoidCallback onTap;

  const _Feat(this.label, this.icon, this.color, this.bg, this.onTap);
}

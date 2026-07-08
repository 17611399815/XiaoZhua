import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../theme/app_theme.dart';
import '../../services/app_provider.dart';
import '../pet_edit/pet_edit_page.dart';
import '../message/message_page.dart';

class ProfilePage extends StatelessWidget {
  const ProfilePage({super.key});

  @override
  Widget build(BuildContext context) {
    final provider = context.watch<AppProvider>();
    final pet = provider.currentPet;
    final pets = provider.pets;

    return Scaffold(
      backgroundColor: const Color(0xFFFAF6F0),
      body: SafeArea(
        child: SingleChildScrollView(
          child: Padding(
            padding: const EdgeInsets.fromLTRB(12, 12, 12, 20),
            child: Column(
              children: [
                // ── User Header Card (gradient matching admin) ──
                Container(
                  padding: const EdgeInsets.all(16),
                  decoration: BoxDecoration(
                    gradient: const LinearGradient(
                      colors: [Color(0xFFFFB23F), Color(0xFFFF8A3D)],
                      begin: Alignment.topLeft,
                      end: Alignment.bottomRight,
                    ),
                    borderRadius: BorderRadius.circular(20),
                    boxShadow: const [
                      BoxShadow(
                        color: Color(0x33FF8A3D),
                        blurRadius: 12,
                        offset: Offset(0, 4),
                      ),
                    ],
                  ),
                  child: Row(
                    children: [
                      // Avatar circle
                      Container(
                        width: 54,
                        height: 54,
                        decoration: BoxDecoration(
                          color: const Color(0x4DFFFFFF),
                          shape: BoxShape.circle,
                          border: Border.all(
                            color: Colors.white,
                            width: 2,
                          ),
                        ),
                        alignment: Alignment.center,
                        child: (pet?.emoji != null &&
                                (pet!.emoji.startsWith('http') ||
                                    pet.emoji.startsWith('data:')))
                            ? ClipOval(
                                child: Image.network(
                                  pet.emoji,
                                  width: 54,
                                  height: 54,
                                  fit: BoxFit.cover,
                                  errorBuilder: (_, __, ___) => const Icon(
                                    Icons.pets,
                                    color: Colors.white,
                                    size: 24,
                                  ),
                                ),
                              )
                            : Text(
                                pet?.emoji ?? '🐾',
                                style: const TextStyle(fontSize: 28),
                              ),
                      ),
                      const SizedBox(width: 14),
                      // User info
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            const Text(
                              '铲屎官',
                              style: TextStyle(
                                fontSize: 18,
                                fontWeight: FontWeight.w900,
                                color: Colors.white,
                              ),
                            ),
                            const SizedBox(height: 2),
                            const Text(
                              '📱 138****8000',
                              style: TextStyle(
                                fontSize: 12,
                                color: Color(0xD9FFFFFF),
                              ),
                            ),
                            if (pet != null) ...[
                              const SizedBox(height: 2),
                              Text(
                                '🐾 ${pet.name} · 相伴 ${pet.daysTogether} 天',
                                style: const TextStyle(
                                  fontSize: 11,
                                  color: Color(0xBFFFFFFF),
                                ),
                              ),
                            ],
                          ],
                        ),
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: 12),

                // ── VIP Card (matching admin dark gradient) ──
                GestureDetector(
                  onTap: () => _showTip(context, '会员功能即将上线'),
                  child: Container(
                    padding: const EdgeInsets.symmetric(
                      horizontal: 16,
                      vertical: 14,
                    ),
                    decoration: BoxDecoration(
                      gradient: const LinearGradient(
                        colors: [Color(0xFF1F1F1F), Color(0xFF3D2C1E)],
                        begin: Alignment.topLeft,
                        end: Alignment.bottomRight,
                      ),
                      borderRadius: BorderRadius.circular(16),
                      border: Border.all(
                        color: const Color(0x40FFB23F),
                      ),
                      boxShadow: const [
                        BoxShadow(
                          color: Color(0x26000000),
                          blurRadius: 12,
                          offset: Offset(0, 4),
                        ),
                      ],
                    ),
                    child: Row(
                      children: [
                        Container(
                          width: 42,
                          height: 42,
                          decoration: BoxDecoration(
                            gradient: const LinearGradient(
                              colors: [Color(0xFFFFD700), Color(0xFFFF8A3D)],
                            ),
                            borderRadius: BorderRadius.circular(12),
                          ),
                          alignment: Alignment.center,
                          child: const Text(
                            '👑',
                            style: TextStyle(fontSize: 20),
                          ),
                        ),
                        const SizedBox(width: 12),
                        const Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                '小爪会员',
                                style: TextStyle(
                                  fontSize: 14,
                                  fontWeight: FontWeight.w900,
                                  color: Color(0xFFFFD700),
                                ),
                              ),
                              SizedBox(height: 1),
                              Text(
                                '开通会员享更多专属权益 ✨',
                                style: TextStyle(
                                  fontSize: 11,
                                  color: Color(0xFFC0A080),
                                ),
                              ),
                            ],
                          ),
                        ),
                        const Icon(
                          Icons.chevron_right,
                          color: Color(0xFFFFD700),
                          size: 20,
                        ),
                      ],
                    ),
                  ),
                ),
                const SizedBox(height: 12),

                // ── My Orders Card (matching admin design) ──
                Container(
                  padding: const EdgeInsets.all(14),
                  decoration: BoxDecoration(
                    color: Colors.white,
                    borderRadius: BorderRadius.circular(18),
                    border: Border.all(color: const Color(0xFFFFE7D1)),
                  ),
                  child: Column(
                    children: [
                      // Title row
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          const Text(
                            '🛍️ 我的订单',
                            style: TextStyle(
                              fontSize: 13,
                              fontWeight: FontWeight.w900,
                              color: Color(0xFF2D2621),
                            ),
                          ),
                          GestureDetector(
                            onTap: () =>
                                _showTip(context, '暂无订单记录'),
                            child: const Row(
                              children: [
                                Text(
                                  '查看全部',
                                  style: TextStyle(
                                    fontSize: 11,
                                    fontWeight: FontWeight.w700,
                                    color: Color(0xFFFF8A3D),
                                  ),
                                ),
                                Icon(
                                  Icons.chevron_right,
                                  size: 14,
                                  color: Color(0xFFFF8A3D),
                                ),
                              ],
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 12),
                      // Order status icons row
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          _OrderStatusItem(
                            icon: '🪙',
                            label: '待付款',
                            count: 0,
                          ),
                          _OrderStatusItem(
                            icon: '📦',
                            label: '待发货',
                            count: 0,
                          ),
                          _OrderStatusItem(
                            icon: '🚚',
                            label: '待收货',
                            count: 0,
                          ),
                          _OrderStatusItem(
                            icon: '🔄',
                            label: '退款/售后',
                            count: 0,
                          ),
                        ],
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: 12),

                // ── Pet Management Entry (matching admin) ──
                GestureDetector(
                  onTap: () => Navigator.of(context).push(
                    MaterialPageRoute(
                      builder: (_) => const PetEditPage(),
                    ),
                  ),
                  child: Container(
                    padding: const EdgeInsets.all(16),
                    decoration: BoxDecoration(
                      color: Colors.white,
                      borderRadius: BorderRadius.circular(18),
                      border: Border.all(color: const Color(0xFFFFE7D1)),
                    ),
                    child: Row(
                      children: [
                        Container(
                          width: 48,
                          height: 48,
                          decoration: BoxDecoration(
                            color: const Color(0xFFFEF3C6),
                            borderRadius: BorderRadius.circular(14),
                          ),
                          alignment: Alignment.center,
                          child: Text(
                            pet?.emoji ?? '🐾',
                            style: const TextStyle(fontSize: 22),
                          ),
                        ),
                        const SizedBox(width: 12),
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              const Text(
                                '🐾 宠物管理',
                                style: TextStyle(
                                  fontSize: 14,
                                  fontWeight: FontWeight.w800,
                                  color: Color(0xFF2D2621),
                                ),
                              ),
                              const SizedBox(height: 2),
                              Text(
                                pet != null
                                    ? '${pet.name} · ${pet.type} · ${pet.breed} · ${pet.weight}kg'
                                    : '管理与添加您的爱宠档案',
                                style: const TextStyle(
                                  fontSize: 11,
                                  color: Color(0xFF999999),
                                ),
                              ),
                            ],
                          ),
                        ),
                        const Icon(
                          Icons.chevron_right,
                          color: Color(0xFFC0A080),
                          size: 20,
                        ),
                      ],
                    ),
                  ),
                ),
                const SizedBox(height: 12),

                // ── Menu Section: Account ──
                _MenuSection(
                  title: '账户',
                  items: [
                    _MenuItem(
                      icon: '🌐',
                      title: '切换语言',
                      subtitle: '简体中文',
                      onTap: () => _showTip(context, '语言切换'),
                    ),
                    _MenuItem(
                      icon: '🔐',
                      title: '设置密码',
                      subtitle: '修改或设置登录密码',
                      onTap: () => _showTip(context, '密码设置'),
                    ),
                  ],
                ),
                const SizedBox(height: 8),

                // ── Menu Section: Services ──
                _MenuSection(
                  title: '服务',
                  items: [
                    _MenuItem(
                      icon: '💬',
                      title: '意见反馈',
                      subtitle: '帮助我们变得更好',
                      onTap: () => _showTip(context, '意见反馈'),
                    ),
                    _MenuItem(
                      icon: '⭐',
                      title: '评价我们',
                      subtitle: '给个五星好评吧～',
                      onTap: () => _showTip(context, '评价我们'),
                    ),
                    _MenuItem(
                      icon: '📋',
                      title: '用户协议',
                      subtitle: '查看服务条款与隐私政策',
                      onTap: () => _showTip(context, '用户协议'),
                    ),
                    _MenuItem(
                      icon: 'ℹ️',
                      title: '关于我们',
                      subtitle: '小爪宠物管家 v1.0.0',
                      onTap: () => _showTip(context, '关于我们'),
                    ),
                  ],
                ),
                const SizedBox(height: 16),

                // ── Logout Button ──
                SizedBox(
                  width: double.infinity,
                  child: TextButton(
                    onPressed: () => _showLogoutDialog(context),
                    style: TextButton.styleFrom(
                      backgroundColor: const Color(0xFFFF4D4F),
                      padding: const EdgeInsets.symmetric(vertical: 14),
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(14),
                      ),
                    ),
                    child: const Text(
                      '退出登录',
                      style: TextStyle(
                        fontSize: 16,
                        fontWeight: FontWeight.w900,
                        color: Colors.white,
                      ),
                    ),
                  ),
                ),
                const SizedBox(height: 20),
              ],
            ),
          ),
        ),
      ),
    );
  }

  void _showTip(BuildContext context, String title) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text('$title — 功能已进入演示模式 🐾'),
        behavior: SnackBarBehavior.floating,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
      ),
    );
  }

  void _showLogoutDialog(BuildContext context) {
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        backgroundColor: Colors.white,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
        title: const Text(
          '退出登录？',
          style: TextStyle(
            fontWeight: FontWeight.w800,
            color: AppColors.textDark,
          ),
        ),
        content: const Text(
          '退出后需要重新登录才能使用',
          style: TextStyle(color: AppColors.textMuted),
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
              context.read<AppProvider>().logout();
              Navigator.of(ctx).pop();
              Navigator.of(context)
                  .pushNamedAndRemoveUntil('/', (route) => false);
            },
            child: const Text(
              '退出',
              style: TextStyle(
                color: Color(0xFFFF6B6B),
                fontWeight: FontWeight.w600,
              ),
            ),
          ),
        ],
      ),
    );
  }
}

// ── Helper Widgets ──

class _OrderStatusItem extends StatelessWidget {
  final String icon;
  final String label;
  final int count;

  const _OrderStatusItem({
    required this.icon,
    required this.label,
    required this.count,
  });

  @override
  Widget build(BuildContext context) {
    return Expanded(
      child: GestureDetector(
        onTap: () {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(
              content: Text('$label — 暂无数据'),
              behavior: SnackBarBehavior.floating,
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(12),
              ),
            ),
          );
        },
        child: Column(
          children: [
            Stack(
              clipBehavior: Clip.none,
              children: [
                Text(icon, style: const TextStyle(fontSize: 22)),
                if (count > 0)
                  Positioned(
                    top: -4,
                    right: -8,
                    child: Container(
                      width: 16,
                      height: 16,
                      decoration: BoxDecoration(
                        color: const Color(0xFFEF4444),
                        shape: BoxShape.circle,
                        boxShadow: const [
                          BoxShadow(
                            color: Color(0x4DEF4444),
                            blurRadius: 4,
                            offset: Offset(0, 2),
                          ),
                        ],
                      ),
                      alignment: Alignment.center,
                      child: Text(
                        '$count',
                        style: const TextStyle(
                          fontSize: 9,
                          fontWeight: FontWeight.w900,
                          color: Colors.white,
                        ),
                      ),
                    ),
                  ),
              ],
            ),
            const SizedBox(height: 4),
            Text(
              label,
              style: const TextStyle(
                fontSize: 11,
                fontWeight: FontWeight.w700,
                color: Color(0xFF555555),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _MenuSection extends StatelessWidget {
  final String title;
  final List<_MenuItem> items;

  const _MenuSection({required this.title, required this.items});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(18),
        border: Border.all(color: const Color(0xFFFFE7D1)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            title,
            style: const TextStyle(
              fontSize: 11,
              fontWeight: FontWeight.w700,
              color: Color(0xFFC0A080),
            ),
          ),
          const SizedBox(height: 8),
          ...items.asMap().entries.map((entry) {
            final isLast = entry.key == items.length - 1;
            return Column(
              children: [
                GestureDetector(
                  onTap: entry.value.onTap,
                  child: Padding(
                    padding: const EdgeInsets.symmetric(vertical: 10),
                    child: Row(
                      children: [
                        Text(
                          entry.value.icon,
                          style: const TextStyle(fontSize: 18),
                        ),
                        const SizedBox(width: 10),
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                entry.value.title,
                                style: const TextStyle(
                                  fontSize: 13,
                                  fontWeight: FontWeight.w600,
                                  color: Color(0xFF2D2621),
                                ),
                              ),
                              Text(
                                entry.value.subtitle,
                                style: const TextStyle(
                                  fontSize: 11,
                                  color: Color(0xFF999999),
                                ),
                              ),
                            ],
                          ),
                        ),
                        const Icon(
                          Icons.chevron_right,
                          color: Color(0xFFD1C0B0),
                          size: 18,
                        ),
                      ],
                    ),
                  ),
                ),
                if (!isLast)
                  const Divider(
                    height: 1,
                    color: Color(0xFFF9F2EB),
                  ),
              ],
            );
          }),
        ],
      ),
    );
  }
}

class _MenuItem {
  final String icon;
  final String title;
  final String subtitle;
  final VoidCallback onTap;

  const _MenuItem({
    required this.icon,
    required this.title,
    required this.subtitle,
    required this.onTap,
  });
}

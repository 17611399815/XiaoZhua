import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../theme/app_theme.dart';
import '../../services/app_provider.dart';
class ProfilePage extends StatelessWidget {
  const ProfilePage({super.key});

  @override
  Widget build(BuildContext context) {
    final provider = context.watch<AppProvider>();
    final pet = provider.currentPet;

    return Scaffold(
      backgroundColor: AppColors.backgroundLight,
      appBar: AppBar(
        title: const Text(
          '个人',
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
              child: const Icon(Icons.settings_outlined, size: 20, color: AppColors.primaryDark),
            ),
          ),
        ],
      ),
      body: SingleChildScrollView(
        child: Column(
          children: [
            // Profile header
            Container(
              margin: const EdgeInsets.all(16),
              padding: const EdgeInsets.all(20),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(24),
                boxShadow: const [
                  BoxShadow(color: Color(0x26F5A821), blurRadius: 12, offset: Offset(0, 4)),
                ],
              ),
              child: Column(
                children: [
                  // Pet avatar
                  Stack(
                    children: [
                      Container(
                        width: 80, height: 80,
                        decoration: BoxDecoration(
                          color: AppColors.primaryLight,
                          borderRadius: BorderRadius.circular(24),
                          border: Border.all(color: AppColors.primary, width: 3),
                        ),
                        alignment: Alignment.center,
                        child: Text(pet?.emoji ?? '🐾', style: const TextStyle(fontSize: 40)),
                      ),
                      Positioned(
                        bottom: 0,
                        right: 0,
                        child: Container(
                          width: 28, height: 28,
                          decoration: BoxDecoration(
                            color: AppColors.primary,
                            borderRadius: BorderRadius.circular(8),
                          ),
                          child: const Icon(Icons.camera_alt, color: Colors.white, size: 14),
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 12),
                  Text(
                    pet?.name ?? '毛孩子',
                    style: const TextStyle(fontSize: 20, fontWeight: FontWeight.w900, color: AppColors.textDark),
                  ),
                  const SizedBox(height: 2),
                  Text(
                    '${pet?.type ?? '宠物'} · 相伴 ${pet?.daysTogether ?? 0} 天',
                    style: const TextStyle(fontSize: 13, color: AppColors.textMuted),
                  ),
                  const SizedBox(height: 12),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      _buildStatItem('体重', '${pet?.weight.toStringAsFixed(1) ?? '0.0'} kg'),
                      _buildDivider(),
                      _buildStatItem('品种', pet?.breed.isNotEmpty == true ? pet!.breed : '未设置'),
                      _buildDivider(),
                      _buildStatItem('生日', pet?.birthday ?? '未知'),
                    ],
                  ),
                  const SizedBox(height: 12),
                  GestureDetector(
                    onTap: () {
                      // Switch pet
                      _showSwitchPetSheet(context);
                    },
                    child: Container(
                      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                      decoration: BoxDecoration(
                        color: AppColors.primaryLight,
                        borderRadius: BorderRadius.circular(12),
                      ),
                      child: const Row(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          Icon(Icons.swap_horiz, size: 16, color: AppColors.primaryDark),
                          SizedBox(width: 4),
                          Text('切换宠物', style: TextStyle(fontSize: 13, fontWeight: FontWeight.w600, color: AppColors.primaryDark)),
                        ],
                      ),
                    ),
                  ),
                ],
              ),
            ),
            // Menu sections
            _buildMenuSection(context, '账户管理', [
              (icon: Icons.person_outline, title: '个人信息', subtitle: '修改昵称和头像', route: null),
              (icon: Icons.pets, title: '我的宠物', subtitle: '管理宠物档案', route: '/pet-edit'),
              (icon: Icons.family_restroom, title: '家人共享', subtitle: '邀请家人一起照顾', route: null),
            ]),
            _buildMenuSection(context, '数据与服务', [
              (icon: Icons.cloud_sync, title: '数据同步', subtitle: '自动备份到云端', route: null),
              (icon: Icons.download, title: '导出数据', subtitle: '导出为PDF/Excel', route: null),
              (icon: Icons.notifications_outlined, title: '消息提醒', subtitle: '管理推送通知', route: '/message'),
            ]),
            _buildMenuSection(context, '其他', [
              (icon: Icons.help_outline, title: '帮助与反馈', subtitle: '常见问题和意见反馈', route: null),
              (icon: Icons.shield_outlined, title: '隐私设置', subtitle: '管理隐私和安全', route: null),
              (icon: Icons.info_outline, title: '关于小爪', subtitle: '版本 1.0.0', route: null),
            ]),
            // Logout
            Padding(
              padding: const EdgeInsets.all(16),
              child: SizedBox(
                width: double.infinity,
                child: TextButton(
                  onPressed: () {
                    showDialog(
                      context: context,
                      builder: (ctx) => AlertDialog(
                        backgroundColor: Colors.white,
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
                        title: const Text('退出登录？', style: TextStyle(fontWeight: FontWeight.w800, color: AppColors.textDark)),
                        content: const Text('退出后需要重新登录才能使用', style: TextStyle(color: AppColors.textMuted)),
                        actions: [
                          TextButton(
                            onPressed: () => Navigator.of(ctx).pop(),
                            child: const Text('取消', style: TextStyle(color: AppColors.textMuted, fontWeight: FontWeight.w600)),
                          ),
                          TextButton(
                            onPressed: () {
                              context.read<AppProvider>().logout();
                              Navigator.of(ctx).pop();
                              Navigator.of(context).pushNamedAndRemoveUntil('/', (route) => false);
                            },
                            child: const Text('退出', style: TextStyle(color: Color(0xFFFF6B6B), fontWeight: FontWeight.w600)),
                          ),
                        ],
                      ),
                    );
                  },
                  child: const Text(
                    '退出登录',
                    style: TextStyle(fontSize: 16, fontWeight: FontWeight.w600, color: Color(0xFFFF6B6B)),
                  ),
                ),
              ),
            ),
            const SizedBox(height: 20),
          ],
        ),
      ),
    );
  }

  Widget _buildStatItem(String label, String value) {
    return Column(
      children: [
        Text(value, style: const TextStyle(fontSize: 15, fontWeight: FontWeight.w700, color: AppColors.textDark)),
        const SizedBox(height: 2),
        Text(label, style: const TextStyle(fontSize: 11, color: AppColors.textMuted)),
      ],
    );
  }

  Widget _buildDivider() {
    return Container(
      width: 1, height: 30,
      color: Colors.grey.shade200,
      margin: const EdgeInsets.symmetric(horizontal: 16),
    );
  }

  Widget _buildMenuSection(BuildContext context, String title, List<({IconData icon, String title, String subtitle, String? route})> items) {
    return Container(
      margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 6),
      padding: const EdgeInsets.all(16),
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
          Text(title, style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w700, color: AppColors.textMuted)),
          const SizedBox(height: 12),
          ...items.map((item) => Padding(
            padding: const EdgeInsets.only(bottom: 4),
            child: ListTile(
              contentPadding: EdgeInsets.zero,
              leading: Container(
                width: 40, height: 40,
                decoration: BoxDecoration(
                  color: AppColors.primaryLight,
                  borderRadius: BorderRadius.circular(12),
                ),
                child: Icon(item.icon, size: 20, color: AppColors.primaryDark),
              ),
              title: Text(item.title, style: const TextStyle(fontSize: 15, fontWeight: FontWeight.w600, color: AppColors.textDark)),
              subtitle: Text(item.subtitle, style: const TextStyle(fontSize: 12, color: AppColors.textMuted)),
              trailing: const Icon(Icons.chevron_right, color: AppColors.textMuted, size: 20),
              onTap: () {
                if (item.route != null) {
                  Navigator.of(context).pushNamed(item.route!);
                } else {
                  _showMenuTip(context, item.title);
                }
              },
              minLeadingWidth: 0,
            ),
          )),
        ],
      ),
    );
  }

  void _showMenuTip(BuildContext context, String title) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(content: Text('$title 功能已进入演示模式')),
    );
  }
  void _showSwitchPetSheet(BuildContext context) {
    final provider = context.read<AppProvider>();
    final pets = provider.pets;
    final currentPet = provider.currentPet;

    showModalBottomSheet(
      context: context,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
      ),
      builder: (ctx) {
        return Container(
          padding: const EdgeInsets.all(20),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Center(
                child: Container(
                  width: 40, height: 4,
                  decoration: BoxDecoration(color: Colors.grey.shade300, borderRadius: BorderRadius.circular(2)),
                ),
              ),
              const SizedBox(height: 20),
              const Text('切换宠物', style: TextStyle(fontSize: 20, fontWeight: FontWeight.w900, color: AppColors.textDark)),
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
                      color: isActive ? AppColors.primaryLight : Colors.grey.shade50,
                      borderRadius: BorderRadius.circular(16),
                      border: Border.all(color: isActive ? AppColors.primary : Colors.transparent, width: 2),
                    ),
                    child: Row(
                      children: [
                        Container(
                          width: 48, height: 48,
                          decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(12)),
                          alignment: Alignment.center,
                          child: Text(pet.emoji, style: const TextStyle(fontSize: 28)),
                        ),
                        const SizedBox(width: 12),
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(pet.name, style: const TextStyle(fontSize: 16, fontWeight: FontWeight.w700, color: AppColors.textDark)),
                              Text('${pet.type} · 相伴 ${pet.daysTogether} 天', style: const TextStyle(fontSize: 12, color: AppColors.textMuted)),
                            ],
                          ),
                        ),
                        if (isActive)
                          const Icon(Icons.check_circle, color: AppColors.primary, size: 24),
                      ],
                    ),
                  ),
                );
              }),
              const SizedBox(height: 20),
            ],
          ),
        );
      },
    );
  }
}


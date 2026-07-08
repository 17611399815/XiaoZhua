import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../theme/app_theme.dart';
import '../../services/app_provider.dart';

class ProfilePreviewPage extends StatelessWidget {
  const ProfilePreviewPage({super.key});

  @override
  Widget build(BuildContext context) {
    final pet = context.watch<AppProvider>().pendingPet;
    final petName = pet?.name ?? '毛孩子';
    final petEmoji = pet?.emoji ?? '🐕';

    return Scaffold(
      body: Container(
        decoration: const BoxDecoration(
          gradient: LinearGradient(
            begin: Alignment.topCenter,
            end: Alignment.bottomCenter,
            colors: [
              Color(0xFFFFF8E1),
              Color(0xFFFFE0B2),
            ],
          ),
        ),
        child: SafeArea(
          child: Padding(
            padding: const EdgeInsets.symmetric(horizontal: 24),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                const SizedBox(height: 32),

                // 宠物大头像
                Center(
                  child: Container(
                    width: 160,
                    height: 160,
                    decoration: BoxDecoration(
                      shape: BoxShape.circle,
                      color: Colors.white,
                      boxShadow: [
                        BoxShadow(
                          color: AppColors.primary.withValues(alpha: 0.25),
                          blurRadius: 30,
                          spreadRadius: 4,
                          offset: const Offset(0, 8),
                        ),
                      ],
                    ),
                    alignment: Alignment.center,
                    child: Text(
                      petEmoji,
                      style: const TextStyle(fontSize: 80),
                    ),
                  ),
                ),
                const SizedBox(height: 32),

                // 欢迎文字
                const Text(
                  '欢迎加入小爪！',
                  textAlign: TextAlign.center,
                  style: TextStyle(
                    fontSize: 28,
                    fontWeight: FontWeight.w900,
                    color: Color(0xFF7B3306),
                  ),
                ),
                const SizedBox(height: 12),
                Text(
                  '$petName 的专属档案已建立 ✨',
                  textAlign: TextAlign.center,
                  style: const TextStyle(
                    fontSize: 16,
                    color: Color(0xFFBB4D00),
                    fontWeight: FontWeight.w600,
                  ),
                ),
                const SizedBox(height: 8),
                const Text(
                  '让我们开始记录美好时光吧',
                  textAlign: TextAlign.center,
                  style: TextStyle(
                    fontSize: 14,
                    color: Color(0xFF973C00),
                  ),
                ),
                const SizedBox(height: 32),

                // 状态列表
                AppCard(
                  padding: const EdgeInsets.all(16),
                  color: Colors.white.withValues(alpha: 0.85),
                  child: Column(
                    children: [
                      _buildStatusItem('宠物档案已完善'),
                      const SizedBox(height: 12),
                      _buildStatusItem('AI助理已准备就绪'),
                      const SizedBox(height: 12),
                      _buildStatusItem('多宠物管理已开启'),
                    ],
                  ),
                ),
                const SizedBox(height: 32),

                // 进入按钮
                PrimaryButton(
                  text: '进入小爪 →',
                  onPressed: () {
                    context.read<AppProvider>().completeRegistration();
                    Navigator.of(context).pushNamedAndRemoveUntil(
                      '/home',
                      (route) => false,
                    );
                  },
                ),
                const SizedBox(height: 24),
              ],
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildStatusItem(String text) {
    return Row(
      children: [
        Container(
          width: 24,
          height: 24,
          decoration: const BoxDecoration(
            color: Color(0xFF51CF66),
            shape: BoxShape.circle,
          ),
          child: const Icon(
            Icons.check,
            color: Colors.white,
            size: 16,
          ),
        ),
        const SizedBox(width: 12),
        Text(
          text,
          style: const TextStyle(
            fontSize: 14,
            fontWeight: FontWeight.w600,
            color: AppColors.textDark,
          ),
        ),
      ],
    );
  }
}

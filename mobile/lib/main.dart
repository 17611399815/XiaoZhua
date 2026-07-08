import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'theme/app_theme.dart';
import 'services/app_provider.dart';
import 'pages/login/phone_login_page.dart';
import 'pages/login/verify_code_page.dart';
import 'pages/login/profile_setup_page.dart';
import 'pages/login/pet_type_page.dart';
import 'pages/login/pet_detail_page.dart';
import 'pages/login/gender_page.dart';
import 'pages/login/weight_page.dart';
import 'pages/login/avatar_page.dart';
import 'pages/login/profile_preview_page.dart';
import 'pages/home_page.dart';
import 'pages/album/album_page.dart';
import 'pages/ai_assistant/ai_assistant_page.dart';
import 'pages/shop/shop_page.dart';
import 'pages/profile/profile_page.dart';
import 'pages/message/message_page.dart';
import 'pages/device/device_page.dart';
import 'pages/pet_edit/pet_edit_page.dart';
import 'pages/spa/spa_page.dart';

void main() {
  runApp(
    ChangeNotifierProvider(
      create: (_) => AppProvider(),
      child: const XiaoZhuaApp(),
    ),
  );
}

class XiaoZhuaApp extends StatelessWidget {
  const XiaoZhuaApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: '小爪',
      debugShowCheckedModeBanner: false,
      theme: ThemeData(
        colorScheme: ColorScheme.light(
          primary: AppColors.primary,
          onPrimary: Colors.white,
          secondary: AppColors.primaryDark,
          onSecondary: Colors.white,
          surface: AppColors.backgroundLight,
          onSurface: AppColors.textDark,
        ),
        useMaterial3: true,
        scaffoldBackgroundColor: AppColors.backgroundLight,
        splashColor: AppColors.primary.withValues(alpha: 0.12),
        highlightColor: AppColors.primary.withValues(alpha: 0.08),
      ),
      initialRoute: '/',
      onGenerateRoute: (settings) {
        switch (settings.name) {
          case '/':
            return MaterialPageRoute(
              builder: (_) => const PhoneLoginPage(),
            );
          case '/verify':
            final phone = settings.arguments as String? ?? '';
            return MaterialPageRoute(
              builder: (_) => VerifyCodePage(phoneNumber: phone),
            );
          case '/profile-setup':
            return MaterialPageRoute(
              builder: (_) => const ProfileSetupPage(),
            );
          case '/pet-type':
            return MaterialPageRoute(
              builder: (_) => const PetTypePage(),
            );
          case '/pet-detail':
            final args = settings.arguments as Map?;
            return MaterialPageRoute(
              builder: (_) => PetDetailPage(
                petType: args?['type'] as String? ?? '',
                petName: args?['name'] as String? ?? '',
              ),
            );
          case '/gender':
            return MaterialPageRoute(
              builder: (_) => const GenderPage(),
            );
          case '/weight':
            return MaterialPageRoute(
              builder: (_) => const WeightPage(),
            );
          case '/avatar':
            return MaterialPageRoute(
              builder: (_) => const AvatarPage(),
            );
          case '/profile-preview':
            return MaterialPageRoute(
              builder: (_) => const ProfilePreviewPage(),
            );
          case '/home':
            return MaterialPageRoute(
              builder: (_) => const MainNavigator(),
            );
          case '/message':
            return MaterialPageRoute(
              builder: (_) => const MessagePage(),
            );
          case '/device':
            return MaterialPageRoute(
              builder: (_) => const DevicePage(),
            );
          case '/pet-edit':
            return MaterialPageRoute(
              builder: (_) => const PetEditPage(),
            );
          case '/spa':
            return MaterialPageRoute(
              builder: (_) => const SpaPage(),
            );
          default:
            return MaterialPageRoute(
              builder: (_) => const PhoneLoginPage(),
            );
        }
      },
    );
  }
}

class MainNavigator extends StatefulWidget {
  const MainNavigator({super.key});

  @override
  State<MainNavigator> createState() => _MainNavigatorState();
}

class _MainNavigatorState extends State<MainNavigator> {
  int _currentIndex = 0;

  @override
  void initState() {
    super.initState();
    // Seed demo data after first frame
    WidgetsBinding.instance.addPostFrameCallback((_) {
      context.read<AppProvider>().seedDemoData();
    });
  }

  @override
  Widget build(BuildContext context) {
    final pages = [
      HomePage(onOpenAi: () => setState(() => _currentIndex = 2)),
      const ShopPage(),
      const AiAssistantPage(),
      const AlbumPage(),
      const ProfilePage(),
    ];

    return Scaffold(
      body: IndexedStack(
        index: _currentIndex,
        children: pages,
      ),
      bottomNavigationBar: Container(
        decoration: const BoxDecoration(
          color: Colors.white,
          boxShadow: [
            BoxShadow(
              color: AppColors.cardShadow,
              blurRadius: 22,
              offset: Offset(0, -8),
            ),
          ],
        ),
        child: NavigationBarTheme(
          data: NavigationBarThemeData(
            height: 66,
            indicatorColor: AppColors.primary.withValues(alpha: 0.18),
            labelTextStyle: WidgetStateProperty.resolveWith((states) {
              final selected = states.contains(WidgetState.selected);
              return TextStyle(
                fontSize: 12,
                fontWeight: selected ? FontWeight.w800 : FontWeight.w600,
                color: selected ? AppColors.primaryDark : AppColors.textMuted,
              );
            }),
            iconTheme: WidgetStateProperty.resolveWith((states) {
              final selected = states.contains(WidgetState.selected);
              return IconThemeData(
                size: selected ? 25 : 23,
                color: selected ? AppColors.primaryDark : AppColors.textMuted,
              );
            }),
          ),
          child: NavigationBar(
            selectedIndex: _currentIndex,
            onDestinationSelected: (i) => setState(() => _currentIndex = i),
            labelBehavior: NavigationDestinationLabelBehavior.alwaysShow,
            backgroundColor: Colors.white,
            elevation: 0,
            destinations: const [
              NavigationDestination(
                icon: Icon(Icons.home_outlined),
                selectedIcon: Icon(Icons.home),
                label: '首页',
              ),
              NavigationDestination(
                icon: Icon(Icons.shopping_bag_outlined),
                selectedIcon: Icon(Icons.shopping_bag),
                label: '商城',
              ),
              NavigationDestination(
                icon: _AiNavIcon(selected: false),
                selectedIcon: _AiNavIcon(selected: true),
                label: 'AI管家',
              ),
              NavigationDestination(
                icon: Icon(Icons.photo_album_outlined),
                selectedIcon: Icon(Icons.photo_album),
                label: '相册',
              ),
              NavigationDestination(
                icon: Icon(Icons.person_outlined),
                selectedIcon: Icon(Icons.person),
                label: '个人',
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class _AiNavIcon extends StatelessWidget {
  final bool selected;
  const _AiNavIcon({required this.selected});

  @override
  Widget build(BuildContext context) {
    final size = selected ? 48.0 : 40.0;
    return Container(
      width: size,
      height: size,
      decoration: BoxDecoration(
        shape: BoxShape.circle,
        gradient: const LinearGradient(
          colors: [AppColors.ai, AppColors.coral],
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
        boxShadow: selected
            ? [
                BoxShadow(
                  color: AppColors.ai.withValues(alpha: 0.35),
                  blurRadius: 14,
                  offset: const Offset(0, 6),
                ),
              ]
            : [
                BoxShadow(
                  color: AppColors.ai.withValues(alpha: 0.15),
                  blurRadius: 8,
                  offset: const Offset(0, 2),
                ),
              ],
      ),
      child: Icon(
        Icons.auto_awesome,
        color: Colors.white,
        size: selected ? 24 : 20,
      ),
    );
  }
}

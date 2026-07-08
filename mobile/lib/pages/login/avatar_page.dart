import 'dart:typed_data';
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:image_picker/image_picker.dart';
import '../../theme/app_theme.dart';
import '../../services/app_provider.dart';

class AvatarPage extends StatefulWidget {
  const AvatarPage({super.key});

  @override
  State<AvatarPage> createState() => _AvatarPageState();
}

class _AvatarPageState extends State<AvatarPage> {
  final ImagePicker _picker = ImagePicker();

  // 预设的 emoji 选项
  final List<String> _avatarOptions = const [
    '🐕', '🐩', '🐈', '🐇',
    '🐹', '🐰', '🦜', '🐠',
    '🦮', '🐕‍🦺', '🐈‍⬛', '🐢',
  ];

  String? _selectedAvatar;
  Uint8List? _pickedImageBytes;

  @override
  void initState() {
    super.initState();
    final existing = context.read<AppProvider>().pendingPet;
    if (existing != null && existing.emoji.isNotEmpty) {
      _selectedAvatar = existing.emoji;
    } else {
      _selectedAvatar = '🐕';
    }
  }

  Future<void> _pickFromGallery() async {
    try {
      final XFile? image = await _picker.pickImage(
        source: ImageSource.gallery,
        maxWidth: 512,
        maxHeight: 512,
        imageQuality: 85,
      );
      if (image != null) {
        final bytes = await image.readAsBytes();
        setState(() {
          _pickedImageBytes = bytes;
          // image path stored
          _selectedAvatar = null; // 取消 emoji 选择
        });
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('选择照片失败: $e'),
            duration: const Duration(seconds: 2),
          ),
        );
      }
    }
  }

  Future<void> _pickFromCamera() async {
    try {
      final XFile? image = await _picker.pickImage(
        source: ImageSource.camera,
        maxWidth: 512,
        maxHeight: 512,
        imageQuality: 85,
      );
      if (image != null) {
        final bytes = await image.readAsBytes();
        setState(() {
          _pickedImageBytes = bytes;
          // image path stored
          _selectedAvatar = null;
        });
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('拍照失败: $e'),
            duration: const Duration(seconds: 2),
          ),
        );
      }
    }
  }

  void _showPhotoSheet() {
    showModalBottomSheet<void>(
      context: context,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
      ),
      builder: (ctx) => Container(
        padding: const EdgeInsets.all(24),
        decoration: const BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
        ),
        child: SafeArea(
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              const Text(
                '选择照片',
                style: TextStyle(
                  fontSize: 18,
                  fontWeight: FontWeight.w900,
                  color: AppColors.textPrimary,
                ),
              ),
              const SizedBox(height: 20),
              ListTile(
                leading: Container(
                  width: 44, height: 44,
                  decoration: BoxDecoration(
                    color: AppColors.primaryLight,
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: const Icon(Icons.photo_camera, color: AppColors.primary),
                ),
                title: const Text('拍照'),
                trailing: const Icon(Icons.chevron_right, color: Colors.grey),
                onTap: () {
                  Navigator.of(ctx).pop();
                  _pickFromCamera();
                },
              ),
              ListTile(
                leading: Container(
                  width: 44, height: 44,
                  decoration: BoxDecoration(
                    color: AppColors.primaryLight,
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: const Icon(Icons.photo_library, color: AppColors.primary),
                ),
                title: const Text('从相册选择'),
                trailing: const Icon(Icons.chevron_right, color: Colors.grey),
                onTap: () {
                  Navigator.of(ctx).pop();
                  _pickFromGallery();
                },
              ),
              if (_pickedImageBytes != null)
                ListTile(
                  leading: Container(
                    width: 44, height: 44,
                    decoration: BoxDecoration(
                      color: Colors.red.shade50,
                      borderRadius: BorderRadius.circular(12),
                    ),
                    child: const Icon(Icons.delete_outline, color: Colors.red),
                  ),
                  title: const Text('移除照片'),
                  trailing: const Icon(Icons.chevron_right, color: Colors.grey),
                  onTap: () {
                    Navigator.of(ctx).pop();
                    setState(() {
                      _pickedImageBytes = null;
                      // reset
                      _selectedAvatar = '🐕';
                    });
                  },
                ),
            ],
          ),
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: LoginGradientBackground(
        child: SafeArea(
          child: Padding(
            padding: const EdgeInsets.symmetric(horizontal: 24),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const SizedBox(height: 16),
                Row(
                  children: const [
                    BackCircleButton(),
                    Spacer(),
                    ProgressDots(total: 5, current: 4),
                    Spacer(),
                  ],
                ),
                const SizedBox(height: 24),
                const Text(
                  '宠物头像',
                  style: AppTextStyles.titleLarge,
                ),
                const SizedBox(height: 4),
                const Text(
                  '选一个可爱的头像或上传照片',
                  style: AppTextStyles.subtitle,
                ),
                const SizedBox(height: 28),

                // 大的预览头像
                Center(
                  child: GestureDetector(
                    onTap: _showPhotoSheet,
                    child: Container(
                      width: 100,
                      height: 100,
                      decoration: BoxDecoration(
                        color: AppColors.primaryLight,
                        shape: BoxShape.circle,
                        border: Border.all(
                          color: AppColors.primary,
                          width: 4,
                        ),
                        boxShadow: [
                          BoxShadow(
                            color: AppColors.primary.withValues(alpha: 0.3),
                            blurRadius: 20,
                            spreadRadius: 2,
                            offset: const Offset(0, 6),
                          ),
                        ],
                      ),
                      alignment: Alignment.center,
                      clipBehavior: Clip.antiAlias,
                      child: _pickedImageBytes != null
                          ? Image.memory(
                              _pickedImageBytes!,
                              width: 100,
                              height: 100,
                              fit: BoxFit.cover,
                            )
                          : Text(
                              _selectedAvatar ?? '🐕',
                              style: const TextStyle(fontSize: 48),
                            ),
                    ),
                  ),
                ),
                const SizedBox(height: 24),

                // Emoji 网格选择
                AppCard(
                  padding: const EdgeInsets.all(16),
                  color: Colors.white,
                  child: GridView.builder(
                    shrinkWrap: true,
                    physics: const NeverScrollableScrollPhysics(),
                    gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                      crossAxisCount: 4,
                      mainAxisSpacing: 8,
                      crossAxisSpacing: 8,
                    ),
                    itemCount: _avatarOptions.length,
                    itemBuilder: (context, index) {
                      final emoji = _avatarOptions[index];
                      final isSelected = _selectedAvatar == emoji;
                      return GestureDetector(
                        onTap: () {
                          setState(() {
                            _selectedAvatar = emoji;
                            _pickedImageBytes = null;
                            // reset
                          });
                        },
                        child: Container(
                          decoration: BoxDecoration(
                            color: isSelected
                                ? AppColors.primaryLight
                                : Colors.grey.shade50,
                            borderRadius: BorderRadius.circular(12),
                            border: Border.all(
                              color: isSelected
                                  ? AppColors.primary
                                  : Colors.transparent,
                              width: 2,
                            ),
                          ),
                          alignment: Alignment.center,
                          child: Text(
                            emoji,
                            style: const TextStyle(fontSize: 28),
                          ),
                        ),
                      );
                    },
                  ),
                ),
                const SizedBox(height: 16),

                // 从相册选择照片
                DashedBorderButton(
                  text: _pickedImageBytes != null ? '更换照片' : '从相册选择照片',
                  icon: const Icon(Icons.photo_library_outlined, color: AppColors.primary, size: 20),
                  onTap: _showPhotoSheet,
                ),
                const SizedBox(height: 20),

                PrimaryButton(
                  text: '完成设置 🎉',
                  onPressed: () {
                    context.read<AppProvider>().updatePendingPet(
                          emoji: _selectedAvatar ?? '🐕',
                        );
                    Navigator.of(context).pushNamed('/profile-preview');
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
}

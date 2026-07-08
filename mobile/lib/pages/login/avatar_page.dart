import 'dart:typed_data';
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:image_picker/image_picker.dart';
import 'dart:convert';
import '../../theme/app_theme.dart';
import '../../services/app_provider.dart';

class AvatarPage extends StatefulWidget {
  const AvatarPage({super.key});

  @override
  State<AvatarPage> createState() => _AvatarPageState();
}

class _AvatarPageState extends State<AvatarPage> {
  final ImagePicker _picker = ImagePicker();

  final List<String> _emojiOptions = const [
    '🐕', '🐩', '🐈', '🐇',
    '🐹', '🐰', '🦜', '🐠',
    '🦮', '🐕‍🦺', '🐈‍⬛', '🐢',
  ];

  String _selectedAvatar = '🐕';
  Uint8List? _pickedImageBytes;

  @override
  void initState() {
    super.initState();
    final existing = context.read<AppProvider>().pendingPet;
    if (existing != null && existing.emoji.isNotEmpty) {
      _selectedAvatar = existing.emoji;
    }
  }

  bool get _hasPhoto =>
      _pickedImageBytes != null ||
      (_selectedAvatar.startsWith('http') || _selectedAvatar.startsWith('data:'));

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
          _selectedAvatar = '';
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
          _selectedAvatar = '';
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
                  width: 44,
                  height: 44,
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
                  width: 44,
                  height: 44,
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
              if (_hasPhoto)
                ListTile(
                  leading: Container(
                    width: 44,
                    height: 44,
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
                    ProgressDots(total: 7, current: 6),
                    Spacer(),
                    SizedBox(width: 40),
                  ],
                ),
                const SizedBox(height: 20),
                const Text(
                  '宠物头像',
                  style: TextStyle(
                    fontSize: 18,
                    fontWeight: FontWeight.w900,
                    color: Color(0xFF2D2621),
                  ),
                ),
                const SizedBox(height: 4),
                const Text(
                  '选一个可爱的头像或上传照片',
                  style: TextStyle(
                    fontSize: 12,
                    color: Color(0xFFA8621B),
                  ),
                ),
                const SizedBox(height: 24),

                // Large circular avatar preview (matching admin design)
                Center(
                  child: GestureDetector(
                    onTap: _showPhotoSheet,
                    child: Container(
                      width: 88,
                      height: 88,
                      decoration: BoxDecoration(
                        color: const Color(0xFFFEF3C6),
                        shape: BoxShape.circle,
                        border: Border.all(
                          color: const Color(0xFFFFB23F),
                          width: 4,
                        ),
                        boxShadow: const [
                          BoxShadow(
                            color: Color(0x4DFFB23F),
                            blurRadius: 20,
                            offset: Offset(0, 6),
                          ),
                        ],
                      ),
                      clipBehavior: Clip.antiAlias,
                      alignment: Alignment.center,
                      child: _pickedImageBytes != null
                          ? Image.memory(
                              _pickedImageBytes!,
                              width: 88,
                              height: 88,
                              fit: BoxFit.cover,
                            )
                          : _selectedAvatar.startsWith('http') ||
                                  _selectedAvatar.startsWith('data:')
                              ? Image.network(
                                  _selectedAvatar,
                                  width: 88,
                                  height: 88,
                                  fit: BoxFit.cover,
                                  errorBuilder: (_, __, ___) => Text(
                                    _selectedAvatar.isNotEmpty &&
                                            !_selectedAvatar.startsWith('http') &&
                                            !_selectedAvatar.startsWith('data:')
                                        ? _selectedAvatar
                                        : '🐕',
                                    style: const TextStyle(fontSize: 42),
                                  ),
                                )
                              : Text(
                                  _selectedAvatar.isNotEmpty
                                      ? _selectedAvatar
                                      : '🐕',
                                  style: const TextStyle(fontSize: 42),
                                ),
                    ),
                  ),
                ),
                const SizedBox(height: 12),

                // Upload / Change photo text (matching admin)
                Center(
                  child: GestureDetector(
                    onTap: _showPhotoSheet,
                    child: Text(
                      _hasPhoto ? '📷 更换照片' : '📷 上传头像',
                      style: const TextStyle(
                        fontSize: 12,
                        fontWeight: FontWeight.w700,
                        color: Color(0xFFFF8A3D),
                      ),
                    ),
                  ),
                ),
                const SizedBox(height: 20),

                // Emoji grid (matching admin design exactly)
                Container(
                  padding: const EdgeInsets.all(16),
                  decoration: BoxDecoration(
                    color: Colors.white,
                    borderRadius: BorderRadius.circular(20),
                    border: Border.all(color: const Color(0xFFFFE7D1)),
                    boxShadow: const [
                      BoxShadow(
                        color: Color(0x0A000000),
                        blurRadius: 4,
                        offset: Offset(0, 1),
                      ),
                    ],
                  ),
                  child: GridView.builder(
                    shrinkWrap: true,
                    physics: const NeverScrollableScrollPhysics(),
                    gridDelegate:
                        const SliverGridDelegateWithFixedCrossAxisCount(
                      crossAxisCount: 4,
                      mainAxisSpacing: 6,
                      crossAxisSpacing: 6,
                    ),
                    itemCount: _emojiOptions.length,
                    itemBuilder: (context, index) {
                      final emoji = _emojiOptions[index];
                      final isSelected = _selectedAvatar == emoji;
                      return GestureDetector(
                        onTap: () {
                          setState(() {
                            _selectedAvatar = emoji;
                            _pickedImageBytes = null;
                          });
                        },
                        child: Container(
                          height: 50,
                          decoration: BoxDecoration(
                            color: isSelected
                                ? const Color(0xFFFEF3C6)
                                : Colors.white,
                            borderRadius: BorderRadius.circular(12),
                            border: Border.all(
                              color: isSelected
                                  ? const Color(0xFFFFB23F)
                                  : const Color(0xFFFFE7D1),
                              width: isSelected ? 2 : 1,
                            ),
                            boxShadow: isSelected
                                ? const [
                                    BoxShadow(
                                      color: Color(0x40FFB23F),
                                      blurRadius: 10,
                                      offset: Offset(0, 3),
                                    ),
                                  ]
                                : const [
                                    BoxShadow(
                                      color: Color(0x0A000000),
                                      blurRadius: 3,
                                      offset: Offset(0, 1),
                                    ),
                                  ],
                          ),
                          alignment: Alignment.center,
                          child: Text(
                            emoji,
                            style: const TextStyle(fontSize: 24),
                          ),
                        ),
                      );
                    },
                  ),
                ),

                const SizedBox(height: 20),
                PrimaryButton(
                  text: '完成设置 🎉',
                  onPressed: () {
                    final finalEmoji = _pickedImageBytes != null
                        ? 'data:image/png;base64,${base64Encode(_pickedImageBytes!)}'
                        : _selectedAvatar;
                    context.read<AppProvider>().updatePendingPet(
                          emoji: finalEmoji,
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

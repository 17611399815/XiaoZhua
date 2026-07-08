import 'package:flutter/material.dart';
import '../../theme/app_theme.dart';

class AlbumPage extends StatefulWidget {
  const AlbumPage({super.key});

  @override
  State<AlbumPage> createState() => _AlbumPageState();
}

class _AlbumPageState extends State<AlbumPage> {
  // Simulated photo grid with placeholder colors
  final List<Map<String, String>> _photos = List.generate(
    20,
    (i) => {
      'label': '照片 ${i + 1}',
      'date': '${DateTime.now().month}月${(i % 30) + 1}日',
      'emoji': ['🐶', '🐱', '🐾', '📸', '🌳', '🏠', '🎂', '🛁'][i % 8],
    },
  );

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.backgroundLight,
      appBar: AppBar(
        title: const Text(
          '成长相册',
          style: TextStyle(fontSize: 18, fontWeight: FontWeight.w900, color: AppColors.primaryDark),
        ),
        centerTitle: true,
        backgroundColor: Colors.transparent,
        elevation: 0,
      ),
      body: Column(
        children: [
          // Monthly summary
          Container(
            margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(20),
              boxShadow: const [
                BoxShadow(color: Color(0x1A000000), blurRadius: 4, offset: Offset(0, 1)),
              ],
            ),
            child: Row(
              children: [
                Container(
                  width: 48, height: 48,
                  decoration: BoxDecoration(
                    color: const Color(0xFFF3E8FF),
                    borderRadius: BorderRadius.circular(14),
                  ),
                  alignment: Alignment.center,
                  child: const Text('📸', style: TextStyle(fontSize: 26)),
                ),
                const SizedBox(width: 12),
                const Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text('本月回顾', style: TextStyle(fontSize: 15, fontWeight: FontWeight.w800, color: AppColors.textDark)),
                      SizedBox(height: 2),
                      Text('共记录 15 个美好瞬间', style: TextStyle(fontSize: 13, color: AppColors.textMuted)),
                    ],
                  ),
                ),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                  decoration: BoxDecoration(
                    color: AppColors.primaryLight,
                    borderRadius: BorderRadius.circular(10),
                  ),
                  child: const Text('查看全部', style: TextStyle(fontSize: 12, fontWeight: FontWeight.w600, color: AppColors.primaryDark)),
                ),
              ],
            ),
          ),
          // Photo grid
          Expanded(
            child: GridView.builder(
              padding: const EdgeInsets.all(16),
              gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                crossAxisCount: 3,
                mainAxisSpacing: 10,
                crossAxisSpacing: 10,
                childAspectRatio: 0.9,
              ),
              itemCount: _photos.length,
              itemBuilder: (context, index) {
                final photo = _photos[index];
                // Different pastel colors for different photos
                final colors = [
                  const Color(0xFFFFE8D2), const Color(0xFFE8F3FF),
                  const Color(0xFFF0E8FF), const Color(0xFFFFF0CC),
                  const Color(0xFFE6FFF0), const Color(0xFFFFE8E8),
                  const Color(0xFFF3E8FF), const Color(0xFFFFF4E6),
                ];
                final color = colors[index % colors.length];

                return GestureDetector(
                  onTap: () => _showPhotoPreview(photo),
                  child: Container(
                    decoration: BoxDecoration(
                      color: color,
                      borderRadius: BorderRadius.circular(16),
                      boxShadow: const [
                        BoxShadow(color: Color(0x1A000000), blurRadius: 4, offset: Offset(0, 1)),
                      ],
                    ),
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Text(photo['emoji']!, style: const TextStyle(fontSize: 36)),
                        const SizedBox(height: 8),
                        Text(
                          photo['date']!,
                          style: const TextStyle(fontSize: 11, color: AppColors.textMuted, fontWeight: FontWeight.w500),
                        ),
                      ],
                    ),
                  ),
                );
              },
            ),
          ),
        ],
      ),
      floatingActionButton: GestureDetector(
        onTap: _addPhoto,
        child: Container(
          width: 56, height: 56,
          decoration: BoxDecoration(
            color: AppColors.primary,
            borderRadius: BorderRadius.circular(16),
            boxShadow: const [
              BoxShadow(color: Color(0x40FFB900), blurRadius: 12, offset: Offset(0, 4)),
            ],
          ),
          child: const Icon(Icons.add_a_photo, color: Colors.white, size: 28),
        ),
      ),
    );
  }
  void _showPhotoPreview(Map<String, String> photo) {
    showDialog(
      context: context,
      builder: (context) => Dialog(
        backgroundColor: Colors.white,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(24)),
        child: Padding(
          padding: const EdgeInsets.all(20),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Container(
                height: 220,
                decoration: BoxDecoration(color: const Color(0xFFFFE8D2), borderRadius: BorderRadius.circular(20)),
                alignment: Alignment.center,
                child: Text(photo['emoji']!, style: const TextStyle(fontSize: 72)),
              ),
              const SizedBox(height: 16),
              Text(photo['label']!, style: const TextStyle(fontSize: 18, fontWeight: FontWeight.w900, color: AppColors.textDark)),
              const SizedBox(height: 4),
              Text(photo['date']!, style: const TextStyle(fontSize: 13, color: AppColors.textMuted)),
              const SizedBox(height: 16),
              PrimaryButton(text: '关闭', onPressed: () => Navigator.of(context).pop()),
            ],
          ),
        ),
      ),
    );
  }

  void _addPhoto() {
    setState(() {
      _photos.insert(0, {
        'label': '新照片 ${_photos.length + 1}',
        'date': '今天',
        'emoji': '✨',
      });
    });
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(content: Text('已添加一张演示照片')),
    );
  }
}


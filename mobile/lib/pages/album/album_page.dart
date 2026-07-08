import 'package:flutter/material.dart';
import '../../theme/app_theme.dart';

class AlbumPage extends StatefulWidget {
  const AlbumPage({super.key});

  @override
  State<AlbumPage> createState() => _AlbumPageState();
}

class _AlbumPageState extends State<AlbumPage> {
  final List<Map<String, String>> _photos = [
    {
      'url':
          'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=200',
      'label': '阳光下的美喵 🐱'
    },
    {
      'url':
          'https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=200',
      'label': '学会握手了！🐶'
    },
    {
      'url':
          'https://images.unsplash.com/photo-1522850959074-3a7507729a9c?w=200',
      'label': '第一次洗澡 🛁'
    },
    {
      'url':
          'https://images.unsplash.com/photo-1504450758481-7338eba7524a?w=200',
      'label': '午后晒太阳 ☀️'
    },
  ];

  int _nextId = 4;

  void _addPhoto() {
    final urls = [
      'https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?w=200',
      'https://images.unsplash.com/photo-1574158622682-e40e69881006?w=200',
      'https://images.unsplash.com/photo-1518791841217-8f162f1e1131?w=200',
      'https://images.unsplash.com/photo-1573865526739-10659fec78a5?w=200',
    ];
    setState(() {
      _photos.insert(0, {
        'url': urls[_nextId % urls.length],
        'label': '新照片 #$_nextId',
      });
      _nextId++;
    });
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: const Text('已添加一张照片！📸'),
        behavior: SnackBarBehavior.floating,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFFAF6F0),
      body: SafeArea(
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // ── Top bar: photo count + add button (matching admin) ──
            Padding(
              padding: const EdgeInsets.fromLTRB(16, 12, 16, 8),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Text(
                    '📸 共 ${_photos.length} 张照片',
                    style: const TextStyle(
                      fontSize: 13,
                      fontWeight: FontWeight.w800,
                      color: Color(0xFF8C6239),
                    ),
                  ),
                  GestureDetector(
                    onTap: _addPhoto,
                    child: Container(
                      width: 36,
                      height: 36,
                      decoration: BoxDecoration(
                        gradient: const LinearGradient(
                          colors: [Color(0xFF6366F1), Color(0xFF8B5CF6)],
                        ),
                        borderRadius: BorderRadius.circular(12),
                        boxShadow: const [
                          BoxShadow(
                            color: Color(0x406366F1),
                            blurRadius: 10,
                            offset: Offset(0, 3),
                          ),
                        ],
                      ),
                      child: const Icon(
                        Icons.add,
                        color: Colors.white,
                        size: 18,
                      ),
                    ),
                  ),
                ],
              ),
            ),

            // ── 2-column photo grid (matching admin) ──
            Expanded(
              child: GridView.builder(
                padding: const EdgeInsets.fromLTRB(12, 4, 12, 16),
                gridDelegate:
                    const SliverGridDelegateWithFixedCrossAxisCount(
                  crossAxisCount: 2,
                  mainAxisSpacing: 10,
                  crossAxisSpacing: 10,
                  childAspectRatio: 0.85,
                ),
                itemCount: _photos.length,
                itemBuilder: (context, index) {
                  final photo = _photos[index];
                  return _buildPhotoCard(photo);
                },
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildPhotoCard(Map<String, String> photo) {
    return GestureDetector(
      onTap: () => _showPhotoPreview(photo),
      child: Container(
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(12),
          border: Border.all(color: const Color(0xFFFFE7D1)),
          boxShadow: const [
            BoxShadow(
              color: Color(0x0A000000),
              blurRadius: 4,
              offset: Offset(0, 2),
            ),
          ],
        ),
        clipBehavior: Clip.antiAlias,
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            // Image
            Expanded(
              child: Image.network(
                photo['url']!,
                fit: BoxFit.cover,
                errorBuilder: (_, __, ___) => Container(
                  color: const Color(0xFFFFF7ED),
                  alignment: Alignment.center,
                  child: const Icon(Icons.pets,
                      size: 36, color: Color(0xFFFFB23F)),
                ),
              ),
            ),
            // Label
            Padding(
              padding: const EdgeInsets.all(8),
              child: Text(
                photo['label']!,
                textAlign: TextAlign.center,
                style: const TextStyle(
                  fontSize: 10,
                  color: Color(0xFF666666),
                ),
                maxLines: 1,
                overflow: TextOverflow.ellipsis,
              ),
            ),
          ],
        ),
      ),
    );
  }

  void _showPhotoPreview(Map<String, String> photo) {
    showDialog(
      context: context,
      builder: (ctx) => Dialog(
        backgroundColor: Colors.white,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(24)),
        child: Padding(
          padding: const EdgeInsets.all(20),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              ClipRRect(
                borderRadius: BorderRadius.circular(20),
                child: Image.network(
                  photo['url']!,
                  height: 220,
                  fit: BoxFit.cover,
                  width: double.infinity,
                  errorBuilder: (_, __, ___) => Container(
                    height: 220,
                    decoration: BoxDecoration(
                      color: const Color(0xFFFFF7ED),
                      borderRadius: BorderRadius.circular(20),
                    ),
                    alignment: Alignment.center,
                    child: const Icon(Icons.image,
                        size: 64, color: Color(0xFFFFB23F)),
                  ),
                ),
              ),
              const SizedBox(height: 16),
              Text(
                photo['label']!,
                style: const TextStyle(
                  fontSize: 18,
                  fontWeight: FontWeight.w900,
                  color: AppColors.textDark,
                ),
              ),
              const SizedBox(height: 16),
              PrimaryButton(
                text: '关闭',
                onPressed: () => Navigator.of(context).pop(),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

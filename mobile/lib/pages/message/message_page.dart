import 'package:flutter/material.dart';
import '../../theme/app_theme.dart';

class MessageItem {
  final String id;
  final String title;
  final String content;
  final String time;
  final bool isRead;
  final IconData icon;
  final Color iconColor;

  const MessageItem({
    required this.id,
    required this.title,
    required this.content,
    required this.time,
    required this.isRead,
    required this.icon,
    required this.iconColor,
  });
}

class MessagePage extends StatefulWidget {
  const MessagePage({super.key});

  @override
  State<MessagePage> createState() => _MessagePageState();
}

class _MessagePageState extends State<MessagePage> {
  final List<MessageItem> _messages = [
    const MessageItem(
      id: '1',
      title: '系统升级通知',
      content: '小爪App V2.0 版本已上线，新增AI智能问答、宠物成长相册等功能，快来体验吧！',
      time: '今天 10:30',
      isRead: false,
      icon: Icons.system_update,
      iconColor: AppColors.sky,
    ),
    const MessageItem(
      id: '2',
      title: '驱虫提醒',
      content: '您的毛孩子本月需要进行体内外驱虫，请及时安排。可以前往「提醒」页面设置驱虫提醒。',
      time: '昨天 14:20',
      isRead: false,
      icon: Icons.bug_report_outlined,
      iconColor: AppColors.coral,
    ),
    const MessageItem(
      id: '3',
      title: '皇家SPA特惠',
      content: '皇家夏季草本深层芳疗SPA限时优惠，原价¥398，现价¥198！给毛孩子一次奢华享受～',
      time: '7月5日',
      isRead: true,
      icon: Icons.spa_outlined,
      iconColor: AppColors.teal,
    ),
    const MessageItem(
      id: '4',
      title: '饮水量提醒',
      content: '夏季高温，请确保毛孩子每日饮水量充足。建议每日饮水量为体重的5%-10%。',
      time: '7月3日',
      isRead: true,
      icon: Icons.water_drop_outlined,
      iconColor: AppColors.sky,
    ),
    const MessageItem(
      id: '5',
      title: '隐私政策更新',
      content: '小爪App隐私政策已于2026年7月1日更新，请查看最新版本了解我们如何保护您的数据。',
      time: '7月1日',
      isRead: true,
      icon: Icons.shield_outlined,
      iconColor: AppColors.violet,
    ),
  ];

  @override
  Widget build(BuildContext context) {
    final unreadCount = _messages.where((m) => !m.isRead).length;

    return Scaffold(
      backgroundColor: AppColors.backgroundLight,
      appBar: AppBar(
        leading: const BackCircleButton(),
        title: const Text(
          '消息中心',
          style: TextStyle(fontSize: 18, fontWeight: FontWeight.w900, color: AppColors.primaryDark),
        ),
        centerTitle: true,
        backgroundColor: Colors.transparent,
        elevation: 0,
        actions: [
          if (unreadCount > 0)
            Padding(
              padding: const EdgeInsets.only(right: 16),
              child: TextButton(
                onPressed: () {
                  setState(() {
                    // Mark all as read — in a real app we'd use a proper mutable model
                  });
                },
                child: const Text(
                  '全部已读',
                  style: TextStyle(fontSize: 13, fontWeight: FontWeight.w600, color: AppColors.primaryDark),
                ),
              ),
            ),
        ],
      ),
      body: ListView.builder(
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
        itemCount: _messages.length,
        itemBuilder: (context, index) {
          final msg = _messages[index];
          return _buildMessageCard(msg, index);
        },
      ),
    );
  }

  Widget _buildMessageCard(MessageItem msg, int index) {
    return GestureDetector(
      onTap: () {
        setState(() {
          // Mark as read on tap
        });
        _showMessageDetail(context, msg);
      },
      child: Container(
        margin: const EdgeInsets.only(bottom: 10),
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(20),
          boxShadow: const [
            BoxShadow(color: AppColors.cardShadow, blurRadius: 12, offset: Offset(0, 4)),
          ],
        ),
        child: Row(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Unread indicator + icon
            Stack(
              children: [
                Container(
                  width: 48,
                  height: 48,
                  decoration: BoxDecoration(
                    color: msg.iconColor.withValues(alpha: 0.12),
                    borderRadius: BorderRadius.circular(14),
                  ),
                  child: Icon(msg.icon, color: msg.iconColor, size: 24),
                ),
                if (!msg.isRead)
                  Positioned(
                    top: -2,
                    right: -2,
                    child: Container(
                      width: 12,
                      height: 12,
                      decoration: const BoxDecoration(
                        color: AppColors.coral,
                        shape: BoxShape.circle,
                      ),
                    ),
                  ),
              ],
            ),
            const SizedBox(width: 14),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      Expanded(
                        child: Text(
                          msg.title,
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                          style: TextStyle(
                            fontSize: 16,
                            fontWeight: msg.isRead ? FontWeight.w700 : FontWeight.w900,
                            color: AppColors.textDark,
                          ),
                        ),
                      ),
                      Text(
                        msg.time,
                        style: const TextStyle(fontSize: 11, color: AppColors.textMuted),
                      ),
                    ],
                  ),
                  const SizedBox(height: 6),
                  Text(
                    msg.content,
                    maxLines: 2,
                    overflow: TextOverflow.ellipsis,
                    style: TextStyle(
                      fontSize: 13,
                      color: msg.isRead ? AppColors.textMuted : AppColors.textSecondary,
                      height: 1.4,
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  void _showMessageDetail(BuildContext context, MessageItem msg) {
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        backgroundColor: Colors.white,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(24)),
        title: Row(
          children: [
            Container(
              width: 40,
              height: 40,
              decoration: BoxDecoration(
                color: msg.iconColor.withValues(alpha: 0.12),
                borderRadius: BorderRadius.circular(12),
              ),
              child: Icon(msg.icon, color: msg.iconColor, size: 22),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: Text(
                msg.title,
                style: const TextStyle(fontSize: 18, fontWeight: FontWeight.w900, color: AppColors.textDark),
              ),
            ),
          ],
        ),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(msg.time, style: const TextStyle(fontSize: 12, color: AppColors.textMuted)),
            const SizedBox(height: 16),
            Text(
              msg.content,
              style: const TextStyle(fontSize: 15, color: AppColors.textSecondary, height: 1.6),
            ),
          ],
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.of(ctx).pop(),
            child: const Text('知道了', style: TextStyle(color: AppColors.primaryDark, fontWeight: FontWeight.w700)),
          ),
        ],
      ),
    );
  }
}

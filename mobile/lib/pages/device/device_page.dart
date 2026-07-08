import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../theme/app_theme.dart';
import '../../services/app_provider.dart';

class DeviceInfo {
  final String id;
  final String name;
  final String type;
  final IconData icon;
  final Color color;
  final bool isOnline;
  final String? status;
  final String? subtitle;

  const DeviceInfo({
    required this.id,
    required this.name,
    required this.type,
    required this.icon,
    required this.color,
    required this.isOnline,
    this.status,
    this.subtitle,
  });
}

class DevicePage extends StatefulWidget {
  const DevicePage({super.key});

  @override
  State<DevicePage> createState() => _DevicePageState();
}

class _DevicePageState extends State<DevicePage> {
  final List<DeviceInfo> _devices = const [
    DeviceInfo(
      id: 'd1',
      name: '客厅摄像头',
      type: 'camera',
      icon: Icons.videocam,
      color: AppColors.sky,
      isOnline: true,
      status: '实时监控中',
      subtitle: '1080P · 语音对讲',
    ),
    DeviceInfo(
      id: 'd2',
      name: 'GPS定位器',
      type: 'tracker',
      icon: Icons.location_on,
      color: AppColors.teal,
      isOnline: true,
      status: '朝阳公园附近',
      subtitle: '电量 85% · 安全围栏已开启',
    ),
    DeviceInfo(
      id: 'd3',
      name: '智能喂食器',
      type: 'feeder',
      icon: Icons.restaurant,
      color: AppColors.primaryDark,
      isOnline: false,
      status: '离线',
      subtitle: '最后在线：2小时前',
    ),
    DeviceInfo(
      id: 'd4',
      name: '智能饮水机',
      type: 'water',
      icon: Icons.water_drop,
      color: AppColors.sky,
      isOnline: true,
      status: '水位正常',
      subtitle: '今日饮水量：380ml',
    ),
  ];

  @override
  Widget build(BuildContext context) {
    final pet = context.watch<AppProvider>().currentPet;

    return Scaffold(
      backgroundColor: AppColors.backgroundLight,
      appBar: AppBar(
        leading: const BackCircleButton(),
        title: const Text(
          '智能设备',
          style: TextStyle(fontSize: 18, fontWeight: FontWeight.w900, color: AppColors.primaryDark),
        ),
        centerTitle: true,
        backgroundColor: Colors.transparent,
        elevation: 0,
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Header card
            Container(
              padding: const EdgeInsets.all(20),
              decoration: BoxDecoration(
                gradient: const LinearGradient(
                  colors: [AppColors.ai, AppColors.violet],
                  begin: Alignment.topLeft,
                  end: Alignment.bottomRight,
                ),
                borderRadius: BorderRadius.circular(24),
                boxShadow: [
                  BoxShadow(
                    color: AppColors.ai.withValues(alpha: 0.25),
                    blurRadius: 18,
                    offset: const Offset(0, 8),
                  ),
                ],
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      Container(
                        width: 48,
                        height: 48,
                        decoration: BoxDecoration(
                          color: Colors.white.withValues(alpha: 0.2),
                          borderRadius: BorderRadius.circular(16),
                        ),
                        child: const Icon(Icons.devices, color: Colors.white, size: 26),
                      ),
                      const SizedBox(width: 14),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              '${pet?.name ?? '毛孩子'} 的设备',
                              style: const TextStyle(
                                fontSize: 18,
                                fontWeight: FontWeight.w900,
                                color: Colors.white,
                              ),
                            ),
                            const SizedBox(height: 4),
                            Text(
                              '${_devices.where((d) => d.isOnline).length} 台在线 · ${_devices.length} 台已绑定',
                              style: const TextStyle(
                                fontSize: 13,
                                color: Color(0xE0FFFFFF),
                                fontWeight: FontWeight.w600,
                              ),
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),
                ],
              ),
            ),
            const SizedBox(height: 20),

            // Device list
            const Text(
              '已绑定设备',
              style: TextStyle(fontSize: 16, fontWeight: FontWeight.w800, color: AppColors.textDark),
            ),
            const SizedBox(height: 12),
            ..._devices.map((device) => _buildDeviceCard(device)),

            const SizedBox(height: 24),

            // Bind new device button
            DashedBorderButton(
              text: '绑定新设备',
              icon: const Icon(Icons.add_link, color: AppColors.primary, size: 20),
              onTap: () => _showBindDeviceSheet(context),
            ),
            const SizedBox(height: 40),
          ],
        ),
      ),
    );
  }

  Widget _buildDeviceCard(DeviceInfo device) {
    return GestureDetector(
      onTap: () => _showDeviceDetail(context, device),
      child: Container(
        margin: const EdgeInsets.only(bottom: 10),
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(20),
          boxShadow: const [
            BoxShadow(color: AppColors.cardShadow, blurRadius: 10, offset: Offset(0, 4)),
          ],
        ),
        child: Row(
          children: [
            // Device icon
            Container(
              width: 52,
              height: 52,
              decoration: BoxDecoration(
                color: device.color.withValues(alpha: 0.12),
                borderRadius: BorderRadius.circular(16),
              ),
              child: Icon(device.icon, color: device.color, size: 26),
            ),
            const SizedBox(width: 14),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      Text(
                        device.name,
                        style: const TextStyle(
                          fontSize: 16,
                          fontWeight: FontWeight.w800,
                          color: AppColors.textDark,
                        ),
                      ),
                      const SizedBox(width: 8),
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                        decoration: BoxDecoration(
                          color: device.isOnline
                              ? AppColors.teal.withValues(alpha: 0.12)
                              : Colors.grey.shade100,
                          borderRadius: BorderRadius.circular(8),
                        ),
                        child: Text(
                          device.isOnline ? '在线' : '离线',
                          style: TextStyle(
                            fontSize: 11,
                            fontWeight: FontWeight.w700,
                            color: device.isOnline ? AppColors.teal : Colors.grey,
                          ),
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 4),
                  Text(
                    device.subtitle ?? '',
                    style: const TextStyle(fontSize: 12, color: AppColors.textMuted),
                  ),
                ],
              ),
            ),
            const Icon(Icons.chevron_right, color: AppColors.textMuted, size: 22),
          ],
        ),
      ),
    );
  }

  void _showDeviceDetail(BuildContext context, DeviceInfo device) {
    showModalBottomSheet(
      context: context,
      shape: const RoundedRectangleBorder(borderRadius: BorderRadius.vertical(top: Radius.circular(24))),
      builder: (ctx) => Container(
        padding: const EdgeInsets.all(24),
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
            Row(
              children: [
                Container(
                  width: 56,
                  height: 56,
                  decoration: BoxDecoration(
                    color: device.color.withValues(alpha: 0.12),
                    borderRadius: BorderRadius.circular(18),
                  ),
                  child: Icon(device.icon, color: device.color, size: 30),
                ),
                const SizedBox(width: 14),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(device.name, style: const TextStyle(fontSize: 20, fontWeight: FontWeight.w900, color: AppColors.textDark)),
                      const SizedBox(height: 4),
                      Text(device.status ?? '', style: const TextStyle(fontSize: 13, color: AppColors.textMuted)),
                    ],
                  ),
                ),
              ],
            ),
            const SizedBox(height: 20),
            const Divider(color: AppColors.divider),
            const SizedBox(height: 12),
            SizedBox(
              width: double.infinity,
              child: PrimaryButton(
                text: '设备设置',
                onPressed: () => Navigator.of(ctx).pop(),
              ),
            ),
            const SizedBox(height: 8),
            SizedBox(
              width: double.infinity,
              child: TextButton(
                onPressed: () {
                  Navigator.of(ctx).pop();
                  setState(() {
                    _devices.remove(device);
                  });
                },
                child: const Text('解绑设备', style: TextStyle(fontSize: 15, fontWeight: FontWeight.w600, color: Color(0xFFFF6B6B))),
              ),
            ),
            const SizedBox(height: 16),
          ],
        ),
      ),
    );
  }

  void _showBindDeviceSheet(BuildContext context) {
    showModalBottomSheet(
      context: context,
      shape: const RoundedRectangleBorder(borderRadius: BorderRadius.vertical(top: Radius.circular(24))),
      builder: (ctx) => Container(
        padding: const EdgeInsets.all(24),
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
            const Text('选择设备类型', style: TextStyle(fontSize: 20, fontWeight: FontWeight.w900, color: AppColors.textDark)),
            const SizedBox(height: 16),
            _buildBindOption(
              icon: Icons.videocam,
              label: '智能摄像头',
              color: AppColors.sky,
              onTap: () {
                Navigator.of(ctx).pop();
                ScaffoldMessenger.of(context).showSnackBar(
                  const SnackBar(content: Text('正在搜索附近的摄像头设备...')),
                );
              },
            ),
            _buildBindOption(
              icon: Icons.location_on,
              label: 'GPS定位器',
              color: AppColors.teal,
              onTap: () {
                Navigator.of(ctx).pop();
                ScaffoldMessenger.of(context).showSnackBar(
                  const SnackBar(content: Text('正在搜索附近的定位器设备...')),
                );
              },
            ),
            _buildBindOption(
              icon: Icons.restaurant,
              label: '智能喂食器',
              color: AppColors.primaryDark,
              onTap: () {
                Navigator.of(ctx).pop();
                ScaffoldMessenger.of(context).showSnackBar(
                  const SnackBar(content: Text('正在搜索附近的喂食器设备...')),
                );
              },
            ),
            _buildBindOption(
              icon: Icons.water_drop,
              label: '智能饮水机',
              color: AppColors.sky,
              onTap: () {
                Navigator.of(ctx).pop();
                ScaffoldMessenger.of(context).showSnackBar(
                  const SnackBar(content: Text('正在搜索附近的饮水机设备...')),
                );
              },
            ),
            const SizedBox(height: 20),
          ],
        ),
      ),
    );
  }

  Widget _buildBindOption({
    required IconData icon,
    required String label,
    required Color color,
    required VoidCallback onTap,
  }) {
    return ListTile(
      contentPadding: EdgeInsets.zero,
      leading: Container(
        width: 44, height: 44,
        decoration: BoxDecoration(
          color: color.withValues(alpha: 0.12),
          borderRadius: BorderRadius.circular(14),
        ),
        child: Icon(icon, color: color, size: 22),
      ),
      title: Text(label, style: const TextStyle(fontSize: 15, fontWeight: FontWeight.w700, color: AppColors.textDark)),
      trailing: const Icon(Icons.add_circle_outline, color: AppColors.primaryDark, size: 22),
      onTap: onTap,
    );
  }
}

import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../theme/app_theme.dart';
import '../../services/app_provider.dart';
import '../../models/reminder.dart';
import 'add_reminder_dialog.dart';

class ReminderListPage extends StatefulWidget {
  const ReminderListPage({super.key});

  @override
  State<ReminderListPage> createState() => _ReminderListPageState();
}

class _ReminderListPageState extends State<ReminderListPage> {
  final _titleCtrl = TextEditingController();
  String _type = 'vaccine';

  @override
  void dispose() {
    _titleCtrl.dispose();
    super.dispose();
  }

  void _addReminder() {
    final title = _titleCtrl.text.trim();
    if (title.isEmpty) return;
    final provider = context.read<AppProvider>();
    final typeMap = {'vaccine': ReminderType.vaccine, 'deworm': ReminderType.deworm, 'bath': ReminderType.bath};
    final typeStr = typeMap[_type] ?? ReminderType.custom;
    provider.addReminder(Reminder(
      id: 'r_${DateTime.now().millisecondsSinceEpoch}',
      petId: provider.currentPet!.id,
      title: title,
      type: typeStr,
      date: DateTime.now().add(const Duration(days: 3)),
      time: const TimeOfDay(hour: 9, minute: 0),
    ));
    _titleCtrl.clear();
    setState(() {});
  }

  @override
  Widget build(BuildContext context) {
    final provider = context.watch<AppProvider>();
    final reminders = provider.currentPetReminders;

    final typeLabels = {'vaccine': '💉 疫苗', 'deworm': '🐛 驱虫', 'bath': '🧼 洗澡', 'other': '📝 其他'};
    final typeOptions = typeLabels.entries.map((e) => DropdownMenuItem(value: e.key, child: Text(e.value, style: const TextStyle(fontSize: 13)))).toList();

    return Scaffold(
      backgroundColor: const Color(0xFFFAF6F0),
      appBar: AppBar(
        leading: const BackCircleButton(),
        title: const Text('日常提醒', style: TextStyle(fontSize: 15, fontWeight: FontWeight.w900, color: Color(0xFF2D2621))),
        centerTitle: true,
        backgroundColor: Colors.transparent,
        elevation: 0,
      ),
      body: Column(
        children: [
          // Add reminder form
          Container(
            margin: const EdgeInsets.symmetric(horizontal: 16),
            padding: const EdgeInsets.all(12),
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(16),
              border: Border.all(color: const Color(0xFFFFE7D1)),
            ),
            child: Column(
              children: [
                TextField(
                  controller: _titleCtrl,
                  decoration: InputDecoration(
                    hintText: '需要提醒什么事？(如：驱虫)',
                    hintStyle: const TextStyle(color: Color(0xFFC0A080)),
                    border: OutlineInputBorder(borderRadius: BorderRadius.circular(10), borderSide: const BorderSide(color: Color(0xFFEADEC9))),
                    contentPadding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
                    isDense: true,
                  ),
                ),
                const SizedBox(height: 10),
                Row(
                  children: [
                    Expanded(
                      child: Container(
                        padding: const EdgeInsets.symmetric(horizontal: 12),
                        decoration: BoxDecoration(borderRadius: BorderRadius.circular(10), border: Border.all(color: const Color(0xFFEADEC9))),
                        child: DropdownButtonHideUnderline(
                          child: DropdownButton<String>(
                            value: _type,
                            isExpanded: true,
                            items: typeOptions,
                            onChanged: (v) => setState(() => _type = v!),
                          ),
                        ),
                      ),
                    ),
                    const SizedBox(width: 10),
                    ElevatedButton(
                      onPressed: _addReminder,
                      style: ElevatedButton.styleFrom(
                        backgroundColor: const Color(0xFFFFB23F),
                        foregroundColor: Colors.white,
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                      ),
                      child: const Text('设提醒', style: TextStyle(fontWeight: FontWeight.w700)),
                    ),
                  ],
                ),
              ],
            ),
          ),
          const SizedBox(height: 12),
          // Reminders list
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 20),
            child: Row(
              children: [
                const Text('备忘清单', style: TextStyle(fontSize: 14, fontWeight: FontWeight.w700, color: Color(0xFF8C6239))),
                const Spacer(),
                TextButton(onPressed: () => showDialog(context: context, builder: (_) => const AddReminderDialog()), child: const Text('+ 添加', style: TextStyle(color: Color(0xFFFF8A3D)))),
              ],
            ),
          ),
          Expanded(
            child: reminders.isEmpty
                ? const Center(child: Text('暂无提醒，去添加一个吧 ⏰', style: TextStyle(color: Color(0xFF888888))))
                : ListView.builder(
                    padding: const EdgeInsets.symmetric(horizontal: 16),
                    itemCount: reminders.length,
                    itemBuilder: (context, i) {
                      final r = reminders[i];
                      return Container(
                        margin: const EdgeInsets.only(bottom: 8),
                        padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
                        decoration: BoxDecoration(
                          color: Colors.white,
                          borderRadius: BorderRadius.circular(14),
                          border: Border.all(color: const Color(0xFFFFE7D1)),
                        ),
                        child: Row(
                          children: [
                            GestureDetector(
                              onTap: () => context.read<AppProvider>().toggleReminderComplete(r.id),
                              child: Container(
                                width: 20, height: 20,
                                decoration: BoxDecoration(
                                  color: r.isCompleted ? const Color(0xFFFFB23F) : Colors.white,
                                  border: Border.all(color: r.isCompleted ? const Color(0xFFFFB23F) : const Color(0xFFD1D5DB), width: 2),
                                  borderRadius: BorderRadius.circular(6),
                                ),
                                child: r.isCompleted ? const Icon(Icons.check, size: 14, color: Colors.white) : null,
                              ),
                            ),
                            const SizedBox(width: 10),
                            Expanded(
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Text(
                                    '${ReminderType.getEmoji(r.type)} ${r.title}',
                                    style: TextStyle(
                                      fontWeight: FontWeight.w700,
                                      color: r.isCompleted ? const Color(0xFF999999) : const Color(0xFF333333),
                                      decoration: r.isCompleted ? TextDecoration.lineThrough : null,
                                    ),
                                  ),
                                  Text('计划时间: ${r.formattedDate} ${r.formattedTime}', style: const TextStyle(fontSize: 10, color: Color(0xFF999999))),
                                ],
                              ),
                            ),
                            Container(
                              padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                              decoration: BoxDecoration(
                                color: r.isCompleted ? Colors.grey.shade100 : const Color(0xFFFFF4DE),
                                borderRadius: BorderRadius.circular(6),
                              ),
                              child: Text(r.isCompleted ? '已完成' : '待办', style: TextStyle(fontSize: 10, fontWeight: FontWeight.w700, color: r.isCompleted ? Colors.grey : const Color(0xFFFF8A3D))),
                            ),
                          ],
                        ),
                      );
                    },
                  ),
          ),
        ],
      ),
    );
  }
}

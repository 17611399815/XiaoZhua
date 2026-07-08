import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../theme/app_theme.dart';
import '../../services/app_provider.dart';
import '../../models/weight_record.dart';

class WeightPage extends StatefulWidget {
  const WeightPage({super.key});

  @override
  State<WeightPage> createState() => _WeightPageState();
}

class _WeightPageState extends State<WeightPage> {
  final _inputCtrl = TextEditingController();

  @override
  void dispose() {
    _inputCtrl.dispose();
    super.dispose();
  }

  void _addRecord() {
    final w = double.tryParse(_inputCtrl.text.trim());
    if (w == null || w <= 0) return;
    final provider = context.read<AppProvider>();
    provider.addWeightRecord(
      WeightRecord(
        id: 'w_${DateTime.now().millisecondsSinceEpoch}',
        petId: provider.currentPet!.id,
        weight: w,
        date: DateTime.now(),
      ),
    );
    _inputCtrl.clear();
    setState(() {});
  }

  @override
  Widget build(BuildContext context) {
    final provider = context.watch<AppProvider>();
    final pet = provider.currentPet;
    final records = provider.currentPetWeightRecords;
    final lastRecord = records.isNotEmpty ? records.last : null;

    return Scaffold(
      backgroundColor: const Color(0xFFFAF6F0),
      appBar: AppBar(
        leading: const BackCircleButton(),
        title: const Text('体重监测', style: TextStyle(fontSize: 15, fontWeight: FontWeight.w900, color: Color(0xFF2D2621))),
        centerTitle: true,
        backgroundColor: Colors.transparent,
        elevation: 0,
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Current weight card
            Container(
              width: double.infinity,
              padding: const EdgeInsets.all(20),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(16),
                border: Border.all(color: const Color(0xFFFFE7D1)),
              ),
              child: Column(
                children: [
                  const Text('当前体重', style: TextStyle(fontSize: 12, color: Color(0xFF999999))),
                  const SizedBox(height: 4),
                  Text(
                    '${pet?.weight.toStringAsFixed(1) ?? '0.0'} KG',
                    style: const TextStyle(fontSize: 30, fontWeight: FontWeight.w900, color: Color(0xFFFF8A3D)),
                  ),
                  if (lastRecord != null) ...[
                    const SizedBox(height: 4),
                    Text('上次测量：${_formatDate(lastRecord.date)}', style: const TextStyle(fontSize: 11, color: Color(0xFFC09060))),
                  ],
                ],
              ),
            ),
            const SizedBox(height: 14),
            // Add record
            Container(
              padding: const EdgeInsets.all(14),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(16),
                border: Border.all(color: const Color(0xFFFFE7D1)),
              ),
              child: Row(
                children: [
                  Expanded(
                    child: TextField(
                      controller: _inputCtrl,
                      keyboardType: const TextInputType.numberWithOptions(decimal: true),
                      decoration: InputDecoration(
                        hintText: '新称重数字 (KG)',
                        hintStyle: const TextStyle(color: Color(0xFFC0A080)),
                        border: OutlineInputBorder(borderRadius: BorderRadius.circular(10), borderSide: const BorderSide(color: Color(0xFFEADEC9))),
                        contentPadding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
                        isDense: true,
                      ),
                    ),
                  ),
                  const SizedBox(width: 10),
                  ElevatedButton(
                    onPressed: _addRecord,
                    style: ElevatedButton.styleFrom(
                      backgroundColor: const Color(0xFFFFB23F),
                      foregroundColor: Colors.white,
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                      padding: const EdgeInsets.symmetric(horizontal: 18, vertical: 12),
                    ),
                    child: const Text('记录', style: TextStyle(fontWeight: FontWeight.w700)),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 16),
            const Text('测量历史', style: TextStyle(fontSize: 14, fontWeight: FontWeight.w700, color: Color(0xFF8C6239))),
            const SizedBox(height: 8),
            if (records.isEmpty)
              const Center(child: Padding(padding: EdgeInsets.all(20), child: Text('暂无记录', style: TextStyle(color: Color(0xFF999999)))))
            else
              Container(
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(14),
                  border: Border.all(color: const Color(0xFFFFE7D1)),
                ),
                child: ListView.separated(
                  shrinkWrap: true,
                  physics: const NeverScrollableScrollPhysics(),
                  itemCount: records.reversed.length,
                  separatorBuilder: (_, __) => const Divider(height: 1, color: Color(0xFFFFE7D1)),
                  itemBuilder: (context, i) {
                    final r = records.reversed.toList()[i];
                    return ListTile(
                      dense: true,
                      leading: const Icon(Icons.monitor_weight_outlined, color: Color(0xFFFF8A3D), size: 20),
                      title: Text('${r.weight} KG', style: const TextStyle(fontWeight: FontWeight.w600, color: Color(0xFF555555))),
                      trailing: Text(_formatDate(r.date), style: const TextStyle(fontSize: 11, color: Color(0xFF999999))),
                    );
                  },
                ),
              ),
          ],
        ),
      ),
    );
  }

  String _formatDate(DateTime d) => '${d.year}-${d.month.toString().padLeft(2, '0')}-${d.day.toString().padLeft(2, '0')}';
}

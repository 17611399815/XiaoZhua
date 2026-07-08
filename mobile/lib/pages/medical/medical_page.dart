import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../theme/app_theme.dart';
import '../../services/app_provider.dart';
import '../../models/medical_record.dart';
import '../../widgets/wheel_time_picker.dart';

class MedicalPage extends StatefulWidget {
  const MedicalPage({super.key});

  @override
  State<MedicalPage> createState() => _MedicalPageState();
}

class _MedicalPageState extends State<MedicalPage> {
  @override
  Widget build(BuildContext context) {
    final provider = context.watch<AppProvider>();
    final records = provider.currentPetMedicalRecords;

    return Scaffold(
      backgroundColor: AppColors.backgroundLight,
      appBar: AppBar(
        title: const Text(
          '宠物病历',
          style: TextStyle(fontSize: 18, fontWeight: FontWeight.w900, color: AppColors.primaryDark),
        ),
        centerTitle: true,
        backgroundColor: Colors.transparent,
        elevation: 0,
        leading: GestureDetector(
          onTap: () => Navigator.of(context).maybePop(),
          child: Container(
            margin: const EdgeInsets.all(8),
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(12),
              boxShadow: const [
                BoxShadow(color: Color(0x1A000000), blurRadius: 4, offset: Offset(0, 1)),
              ],
            ),
            child: const Icon(Icons.arrow_back_ios_new, color: AppColors.textDark, size: 16),
          ),
        ),
      ),
      body: records.isEmpty
          ? _buildEmptyState()
          : ListView.separated(
              padding: const EdgeInsets.all(16),
              itemCount: records.length,
              separatorBuilder: (_, __) => const SizedBox(height: 10),
              itemBuilder: (context, index) => _buildMedicalItem(records[index]),
            ),
      floatingActionButton: GestureDetector(
        onTap: () {
          showDialog(context: context, builder: (_) => const AddMedicalDialog());
        },
        child: Container(
          width: 56, height: 56,
          decoration: BoxDecoration(
            color: AppColors.primary,
            borderRadius: BorderRadius.circular(16),
            boxShadow: const [
              BoxShadow(color: Color(0x40FFB900), blurRadius: 12, offset: Offset(0, 4)),
            ],
          ),
          child: const Icon(Icons.add, color: Colors.white, size: 28),
        ),
      ),
    );
  }

  Widget _buildEmptyState() {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Container(
            width: 80, height: 80,
            decoration: BoxDecoration(color: const Color(0xFFFFE8E8), borderRadius: BorderRadius.circular(24)),
            child: const Icon(Icons.medical_services_outlined, size: 40, color: Color(0xFFFF6B6B)),
          ),
          const SizedBox(height: 16),
          const Text('还没有病历', style: TextStyle(fontSize: 16, fontWeight: FontWeight.w700, color: AppColors.textDark)),
          const SizedBox(height: 4),
          const Text('记录TA的就医历史～', style: TextStyle(fontSize: 13, color: AppColors.textMuted)),
        ],
      ),
    );
  }

  Widget _buildMedicalItem(MedicalRecord record) {
    return Container(
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        boxShadow: const [
          BoxShadow(color: Color(0x1A000000), blurRadius: 4, offset: Offset(0, 1)),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Container(
                width: 44, height: 44,
                decoration: BoxDecoration(color: const Color(0xFFFFE8E8), borderRadius: BorderRadius.circular(12)),
                alignment: Alignment.center,
                child: const Icon(Icons.medical_services_outlined, size: 24, color: Color(0xFFFF6B6B)),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(record.title, style: const TextStyle(fontSize: 15, fontWeight: FontWeight.w700, color: AppColors.textDark)),
                    const SizedBox(height: 2),
                    Text(record.formattedDate, style: const TextStyle(fontSize: 12, color: AppColors.textMuted)),
                  ],
                ),
              ),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                decoration: BoxDecoration(color: AppColors.primaryLight, borderRadius: BorderRadius.circular(10)),
                child: Text(record.hospital, style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w600, color: AppColors.primaryDark)),
              ),
            ],
          ),
          const SizedBox(height: 12),
          _buildDetailRow('症状', record.symptoms.isEmpty ? '无' : record.symptoms),
          const SizedBox(height: 6),
          _buildDetailRow('诊断', record.diagnosis.isEmpty ? '无' : record.diagnosis),
          const SizedBox(height: 6),
          _buildDetailRow('治疗', record.treatment.isEmpty ? '无' : record.treatment),
          const SizedBox(height: 6),
          _buildDetailRow('费用', record.cost.isEmpty ? '无' : record.cost),
        ],
      ),
    );
  }

  Widget _buildDetailRow(String label, String value) {
    return Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        SizedBox(
          width: 40,
          child: Text(label, style: const TextStyle(fontSize: 12, color: AppColors.textMuted)),
        ),
        Expanded(
          child: Text(value, style: const TextStyle(fontSize: 13, color: AppColors.textDark)),
        ),
      ],
    );
  }
}

class AddMedicalDialog extends StatefulWidget {
  const AddMedicalDialog({super.key});

  @override
  State<AddMedicalDialog> createState() => _AddMedicalDialogState();
}

class _AddMedicalDialogState extends State<AddMedicalDialog> {
  final TextEditingController _titleController = TextEditingController();
  final TextEditingController _hospitalController = TextEditingController();
  final TextEditingController _symptomsController = TextEditingController();
  final TextEditingController _diagnosisController = TextEditingController();
  final TextEditingController _treatmentController = TextEditingController();
  final TextEditingController _costController = TextEditingController();
  DateTime _date = DateTime.now();

  bool get _canSave => _titleController.text.trim().isNotEmpty;

  @override
  void dispose() {
    _titleController.dispose();
    _hospitalController.dispose();
    _symptomsController.dispose();
    _diagnosisController.dispose();
    _treatmentController.dispose();
    _costController.dispose();
    super.dispose();
  }

  Future<void> _pickDate() async {
    final picked = await WheelDateTimePicker.showDatePicker(
      context: context, initialDate: _date,
    );
    if (picked != null) setState(() => _date = picked);
  }

  void _save() {
    if (!_canSave) return;
    final provider = context.read<AppProvider>();
    final pet = provider.currentPet;
    if (pet == null) return;

    provider.addMedicalRecord(MedicalRecord(
      id: 'med_${DateTime.now().millisecondsSinceEpoch}',
      petId: pet.id,
      title: _titleController.text.trim(),
      date: _date,
      hospital: _hospitalController.text.trim(),
      symptoms: _symptomsController.text.trim(),
      diagnosis: _diagnosisController.text.trim(),
      treatment: _treatmentController.text.trim(),
      cost: _costController.text.trim(),
    ));
    Navigator.of(context).pop();
  }

  @override
  Widget build(BuildContext context) {
    return Dialog(
      backgroundColor: Colors.white,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(24)),
      child: Container(
        padding: const EdgeInsets.all(20),
        child: SingleChildScrollView(
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  const Text('新增病历', style: TextStyle(fontSize: 20, fontWeight: FontWeight.w800, color: AppColors.textDark)),
                  GestureDetector(
                    onTap: () => Navigator.of(context).pop(),
                    child: Container(
                      width: 32, height: 32,
                      decoration: BoxDecoration(color: Colors.grey.shade100, borderRadius: BorderRadius.circular(10)),
                      child: const Icon(Icons.close, color: AppColors.textMuted, size: 18),
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 16),
              _buildField('就诊标题 *', '如：年度体检、皮肤过敏...', _titleController, onChanged: (_) => setState(() {})),
              const SizedBox(height: 12),
              _buildField('医院/诊所', '如：友爱宠物医院', _hospitalController),
              const SizedBox(height: 12),
              _buildField('症状', '描述TA的症状...', _symptomsController),
              const SizedBox(height: 12),
              _buildField('诊断结果', '医生的诊断...', _diagnosisController),
              const SizedBox(height: 12),
              _buildField('治疗方案', '用药和护理方案...', _treatmentController),
              const SizedBox(height: 12),
              _buildField('费用', '如：¥680', _costController),
              const SizedBox(height: 16),
              GestureDetector(
                onTap: _pickDate,
                child: Container(
                  padding: const EdgeInsets.all(12),
                  decoration: BoxDecoration(color: AppColors.backgroundLight, borderRadius: BorderRadius.circular(14)),
                  child: Row(
                    children: [
                      const Icon(Icons.calendar_today, size: 14, color: AppColors.textMuted),
                      const SizedBox(width: 4),
                      const Text('就诊日期', style: TextStyle(fontSize: 11, color: AppColors.textMuted)),
                      const Spacer(),
                      Text(
                        '${_date.year}年${_date.month}月${_date.day}日',
                        style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w700, color: AppColors.textDark),
                      ),
                      const SizedBox(width: 4),
                      const Icon(Icons.chevron_right, color: AppColors.textMuted, size: 18),
                    ],
                  ),
                ),
              ),
              const SizedBox(height: 20),
              Row(
                children: [
                  Expanded(
                    child: TextButton(
                      onPressed: () => Navigator.of(context).pop(),
                      child: const Text('取消', style: TextStyle(fontSize: 16, fontWeight: FontWeight.w700, color: AppColors.textMuted)),
                    ),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: PrimaryButton(text: '保存', enabled: _canSave, onPressed: _save),
                  ),
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildField(String label, String hint, TextEditingController controller, {ValueChanged<String>? onChanged}) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(label, style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w700, color: AppColors.textDark)),
        const SizedBox(height: 8),
        Container(
          padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 4),
          decoration: BoxDecoration(color: AppColors.backgroundLight, borderRadius: BorderRadius.circular(14)),
          child: TextField(
            controller: controller,
            style: const TextStyle(fontSize: 15, color: AppColors.textDark),
            decoration: InputDecoration(
              border: InputBorder.none,
              hintText: hint,
              hintStyle: const TextStyle(fontSize: 14, color: AppColors.textMuted),
            ),
            onChanged: onChanged,
          ),
        ),
      ],
    );
  }
}

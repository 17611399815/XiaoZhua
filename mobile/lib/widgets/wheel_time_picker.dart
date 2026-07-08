import 'package:flutter/material.dart';
import '../theme/app_theme.dart';

class WheelPicker extends StatefulWidget {
  final List<String> items;
  final int initialIndex;
  final double itemHeight;
  final double itemWidth;
  final ValueChanged<int>? onSelectedItemChanged;
  final TextStyle? selectedStyle;
  final TextStyle? unselectedStyle;

  const WheelPicker({
    super.key,
    required this.items,
    this.initialIndex = 0,
    this.itemHeight = 44,
    this.itemWidth = 80,
    this.onSelectedItemChanged,
    this.selectedStyle,
    this.unselectedStyle,
  });

  @override
  State<WheelPicker> createState() => _WheelPickerState();
}

class _WheelPickerState extends State<WheelPicker> {
  late FixedExtentScrollController _controller;

  @override
  void initState() {
    super.initState();
    _controller = FixedExtentScrollController(initialItem: widget.initialIndex);
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final selectedTextStyle = widget.selectedStyle ??
        const TextStyle(
          fontSize: 20,
          fontWeight: FontWeight.w800,
          color: AppColors.textDark,
        );
    final unselectedTextStyle = widget.unselectedStyle ??
        const TextStyle(
          fontSize: 18,
          fontWeight: FontWeight.w500,
          color: AppColors.textMuted,
        );

    return SizedBox(
      width: widget.itemWidth,
      height: widget.itemHeight * 3,
      child: Stack(
        alignment: Alignment.center,
        children: [
          Container(
            height: widget.itemHeight,
            margin: const EdgeInsets.symmetric(horizontal: 4),
            decoration: BoxDecoration(
              color: AppColors.primaryLight.withValues(alpha: 0.4),
              borderRadius: BorderRadius.circular(12),
            ),
          ),
          ListWheelScrollView.useDelegate(
            controller: _controller,
            itemExtent: widget.itemHeight,
            diameterRatio: 1.5,
            perspective: 0.005,
            physics: const FixedExtentScrollPhysics(),
            onSelectedItemChanged: widget.onSelectedItemChanged,
            childDelegate: ListWheelChildBuilderDelegate(
              childCount: widget.items.length,
              builder: (context, index) {
                final isSelected = index == _controller.selectedItem;
                return Center(
                  child: Text(
                    widget.items[index],
                    style: isSelected ? selectedTextStyle : unselectedTextStyle,
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

enum WheelPickerMode {
  date,
  time,
  dateTime,
}

class WheelDateTimePicker {
  static Future<DateTime?> showDatePicker({
    required BuildContext context,
    DateTime? initialDate,
    DateTime? firstDate,
    DateTime? lastDate,
  }) async {
    final now = DateTime.now();
    final initial = initialDate ?? now;
    final first = firstDate ?? DateTime(now.year - 30, 1, 1);
    final last = lastDate ?? now;

    int selectedYear = initial.year;
    int selectedMonth = initial.month;
    int selectedDay = initial.day;

    final result = await showDialog<DateTime>(
      context: context,
      builder: (context) => _DatePickerDialog(
        initialYear: selectedYear,
        initialMonth: selectedMonth,
        initialDay: selectedDay,
        firstYear: first.year,
        lastYear: last.year,
        onChanged: (y, m, d) {
          selectedYear = y;
          selectedMonth = m;
          selectedDay = d;
        },
      ),
    );

    return result;
  }

  static Future<TimeOfDay?> showTimePicker({
    required BuildContext context,
    TimeOfDay? initialTime,
  }) async {
    final initial = initialTime ?? TimeOfDay.now();
    int selectedHour = initial.hour;
    int selectedMinute = initial.minute;

    final result = await showDialog<TimeOfDay>(
      context: context,
      builder: (context) => _TimePickerDialog(
        initialHour: selectedHour,
        initialMinute: selectedMinute,
        onChanged: (h, m) {
          selectedHour = h;
          selectedMinute = m;
        },
      ),
    );

    return result;
  }

  static Future<Map<String, dynamic>?> showDateTimePicker({
    required BuildContext context,
    DateTime? initialDate,
    TimeOfDay? initialTime,
  }) async {
    final now = DateTime.now();
    final initDate = initialDate ?? now;
    final initTime = initialTime ?? TimeOfDay.now();

    int selectedYear = initDate.year;
    int selectedMonth = initDate.month;
    int selectedDay = initDate.day;
    int selectedHour = initTime.hour;
    int selectedMinute = initTime.minute;

    final result = await showDialog<Map<String, dynamic>>(
      context: context,
      builder: (context) => _DateTimePickerDialog(
        initialYear: selectedYear,
        initialMonth: selectedMonth,
        initialDay: selectedDay,
        initialHour: selectedHour,
        initialMinute: selectedMinute,
        onDateChanged: (y, m, d) {
          selectedYear = y;
          selectedMonth = m;
          selectedDay = d;
        },
        onTimeChanged: (h, m) {
          selectedHour = h;
          selectedMinute = m;
        },
      ),
    );

    return result;
  }
}

class _DatePickerDialog extends StatefulWidget {
  final int initialYear;
  final int initialMonth;
  final int initialDay;
  final int firstYear;
  final int lastYear;
  final Function(int year, int month, int day) onChanged;

  const _DatePickerDialog({
    required this.initialYear,
    required this.initialMonth,
    required this.initialDay,
    required this.firstYear,
    required this.lastYear,
    required this.onChanged,
  });

  @override
  State<_DatePickerDialog> createState() => _DatePickerDialogState();
}

class _DatePickerDialogState extends State<_DatePickerDialog> {
  late int _year;
  late int _month;
  late int _day;

  @override
  void initState() {
    super.initState();
    _year = widget.initialYear;
    _month = widget.initialMonth;
    _day = widget.initialDay;
  }

  int _daysInMonth(int year, int month) {
    if (month == 2) {
      if ((year % 4 == 0 && year % 100 != 0) || year % 400 == 0) return 29;
      return 28;
    }
    if ([4, 6, 9, 11].contains(month)) return 30;
    return 31;
  }

  void _notify() {
    final maxDay = _daysInMonth(_year, _month);
    if (_day > maxDay) _day = maxDay;
    widget.onChanged(_year, _month, _day);
  }

  @override
  Widget build(BuildContext context) {
    final years = List<String>.generate(
      widget.lastYear - widget.firstYear + 1,
      (i) => '${widget.firstYear + i}',
    );
    final months = List<String>.generate(12, (i) => '${i + 1}'.padLeft(2, '0'));
    final days = List<String>.generate(
      _daysInMonth(_year, _month),
      (i) => '${i + 1}'.padLeft(2, '0'),
    );

    final yearIndex = _year - widget.firstYear;
    final monthIndex = _month - 1;
    final dayIndex = _day - 1;

    return Dialog(
      backgroundColor: Colors.white,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
      child: Container(
        padding: const EdgeInsets.all(20),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            const Text(
              '选择日期',
              style: TextStyle(
                fontSize: 18,
                fontWeight: FontWeight.w800,
                color: AppColors.textDark,
              ),
            ),
            const SizedBox(height: 16),
            FittedBox(
              fit: BoxFit.scaleDown,
              child: Row(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                WheelPicker(
                  items: years,
                  initialIndex: yearIndex,
                  itemWidth: 80,
                  onSelectedItemChanged: (index) {
                    setState(() => _year = widget.firstYear + index);
                    _notify();
                  },
                ),
                const Text(
                  '年',
                  style: TextStyle(fontSize: 18, color: AppColors.textMuted),
                ),
                WheelPicker(
                  items: months,
                  initialIndex: monthIndex,
                  itemWidth: 60,
                  onSelectedItemChanged: (index) {
                    setState(() => _month = index + 1);
                    _notify();
                  },
                ),
                const Text(
                  '月',
                  style: TextStyle(fontSize: 18, color: AppColors.textMuted),
                ),
                WheelPicker(
                  items: days,
                  initialIndex: dayIndex.clamp(0, days.length - 1),
                  itemWidth: 60,
                  onSelectedItemChanged: (index) {
                    setState(() => _day = index + 1);
                    _notify();
                  },
                ),
                const Text(
                  '日',
                  style: TextStyle(fontSize: 18, color: AppColors.textMuted),
                ),
              ],
            ),
            ),
            const SizedBox(height: 20),
            Row(
              children: [
                Expanded(
                  child: TextButton(
                    onPressed: () => Navigator.of(context).pop(),
                    child: const Text(
                      '取消',
                      style: TextStyle(
                        fontSize: 16,
                        fontWeight: FontWeight.w700,
                        color: AppColors.textMuted,
                      ),
                    ),
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: PrimaryButton(
                    text: '确定',
                    onPressed: () {
                      final selected = DateTime(_year, _month, _day);
                      Navigator.of(context).pop(selected);
                    },
                  ),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }
}

class _TimePickerDialog extends StatefulWidget {
  final int initialHour;
  final int initialMinute;
  final Function(int hour, int minute) onChanged;

  const _TimePickerDialog({
    required this.initialHour,
    required this.initialMinute,
    required this.onChanged,
  });

  @override
  State<_TimePickerDialog> createState() => _TimePickerDialogState();
}

class _TimePickerDialogState extends State<_TimePickerDialog> {
  late int _hour;
  late int _minute;

  @override
  void initState() {
    super.initState();
    _hour = widget.initialHour;
    _minute = widget.initialMinute;
  }

  @override
  Widget build(BuildContext context) {
    final hours = List<String>.generate(24, (i) => '$i'.padLeft(2, '0'));
    final minutes = List<String>.generate(60, (i) => '$i'.padLeft(2, '0'));

    return Dialog(
      backgroundColor: Colors.white,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
      child: Container(
        padding: const EdgeInsets.all(20),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            const Text(
              '选择时间',
              style: TextStyle(
                fontSize: 18,
                fontWeight: FontWeight.w800,
                color: AppColors.textDark,
              ),
            ),
            const SizedBox(height: 16),
            FittedBox(
              fit: BoxFit.scaleDown,
              child: Row(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                WheelPicker(
                  items: hours,
                  initialIndex: _hour,
                  itemWidth: 70,
                  onSelectedItemChanged: (index) {
                    setState(() => _hour = index);
                    widget.onChanged(_hour, _minute);
                  },
                ),
                const Text(
                  '时',
                  style: TextStyle(fontSize: 18, color: AppColors.textMuted),
                ),
                WheelPicker(
                  items: minutes,
                  initialIndex: _minute,
                  itemWidth: 70,
                  onSelectedItemChanged: (index) {
                    setState(() => _minute = index);
                    widget.onChanged(_hour, _minute);
                  },
                ),
                const Text(
                  '分',
                  style: TextStyle(fontSize: 18, color: AppColors.textMuted),
                ),
              ],
            ),
            ),
            const SizedBox(height: 20),
            Row(
              children: [
                Expanded(
                  child: TextButton(
                    onPressed: () => Navigator.of(context).pop(),
                    child: const Text(
                      '取消',
                      style: TextStyle(
                        fontSize: 16,
                        fontWeight: FontWeight.w700,
                        color: AppColors.textMuted,
                      ),
                    ),
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: PrimaryButton(
                    text: '确定',
                    onPressed: () {
                      Navigator.of(context).pop(TimeOfDay(hour: _hour, minute: _minute));
                    },
                  ),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }
}

class _DateTimePickerDialog extends StatefulWidget {
  final int initialYear;
  final int initialMonth;
  final int initialDay;
  final int initialHour;
  final int initialMinute;
  final Function(int year, int month, int day) onDateChanged;
  final Function(int hour, int minute) onTimeChanged;

  const _DateTimePickerDialog({
    required this.initialYear,
    required this.initialMonth,
    required this.initialDay,
    required this.initialHour,
    required this.initialMinute,
    required this.onDateChanged,
    required this.onTimeChanged,
  });

  @override
  State<_DateTimePickerDialog> createState() => _DateTimePickerDialogState();
}

class _DateTimePickerDialogState extends State<_DateTimePickerDialog> {
  late int _year;
  late int _month;
  late int _day;
  late int _hour;
  late int _minute;
  bool _showDate = true;

  @override
  void initState() {
    super.initState();
    _year = widget.initialYear;
    _month = widget.initialMonth;
    _day = widget.initialDay;
    _hour = widget.initialHour;
    _minute = widget.initialMinute;
  }

  int _daysInMonth(int year, int month) {
    if (month == 2) {
      if ((year % 4 == 0 && year % 100 != 0) || year % 400 == 0) return 29;
      return 28;
    }
    if ([4, 6, 9, 11].contains(month)) return 30;
    return 31;
  }

  @override
  Widget build(BuildContext context) {
    final now = DateTime.now();
    final years =
        List<String>.generate(31, (i) => '${now.year - 30 + i}');
    final months = List<String>.generate(12, (i) => '${i + 1}'.padLeft(2, '0'));
    final days = List<String>.generate(
      _daysInMonth(_year, _month),
      (i) => '${i + 1}'.padLeft(2, '0'),
    );
    final hours = List<String>.generate(24, (i) => '$i'.padLeft(2, '0'));
    final minutes = List<String>.generate(60, (i) => '$i'.padLeft(2, '0'));

    final yearIndex = _year - (now.year - 30);

    return Dialog(
      backgroundColor: Colors.white,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
      child: Container(
        padding: const EdgeInsets.all(20),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                _buildModeButton('日期', _showDate),
                const SizedBox(width: 8),
                _buildModeButton('时间', !_showDate),
              ],
            ),
            const SizedBox(height: 16),
            if (_showDate)
              FittedBox(
                fit: BoxFit.scaleDown,
                child: Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  WheelPicker(
                    items: years,
                    initialIndex: yearIndex.clamp(0, years.length - 1),
                    itemWidth: 80,
                    onSelectedItemChanged: (index) {
                      setState(() => _year = now.year - 30 + index);
                    },
                  ),
                  const Text('年', style: TextStyle(fontSize: 18, color: AppColors.textMuted)),
                  WheelPicker(
                    items: months,
                    initialIndex: _month - 1,
                    itemWidth: 60,
                    onSelectedItemChanged: (index) {
                      setState(() => _month = index + 1);
                    },
                  ),
                  const Text('月', style: TextStyle(fontSize: 18, color: AppColors.textMuted)),
                  WheelPicker(
                    items: days,
                    initialIndex: (_day - 1).clamp(0, days.length - 1),
                    itemWidth: 60,
                    onSelectedItemChanged: (index) {
                      setState(() => _day = index + 1);
                    },
                  ),
                  const Text('日', style: TextStyle(fontSize: 18, color: AppColors.textMuted)),
                ],
              ),
              )
            else
              FittedBox(
                fit: BoxFit.scaleDown,
                child: Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  WheelPicker(
                    items: hours,
                    initialIndex: _hour,
                    itemWidth: 70,
                    onSelectedItemChanged: (index) {
                      setState(() => _hour = index);
                    },
                  ),
                  const Text('时', style: TextStyle(fontSize: 18, color: AppColors.textMuted)),
                  WheelPicker(
                    items: minutes,
                    initialIndex: _minute,
                    itemWidth: 70,
                    onSelectedItemChanged: (index) {
                      setState(() => _minute = index);
                    },
                  ),
                  const Text('分', style: TextStyle(fontSize: 18, color: AppColors.textMuted)),
                ],
              ),
              ),
            const SizedBox(height: 20),
            Row(
              children: [
                Expanded(
                  child: TextButton(
                    onPressed: () => Navigator.of(context).pop(),
                    child: const Text(
                      '取消',
                      style: TextStyle(
                        fontSize: 16,
                        fontWeight: FontWeight.w700,
                        color: AppColors.textMuted,
                      ),
                    ),
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: PrimaryButton(
                    text: '确定',
                    onPressed: () {
                      final result = {
                        'date': DateTime(_year, _month, _day),
                        'time': TimeOfDay(hour: _hour, minute: _minute),
                      };
                      Navigator.of(context).pop(result);
                    },
                  ),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildModeButton(String text, bool isActive) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 8),
      decoration: BoxDecoration(
        color: isActive ? AppColors.primary : Colors.grey.shade100,
        borderRadius: BorderRadius.circular(20),
      ),
      child: GestureDetector(
        onTap: () => setState(() => _showDate = text == '日期'),
        child: Text(
          text,
          style: TextStyle(
            fontSize: 14,
            fontWeight: FontWeight.w700,
            color: isActive ? Colors.white : AppColors.textMuted,
          ),
        ),
      ),
    );
  }
}

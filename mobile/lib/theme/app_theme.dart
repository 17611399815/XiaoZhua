import 'package:flutter/material.dart';

class AppColors {
  static const Color backgroundLight = Color(0xFFFFFAF0);
  static const Color backgroundStart = Color(0xFFFFF6DB);
  static const Color backgroundMid = Color(0xFFFFFAF0);
  static const Color backgroundEnd = Color(0xFFFFEFE2);

  static const Color primary = Color(0xFFFFB23F);
  static const Color primaryDark = Color(0xFFE8791A);
  static const Color primaryLight = Color(0xFFFFE6A8);
  static const Color coral = Color(0xFFFF7A70);
  static const Color teal = Color(0xFF22B8A7);
  static const Color sky = Color(0xFF4D96FF);
  static const Color violet = Color(0xFF8B5CF6);
  static const Color ai = Color(0xFF6D5DF6);
  static const Color aiLight = Color(0xFFECE9FF);

  static const Color textPrimary = Color(0xFF8A3B12);
  static const Color textSecondary = Color(0xFF6C2F12);
  static const Color textDark = Color(0xFF24160F);
  static const Color textHint = Color(0xB26C2F12);
  static const Color textMuted = Color(0xFF8B8178);
  static const Color textFieldLabel = Color(0xFFE8791A);
  static const Color textPlaceholder = Color(0xFFAD5C1B);
  static const Color textWhite = Color(0xFFFFFFFF);

  static const Color divider = Color(0xFFE9DED1);
  static const Color cardShadow = Color(0x24A8621B);
  static const Color primaryShadow = Color(0x1A8A3B12);
  static const Color buttonShadow = Color(0x33E8791A);
  static const Color inactiveButton = Color(0x66FFB23F);
}

class AppTextStyles {
  static const TextStyle titleLarge = TextStyle(
    fontSize: 24,
    height: 1.33,
    fontWeight: FontWeight.w900,
    color: AppColors.textSecondary,
    letterSpacing: 0,
  );

  static const TextStyle subtitle = TextStyle(
    fontSize: 14,
    height: 1.43,
    color: AppColors.textHint,
    letterSpacing: 0,
  );

  static const TextStyle petTypeLabel = TextStyle(
    fontSize: 14,
    fontWeight: FontWeight.w700,
    color: AppColors.textPrimary,
    letterSpacing: 0,
  );

  static const TextStyle fieldLabel = TextStyle(
    fontSize: 12,
    fontWeight: FontWeight.w700,
    color: AppColors.textFieldLabel,
    letterSpacing: 0,
  );

  static const TextStyle fieldPlaceholder = TextStyle(
    fontSize: 16,
    color: Color(0x801E2939),
    letterSpacing: 0,
  );

  static const TextStyle fieldValue = TextStyle(
    fontSize: 16,
    color: Color(0xFF1E2939),
    letterSpacing: 0,
  );

  static const TextStyle buttonText = TextStyle(
    fontSize: 16,
    height: 1.5,
    fontWeight: FontWeight.w700,
    color: AppColors.textWhite,
    letterSpacing: 0,
  );

  static const TextStyle heroTitle = TextStyle(
    fontSize: 36,
    height: 1.11,
    color: AppColors.textPrimary,
    fontWeight: FontWeight.w900,
    letterSpacing: 0,
  );

  static const TextStyle heroSlogan = TextStyle(
    fontSize: 14,
    height: 1.43,
    color: AppColors.textHint,
    letterSpacing: 0,
  );

  static const TextStyle emojiLarge = TextStyle(
    fontSize: 48,
    color: AppColors.textDark,
    letterSpacing: 0,
  );
}

class AppCard extends StatelessWidget {
  final Widget child;
  final EdgeInsetsGeometry? padding;
  final EdgeInsetsGeometry? margin;
  final Color? color;
  final List<BoxShadow>? shadow;
  final BorderRadius? borderRadius;
  final double? height;
  final double? width;
  final Alignment? alignment;

  const AppCard({
    super.key,
    required this.child,
    this.padding,
    this.margin,
    this.color,
    this.shadow,
    this.borderRadius,
    this.height,
    this.width,
    this.alignment,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      width: width,
      height: height,
      margin: margin,
      padding: padding,
      alignment: alignment,
      decoration: BoxDecoration(
        color: color ?? Colors.white,
        borderRadius: borderRadius ?? BorderRadius.circular(18),
        boxShadow: shadow ??
            const [
              BoxShadow(
                color: AppColors.cardShadow,
                blurRadius: 18,
                offset: Offset(0, 8),
              ),
              BoxShadow(
                color: Color(0x0FFFFFFF),
                blurRadius: 1,
                offset: Offset(0, -1),
              ),
            ],
      ),
      child: child,
    );
  }
}

class PrimaryButton extends StatelessWidget {
  final String text;
  final VoidCallback? onPressed;
  final bool enabled;
  final EdgeInsetsGeometry? padding;
  final double borderRadius;

  const PrimaryButton({
    super.key,
    required this.text,
    this.onPressed,
    this.enabled = true,
    this.padding,
    this.borderRadius = 16,
  });

  @override
  Widget build(BuildContext context) {
    final isActive = enabled && onPressed != null;
    return Container(
      decoration: BoxDecoration(
        gradient: isActive
            ? const LinearGradient(
                colors: [AppColors.primary, AppColors.primaryDark],
                begin: Alignment.topLeft,
                end: Alignment.bottomRight,
              )
            : null,
        color: isActive ? null : AppColors.inactiveButton,
        borderRadius: BorderRadius.circular(borderRadius),
        boxShadow: isActive
            ? const [
                BoxShadow(
                  color: AppColors.buttonShadow,
                  blurRadius: 18,
                  offset: Offset(0, 10),
                ),
                BoxShadow(
                  color: Color(0x0D000000),
                  blurRadius: 6,
                  offset: Offset(0, 4),
                ),
              ]
            : null,
      ),
      child: Material(
        color: Colors.transparent,
        child: InkWell(
          borderRadius: BorderRadius.circular(borderRadius),
          onTap: isActive ? onPressed : null,
          child: Container(
            padding: padding ??
                const EdgeInsets.symmetric(
                  horizontal: 16,
                  vertical: 15,
                ),
            alignment: Alignment.center,
            child: Text(
              text,
              style: AppTextStyles.buttonText.copyWith(
                color: isActive ? Colors.white : Colors.white.withValues(alpha: 0.8),
              ),
            ),
          ),
        ),
      ),
    );
  }
}

class BackCircleButton extends StatelessWidget {
  final VoidCallback? onTap;
  const BackCircleButton({super.key, this.onTap});

  @override
  Widget build(BuildContext context) {
    return Container(
      width: 40,
      height: 40,
      decoration: BoxDecoration(
        color: const Color(0xCCFFFFFF),
        borderRadius: BorderRadius.circular(20),
        boxShadow: const [
          BoxShadow(
            color: Color(0x1A000000),
            blurRadius: 3,
            offset: Offset(0, 1),
          ),
          BoxShadow(
            color: Color(0x0D000000),
            blurRadius: 2,
            offset: Offset(0, 1),
          ),
        ],
      ),
      child: Material(
        color: Colors.transparent,
        child: InkWell(
          borderRadius: BorderRadius.circular(20),
          onTap: onTap ?? () => Navigator.of(context).maybePop(),
          child: const Icon(
            Icons.arrow_back_ios_new,
            color: Colors.black87,
            size: 18,
          ),
        ),
      ),
    );
  }
}

class ProgressDots extends StatelessWidget {
  final int total;
  final int current;
  const ProgressDots({super.key, required this.total, required this.current});

  @override
  Widget build(BuildContext context) {
    return Row(
      mainAxisSize: MainAxisSize.min,
      children: List.generate(total, (index) {
        final isActive = index < current;
        return Container(
          width: 24,
          height: 6,
          margin: const EdgeInsets.symmetric(horizontal: 2),
          decoration: BoxDecoration(
            color: isActive ? AppColors.primaryDark : AppColors.primaryLight,
            borderRadius: BorderRadius.circular(3),
          ),
        );
      }),
    );
  }
}

class LoginGradientBackground extends StatelessWidget {
  final Widget child;
  const LoginGradientBackground({super.key, required this.child});

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: const BoxDecoration(
        gradient: LinearGradient(
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
          colors: [
            AppColors.backgroundStart,
            AppColors.backgroundMid,
            AppColors.backgroundEnd,
          ],
          stops: [0.03, 0.6, 0.97],
        ),
      ),
      child: child,
    );
  }
}

class InputField extends StatelessWidget {
  final String label;
  final String? placeholder;
  final TextEditingController? controller;
  final ValueChanged<String>? onChanged;
  final TextInputType? keyboardType;
  final bool obscureText;
  final int? maxLength;
  final Widget? suffix;
  final bool readOnly;
  final VoidCallback? onTap;
  final Widget? leading;
  final Color? backgroundColor;

  const InputField({
    super.key,
    required this.label,
    this.placeholder,
    this.controller,
    this.onChanged,
    this.keyboardType,
    this.obscureText = false,
    this.maxLength,
    this.suffix,
    this.readOnly = false,
    this.onTap,
    this.leading,
    this.backgroundColor,
  });

  @override
  Widget build(BuildContext context) {
    return AppCard(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
      color: backgroundColor,
      child: Column(
        mainAxisSize: MainAxisSize.min,
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(label, style: AppTextStyles.fieldLabel),
          const SizedBox(height: 8),
          Row(
            children: [
              if (leading != null) ...[
                leading!,
                const SizedBox(width: 12),
              ],
              Expanded(
                child: TextField(
                  controller: controller,
                  onChanged: onChanged,
                  keyboardType: keyboardType,
                  obscureText: obscureText,
                  maxLength: maxLength,
                  readOnly: readOnly,
                  onTap: onTap,
                  style: AppTextStyles.fieldValue,
                  decoration: InputDecoration(
                    isDense: true,
                    hintText: placeholder,
                    hintStyle: AppTextStyles.fieldPlaceholder,
                    border: InputBorder.none,
                    contentPadding: EdgeInsets.zero,
                    counterText: '',
                  ),
                ),
              ),
              if (suffix != null) suffix!,
            ],
          ),
        ],
      ),
    );
  }
}

class DashedBorderButton extends StatelessWidget {
  final String text;
  final VoidCallback onTap;
  final Widget? icon;
  const DashedBorderButton({
    super.key,
    required this.text,
    required this.onTap,
    this.icon,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(16),
        color: Colors.white,
        border: Border.all(
          color: AppColors.primary,
          width: 1.5,
          style: BorderStyle.solid,
        ),
      ),
      child: Material(
        color: Colors.transparent,
        child: InkWell(
          borderRadius: BorderRadius.circular(16),
          onTap: onTap,
          child: Padding(
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                icon ??
                    const Icon(
                      Icons.photo_library_outlined,
                      color: AppColors.primary,
                      size: 20,
                    ),
                const SizedBox(width: 8),
                Text(
                  text,
                  style: const TextStyle(
                    fontSize: 14,
                    fontWeight: FontWeight.w700,
                    color: AppColors.primaryDark,
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}

class PickerField extends StatelessWidget {
  final String label;
  final String value;
  final String placeholder;
  final VoidCallback onTap;
  const PickerField({
    super.key,
    required this.label,
    required this.value,
    required this.placeholder,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    final isEmpty = value.isEmpty;
    return AppCard(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
      child: Material(
        color: Colors.transparent,
        child: InkWell(
          onTap: onTap,
          borderRadius: BorderRadius.circular(16),
          child: Row(
            children: [
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(label, style: AppTextStyles.fieldLabel),
                    const SizedBox(height: 8),
                    Text(
                      isEmpty ? placeholder : value,
                      style: isEmpty
                          ? AppTextStyles.fieldPlaceholder
                          : AppTextStyles.fieldValue,
                    ),
                  ],
                ),
              ),
              const Icon(
                Icons.keyboard_arrow_down,
                color: AppColors.textMuted,
                size: 22,
              ),
            ],
          ),
        ),
      ),
    );
  }
}

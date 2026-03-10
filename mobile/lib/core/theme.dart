import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

class WexoTheme {
  static const primaryBlue = Color(0xFF2563EB);
  static const secondaryOrange = Color(0xFFF59E0B);
  static const backgroundWhite = Color(0xFFFFFFFF);
  static const surfaceGray = Color(0xFFF8FAFC);
  static const textDark = Color(0xFF0F172A);
  static const textMuted = Color(0xFF64748B);

  static ThemeData get lightTheme {
    return ThemeData(
      useMaterial3: true,
      colorScheme: ColorScheme.fromSeed(
        seedColor: primaryBlue,
        primary: primaryBlue,
        secondary: secondaryOrange,
        background: backgroundWhite,
        surface: surfaceGray,
      ),
      textTheme: GoogleFonts.outfitTextTheme().copyWith(
        displayLarge: GoogleFonts.outfit(
          fontSize: 32,
          fontWeight: FontWeight.w900,
          color: textDark,
        ),
        titleLarge: GoogleFonts.outfit(
          fontSize: 20,
          fontWeight: FontWeight.w800,
          color: textDark,
        ),
        bodyLarge: GoogleFonts.inter(
          fontSize: 16,
          fontWeight: FontWeight.w500,
          color: textDark,
        ),
      ),
      cardTheme: CardTheme(
        elevation: 0,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(24),
          side: BorderSide(color: Colors.white, width: 1),
        ),
        color: backgroundWhite.withOpacity(0.8),
      ),
    );
  }

  static BoxDecoration get glassDecoration {
    return BoxDecoration(
      color: Colors.white.withOpacity(0.7),
      borderRadius: BorderRadius.circular(24),
      border: Border.all(color: Colors.white.withOpacity(0.2)),
      boxShadow: [
        BoxShadow(
          color: Colors.black.withOpacity(0.05),
          blurRadius: 20,
          offset: Offset(0, 8),
        ),
      ],
    );
  }
  
  static BoxDecoration get button3DDecoration {
    return BoxDecoration(
      color: primaryBlue,
      borderRadius: BorderRadius.circular(20),
      boxShadow: [
        BoxShadow(
          color: primaryBlue.withOpacity(0.3),
          blurRadius: 10,
          offset: Offset(0, 4),
        ),
        BoxShadow(
          color: Colors.black.withOpacity(0.2),
          blurRadius: 0,
          offset: Offset(0, 4),
        ),
      ],
    );
  }
}

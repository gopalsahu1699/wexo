import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import 'package:wexo_mobile/core/theme.dart';
import 'package:wexo_mobile/presentation/screens/main_nav_shell.dart';

Future<void> main() async {
  WidgetsFlutterBinding.ensureInitialized();

  // Initialize Supabase (Use your project credentials)
  // await Supabase.initialize(
  //   url: 'YOUR_SUPABASE_URL',
  //   anonKey: 'YOUR_ANON_KEY',
  // );

  runApp(
    const ProviderScope(
      child: WexoApp(),
    ),
  );
}

class WexoApp extends StatelessWidget {
  const WexoApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'WEXO Mobile',
      debugShowCheckedModeBanner: false,
      theme: WexoTheme.lightTheme,
      home: const MainNavigationShell(),
    );
  }
}

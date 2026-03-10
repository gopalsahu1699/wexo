import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_svg/flutter_svg.dart';
import 'package:wexo_mobile/core/theme.dart';

import 'package:wexo_mobile/presentation/screens/jobs_screen.dart';
import 'package:wexo_mobile/presentation/screens/attendance_screen.dart';
import 'package:wexo_mobile/presentation/screens/earnings_screen.dart';

class MainNavigationShell extends ConsumerStatefulWidget {
  const MainNavigationShell({super.key});

  @override
  ConsumerState<MainNavigationShell> createState() => _MainNavigationShellState();
}

class _MainNavigationShellState extends ConsumerState<MainNavigationShell> {
  int _selectedIndex = 0;

  final List<Widget> _screens = [
    const JobsScreen(),
    const AttendanceScreen(),
    const Center(child: Text('Bill Redirect')), // Placeholder for special action
    const EarningsScreen(),
  ];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: WexoTheme.surfaceGray,
      body: _screens[_selectedIndex],
      bottomNavigationBar: Container(
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 20),
        decoration: BoxDecoration(
          color: Colors.white,
          boxShadow: [
            BoxShadow(
              color: Colors.black.withOpacity(0.05),
              blurRadius: 20,
              offset: const Offset(0, -5),
            ),
          ],
        ),
        child: ClipRRect(
          borderRadius: BorderRadius.circular(30),
          child: BottomNavigationBar(
            currentIndex: _selectedIndex,
            fixedColor: WexoTheme.primaryBlue,
            unselectedItemColor: WexoTheme.textMuted,
            showSelectedLabels: true,
            showUnselectedLabels: true,
            type: BottomNavigationBarType.fixed,
            elevation: 0,
            onTap: (index) {
              if (index == 2) {
                // Redirect logic for BillMensor
                return;
              }
              setState(() {
                _selectedIndex = index;
              });
            },
            items: const [
              BottomNavigationBarItem(
                icon: Icon(Icons.assignment_outlined),
                activeIcon: Icon(Icons.assignment),
                label: 'Jobs',
              ),
              BottomNavigationBarItem(
                icon: Icon(Icons.access_time_outlined),
                activeIcon: Icon(Icons.access_time_filled),
                label: 'Attendance',
              ),
              BottomNavigationBarItem(
                icon: CircleAvatar(
                  backgroundColor: WexoTheme.primaryBlue,
                  radius: 20,
                  child: Icon(Icons.add, color: Colors.white),
                ),
                label: 'Bill',
              ),
              BottomNavigationBarItem(
                icon: Icon(Icons.account_balance_wallet_outlined),
                activeIcon: Icon(Icons.account_balance_wallet),
                label: 'Earnings',
              ),
            ],
          ),
        ),
      ),
    );
  }
}

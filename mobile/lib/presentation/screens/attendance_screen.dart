import 'package:flutter/material.dart';
import 'package:wexo_mobile/core/theme.dart';

class AttendanceScreen extends StatefulWidget {
  const AttendanceScreen({super.key});

  @override
  State<AttendanceScreen> createState() => _AttendanceScreenState();
}

class _AttendanceScreenState extends State<AttendanceScreen> {
  bool _isPresent = false;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: WexoTheme.surfaceGray,
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.symmetric(horizontal: 24.0),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const SizedBox(height: 40),
              Text('Daily Attendance', style: Theme.of(context).textTheme.displayLarge),
              const SizedBox(height: 8),
              const Text('Mark your status for today', style: TextStyle(color: WexoTheme.textMuted, fontSize: 16)),
              
              const Spacer(),
              
              Center(
                child: GestureDetector(
                  onTap: () {
                    setState(() {
                      _isPresent = !_isPresent;
                    });
                  },
                  child: AnimatedContainer(
                    duration: const Duration(milliseconds: 300),
                    width: 240,
                    height: 240,
                    decoration: BoxDecoration(
                      color: _isPresent ? Colors.green : WexoTheme.primaryBlue,
                      shape: BoxShape.circle,
                      boxShadow: [
                        BoxShadow(
                          color: (_isPresent ? Colors.green : WexoTheme.primaryBlue).withOpacity(0.3),
                          blurRadius: 40,
                          offset: const Offset(0, 20),
                        ),
                        BoxShadow(
                          color: Colors.black.withOpacity(0.2),
                          blurRadius: 0,
                          offset: const Offset(0, 10),
                        ),
                      ],
                    ),
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Icon(
                          _isPresent ? Icons.check_circle_rounded : Icons.fingerprint_rounded,
                          size: 80,
                          color: Colors.white,
                        ),
                        const SizedBox(height: 12),
                        Text(
                          _isPresent ? 'Checked In' : 'Punch In',
                          style: const TextStyle(color: Colors.white, fontSize: 24, fontWeight: FontWeight.w900),
                        ),
                      ],
                    ),
                  ),
                ),
              ),
              
              const Spacer(),
              
              Container(
                padding: const EdgeInsets.all(24),
                decoration: WexoTheme.glassDecoration,
                child: Row(
                  children: [
                    _InfoTile(label: 'Check In', value: _isPresent ? '09:00 AM' : '--:--'),
                    const VerticalDivider(color: WexoTheme.surfaceGray),
                    _InfoTile(label: 'Check Out', value: '--:--'),
                    const VerticalDivider(color: WexoTheme.surfaceGray),
                    const _InfoTile(label: 'Working Hr', value: '0h 0m'),
                  ],
                ),
              ),
              const SizedBox(height: 40),
            ],
          ),
        ),
      ),
    );
  }
}

class _InfoTile extends StatelessWidget {
  final String label;
  final String value;
  const _InfoTile({required this.label, required this.value});

  @override
  Widget build(BuildContext context) {
    return Expanded(
      child: Column(
        children: [
          Text(label, style: const TextStyle(color: WexoTheme.textMuted, fontSize: 12, fontWeight: FontWeight.bold)),
          const SizedBox(height: 4),
          Text(value, style: const TextStyle(color: WexoTheme.textDark, fontSize: 16, fontWeight: FontWeight.w900)),
        ],
      ),
    );
  }
}

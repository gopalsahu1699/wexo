import 'package:flutter/material.dart';
import 'package:wexo_mobile/core/theme.dart';

class EarningsScreen extends StatelessWidget {
  const EarningsScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: WexoTheme.surfaceGray,
      appBar: AppBar(
        backgroundColor: Colors.transparent,
        elevation: 0,
        title: Text('My Earnings', style: Theme.of(context).textTheme.displayLarge?.copyWith(fontSize: 28)),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(24),
        child: Column(
          children: [
            Container(
              width: double.infinity,
              padding: const EdgeInsets.all(32),
              decoration: BoxDecoration(
                color: WexoTheme.primaryBlue,
                borderRadius: BorderRadius.circular(32),
                boxShadow: [
                  BoxShadow(
                    color: WexoTheme.primaryBlue.withOpacity(0.3),
                    blurRadius: 30,
                    offset: const Offset(0, 15),
                  ),
                ],
              ),
              child: Column(
                children: [
                  const Text('Available Balance', style: TextStyle(color: Colors.white70, fontSize: 16, fontWeight: FontWeight.bold)),
                  const SizedBox(height: 8),
                  const Text('₹12,450', style: TextStyle(color: Colors.white, fontSize: 44, fontWeight: FontWeight.w900)),
                  const SizedBox(height: 24),
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                    decoration: BoxDecoration(
                      color: Colors.white.withOpacity(0.2),
                      borderRadius: BorderRadius.circular(100),
                    ),
                    child: const Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        Icon(Icons.trending_up, color: Colors.greenAccent, size: 20),
                        SizedBox(width: 8),
                        Text('+15% from last week', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
                      ],
                    ),
                  ),
                ],
              ),
            ),
            
            const SizedBox(height: 40),
            
            const Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text('History', style: TextStyle(fontSize: 22, fontWeight: FontWeight.w900, color: WexoTheme.textDark)),
                Text('View Filter', style: TextStyle(color: WexoTheme.primaryBlue, fontWeight: FontWeight.bold)),
              ],
            ),
            
            const SizedBox(height: 20),
            
            ListView.builder(
              shrinkWrap: true,
              physics: const NeverScrollableScrollPhysics(),
              itemCount: 5,
              itemBuilder: (context, index) {
                return Container(
                  margin: const EdgeInsets.only(bottom: 16),
                  padding: const EdgeInsets.all(16),
                  decoration: WexoTheme.glassDecoration,
                  child: Row(
                    children: [
                      Container(
                        width: 48,
                        height: 48,
                        decoration: BoxDecoration(
                          color: WexoTheme.surfaceGray,
                          borderRadius: BorderRadius.circular(12),
                        ),
                        child: const Icon(Icons.receipt_long_rounded, color: WexoTheme.primaryBlue),
                      ),
                      const SizedBox(width: 16),
                      const Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text('Job #W-899 Bonus', style: TextStyle(fontWeight: FontWeight.w900, fontSize: 16)),
                            Text('10 March 2024', style: TextStyle(color: WexoTheme.textMuted, fontSize: 12, fontWeight: FontWeight.bold)),
                          ],
                        ),
                      ),
                      const Text('+₹500', style: TextStyle(color: Colors.green, fontWeight: FontWeight.w900, fontSize: 18)),
                    ],
                  ),
                );
              },
            ),
          ],
        ),
      ),
    );
  }
}

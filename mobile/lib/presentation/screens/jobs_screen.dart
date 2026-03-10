import 'package:flutter/material.dart';
import 'package:wexo_mobile/core/theme.dart';

class JobsScreen extends StatelessWidget {
  const JobsScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: WexoTheme.surfaceGray,
      appBar: AppBar(
        backgroundColor: Colors.transparent,
        elevation: 0,
        title: Text('My Jobs', style: Theme.of(context).textTheme.displayLarge?.copyWith(fontSize: 28)),
        actions: [
          IconButton(
            icon: const Icon(Icons.notifications_none_rounded, color: WexoTheme.textDark),
            onPressed: () {},
          ),
          const SizedBox(width: 8),
        ],
      ),
      body: ListView.builder(
        padding: const EdgeInsets.all(20),
        itemCount: 3,
        itemBuilder: (context, index) {
          return const JobCard();
        },
      ),
    );
  }
}

class JobCard extends StatelessWidget {
  const JobCard({super.key});

  @override
  Widget build(BuildContext context) {
    return Container(
      margin: const EdgeInsets.only(bottom: 20),
      decoration: WexoTheme.glassDecoration,
      padding: const EdgeInsets.all(20),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.between,
            children: [
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                decoration: BoxDecoration(
                  color: WexoTheme.primaryBlue.withOpacity(0.1),
                  borderRadius: BorderRadius.circular(12),
                ),
                child: const Text('AC Repair', style: TextStyle(color: WexoTheme.primaryBlue, fontWeight: FontWeight.bold, fontSize: 12)),
              ),
              const Text('#W-901', style: TextStyle(color: WexoTheme.textMuted, fontWeight: FontWeight.w900)),
            ],
          ),
          const SizedBox(height: 16),
          const Text('Full AC Servicing & Leakage Fix', style: TextStyle(fontSize: 20, fontWeight: FontWeight.w900, color: WexoTheme.textDark)),
          const SizedBox(height: 8),
          const Row(
            children: [
              Icon(Icons.location_on_outlined, size: 16, color: WexoTheme.secondaryOrange),
              SizedBox(width: 4),
              Text('Sector 44, Gurgaon', style: TextStyle(color: WexoTheme.textMuted, fontWeight: FontWeight.w600)),
            ],
          ),
          const SizedBox(height: 20),
          Row(
            children: [
              Expanded(
                child: InkWell(
                  onTap: () {},
                  child: Container(
                    height: 54,
                    decoration: WexoTheme.button3DDecoration,
                    alignment: Alignment.center,
                    child: const Text('Start Job', style: TextStyle(color: Colors.white, fontWeight: FontWeight.w900, fontSize: 16)),
                  ),
                ),
              ),
              const SizedBox(width: 12),
              Container(
                width: 54,
                height: 54,
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(20),
                  border: Border.all(color: WexoTheme.surfaceGray),
                ),
                child: const Icon(Icons.phone_in_talk_rounded, color: Colors.green),
              ),
            ],
          ),
        ],
      ),
    );
  }
}

import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
  // Compliance summary data
  complianceSummary = {
    overall: 68,
    byDomain: [
      { name: 'Access Control', value: 75 },
      { name: 'Asset Management', value: 60 },
      { name: 'Audit & Accountability', value: 82 },
      { name: 'Configuration Management', value: 55 },
      { name: 'Identification & Authentication', value: 70 },
      { name: 'Incident Response', value: 65 },
      { name: 'Maintenance', value: 50 },
      { name: 'Media Protection', value: 80 },
      { name: 'Personnel Security', value: 90 },
      { name: 'Physical Protection', value: 85 },
      { name: 'Risk Assessment', value: 60 },
      { name: 'Security Assessment', value: 70 },
      { name: 'System & Communications Protection', value: 65 },
      { name: 'System & Information Integrity', value: 55 }
    ]
  };

  // Recent activities
  recentActivities = [
    { type: 'Assessment', name: 'Q1 2023 Assessment', date: new Date(2023, 2, 15), status: 'Completed' },
    { type: 'Policy', name: 'Password Policy', date: new Date(2023, 2, 10), status: 'Updated' },
    { type: 'Control', name: 'AC.1.001', date: new Date(2023, 2, 5), status: 'Implemented' },
    { type: 'Asset', name: 'Cloud Infrastructure', date: new Date(2023, 2, 1), status: 'Added' },
    { type: 'Risk', name: 'Data Breach Risk', date: new Date(2023, 1, 25), status: 'Mitigated' }
  ];

  // Risk summary
  riskSummary = {
    high: 3,
    medium: 8,
    low: 12
  };

  constructor() { }

  ngOnInit(): void {
    // In a real app, we would fetch this data from a service
  }
} 
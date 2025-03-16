import { Component, OnInit } from '@angular/core';
import { DomainService } from '../core/services/domain.service';
import { ControlService } from '../core/services/control.service';
import { forkJoin } from 'rxjs';

interface DomainCompliance {
  name: string;
  value: number;
  domain_id: string;
  totalControls: number;
}

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
  // Compliance summary data
  complianceSummary = {
    overall: 0,
    byDomain: [] as DomainCompliance[]
  };

  // Controls by level
  controlsByLevel = {
    level1: 0,
    level2: 0,
    level3: 0,
    total: 0
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

  // Loading state
  isLoading = true;
  loadingError = false;

  constructor(
    private domainService: DomainService,
    private controlService: ControlService
  ) { }

  ngOnInit(): void {
    this.loadDashboardData();
  }

  loadDashboardData(): void {
    this.isLoading = true;
    this.loadingError = false;

    // Load domains and controls data simultaneously
    forkJoin({
      domains: this.domainService.getDomains(),
      controls: this.controlService.getControls()
    }).subscribe({
      next: (result) => {
        const { domains, controls } = result;
        
        // Process domains and controls data
        this.processDomainControlsData(domains, controls);
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading dashboard data:', error);
        this.loadingError = true;
        this.isLoading = false;
      }
    });
  }

  processDomainControlsData(domains: any[], controls: any[]): void {
    // Count controls by level
    this.controlsByLevel.level1 = controls.filter(c => c.cmmc_level === '1').length;
    this.controlsByLevel.level2 = controls.filter(c => c.cmmc_level === '2').length;
    this.controlsByLevel.level3 = controls.filter(c => c.cmmc_level === '3').length;
    this.controlsByLevel.total = controls.length;

    // Calculate overall percentage (mock calculation)
    this.complianceSummary.overall = Math.round(
      (this.controlsByLevel.level1 + this.controlsByLevel.level2) / 
      this.controlsByLevel.total * 100
    );

    // Process domain compliance (mock data for now)
    this.complianceSummary.byDomain = domains.map(domain => {
      const domainControls = controls.filter(c => c.domain_id === domain.domain_id);
      // Mock random compliance percentage per domain between 50-90%
      const value = Math.floor(Math.random() * 40) + 50;
      
      return {
        name: domain.name,
        value: value,
        domain_id: domain.domain_id,
        totalControls: domainControls.length
      };
    });
  }
} 
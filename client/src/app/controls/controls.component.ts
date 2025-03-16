import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ControlService, Control } from '../core/services/control.service';
import { DomainService, Domain } from '../core/services/domain.service';
import { FormControl } from '@angular/forms';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';

@Component({
  selector: 'app-controls',
  templateUrl: './controls.component.html',
  styleUrls: ['./controls.component.scss']
})
export class ControlsComponent implements OnInit {
  controls: Control[] = [];
  domains: Domain[] = [];
  filteredControls: Control[] = [];
  selectedDomain: string = '';
  selectedLevel: string = '';
  searchControl = new FormControl('');
  loading = true;
  error = '';

  levelOptions = [
    { value: '1', display: 'Level 1' },
    { value: '2', display: 'Level 2' }
  ];

  constructor(
    private controlService: ControlService,
    private domainService: DomainService,
    private route: ActivatedRoute
  ) { }

  ngOnInit(): void {
    // Load domains
    this.domainService.getDomains().subscribe({
      next: (domains) => {
        this.domains = domains;
      },
      error: (error) => {
        console.error('Error loading domains', error);
        this.error = 'Failed to load domains. Please try again later.';
      }
    });

    // Get query parameters
    this.route.queryParams.subscribe(params => {
      this.selectedDomain = params['domain'] || '';
      this.selectedLevel = params['level'] || '';
      this.loadControls();
    });

    // Setup search
    this.searchControl.valueChanges.pipe(
      debounceTime(300),
      distinctUntilChanged()
    ).subscribe(value => {
      this.filterControls();
    });
  }

  loadControls(): void {
    this.loading = true;
    const params: any = {};
    
    if (this.selectedDomain) {
      params.domain = this.selectedDomain;
    }
    
    if (this.selectedLevel) {
      params.level = this.selectedLevel;
    }
    
    this.controlService.getControls(params).subscribe({
      next: (controls) => {
        this.controls = controls;
        this.filterControls();
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading controls', error);
        this.error = 'Failed to load controls. Please try again later.';
        this.loading = false;
      }
    });
  }

  onDomainChange(): void {
    this.loadControls();
  }

  onLevelChange(): void {
    this.loadControls();
  }

  filterControls(): void {
    const searchTerm = this.searchControl.value?.toLowerCase() || '';
    
    if (!searchTerm) {
      this.filteredControls = [...this.controls];
      return;
    }
    
    this.filteredControls = this.controls.filter(control =>
      control.control_id.toLowerCase().includes(searchTerm) ||
      control.name.toLowerCase().includes(searchTerm) ||
      control.description.toLowerCase().includes(searchTerm)
    );
  }

  getDomainName(domainId: string): string {
    const domain = this.domains.find(d => d.domain_id === domainId);
    return domain ? domain.name : domainId;
  }
} 
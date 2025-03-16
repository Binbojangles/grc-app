import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-assessment-detail',
  templateUrl: './assessment-detail.component.html',
  styleUrls: ['./assessment-detail.component.scss']
})
export class AssessmentDetailComponent implements OnInit {
  assessmentId: string = '';

  constructor(private route: ActivatedRoute) { }

  ngOnInit(): void {
    this.assessmentId = this.route.snapshot.paramMap.get('id') || '';
    // Placeholder for future implementation
  }
} 
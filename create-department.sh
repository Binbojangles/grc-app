#!/bin/bash

curl -X POST http://localhost:5000/api/departments \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwiZW1haWwiOiJhZG1pbkBleGFtcGxlLmNvbSIsInJvbGUiOiJhZG1pbiIsImlhdCI6MTc0MjEyOTc3MSwiZXhwIjoxNzQyMTMzMzcxfQ.Xl2prWJTOP-0B2DKJAQKG41Xe0HZtRk-2BlQKUMXACM" \
  -d '{"name": "IT Department", "description": "Information Technology", "organization_id": 1}' 
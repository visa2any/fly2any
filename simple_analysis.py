#!/usr/bin/env python3
"""
Quick Google Contacts Analysis with encoding fixes
"""

import csv
import json
from collections import defaultdict
import os

def analyze_contacts():
    csv_file = r"C:\Users\Power\Downloads\GoogleContact1.csv"
    
    contacts = []
    phone_patterns = defaultdict(int)
    label_counts = defaultdict(int)
    geographic = defaultdict(int)
    
    # Load CSV
    with open(csv_file, 'r', encoding='utf-8', newline='') as file:
        reader = csv.DictReader(file)
        headers = reader.fieldnames
        
        for row in reader:
            contacts.append(row)
            
            # Analyze labels
            labels = row.get('Labels', '')
            if labels:
                for label in labels.split(' ::: '):
                    if label.strip():
                        label_counts[label.strip()] += 1
            
            # Analyze phones
            for i in range(1, 6):
                phone = row.get(f'Phone {i} - Value', '').strip()
                if phone:
                    if phone.startswith('+55'):
                        phone_patterns['Brazil (+55)'] += 1
                        geographic['Brazil'] += 1
                    elif phone.startswith('+1'):
                        phone_patterns['USA (+1)'] += 1
                        geographic['USA'] += 1
                    elif phone.startswith('55'):
                        phone_patterns['Brazil (55)'] += 1
                        geographic['Brazil'] += 1
                    elif phone.startswith('1'):
                        phone_patterns['USA (1)'] += 1
                        geographic['USA'] += 1
                    else:
                        phone_patterns['Other'] += 1
                        geographic['Other'] += 1
    
    # Calculate completeness
    total_contacts = len(contacts)
    first_name_filled = sum(1 for c in contacts if c.get('First Name', ''))
    last_name_filled = sum(1 for c in contacts if c.get('Last Name', ''))
    phone_filled = sum(1 for c in contacts if c.get('Phone 1 - Value', ''))
    email_filled = sum(1 for c in contacts if c.get('E-mail 1 - Value', ''))
    
    # Print results
    print("GOOGLE CONTACTS ANALYSIS RESULTS")
    print("=" * 50)
    print(f"Total Contacts: {total_contacts:,}")
    print(f"CSV Columns: {len(headers)}")
    print()
    
    print("DATA COMPLETENESS:")
    print(f"  First Name: {first_name_filled:,} ({first_name_filled/total_contacts*100:.1f}%)")
    print(f"  Last Name: {last_name_filled:,} ({last_name_filled/total_contacts*100:.1f}%)")
    print(f"  Phone: {phone_filled:,} ({phone_filled/total_contacts*100:.1f}%)")
    print(f"  Email: {email_filled:,} ({email_filled/total_contacts*100:.1f}%)")
    print()
    
    print("GEOGRAPHIC DISTRIBUTION:")
    for region, count in sorted(geographic.items(), key=lambda x: x[1], reverse=True):
        print(f"  {region}: {count:,} ({count/total_contacts*100:.1f}%)")
    print()
    
    print("TOP 10 LABELS:")
    for label, count in sorted(label_counts.items(), key=lambda x: x[1], reverse=True)[:10]:
        print(f"  {label}: {count:,} ({count/total_contacts*100:.1f}%)")
    print()
    
    print("PHONE PATTERNS:")
    for pattern, count in sorted(phone_patterns.items(), key=lambda x: x[1], reverse=True):
        print(f"  {pattern}: {count:,}")
    
    # Calculate the mystery: why 25,521 vs 27,743?
    actual_rows = total_contacts
    expected_rows = 27743 - 1  # minus header
    missing_rows = expected_rows - actual_rows
    
    print()
    print("DATA DISCREPANCY ANALYSIS:")
    print(f"  Expected rows (from wc -l): {expected_rows:,}")
    print(f"  Actually loaded: {actual_rows:,}")
    print(f"  Missing/corrupted rows: {missing_rows:,}")
    print(f"  Data loss: {missing_rows/expected_rows*100:.2f}%")

if __name__ == "__main__":
    analyze_contacts()
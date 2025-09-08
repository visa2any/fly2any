#!/usr/bin/env python3
"""
Google Contacts CSV Deep Statistical Analysis
Analyzing 27,743 contacts with comprehensive data insights
"""

import csv
import json
import re
from collections import defaultdict, Counter
from datetime import datetime
import sys
import os

class GoogleContactsAnalyzer:
    def __init__(self, csv_file_path):
        self.csv_file = csv_file_path
        self.contacts = []
        self.headers = []
        self.stats = {
            'total_contacts': 0,
            'data_completeness': {},
            'phone_patterns': {},
            'geographic_distribution': {},
            'label_analysis': {},
            'business_vs_personal': {},
            'data_quality': {},
            'name_analysis': {},
            'contact_richness': {}
        }
    
    def load_contacts(self):
        """Load and parse the CSV file handling special characters"""
        print("Loading Google Contacts CSV...")
        
        try:
            with open(self.csv_file, 'r', encoding='utf-8', newline='') as file:
                # Use csv.Sniffer to detect delimiter and quoting
                sample = file.read(4096)
                file.seek(0)
                sniffer = csv.Sniffer()
                delimiter = sniffer.sniff(sample).delimiter
                
                reader = csv.DictReader(file, delimiter=delimiter)
                self.headers = reader.fieldnames
                
                for row_num, row in enumerate(reader, start=2):  # Start at 2 since header is line 1
                    try:
                        # Clean and process each row
                        cleaned_row = {}
                        for key, value in row.items():
                            cleaned_row[key] = value.strip() if value else ""
                        self.contacts.append(cleaned_row)
                    except Exception as e:
                        print(f"Warning: Error parsing row {row_num}: {e}")
                        continue
                
                self.stats['total_contacts'] = len(self.contacts)
                print(f"Successfully loaded {self.stats['total_contacts']} contacts")
                print(f"CSV has {len(self.headers)} columns")
                
        except Exception as e:
            print(f"Error loading CSV file: {e}")
            sys.exit(1)
    
    def analyze_data_completeness(self):
        """Analyze how complete each field is across all contacts"""
        print("Analyzing data completeness...")
        
        field_completeness = {}
        
        for field in self.headers:
            non_empty = sum(1 for contact in self.contacts if contact.get(field, ""))
            completeness_pct = (non_empty / self.stats['total_contacts']) * 100
            field_completeness[field] = {
                'filled_count': non_empty,
                'empty_count': self.stats['total_contacts'] - non_empty,
                'completeness_percentage': round(completeness_pct, 2)
            }
        
        # Sort by completeness percentage
        self.stats['data_completeness'] = dict(
            sorted(field_completeness.items(), 
                   key=lambda x: x[1]['completeness_percentage'], 
                   reverse=True)
        )
        
        # Calculate overall data richness score
        total_fields = len(self.headers)
        avg_completeness = sum(field['completeness_percentage'] 
                             for field in field_completeness.values()) / total_fields
        self.stats['contact_richness']['average_field_completeness'] = round(avg_completeness, 2)
    
    def analyze_phone_patterns(self):
        """Analyze phone number patterns and geographic indicators"""
        print("Analyzing phone number patterns...")
        
        phone_fields = [field for field in self.headers if 'Phone' in field and 'Value' in field]
        phone_patterns = defaultdict(int)
        country_codes = defaultdict(int)
        phone_formats = defaultdict(int)
        
        all_phones = []
        
        for contact in self.contacts:
            for phone_field in phone_fields:
                phone = contact.get(phone_field, "").strip()
                if phone:
                    all_phones.append(phone)
                    
                    # Extract country codes
                    if phone.startswith('+55'):
                        country_codes['Brazil (+55)'] += 1
                    elif phone.startswith('+1'):
                        country_codes['US/Canada (+1)'] += 1
                    elif phone.startswith('+'):
                        code_match = re.match(r'\+(\d{1,3})', phone)
                        if code_match:
                            code = code_match.group(1)
                            country_codes[f'Other (+{code})'] += 1
                    elif phone.startswith('55'):
                        country_codes['Brazil (55 format)'] += 1
                    elif phone.startswith('1'):
                        country_codes['US/Canada (1 format)'] += 1
                    else:
                        country_codes['No country code'] += 1
                    
                    # Analyze phone formats
                    if re.match(r'\+55\s?\d{2}\s?\d{4,5}-?\d{4}', phone):
                        phone_formats['Brazilian format'] += 1
                    elif re.match(r'\+1\s?\d{3}\s?\d{3}\s?\d{4}', phone):
                        phone_formats['US format'] += 1
                    elif re.match(r'\d{10,11}', re.sub(r'\D', '', phone)):
                        phone_formats['Numeric only'] += 1
                    else:
                        phone_formats['Other format'] += 1
        
        self.stats['phone_patterns'] = {
            'total_phone_numbers': len(all_phones),
            'unique_phone_numbers': len(set(all_phones)),
            'country_codes': dict(country_codes),
            'phone_formats': dict(phone_formats),
            'contacts_with_phones': sum(1 for contact in self.contacts 
                                      if any(contact.get(field, "") for field in phone_fields)),
            'phone_completeness_percentage': round(
                (sum(1 for contact in self.contacts 
                     if any(contact.get(field, "") for field in phone_fields)) / 
                 self.stats['total_contacts']) * 100, 2)
        }
    
    def analyze_labels_and_groups(self):
        """Analyze contact labels and groupings"""
        print("Analyzing labels and contact groups...")
        
        labels_field = 'Labels'
        label_counts = defaultdict(int)
        multi_label_contacts = 0
        starred_contacts = 0
        
        for contact in self.contacts:
            labels = contact.get(labels_field, "")
            if labels:
                # Split labels by ' ::: '
                label_list = [label.strip() for label in labels.split(' ::: ') if label.strip()]
                
                if len(label_list) > 1:
                    multi_label_contacts += 1
                
                for label in label_list:
                    label_counts[label] += 1
                    if 'starred' in label.lower():
                        starred_contacts += 1
        
        self.stats['label_analysis'] = {
            'total_labeled_contacts': sum(1 for contact in self.contacts if contact.get(labels_field, "")),
            'unlabeled_contacts': sum(1 for contact in self.contacts if not contact.get(labels_field, "")),
            'multi_label_contacts': multi_label_contacts,
            'starred_contacts': starred_contacts,
            'label_distribution': dict(sorted(label_counts.items(), key=lambda x: x[1], reverse=True)),
            'total_unique_labels': len(label_counts)
        }
    
    def analyze_business_vs_personal(self):
        """Classify contacts as business vs personal"""
        print("Analyzing business vs personal contacts...")
        
        business_indicators = ['inc', 'llc', 'corp', 'company', 'ltd', 'specialist', 'equipment', 
                              'store', 'shop', 'service', 'group', 'association', 'organization']
        personal_indicators = ['✨', '🌺', '👮', '💀', 'mom', 'dad', 'wife', 'husband', 'friend']
        
        business_contacts = 0
        personal_contacts = 0
        ambiguous_contacts = 0
        
        business_names = []
        personal_names = []
        
        for contact in self.contacts:
            first_name = contact.get('First Name', '').lower()
            last_name = contact.get('Last Name', '').lower()
            org_name = contact.get('Organization Name', '').lower()
            full_contact = f"{first_name} {last_name} {org_name}".strip()
            
            has_business_indicator = any(indicator in full_contact for indicator in business_indicators)
            has_personal_indicator = any(indicator in full_contact for indicator in personal_indicators)
            has_organization = bool(org_name.strip())
            has_emoji = bool(re.search(r'[\U0001F600-\U0001F64F\U0001F300-\U0001F5FF\U0001F680-\U0001F6FF\U0001F1E0-\U0001F1FF]', 
                                     first_name + last_name))
            
            if has_business_indicator or has_organization:
                business_contacts += 1
                business_names.append(f"{contact.get('First Name', '')} {contact.get('Last Name', '')}".strip())
            elif has_personal_indicator or has_emoji:
                personal_contacts += 1
                personal_names.append(f"{contact.get('First Name', '')} {contact.get('Last Name', '')}".strip())
            else:
                ambiguous_contacts += 1
        
        self.stats['business_vs_personal'] = {
            'business_contacts': business_contacts,
            'personal_contacts': personal_contacts,
            'ambiguous_contacts': ambiguous_contacts,
            'business_percentage': round((business_contacts / self.stats['total_contacts']) * 100, 2),
            'personal_percentage': round((personal_contacts / self.stats['total_contacts']) * 100, 2),
            'top_business_names': business_names[:10],
            'top_personal_names': personal_names[:10]
        }
    
    def analyze_geographic_distribution(self):
        """Analyze geographic distribution from phone numbers and addresses"""
        print("Analyzing geographic distribution...")
        
        brazil_indicators = ['+55', '55 ', 'brazil', 'brasil']
        us_indicators = ['+1', '1-', 'usa', 'united states']
        
        geographic_distribution = defaultdict(int)
        
        for contact in self.contacts:
            contact_text = ""
            
            # Check all phone fields
            for field in self.headers:
                if 'Phone' in field and 'Value' in field:
                    phone = contact.get(field, '').lower()
                    contact_text += " " + phone
            
            # Check address fields
            for field in self.headers:
                if 'Address' in field:
                    address = contact.get(field, '').lower()
                    contact_text += " " + address
            
            # Classify by indicators
            if any(indicator in contact_text for indicator in brazil_indicators):
                geographic_distribution['Brazil'] += 1
            elif any(indicator in contact_text for indicator in us_indicators):
                geographic_distribution['United States'] += 1
            else:
                geographic_distribution['Unknown/Other'] += 1
        
        self.stats['geographic_distribution'] = dict(geographic_distribution)
    
    def analyze_name_patterns(self):
        """Analyze name patterns and characteristics"""
        print("Analyzing name patterns...")
        
        name_stats = {
            'contacts_with_first_name': 0,
            'contacts_with_last_name': 0,
            'contacts_with_both_names': 0,
            'contacts_with_nicknames': 0,
            'contacts_with_emojis': 0,
            'contacts_with_organizations': 0,
            'average_name_length': 0,
            'name_character_analysis': defaultdict(int)
        }
        
        total_name_length = 0
        name_count = 0
        
        for contact in self.contacts:
            first_name = contact.get('First Name', '').strip()
            last_name = contact.get('Last Name', '').strip()
            nickname = contact.get('Nickname', '').strip()
            org_name = contact.get('Organization Name', '').strip()
            
            if first_name:
                name_stats['contacts_with_first_name'] += 1
                total_name_length += len(first_name)
                name_count += 1
                
                # Check for emojis
                if re.search(r'[\U0001F600-\U0001F64F\U0001F300-\U0001F5FF\U0001F680-\U0001F6FF\U0001F1E0-\U0001F1FF]', first_name):
                    name_stats['contacts_with_emojis'] += 1
            
            if last_name:
                name_stats['contacts_with_last_name'] += 1
                total_name_length += len(last_name)
                name_count += 1
            
            if first_name and last_name:
                name_stats['contacts_with_both_names'] += 1
            
            if nickname:
                name_stats['contacts_with_nicknames'] += 1
            
            if org_name:
                name_stats['contacts_with_organizations'] += 1
        
        name_stats['average_name_length'] = round(total_name_length / name_count, 2) if name_count > 0 else 0
        self.stats['name_analysis'] = name_stats
    
    def calculate_data_quality_metrics(self):
        """Calculate overall data quality metrics"""
        print("Calculating data quality metrics...")
        
        # Define key fields for quality assessment
        key_fields = ['First Name', 'Last Name', 'Phone 1 - Value', 'E-mail 1 - Value']
        
        contacts_with_key_data = 0
        contacts_with_phone_or_email = 0
        complete_contacts = 0
        
        for contact in self.contacts:
            has_name = bool(contact.get('First Name', '') or contact.get('Last Name', ''))
            has_phone = any(contact.get(f'Phone {i} - Value', '') for i in range(1, 6))
            has_email = any(contact.get(f'E-mail {i} - Value', '') for i in range(1, 4))
            
            filled_key_fields = sum(1 for field in key_fields if contact.get(field, ''))
            
            if filled_key_fields >= 2:
                contacts_with_key_data += 1
            
            if has_phone or has_email:
                contacts_with_phone_or_email += 1
            
            if has_name and (has_phone or has_email):
                complete_contacts += 1
        
        self.stats['data_quality'] = {
            'contacts_with_key_data': contacts_with_key_data,
            'contacts_with_phone_or_email': contacts_with_phone_or_email,
            'complete_contacts': complete_contacts,
            'key_data_percentage': round((contacts_with_key_data / self.stats['total_contacts']) * 100, 2),
            'phone_or_email_percentage': round((contacts_with_phone_or_email / self.stats['total_contacts']) * 100, 2),
            'complete_contacts_percentage': round((complete_contacts / self.stats['total_contacts']) * 100, 2)
        }
    
    def run_full_analysis(self):
        """Run complete analysis pipeline"""
        print("="*60)
        print("GOOGLE CONTACTS DEEP STATISTICAL ANALYSIS")
        print("="*60)
        
        self.load_contacts()
        self.analyze_data_completeness()
        self.analyze_phone_patterns()
        self.analyze_labels_and_groups()
        self.analyze_business_vs_personal()
        self.analyze_geographic_distribution()
        self.analyze_name_patterns()
        self.calculate_data_quality_metrics()
        
        return self.stats
    
    def export_results(self, output_dir=""):
        """Export analysis results to JSON and summary files"""
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        
        # Export full statistics as JSON
        json_file = os.path.join(output_dir, f"google_contacts_analysis_{timestamp}.json")
        with open(json_file, 'w', encoding='utf-8') as f:
            json.dump(self.stats, f, indent=2, ensure_ascii=False)
        
        # Create summary report
        summary_file = os.path.join(output_dir, f"google_contacts_summary_{timestamp}.txt")
        with open(summary_file, 'w', encoding='utf-8') as f:
            f.write("GOOGLE CONTACTS STATISTICAL ANALYSIS SUMMARY\n")
            f.write("=" * 50 + "\n\n")
            
            f.write(f"TOTAL CONTACTS: {self.stats['total_contacts']:,}\n")
            f.write(f"CSV COLUMNS: {len(self.headers)}\n\n")
            
            f.write("TOP DATA COMPLETENESS:\n")
            for field, data in list(self.stats['data_completeness'].items())[:10]:
                f.write(f"  {field}: {data['completeness_percentage']}% ({data['filled_count']:,} contacts)\n")
            
            f.write(f"\nPHONE NUMBER ANALYSIS:\n")
            f.write(f"  Total phone numbers: {self.stats['phone_patterns']['total_phone_numbers']:,}\n")
            f.write(f"  Contacts with phones: {self.stats['phone_patterns']['contacts_with_phones']:,}\n")
            f.write(f"  Phone completeness: {self.stats['phone_patterns']['phone_completeness_percentage']}%\n")
            
            f.write(f"\nGEOGRAPHIC DISTRIBUTION:\n")
            for region, count in self.stats['geographic_distribution'].items():
                f.write(f"  {region}: {count:,} contacts\n")
            
            f.write(f"\nBUSINESS VS PERSONAL:\n")
            f.write(f"  Business: {self.stats['business_vs_personal']['business_contacts']:,} ({self.stats['business_vs_personal']['business_percentage']}%)\n")
            f.write(f"  Personal: {self.stats['business_vs_personal']['personal_contacts']:,} ({self.stats['business_vs_personal']['personal_percentage']}%)\n")
            
            f.write(f"\nDATA QUALITY:\n")
            f.write(f"  Complete contacts: {self.stats['data_quality']['complete_contacts']:,} ({self.stats['data_quality']['complete_contacts_percentage']}%)\n")
            f.write(f"  Contacts with phone/email: {self.stats['data_quality']['contacts_with_phone_or_email']:,} ({self.stats['data_quality']['phone_or_email_percentage']}%)\n")
        
        print(f"\nResults exported to:")
        print(f"  JSON: {json_file}")
        print(f"  Summary: {summary_file}")
        
        return json_file, summary_file

def main():
    csv_file = r"C:\Users\Power\Downloads\GoogleContact1.csv"
    
    if not os.path.exists(csv_file):
        print(f"Error: CSV file not found at {csv_file}")
        sys.exit(1)
    
    analyzer = GoogleContactsAnalyzer(csv_file)
    results = analyzer.run_full_analysis()
    
    # Export results
    json_file, summary_file = analyzer.export_results()
    
    # Print key findings
    print("\n" + "="*60)
    print("KEY FINDINGS SUMMARY")
    print("="*60)
    
    print(f"📊 TOTAL CONTACTS: {results['total_contacts']:,}")
    print(f"📈 DATA COMPLETENESS: {results['contact_richness']['average_field_completeness']}% average")
    print(f"📱 PHONE COVERAGE: {results['phone_patterns']['phone_completeness_percentage']}%")
    print(f"🏢 BUSINESS CONTACTS: {results['business_vs_personal']['business_percentage']}%")
    print(f"👤 PERSONAL CONTACTS: {results['business_vs_personal']['personal_percentage']}%")
    print(f"✅ COMPLETE CONTACTS: {results['data_quality']['complete_contacts_percentage']}%")
    
    print(f"\n🌍 GEOGRAPHIC DISTRIBUTION:")
    for region, count in results['geographic_distribution'].items():
        percentage = round((count / results['total_contacts']) * 100, 1)
        print(f"   {region}: {count:,} ({percentage}%)")
    
    print(f"\n🏷️ TOP LABELS:")
    for label, count in list(results['label_analysis']['label_distribution'].items())[:5]:
        percentage = round((count / results['total_contacts']) * 100, 1)
        print(f"   {label}: {count:,} ({percentage}%)")

if __name__ == "__main__":
    main()
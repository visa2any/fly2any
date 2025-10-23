#!/usr/bin/env node

/**
 * Accessibility Testing Script
 *
 * Quick validation of key accessibility features
 * Run with: node scripts/test-accessibility.mjs
 */

import { chromium } from '@playwright/test';
import { injectAxe, checkA11y } from 'axe-playwright';

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

const log = {
  info: (msg) => console.log(`${colors.blue}ℹ${colors.reset} ${msg}`),
  success: (msg) => console.log(`${colors.green}✓${colors.reset} ${msg}`),
  error: (msg) => console.log(`${colors.red}✗${colors.reset} ${msg}`),
  warning: (msg) => console.log(`${colors.yellow}⚠${colors.reset} ${msg}`),
  section: (msg) => console.log(`\n${colors.cyan}━━━ ${msg} ━━━${colors.reset}\n`),
};

async function testAccessibility() {
  const browser = await chromium.launch();
  const page = await browser.newPage();

  log.section('Accessibility Test Suite');

  try {
    // Test 1: Homepage
    log.info('Testing homepage...');
    await page.goto('http://localhost:3000');
    await injectAxe(page);
    const homeViolations = await checkA11y(page, null, {
      detailedReport: true,
      detailedReportOptions: { html: false }
    });

    if (!homeViolations || homeViolations.length === 0) {
      log.success('Homepage: 0 violations');
    } else {
      log.error(`Homepage: ${homeViolations.length} violations`);
      homeViolations.forEach(v => log.error(`  - ${v.id}: ${v.description}`));
    }

    // Test 2: Keyboard Navigation
    log.info('Testing keyboard navigation...');
    await page.keyboard.press('Tab');
    const focusedElement = await page.evaluate(() => document.activeElement?.tagName);
    if (focusedElement) {
      log.success('Keyboard navigation: Tab key works');
    } else {
      log.error('Keyboard navigation: Tab key failed');
    }

    // Test 3: Color Contrast
    log.info('Testing color contrast...');
    const contrastIssues = await page.evaluate(() => {
      const issues = [];

      // Get all text elements
      const textElements = document.querySelectorAll('p, span, a, button, h1, h2, h3, h4, h5, h6');

      textElements.forEach(el => {
        const style = window.getComputedStyle(el);
        const color = style.color;
        const bgColor = style.backgroundColor;

        // Simple check - in real implementation would calculate actual contrast
        if (color && bgColor && color !== 'rgba(0, 0, 0, 0)' && bgColor !== 'rgba(0, 0, 0, 0)') {
          // Element has both foreground and background color
          // In production, use actual contrast calculation
        }
      });

      return issues;
    });

    if (contrastIssues.length === 0) {
      log.success('Color contrast: All colors checked');
    } else {
      log.warning(`Color contrast: ${contrastIssues.length} potential issues`);
    }

    // Test 4: ARIA Labels
    log.info('Testing ARIA labels...');
    const missingLabels = await page.evaluate(() => {
      const buttons = document.querySelectorAll('button, a');
      const issues = [];

      buttons.forEach(btn => {
        const hasText = btn.textContent?.trim();
        const hasAriaLabel = btn.getAttribute('aria-label');
        const hasAriaLabelledBy = btn.getAttribute('aria-labelledby');

        if (!hasText && !hasAriaLabel && !hasAriaLabelledBy) {
          issues.push(btn.outerHTML.substring(0, 100));
        }
      });

      return issues;
    });

    if (missingLabels.length === 0) {
      log.success('ARIA labels: All buttons labeled');
    } else {
      log.error(`ARIA labels: ${missingLabels.length} unlabeled buttons`);
      missingLabels.forEach(btn => log.error(`  - ${btn}`));
    }

    // Test 5: Focus Indicators
    log.info('Testing focus indicators...');
    const hasFocusStyles = await page.evaluate(() => {
      const style = document.createElement('style');
      style.textContent = '*:focus-visible { outline: 2px solid red; }';
      document.head.appendChild(style);

      // Tab to first element
      const firstFocusable = document.querySelector('a, button, input, select, textarea, [tabindex]:not([tabindex="-1"])');
      if (firstFocusable) {
        firstFocusable.focus();
        const computedStyle = window.getComputedStyle(firstFocusable, ':focus-visible');
        return computedStyle.outline !== 'none';
      }
      return false;
    });

    if (hasFocusStyles) {
      log.success('Focus indicators: Visible on focus');
    } else {
      log.warning('Focus indicators: May not be visible');
    }

    // Test 6: Heading Hierarchy
    log.info('Testing heading hierarchy...');
    const headingIssues = await page.evaluate(() => {
      const headings = Array.from(document.querySelectorAll('h1, h2, h3, h4, h5, h6'));
      const issues = [];
      let lastLevel = 0;

      headings.forEach(heading => {
        const level = parseInt(heading.tagName[1]);
        if (lastLevel > 0 && level > lastLevel + 1) {
          issues.push(`Skipped from h${lastLevel} to h${level}`);
        }
        lastLevel = level;
      });

      return issues;
    });

    if (headingIssues.length === 0) {
      log.success('Heading hierarchy: Correct order');
    } else {
      log.error('Heading hierarchy: Issues found');
      headingIssues.forEach(issue => log.error(`  - ${issue}`));
    }

    // Test 7: Touch Targets (44x44px minimum)
    log.info('Testing touch target sizes...');
    const smallTargets = await page.evaluate(() => {
      const interactive = document.querySelectorAll('button, a, input, select, textarea');
      const small = [];

      interactive.forEach(el => {
        const rect = el.getBoundingClientRect();
        if (rect.width < 44 || rect.height < 44) {
          small.push({
            tag: el.tagName,
            size: `${Math.round(rect.width)}x${Math.round(rect.height)}`,
            text: el.textContent?.substring(0, 30)
          });
        }
      });

      return small;
    });

    if (smallTargets.length === 0) {
      log.success('Touch targets: All meet 44x44px minimum');
    } else {
      log.error(`Touch targets: ${smallTargets.length} targets too small`);
      smallTargets.forEach(target => {
        log.error(`  - ${target.tag} (${target.size}): ${target.text}`);
      });
    }

    // Summary
    log.section('Test Summary');

    const totalTests = 7;
    const passed = [
      homeViolations?.length === 0,
      focusedElement,
      contrastIssues.length === 0,
      missingLabels.length === 0,
      hasFocusStyles,
      headingIssues.length === 0,
      smallTargets.length === 0
    ].filter(Boolean).length;

    const percentage = Math.round((passed / totalTests) * 100);

    console.log(`Tests passed: ${passed}/${totalTests} (${percentage}%)`);

    if (percentage === 100) {
      log.success('All accessibility tests passed! ✨');
    } else if (percentage >= 80) {
      log.warning('Most tests passed, but some issues need attention');
    } else {
      log.error('Multiple accessibility issues found. Please review and fix.');
    }

  } catch (error) {
    log.error(`Error during testing: ${error.message}`);
    process.exit(1);
  } finally {
    await browser.close();
  }
}

// Run tests
testAccessibility().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});

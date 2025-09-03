#!/usr/bin/env node

/**
 * AI Development Team Performance Monitor
 * Tracks metrics, performance, and quality indicators
 */

const fs = require('fs');
const path = require('path');

class PerformanceMonitor {
  constructor() {
    this.metricsFile = '.claude-agents/metrics.json';
    this.metrics = this.loadMetrics();
    this.startTime = Date.now();
  }

  loadMetrics() {
    if (fs.existsSync(this.metricsFile)) {
      return JSON.parse(fs.readFileSync(this.metricsFile, 'utf8'));
    }
    return {
      totalTasks: 0,
      completedTasks: 0,
      failedTasks: 0,
      averageTaskTime: 0,
      qualityScores: [],
      agentPerformance: {},
      dailyStats: {},
      weeklyTrends: [],
      lastUpdated: Date.now()
    };
  }

  saveMetrics() {
    this.metrics.lastUpdated = Date.now();
    fs.writeFileSync(this.metricsFile, JSON.stringify(this.metrics, null, 2));
  }

  recordTaskCompletion(taskId, agentName, duration, qualityScore, success = true) {
    this.metrics.totalTasks++;
    
    if (success) {
      this.metrics.completedTasks++;
    } else {
      this.metrics.failedTasks++;
    }

    // Update average task time
    const totalDuration = (this.metrics.averageTaskTime * (this.metrics.totalTasks - 1)) + duration;
    this.metrics.averageTaskTime = totalDuration / this.metrics.totalTasks;

    // Record quality score
    this.metrics.qualityScores.push(qualityScore);
    if (this.metrics.qualityScores.length > 100) {
      this.metrics.qualityScores.shift(); // Keep only last 100
    }

    // Agent performance tracking
    if (!this.metrics.agentPerformance[agentName]) {
      this.metrics.agentPerformance[agentName] = {
        tasksCompleted: 0,
        totalDuration: 0,
        averageDuration: 0,
        qualityScores: [],
        successRate: 100
      };
    }

    const agentStats = this.metrics.agentPerformance[agentName];
    agentStats.tasksCompleted++;
    agentStats.totalDuration += duration;
    agentStats.averageDuration = agentStats.totalDuration / agentStats.tasksCompleted;
    agentStats.qualityScores.push(qualityScore);
    
    if (agentStats.qualityScores.length > 50) {
      agentStats.qualityScores.shift();
    }

    // Daily stats
    const today = new Date().toISOString().split('T')[0];
    if (!this.metrics.dailyStats[today]) {
      this.metrics.dailyStats[today] = {
        tasks: 0,
        completed: 0,
        failed: 0,
        averageQuality: 0
      };
    }
    
    this.metrics.dailyStats[today].tasks++;
    if (success) {
      this.metrics.dailyStats[today].completed++;
    } else {
      this.metrics.dailyStats[today].failed++;
    }

    this.saveMetrics();
  }

  getPerformanceReport() {
    const report = {
      overview: {
        totalTasks: this.metrics.totalTasks,
        successRate: ((this.metrics.completedTasks / this.metrics.totalTasks) * 100).toFixed(2),
        averageTaskTime: Math.round(this.metrics.averageTaskTime),
        averageQuality: this.calculateAverageQuality()
      },
      agentPerformance: this.getAgentRankings(),
      qualityTrends: this.getQualityTrends(),
      dailyProductivity: this.getDailyProductivity(),
      recommendations: this.getRecommendations()
    };

    return report;
  }

  calculateAverageQuality() {
    if (this.metrics.qualityScores.length === 0) return 0;
    const sum = this.metrics.qualityScores.reduce((a, b) => a + b, 0);
    return (sum / this.metrics.qualityScores.length).toFixed(2);
  }

  getAgentRankings() {
    return Object.entries(this.metrics.agentPerformance)
      .map(([name, stats]) => ({
        agent: name,
        tasksCompleted: stats.tasksCompleted,
        averageDuration: Math.round(stats.averageDuration),
        averageQuality: stats.qualityScores.length > 0 
          ? (stats.qualityScores.reduce((a, b) => a + b, 0) / stats.qualityScores.length).toFixed(2)
          : 'N/A',
        efficiency: stats.tasksCompleted / (stats.averageDuration / 1000 / 60) // tasks per minute
      }))
      .sort((a, b) => b.efficiency - a.efficiency);
  }

  getQualityTrends() {
    const recent = this.metrics.qualityScores.slice(-20);
    const older = this.metrics.qualityScores.slice(-40, -20);
    
    const recentAvg = recent.length > 0 ? recent.reduce((a, b) => a + b, 0) / recent.length : 0;
    const olderAvg = older.length > 0 ? older.reduce((a, b) => a + b, 0) / older.length : 0;
    
    return {
      recentAverage: recentAvg.toFixed(2),
      previousAverage: olderAvg.toFixed(2),
      trend: recentAvg > olderAvg ? 'improving' : recentAvg < olderAvg ? 'declining' : 'stable',
      improvement: ((recentAvg - olderAvg) / olderAvg * 100).toFixed(2)
    };
  }

  getDailyProductivity() {
    const last7Days = {};
    const today = new Date();
    
    for (let i = 0; i < 7; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      
      last7Days[dateStr] = this.metrics.dailyStats[dateStr] || {
        tasks: 0,
        completed: 0,
        failed: 0
      };
    }

    return last7Days;
  }

  getRecommendations() {
    const recommendations = [];
    
    // Quality recommendations
    const avgQuality = parseFloat(this.calculateAverageQuality());
    if (avgQuality < 85) {
      recommendations.push({
        type: 'quality',
        priority: 'high',
        message: `Average quality score is ${avgQuality}%. Consider additional code review cycles.`
      });
    }

    // Performance recommendations
    if (this.metrics.averageTaskTime > 300000) { // 5 minutes
      recommendations.push({
        type: 'performance', 
        priority: 'medium',
        message: 'Average task time is high. Consider optimizing agent workflows.'
      });
    }

    // Success rate recommendations
    const successRate = (this.metrics.completedTasks / this.metrics.totalTasks) * 100;
    if (successRate < 95) {
      recommendations.push({
        type: 'reliability',
        priority: 'high', 
        message: `Success rate is ${successRate.toFixed(2)}%. Investigate common failure points.`
      });
    }

    return recommendations;
  }

  displayDashboard() {
    const report = this.getPerformanceReport();
    
    console.log('\n🏆 AI DEVELOPMENT TEAM PERFORMANCE DASHBOARD');
    console.log('=============================================');
    
    console.log('\n📊 OVERVIEW:');
    console.log(`   Total Tasks: ${report.overview.totalTasks}`);
    console.log(`   Success Rate: ${report.overview.successRate}%`);
    console.log(`   Average Task Time: ${report.overview.averageTaskTime}ms`);
    console.log(`   Average Quality: ${report.overview.averageQuality}/100`);
    
    console.log('\n🤖 TOP PERFORMING AGENTS:');
    report.agentPerformance.slice(0, 5).forEach((agent, index) => {
      console.log(`   ${index + 1}. ${agent.agent}: ${agent.tasksCompleted} tasks, ${agent.averageQuality} quality`);
    });
    
    console.log('\n📈 QUALITY TRENDS:');
    console.log(`   Recent Average: ${report.qualityTrends.recentAverage}`);
    console.log(`   Trend: ${report.qualityTrends.trend} (${report.qualityTrends.improvement}%)`);
    
    if (report.recommendations.length > 0) {
      console.log('\n💡 RECOMMENDATIONS:');
      report.recommendations.forEach(rec => {
        const priority = rec.priority === 'high' ? '🔴' : rec.priority === 'medium' ? '🟡' : '🟢';
        console.log(`   ${priority} ${rec.message}`);
      });
    }
    
    console.log('=============================================\n');
  }

  simulateMetrics() {
    // Simulate some performance data for demonstration
    const agents = ['frontend', 'backend', 'devops', 'testing', 'code-review'];
    
    for (let i = 0; i < 50; i++) {
      const agent = agents[Math.floor(Math.random() * agents.length)];
      const duration = 30000 + Math.random() * 120000; // 30s to 2.5min
      const quality = 85 + Math.random() * 15; // 85-100 quality
      const success = Math.random() > 0.05; // 95% success rate
      
      this.recordTaskCompletion(`task_${i}`, agent, duration, quality, success);
    }
    
    console.log('✅ Simulated 50 tasks for demonstration');
  }
}

// CLI Interface
if (require.main === module) {
  const monitor = new PerformanceMonitor();
  
  const command = process.argv[2];

  switch (command) {
    case 'dashboard':
      monitor.displayDashboard();
      break;
      
    case 'simulate':
      monitor.simulateMetrics();
      monitor.displayDashboard();
      break;
      
    case 'report':
      const report = monitor.getPerformanceReport();
      console.log(JSON.stringify(report, null, 2));
      break;
      
    default:
      console.log('AI Development Team Performance Monitor');
      console.log('Usage:');
      console.log('  node performance-monitor.js dashboard  - Show performance dashboard');
      console.log('  node performance-monitor.js simulate   - Simulate metrics and show dashboard');
      console.log('  node performance-monitor.js report     - Generate JSON report');
  }
}

module.exports = PerformanceMonitor;
export class PlainLanguageExplainer {
  constructor() {
    this.explanationTemplates = this.initializeTemplates();
    this.severityDescriptions = this.initializeSeverityDescriptions();
    this.technicalToPlainMapping = this.initializeTechnicalMapping();
  }

  initializeTemplates() {
    return {
      // UI Issues
      'JavaScript Error': {
        businessImpact: "Users may experience broken functionality or see error messages",
        userExperience: "The website might not work properly for visitors",
        recommendation: "Fix the code error to ensure smooth user experience",
        urgency: "high"
      },
      'Failed Request': {
        businessImpact: "Some features may not load or work correctly",
        userExperience: "Users might see loading errors or missing content",
        recommendation: "Check server connectivity and fix network issues",
        urgency: "medium"
      },
      'Form Interaction Failed': {
        businessImpact: "Users cannot submit forms, potentially losing leads or sales",
        userExperience: "Customers cannot complete purchases, sign-ups, or contact forms",
        recommendation: "Fix form validation and submission processes immediately",
        urgency: "critical"
      },
      'Accessibility Issue': {
        businessImpact: "Website may not be usable by people with disabilities, risking legal compliance",
        userExperience: "Some users cannot navigate or use the website effectively",
        recommendation: "Improve accessibility to serve all users and meet legal requirements",
        urgency: "medium"
      },
      'Layout Issue': {
        businessImpact: "Website may look unprofessional or be hard to use",
        userExperience: "Content might overlap or be difficult to read",
        recommendation: "Fix visual layout to improve user experience and brand image",
        urgency: "low"
      },

      // Functional Issues
      'Authentication Bypass': {
        businessImpact: "CRITICAL SECURITY RISK: Unauthorized users may access protected data",
        userExperience: "User accounts and private information could be compromised",
        recommendation: "IMMEDIATE ACTION REQUIRED: Fix authentication system before going live",
        urgency: "critical"
      },
      'SQL Injection': {
        businessImpact: "CRITICAL SECURITY RISK: Database could be compromised or deleted",
        userExperience: "All user data and business information is at risk",
        recommendation: "IMMEDIATE ACTION REQUIRED: Fix database security vulnerabilities",
        urgency: "critical"
      },
      'API Response Issue': {
        businessImpact: "Features dependent on data may not work correctly",
        userExperience: "Users may see outdated information or broken features",
        recommendation: "Review and fix API responses to ensure data accuracy",
        urgency: "medium"
      },
      'Validation Issue': {
        businessImpact: "Invalid data may be accepted, causing data quality problems",
        userExperience: "Users might submit incorrect information without proper guidance",
        recommendation: "Improve input validation to maintain data quality",
        urgency: "medium"
      },

      // Database Issues
      'Data Consistency Issue': {
        businessImpact: "Business reports and decisions may be based on incorrect data",
        userExperience: "Users may see conflicting or incorrect information",
        recommendation: "Fix data relationships to ensure information accuracy",
        urgency: "high"
      },
      'Slow Query Performance': {
        businessImpact: "Website may be slow, leading to user abandonment and lost revenue",
        userExperience: "Pages take too long to load, frustrating users",
        recommendation: "Optimize database queries to improve website speed",
        urgency: "medium"
      },
      'Connection Issue': {
        businessImpact: "Website may be completely unavailable, stopping all business operations",
        userExperience: "Users cannot access the website at all",
        recommendation: "Fix database connectivity to restore website functionality",
        urgency: "critical"
      },
      'Data Integrity Violation': {
        businessImpact: "Data corruption could lead to incorrect business decisions and lost trust",
        userExperience: "Users may encounter errors or see incorrect information",
        recommendation: "Implement proper data validation and constraints",
        urgency: "high"
      }
    };
  }

  initializeSeverityDescriptions() {
    return {
      'Critical': {
        description: "🚨 URGENT - Immediate action required",
        businessImpact: "Could cause significant business disruption, security breaches, or complete system failure",
        timeline: "Fix within 24 hours",
        stakeholderMessage: "This issue poses serious risks and must be addressed immediately before launch or continued operation."
      },
      'High': {
        description: "⚠️ HIGH PRIORITY - Address soon",
        businessImpact: "Could significantly impact user experience, data integrity, or business operations",
        timeline: "Fix within 1-3 days",
        stakeholderMessage: "This issue should be resolved quickly to prevent user frustration and potential business impact."
      },
      'Medium': {
        description: "📋 MODERATE - Plan to fix",
        businessImpact: "May cause minor user inconvenience or reduce system efficiency",
        timeline: "Fix within 1-2 weeks",
        stakeholderMessage: "This issue should be included in the next development cycle to improve user experience."
      },
      'Low': {
        description: "📝 LOW PRIORITY - Consider for future",
        businessImpact: "Minor cosmetic or performance improvements",
        timeline: "Fix when convenient",
        stakeholderMessage: "This is a minor improvement that can be addressed when time permits."
      }
    };
  }

  initializeTechnicalMapping() {
    return {
      // Technical terms to plain language
      'DOM': 'webpage structure',
      'API': 'data connection',
      'endpoint': 'data source',
      'query': 'database request',
      'authentication': 'login system',
      'validation': 'input checking',
      'SQL injection': 'database security attack',
      'XSS': 'website security vulnerability',
      'CORS': 'cross-website security',
      'timeout': 'took too long to respond',
      'latency': 'response delay',
      'throughput': 'processing speed',
      'schema': 'data structure',
      'constraint': 'data rule',
      'foreign key': 'data relationship',
      'index': 'database speed optimization',
      'cache': 'temporary storage for speed',
      'session': 'user login period',
      'cookie': 'website memory of user preferences',
      'SSL/TLS': 'secure connection encryption',
      'HTTP status code': 'server response message',
      '404': 'page not found',
      '500': 'server error',
      '403': 'access denied',
      '401': 'login required'
    };
  }

  explainIssue(issue, targetAudience = 'business') {
    const template = this.explanationTemplates[issue.type];
    const severityInfo = this.severityDescriptions[issue.severity];
    
    if (!template) {
      return this.generateGenericExplanation(issue, targetAudience);
    }

    const explanation = {
      summary: this.generateSummary(issue, template, severityInfo),
      businessImpact: this.explainBusinessImpact(issue, template),
      userExperience: this.explainUserExperience(issue, template),
      technicalDetails: this.simplifyTechnicalDetails(issue),
      recommendation: this.generateRecommendation(issue, template),
      priority: this.explainPriority(issue, severityInfo),
      nextSteps: this.generateNextSteps(issue, template)
    };

    // Customize based on audience
    if (targetAudience === 'executive') {
      return this.formatForExecutives(explanation, issue);
    } else if (targetAudience === 'product') {
      return this.formatForProductTeam(explanation, issue);
    } else {
      return this.formatForBusinessUsers(explanation, issue);
    }
  }

  generateSummary(issue, template, severityInfo) {
    const severityEmoji = {
      'Critical': '🚨',
      'High': '⚠️',
      'Medium': '📋',
      'Low': '📝'
    };

    return `${severityEmoji[issue.severity]} ${severityInfo.description}: ${this.simplifyDescription(issue.description)}`;
  }

  explainBusinessImpact(issue, template) {
    let impact = template.businessImpact;
    
    // Add context based on issue location
    if (issue.agent === 'UI') {
      impact += " This affects what users see and interact with on your website.";
    } else if (issue.agent === 'Functional') {
      impact += " This affects how your website processes and handles user requests.";
    } else if (issue.agent === 'DB') {
      impact += " This affects how your website stores and retrieves data.";
    }

    return impact;
  }

  explainUserExperience(issue, template) {
    let experience = template.userExperience;
    
    // Add specific user scenarios
    if (issue.type.includes('Form')) {
      experience += " For example, users trying to make a purchase or sign up for your service will be unable to complete these actions.";
    } else if (issue.type.includes('Authentication')) {
      experience += " Users may be unable to log in to their accounts or access personalized features.";
    } else if (issue.type.includes('Performance')) {
      experience += " Users may become frustrated with slow loading times and leave your website.";
    }

    return experience;
  }

  simplifyTechnicalDetails(issue) {
    let simplified = issue.description;
    
    // Replace technical terms with plain language
    for (const [technical, plain] of Object.entries(this.technicalToPlainMapping)) {
      const regex = new RegExp(technical, 'gi');
      simplified = simplified.replace(regex, plain);
    }

    // Add context about where the issue was found
    const location = this.explainIssueLocation(issue);
    return `${simplified} ${location}`;
  }

  explainIssueLocation(issue) {
    const locationMap = {
      'UI': 'This was detected while testing the user interface (what users see and click on).',
      'Functional': 'This was detected while testing the backend functionality (how the website processes requests).',
      'DB': 'This was detected while testing the database (where your website stores information).'
    };

    return locationMap[issue.agent] || 'This was detected during automated testing.';
  }

  generateRecommendation(issue, template) {
    let recommendation = template.recommendation;
    
    // Add specific action items based on issue type
    if (issue.severity === 'Critical') {
      recommendation = `🚨 IMMEDIATE ACTION REQUIRED: ${recommendation} Do not deploy to production until this is resolved.`;
    } else if (issue.severity === 'High') {
      recommendation = `⚠️ HIGH PRIORITY: ${recommendation} Schedule this fix for the current sprint.`;
    } else {
      recommendation = `📋 ${recommendation} Add this to your development backlog.`;
    }

    return recommendation;
  }

  explainPriority(issue, severityInfo) {
    return {
      level: issue.severity,
      description: severityInfo.description,
      timeline: severityInfo.timeline,
      reasoning: severityInfo.stakeholderMessage
    };
  }

  generateNextSteps(issue, template) {
    const steps = [];
    
    if (issue.severity === 'Critical') {
      steps.push("1. Stop any deployment plans immediately");
      steps.push("2. Assign a senior developer to investigate");
      steps.push("3. Test the fix thoroughly before proceeding");
      steps.push("4. Verify the issue is resolved with another test run");
    } else if (issue.severity === 'High') {
      steps.push("1. Create a ticket in your development system");
      steps.push("2. Assign to appropriate team member");
      steps.push("3. Schedule for current or next sprint");
      steps.push("4. Test after implementation");
    } else {
      steps.push("1. Add to development backlog");
      steps.push("2. Prioritize based on available resources");
      steps.push("3. Include in future release planning");
    }

    return steps;
  }

  formatForExecutives(explanation, issue) {
    return {
      executiveSummary: `${explanation.summary}\n\nBUSINESS IMPACT: ${explanation.businessImpact}`,
      riskAssessment: this.assessRisk(issue),
      resourceRequirement: this.estimateResources(issue),
      timelineImpact: explanation.priority.timeline,
      recommendation: explanation.recommendation,
      costOfInaction: this.explainCostOfInaction(issue)
    };
  }

  formatForProductTeam(explanation, issue) {
    return {
      productImpact: explanation.userExperience,
      featureAffected: this.identifyAffectedFeature(issue),
      userJourneyImpact: this.explainUserJourneyImpact(issue),
      priority: explanation.priority,
      acceptanceCriteria: this.generateAcceptanceCriteria(issue),
      testingRequirements: this.generateTestingRequirements(issue)
    };
  }

  formatForBusinessUsers(explanation, issue) {
    return {
      whatHappened: explanation.summary,
      whyItMatters: explanation.businessImpact,
      howItAffectsUsers: explanation.userExperience,
      whatToDoNext: explanation.nextSteps,
      whenToFixIt: explanation.priority.timeline,
      technicalContext: explanation.technicalDetails
    };
  }

  assessRisk(issue) {
    const riskLevels = {
      'Critical': 'HIGH RISK - Could result in security breaches, data loss, or complete system failure',
      'High': 'MEDIUM-HIGH RISK - Could significantly impact user satisfaction and business metrics',
      'Medium': 'MEDIUM RISK - May cause user frustration and minor business impact',
      'Low': 'LOW RISK - Minor impact on user experience'
    };

    return riskLevels[issue.severity] || 'Risk level unknown';
  }

  estimateResources(issue) {
    const resourceEstimates = {
      'Critical': '1-2 senior developers, immediate attention, 1-3 days',
      'High': '1 developer, high priority, 2-5 days',
      'Medium': '1 developer, normal priority, 1-2 weeks',
      'Low': '1 developer, low priority, when time permits'
    };

    return resourceEstimates[issue.severity] || 'Resource estimate unavailable';
  }

  explainCostOfInaction(issue) {
    const costs = {
      'Critical': 'Potential security breach, data loss, legal liability, complete loss of user trust',
      'High': 'User abandonment, negative reviews, reduced conversion rates, competitive disadvantage',
      'Medium': 'Gradual user frustration, minor impact on metrics, reduced user satisfaction',
      'Low': 'Minimal immediate impact, but may accumulate over time'
    };

    return costs[issue.severity] || 'Impact of not fixing this issue is unclear';
  }

  identifyAffectedFeature(issue) {
    // Analyze issue description to identify affected features
    const description = issue.description.toLowerCase();
    
    if (description.includes('login') || description.includes('auth')) {
      return 'User Authentication & Login';
    } else if (description.includes('form') || description.includes('submit')) {
      return 'Form Submission & Data Entry';
    } else if (description.includes('cart') || description.includes('checkout')) {
      return 'Shopping Cart & Checkout Process';
    } else if (description.includes('search')) {
      return 'Search Functionality';
    } else if (description.includes('navigation') || description.includes('menu')) {
      return 'Site Navigation';
    } else {
      return 'Core Website Functionality';
    }
  }

  explainUserJourneyImpact(issue) {
    const feature = this.identifyAffectedFeature(issue);
    
    const journeyImpacts = {
      'User Authentication & Login': 'Users cannot access their accounts, preventing them from using personalized features or making purchases',
      'Form Submission & Data Entry': 'Users cannot complete sign-ups, contact forms, or provide feedback, blocking lead generation',
      'Shopping Cart & Checkout Process': 'Users cannot complete purchases, directly impacting revenue and conversion rates',
      'Search Functionality': 'Users cannot find products or content easily, leading to frustration and abandonment',
      'Site Navigation': 'Users may get lost or confused, unable to find what they\'re looking for',
      'Core Website Functionality': 'Basic website operations are affected, impacting overall user experience'
    };

    return journeyImpacts[feature] || 'User journey may be disrupted in unexpected ways';
  }

  generateAcceptanceCriteria(issue) {
    return [
      `✅ The ${issue.type.toLowerCase()} no longer occurs during testing`,
      `✅ Users can successfully complete the affected functionality`,
      `✅ No new issues are introduced by the fix`,
      `✅ Performance remains acceptable after the fix`,
      `✅ The fix works across different browsers and devices`
    ];
  }

  generateTestingRequirements(issue) {
    const requirements = [
      'Verify the specific issue is resolved',
      'Test the affected feature end-to-end',
      'Perform regression testing on related features'
    ];

    if (issue.severity === 'Critical') {
      requirements.push('Security testing if applicable');
      requirements.push('Load testing to ensure stability');
    }

    if (issue.agent === 'UI') {
      requirements.push('Cross-browser compatibility testing');
      requirements.push('Mobile responsiveness testing');
    }

    return requirements;
  }

  generateGenericExplanation(issue, targetAudience) {
    return {
      summary: `${issue.severity} issue detected: ${this.simplifyDescription(issue.description)}`,
      businessImpact: "This issue may affect your website's functionality and user experience.",
      userExperience: "Users may encounter problems when using your website.",
      technicalDetails: this.simplifyTechnicalDetails(issue),
      recommendation: "Have your development team investigate and fix this issue.",
      priority: this.explainPriority(issue, this.severityDescriptions[issue.severity] || {}),
      nextSteps: ["Contact your development team", "Provide them with the technical details", "Test the fix when complete"]
    };
  }

  simplifyDescription(description) {
    let simplified = description;
    
    // Replace technical terms
    for (const [technical, plain] of Object.entries(this.technicalToPlainMapping)) {
      const regex = new RegExp(technical, 'gi');
      simplified = simplified.replace(regex, plain);
    }

    // Remove technical jargon patterns
    simplified = simplified.replace(/\b[A-Z]{2,}\b/g, (match) => {
      return this.technicalToPlainMapping[match] || match.toLowerCase();
    });

    return simplified;
  }

  explainMultipleIssues(issues, targetAudience = 'business') {
    const summary = {
      totalIssues: issues.length,
      criticalIssues: issues.filter(i => i.severity === 'Critical').length,
      highIssues: issues.filter(i => i.severity === 'High').length,
      mediumIssues: issues.filter(i => i.severity === 'Medium').length,
      lowIssues: issues.filter(i => i.severity === 'Low').length
    };

    const prioritizedIssues = issues
      .sort((a, b) => {
        const severityOrder = { 'Critical': 4, 'High': 3, 'Medium': 2, 'Low': 1 };
        return severityOrder[b.severity] - severityOrder[a.severity];
      })
      .slice(0, 10) // Top 10 issues
      .map(issue => this.explainIssue(issue, targetAudience));

    return {
      executiveSummary: this.generateExecutiveSummary(summary),
      overallRisk: this.assessOverallRisk(summary),
      recommendedActions: this.generateOverallRecommendations(summary),
      detailedIssues: prioritizedIssues,
      timeline: this.generateOverallTimeline(summary)
    };
  }

  generateExecutiveSummary(summary) {
    let message = `Testing completed and found ${summary.totalIssues} issues that need attention. `;
    
    if (summary.criticalIssues > 0) {
      message += `🚨 ${summary.criticalIssues} CRITICAL issues require immediate action before launch. `;
    }
    
    if (summary.highIssues > 0) {
      message += `⚠️ ${summary.highIssues} high-priority issues should be fixed soon. `;
    }
    
    if (summary.mediumIssues > 0) {
      message += `📋 ${summary.mediumIssues} medium-priority issues can be planned for upcoming releases. `;
    }
    
    if (summary.lowIssues > 0) {
      message += `📝 ${summary.lowIssues} low-priority improvements can be addressed when convenient.`;
    }

    return message;
  }

  assessOverallRisk(summary) {
    if (summary.criticalIssues > 0) {
      return 'HIGH RISK - Do not proceed with launch until critical issues are resolved';
    } else if (summary.highIssues > 3) {
      return 'MEDIUM-HIGH RISK - Consider delaying launch to address high-priority issues';
    } else if (summary.highIssues > 0 || summary.mediumIssues > 5) {
      return 'MEDIUM RISK - Proceed with caution, plan fixes for next release';
    } else {
      return 'LOW RISK - Safe to proceed with minor issues to be addressed later';
    }
  }

  generateOverallRecommendations(summary) {
    const recommendations = [];
    
    if (summary.criticalIssues > 0) {
      recommendations.push('🚨 STOP: Do not deploy until all critical issues are fixed');
      recommendations.push('Assign senior developers to critical issues immediately');
    }
    
    if (summary.highIssues > 0) {
      recommendations.push('Schedule high-priority fixes for current sprint');
    }
    
    if (summary.mediumIssues > 0) {
      recommendations.push('Plan medium-priority fixes for next release cycle');
    }
    
    recommendations.push('Run another test after fixes to verify resolution');
    
    return recommendations;
  }

  generateOverallTimeline(summary) {
    if (summary.criticalIssues > 0) {
      return 'Fix critical issues within 24-48 hours before any deployment';
    } else if (summary.highIssues > 0) {
      return 'Address high-priority issues within 1-2 weeks';
    } else {
      return 'Address remaining issues in next development cycle';
    }
  }
}
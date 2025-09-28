#!/usr/bin/env node

import fetch from 'node-fetch';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:3001';
const BATCH_SIZE = 1000; // Send 1000 service orders per batch
const MAX_CONCURRENT_BATCHES = 5; // Process 5 batches concurrently
const DELAY_BETWEEN_BATCHES = 1000; // 1 second delay between batch submissions

class BackfillService {
  constructor() {
    this.authToken = null;
    this.processedCount = 0;
    this.totalCount = 0;
    this.startTime = null;
    this.errors = [];
    this.batchResults = [];
  }

  async authenticate() {
    console.log('🔐 Authenticating with API...');
    
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: 'admin@wms.com',
          password: 'admin123'
        })
      });

      if (!response.ok) {
        throw new Error(`Authentication failed: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      this.authToken = data.token;
      console.log('✅ Authentication successful');
      
    } catch (error) {
      console.error('❌ Authentication failed:', error.message);
      throw error;
    }
  }

  async generateServiceOrders(count) {
    console.log(`📝 Generating ${count} service orders...`);
    
    const serviceOrders = [];
    const products = [
      'Chemical Waste', 'Electronic Waste', 'Medical Waste', 'Industrial Solvents',
      'Paint Waste', 'Battery Waste', 'Oil Waste', 'Pharmaceutical Waste',
      'Laboratory Chemicals', 'Cleaning Solvents', 'Metal Waste', 'Plastic Waste'
    ];
    
    const descriptions = [
      'Industrial solvent waste from manufacturing process',
      'Used electronic components and circuit boards',
      'Expired pharmaceutical products and containers',
      'Paint and coating waste from automotive industry',
      'Used batteries from electronic devices',
      'Contaminated oil from machinery maintenance',
      'Laboratory chemical waste and reagents',
      'Cleaning solvent waste from facilities maintenance',
      'Metal shavings and contaminated materials',
      'Plastic waste contaminated with chemicals',
      'Hazardous material from construction site',
      'Biomedical waste from healthcare facility'
    ];

    const companies = [
      'Acme Manufacturing Corp', 'TechCorp Industries', 'MedCare Solutions',
      'AutoParts Inc', 'ChemTech Ltd', 'GreenEnergy Co', 'MetalWorks LLC',
      'PlasticSolutions Inc', 'BioMed Corp', 'CleanTech Services'
    ];

    for (let i = 0; i < count; i++) {
      const appointmentDate = new Date();
      appointmentDate.setDate(appointmentDate.getDate() + Math.floor(Math.random() * 30) + 1);
      
      const materialCount = Math.floor(Math.random() * 5) + 1; // 1-5 materials per service order
      const materials = [];
      
      for (let j = 0; j < materialCount; j++) {
        materials.push({
          product: products[Math.floor(Math.random() * products.length)],
          description: descriptions[Math.floor(Math.random() * descriptions.length)]
        });
      }

      serviceOrders.push({
        customerName: `Customer ${i + 1}`,
        companyName: companies[Math.floor(Math.random() * companies.length)],
        appointmentDate: appointmentDate.toISOString(),
        materials: materials
      });
    }

    console.log(`✅ Generated ${count} service orders with ${serviceOrders.reduce((sum, so) => sum + so.materials.length, 0)} total materials`);
    return serviceOrders;
  }

  async processBatch(serviceOrders, batchIndex) {
    console.log(`🚀 Processing batch ${batchIndex + 1} with ${serviceOrders.length} service orders...`);
    
    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/batch/process`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.authToken}`
        },
        body: JSON.stringify({
          serviceOrders: serviceOrders
        })
      });

      if (!response.ok) {
        throw new Error(`Batch processing failed: ${response.status} ${response.statusText}`);
      }

      const result = await response.json();
      
      console.log(`✅ Batch ${batchIndex + 1} completed:`, {
        requestId: result.requestId,
        processed: result.progress.processedCount,
        total: result.progress.totalServiceOrders,
        successRate: result.metrics?.successRate || 'N/A',
        costSavings: result.metrics?.costMetrics?.costSavings || 'N/A'
      });

      this.processedCount += result.progress.processedCount;
      this.batchResults.push({
        batchIndex: batchIndex + 1,
        requestId: result.requestId,
        result: result
      });

      return result;

    } catch (error) {
      console.error(`❌ Batch ${batchIndex + 1} failed:`, error.message);
      this.errors.push({
        batchIndex: batchIndex + 1,
        error: error.message,
        serviceOrdersCount: serviceOrders.length
      });
      throw error;
    }
  }

  async createBatches(serviceOrders) {
    const batches = [];
    for (let i = 0; i < serviceOrders.length; i += BATCH_SIZE) {
      batches.push(serviceOrders.slice(i, i + BATCH_SIZE));
    }
    return batches;
  }

  async processAllBatches(batches) {
    console.log(`📦 Processing ${batches.length} batches with max ${MAX_CONCURRENT_BATCHES} concurrent batches...`);
    
    for (let i = 0; i < batches.length; i += MAX_CONCURRENT_BATCHES) {
      const concurrentBatches = batches.slice(i, i + MAX_CONCURRENT_BATCHES);
      
      // Process batches concurrently
      const batchPromises = concurrentBatches.map((batch, localIndex) => 
        this.processBatch(batch, i + localIndex)
      );
      
      const results = await Promise.allSettled(batchPromises);
      
      // Log results
      results.forEach((result, localIndex) => {
        const globalIndex = i + localIndex;
        if (result.status === 'rejected') {
          console.error(`❌ Batch ${globalIndex + 1} failed:`, result.reason.message);
        }
      });

      // Progress update
      const completedBatches = Math.min(i + MAX_CONCURRENT_BATCHES, batches.length);
      const progressPercent = Math.round((completedBatches / batches.length) * 100);
      console.log(`📊 Progress: ${completedBatches}/${batches.length} batches (${progressPercent}%) - ${this.processedCount}/${this.totalCount} service orders processed`);

      // Delay between batch groups to respect rate limits
      if (i + MAX_CONCURRENT_BATCHES < batches.length) {
        console.log(`⏳ Waiting ${DELAY_BETWEEN_BATCHES}ms before next batch group...`);
        await new Promise(resolve => setTimeout(resolve, DELAY_BETWEEN_BATCHES));
      }
    }
  }

  async generateReport() {
    const endTime = Date.now();
    const totalTime = endTime - this.startTime;
    const successfulBatches = this.batchResults.length;
    const failedBatches = this.errors.length;
    
    const report = {
      summary: {
        totalServiceOrders: this.totalCount,
        processedServiceOrders: this.processedCount,
        successfulBatches: successfulBatches,
        failedBatches: failedBatches,
        successRate: Math.round((this.processedCount / this.totalCount) * 100),
        totalProcessingTime: totalTime,
        averageTimePerServiceOrder: Math.round(totalTime / this.processedCount),
        serviceOrdersPerSecond: Math.round(this.processedCount / (totalTime / 1000))
      },
      batchResults: this.batchResults,
      errors: this.errors,
      timestamp: new Date().toISOString()
    };

    // Save report to file
    const reportPath = path.join(__dirname, `backfill-report-${Date.now()}.json`);
    await fs.writeFile(reportPath, JSON.stringify(report, null, 2));
    
    console.log('📊 BACKFILL REPORT:');
    console.log('==================');
    console.log(`✅ Total Service Orders: ${report.summary.totalServiceOrders}`);
    console.log(`✅ Successfully Processed: ${report.summary.processedServiceOrders}`);
    console.log(`✅ Success Rate: ${report.summary.successRate}%`);
    console.log(`⏱️  Total Time: ${Math.round(totalTime / 1000)} seconds`);
    console.log(`⚡ Processing Rate: ${report.summary.serviceOrdersPerSecond} service orders/second`);
    console.log(`📁 Detailed report saved to: ${reportPath}`);
    
    if (this.errors.length > 0) {
      console.log(`❌ Failed Batches: ${failedBatches}`);
      console.log('❌ Errors:', this.errors);
    }

    return report;
  }

  async run(count = 100000) {
    try {
      console.log(`🚀 Starting backfill process for ${count} service orders...`);
      this.startTime = Date.now();
      this.totalCount = count;

      // Step 1: Authenticate
      await this.authenticate();

      // Step 2: Generate service orders
      const serviceOrders = await this.generateServiceOrders(count);

      // Step 3: Create batches
      const batches = await this.createBatches(serviceOrders);
      console.log(`📦 Created ${batches.length} batches of ${BATCH_SIZE} service orders each`);

      // Step 4: Process all batches
      await this.processAllBatches(batches);

      // Step 5: Generate report
      const report = await this.generateReport();

      console.log('🎉 Backfill process completed successfully!');
      return report;

    } catch (error) {
      console.error('💥 Backfill process failed:', error);
      
      // Generate partial report even on failure
      if (this.startTime) {
        await this.generateReport();
      }
      
      process.exit(1);
    }
  }
}

// Command line interface
async function main() {
  const args = process.argv.slice(2);
  const count = args[0] ? parseInt(args[0]) : 100000;

  if (isNaN(count) || count <= 0) {
    console.error('❌ Invalid count. Usage: node backfill-service-orders.js [count]');
    console.error('Example: node backfill-service-orders.js 100000');
    process.exit(1);
  }

  if (count > 100000) {
    console.error('❌ Maximum count is 100,000 service orders');
    process.exit(1);
  }

  console.log('🔧 Backfill Configuration:');
  console.log(`📊 Service Orders: ${count}`);
  console.log(`📦 Batch Size: ${BATCH_SIZE}`);
  console.log(`🔄 Max Concurrent Batches: ${MAX_CONCURRENT_BATCHES}`);
  console.log(`⏱️  Delay Between Batches: ${DELAY_BETWEEN_BATCHES}ms`);
  console.log(`🌐 API URL: ${API_BASE_URL}`);
  console.log('==========================================');

  const backfillService = new BackfillService();
  await backfillService.run(count);
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}

export { BackfillService };

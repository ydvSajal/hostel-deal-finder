// Cross-platform build and deployment scripts
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const scripts = {
  // Environment detection
  detectEnv: () => {
    const isVercel = process.env.VERCEL || process.env.VERCEL_ENV;
    const isNetlify = process.env.NETLIFY;
    const isAWS = process.env.AWS_REGION;
    const isDocker = fs.existsSync('/.dockerenv');
    
    console.log('Environment detected:', {
      vercel: !!isVercel,
      netlify: !!isNetlify,
      aws: !!isAWS,
      docker: !!isDocker,
      local: !isVercel && !isNetlify && !isAWS && !isDocker
    });
    
    return { isVercel, isNetlify, isAWS, isDocker };
  },

  // Build with environment-specific optimizations
  build: () => {
    const env = scripts.detectEnv();
    
    console.log('🏗️  Building for production...');
    
    // Set NODE_ENV for all platforms
    process.env.NODE_ENV = 'production';
    
    // Platform-specific build optimizations
    if (env.isVercel) {
      console.log('📦 Optimizing for Vercel...');
      process.env.VITE_PLATFORM = 'vercel';
    } else if (env.isNetlify) {
      console.log('📦 Optimizing for Netlify...');
      process.env.VITE_PLATFORM = 'netlify';
    } else if (env.isAWS) {
      console.log('📦 Optimizing for AWS...');
      process.env.VITE_PLATFORM = 'aws';
    } else if (env.isDocker) {
      console.log('📦 Optimizing for Docker...');
      process.env.VITE_PLATFORM = 'docker';
    }
    
    try {
      execSync('npm run build', { stdio: 'inherit' });
      console.log('✅ Build completed successfully!');
    } catch (error) {
      console.error('❌ Build failed:', error.message);
      process.exit(1);
    }
  },

  // Health check for deployments
  healthCheck: () => {
    console.log('🏥 Running health checks...');
    
    // Check if Supabase client is configured
    const supabaseConfigExists = fs.existsSync(path.join(__dirname, 'src/integrations/supabase/client.ts'));
    if (!supabaseConfigExists) {
      console.error('❌ Supabase client configuration not found');
      return false;
    }
    
    // Check if environment variables are accessible (build time)
    const hasSupabaseConfig = process.env.VITE_SUPABASE_URL || 
      fs.readFileSync(path.join(__dirname, 'src/integrations/supabase/client.ts'), 'utf8').includes('mcnntxmpaucquanimhhq.supabase.co');
    
    if (!hasSupabaseConfig) {
      console.error('❌ Supabase configuration missing');
      return false;
    }
    
    console.log('✅ All health checks passed!');
    return true;
  },

  // Platform-specific deployment
  deploy: () => {
    const env = scripts.detectEnv();
    
    if (!scripts.healthCheck()) {
      console.error('❌ Health checks failed. Deployment aborted.');
      process.exit(1);
    }
    
    if (env.isVercel) {
      console.log('🚀 Deploying to Vercel...');
      execSync('vercel --prod', { stdio: 'inherit' });
    } else if (env.isNetlify) {
      console.log('🚀 Deploying to Netlify...');
      execSync('netlify deploy --prod', { stdio: 'inherit' });
    } else if (env.isAWS) {
      console.log('🚀 Deploying to AWS...');
      execSync('bash aws-deploy.sh', { stdio: 'inherit' });
    } else {
      console.log('📋 Manual deployment required. Build artifacts ready in ./dist');
    }
  }
};

// Export for programmatic use
module.exports = scripts;

// CLI usage
if (require.main === module) {
  const command = process.argv[2];
  if (scripts[command]) {
    scripts[command]();
  } else {
    console.log('Available commands: detectEnv, build, healthCheck, deploy');
  }
}
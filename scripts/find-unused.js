const fs = require('fs');
const path = require('path');

// Get all TypeScript/JavaScript files
function getAllFiles(dir, fileList = []) {
  const files = fs.readdirSync(dir);
  
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      // Skip node_modules, .next, .git, etc.
      if (!['node_modules', '.next', '.git', 'dist', 'build'].includes(file)) {
        getAllFiles(filePath, fileList);
      }
    } else if (file.match(/\.(ts|tsx|js|jsx)$/)) {
      fileList.push(filePath);
    }
  });
  
  return fileList;
}

// Get all import statements from a file
function getImports(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const imports = [];
    
    // Match various import patterns
    const importRegex = [
      /import\s+.*?\s+from\s+['"]([^'"]+)['"]/g,
      /import\s*\(\s*['"]([^'"]+)['"]\s*\)/g,
      /require\s*\(\s*['"]([^'"]+)['"]\s*\)/g,
    ];
    
    importRegex.forEach(regex => {
      let match;
      while ((match = regex.exec(content)) !== null) {
        imports.push(match[1]);
      }
    });
    
    return imports;
  } catch (error) {
    console.warn(`Error reading file ${filePath}:`, error.message);
    return [];
  }
}

// Resolve relative imports to absolute paths
function resolveImport(importPath, fromFile) {
  if (importPath.startsWith('.')) {
    const fromDir = path.dirname(fromFile);
    const resolved = path.resolve(fromDir, importPath);
    
    // Try different extensions
    const extensions = ['.ts', '.tsx', '.js', '.jsx', '/index.ts', '/index.tsx', '/index.js', '/index.jsx'];
    
    for (const ext of extensions) {
      const fullPath = resolved + ext;
      if (fs.existsSync(fullPath)) {
        return fullPath;
      }
    }
    
    // Check if it's a directory with index file
    if (fs.existsSync(resolved) && fs.statSync(resolved).isDirectory()) {
      for (const ext of ['/index.ts', '/index.tsx', '/index.js', '/index.jsx']) {
        const indexPath = resolved + ext;
        if (fs.existsSync(indexPath)) {
          return indexPath;
        }
      }
    }
  }
  
  return null;
}

// Main function to find unused files
function findUnusedFiles() {
  console.log('🔍 Finding unused files in your Next.js project...\n');
  
  const projectRoot = process.cwd();
  const allFiles = getAllFiles(projectRoot);
  const usedFiles = new Set();
  
  // Entry points for Next.js
  const entryPatterns = ['pages/', 'app/', 'src/pages/', 'src/app/'];
  const configFiles = ['next.config.js', 'next.config.ts', 'tailwind.config.js', 'tailwind.config.ts'];
  
  // Mark entry points as used
  allFiles.forEach(file => {
    const relativePath = path.relative(projectRoot, file);
    
    // Mark entry points as used
    if (entryPatterns.some(pattern => relativePath.includes(pattern)) ||
        configFiles.some(config => relativePath.endsWith(config))) {
      usedFiles.add(file);
    }
  });
  
  // Trace imports from entry points
  const queue = [...usedFiles];
  const processed = new Set();
  
  while (queue.length > 0) {
    const currentFile = queue.shift();
    
    if (processed.has(currentFile)) continue;
    processed.add(currentFile);
    
    const imports = getImports(currentFile);
    
    imports.forEach(importPath => {
      const resolved = resolveImport(importPath, currentFile);
      if (resolved && !usedFiles.has(resolved)) {
        usedFiles.add(resolved);
        queue.push(resolved);
      }
    });
  }
  
  // Find unused files
  const unusedFiles = allFiles.filter(file => !usedFiles.has(file));
  
  // Filter out common false positives
  const filteredUnused = unusedFiles.filter(file => {
    const relativePath = path.relative(projectRoot, file);
    return !relativePath.match(/\.(test|spec|stories)\.(ts|tsx|js|jsx)$/) &&
           !relativePath.includes('__tests__') &&
           !relativePath.includes('.d.ts');
  });
  
  // Results
  console.log(`📊 Analysis Results:`);
  console.log(`   Total files: ${allFiles.length}`);
  console.log(`   Used files: ${usedFiles.size}`);
  console.log(`   Unused files: ${filteredUnused.length}\n`);
  
  if (filteredUnused.length > 0) {
    console.log('🗑️  Potentially unused files:');
    filteredUnused.forEach(file => {
      const relativePath = path.relative(projectRoot, file);
      console.log(`   - ${relativePath}`);
    });
    
    console.log('\n⚠️  Please review these files manually before deleting!');
    console.log('   Some files might be used in ways this script cannot detect:');
    console.log('   - Dynamic imports with variables');
    console.log('   - Files referenced in public/ folder');
    console.log('   - Files used by external tools');
  } else {
    console.log('✅ No unused files found!');
  }
}

// Run the analysis
findUnusedFiles();
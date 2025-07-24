const ts = require('typescript');
const fs = require('fs');
const path = require('path');

// Install typescript if not available: npm install typescript

class TSUnusedChecker {
  constructor() {
    this.program = null;
    this.checker = null;
    this.unusedSymbols = new Set();
  }

  // Create TypeScript program
  createProgram() {
    const configPath = ts.findConfigFile('./', ts.sys.fileExists, 'tsconfig.json');
    
    if (!configPath) {
      throw new Error('Could not find tsconfig.json');
    }

    const configFile = ts.readConfigFile(configPath, ts.sys.readFile);
    const compilerOptions = ts.parseJsonConfigFileContent(configFile.config, ts.sys, './');

    this.program = ts.createProgram(compilerOptions.fileNames, compilerOptions.options);
    this.checker = this.program.getTypeChecker();
  }

  // Check if symbol is unused
  isSymbolUnused(symbol, sourceFile) {
    const declarations = symbol.getDeclarations();
    if (!declarations) return false;

    for (const decl of declarations) {
      // Skip if it's exported
      if (decl.modifiers?.some(mod => mod.kind === ts.SyntaxKind.ExportKeyword)) {
        return false;
      }

      // Check if symbol is referenced
      const references = this.program.getLanguageService().getReferencesAtPosition(
        sourceFile.fileName,
        decl.getStart()
      );

      // If only one reference (the declaration itself), it might be unused
      if (references && references.length <= 1) {
        return true;
      }
    }

    return false;
  }

  // Visit AST nodes
  visit(node, sourceFile, unusedFunctions) {
    if (ts.isFunctionDeclaration(node) || ts.isMethodDeclaration(node) || ts.isArrowFunction(node)) {
      if (node.name && ts.isIdentifier(node.name)) {
        const symbol = this.checker.getSymbolAtLocation(node.name);
        
        if (symbol && this.isSymbolUnused(symbol, sourceFile)) {
          const line = sourceFile.getLineAndCharacterOfPosition(node.getStart()).line + 1;
          unusedFunctions.push({
            name: node.name.text,
            file: sourceFile.fileName,
            line: line,
            kind: ts.SyntaxKind[node.kind]
          });
        }
      }
    }

    ts.forEachChild(node, (child) => this.visit(child, sourceFile, unusedFunctions));
  }

  // Analyze all source files
  analyze() {
    console.log('🔍 TypeScript AST Analysis for unused functions...\n');
    
    this.createProgram();
    const unusedFunctions = [];

    for (const sourceFile of this.program.getSourceFiles()) {
      // Skip declaration files and node_modules
      if (sourceFile.isDeclarationFile || sourceFile.fileName.includes('node_modules')) {
        continue;
      }

      this.visit(sourceFile, sourceFile, unusedFunctions);
    }

    // Output results
    console.log(`📊 TypeScript Analysis Results:`);
    console.log(`   Files analyzed: ${this.program.getSourceFiles().length}`);
    console.log(`   Unused functions found: ${unusedFunctions.length}\n`);

    if (unusedFunctions.length > 0) {
      console.log('🗑️  Unused functions detected:\n');
      
      unusedFunctions.forEach(func => {
        const relativePath = path.relative(process.cwd(), func.file);
        console.log(`   - ${func.name} in ${relativePath}:${func.line} (${func.kind})`);
      });
    } else {
      console.log('✅ No unused functions detected!');
    }

    return unusedFunctions;
  }
}

// Run if typescript is available
try {
  const checker = new TSUnusedChecker();
  checker.analyze();
} catch (error) {
  console.error('Error: Please install TypeScript first:');
  console.error('npm install typescript');
  console.error('\nOr use the simpler script method instead.');
}
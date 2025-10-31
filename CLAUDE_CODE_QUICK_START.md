# Claude Code Quick Start Guide

## 🚀 Getting Started

### **Always use the batch file to start Claude Code:**

```bash
.\start-claude.bat
```

This ensures:
- Correct working directory
- Optimized memory settings (4GB heap)
- Best performance

---

## 📁 Helper Scripts

### **1. start-claude.bat** ⭐ **USE THIS TO START**
Launches Claude Code with optimized settings.

```bash
.\start-claude.bat
```

### **2. clean-cache.bat** 🧹
Removes build artifacts and caches that slow down Claude Code.

```bash
.\clean-cache.bat
```

**Run this when:**
- Claude Code is slow
- After major code changes
- Build folder is getting large

**What it cleans:**
- `.next/` (Next.js build cache)
- `test-results/` (Playwright test results)
- `playwright-report/` (Test reports)
- `*.tsbuildinfo` (TypeScript build info)
- `.vercel/.output/` (Vercel cache)

### **3. check-project-size.bat** 📊
Shows directory sizes and file counts to identify what's taking up space.

```bash
.\check-project-size.bat
```

---

## ⚠️ Common Issues & Solutions

### **Issue: "Heap out of memory" error**

**Cause:** Claude Code was started from wrong directory or ran out of memory.

**Solution:**
1. Close Claude Code
2. Run `.\clean-cache.bat`
3. Run `.\start-claude.bat` (NOT just `claude`)

### **Issue: Claude Code is slow**

**Causes:**
- Large `.next/` build cache (289MB+)
- Too many test artifacts
- Started from wrong directory

**Solution:**
1. Run `.\clean-cache.bat` to remove caches
2. Always use `.\start-claude.bat` to launch
3. Run `.\check-project-size.bat` to identify large directories

### **Issue: Accidentally started from C: drive root**

**Cause:** Running `claude` from wrong location.

**Solution:**
- ALWAYS use `.\start-claude.bat` instead of `claude` directly
- The batch file ensures correct directory

---

## 📋 Daily Workflow

### **Starting Work:**
```bash
cd C:\Users\Power\fly2any-fresh
.\start-claude.bat
```

### **If Claude Code is slow:**
```bash
.\clean-cache.bat
.\start-claude.bat
```

### **Before Deploying:**
```bash
npm run build
npm run test:e2e
```

---

## 🔧 Technical Details

### **What the optimizations do:**

1. **Working Directory**: Ensures Claude Code runs from project root, not system root
2. **Heap Size**: Increases Node.js memory from default ~2GB to 4GB
3. **`.claudeignore`**: Excludes unnecessary files from indexing:
   - node_modules/ (465MB)
   - .next/ (289MB)
   - Test artifacts
   - 1,041 markdown docs
   - All images and screenshots

### **File Count Reduction:**
- **Before optimization**: ~572,345 files (entire C: drive)
- **After optimization**: ~2,000 relevant project files
- **Reduction**: 99.7% fewer files to index

---

## 💡 Pro Tips

1. **Always** use `start-claude.bat` - never run `claude` directly
2. Run `clean-cache.bat` weekly or when project feels slow
3. Use `check-project-size.bat` to monitor disk usage
4. Keep `.claudeignore` updated with new directories to exclude

---

## 🆘 Emergency Recovery

If Claude Code crashes or won't start:

```bash
# 1. Clean everything
.\clean-cache.bat

# 2. Increase heap even more (8GB)
set NODE_OPTIONS=--max-old-space-size=8192

# 3. Start Claude Code
cd C:\Users\Power\fly2any-fresh
claude

# 4. If still failing, reinstall node_modules
rm -rf node_modules
npm install
.\start-claude.bat
```

---

## 📞 Need Help?

- Check logs in `.next/trace` if Next.js issues
- Run `npm run build` to check for build errors
- File an issue: https://github.com/anthropics/claude-code/issues

---

**Last Updated**: 2025-10-28
**Project**: Fly2Any Flight Booking System
**Location**: C:\Users\Power\fly2any-fresh

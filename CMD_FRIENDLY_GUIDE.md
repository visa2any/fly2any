# 🚀 CMD & PowerShell User-Friendly Setup Guide

## ✅ Quick Setup
Run as **Administrator**:
```batch
setup-friendly-cmd.bat
```

## 📦 What You Get

### 🔧 Unix-like Commands
| Command | Description | Example |
|---------|------------|---------|
| `ls` | List files | `ls`, `ls -la` |
| `grep` | Search text | `grep "pattern" file.txt` |
| `cat` | View file | `cat README.md` |
| `touch` | Create file | `touch newfile.txt` |
| `clear` | Clear screen | `clear` |
| `pwd` | Current directory | `pwd` |
| `which` | Find command | `which node` |

### 🚀 Quick Navigation
| Command | Action |
|---------|--------|
| `..` | Go up 1 level |
| `...` | Go up 2 levels |
| `....` | Go up 3 levels |
| `~` | Go to home |
| `dev` | Go to D:\Users\vilma\fly2any |
| `downloads` | Go to Downloads |
| `desktop` | Go to Desktop |

### 🌿 Git Shortcuts
| Command | Full Command |
|---------|-------------|
| `gs` | `git status` |
| `ga` | `git add` |
| `gc` | `git commit` |
| `gp` | `git push` |
| `gl` | `git pull` |
| `gco` | `git checkout` |
| `gb` | `git branch` |
| `glog` | Pretty git log |

### 📦 NPM Shortcuts
| Command | Full Command |
|---------|-------------|
| `ni` | `npm install` |
| `nr` | `npm run` |
| `nrd` | `npm run dev` |
| `nrb` | `npm run build` |
| `nrt` | `npm run test` |
| `ns` | `npm start` |

### 🛠️ Utility Functions
| Command | Description |
|---------|------------|
| `sysinfo` | System information |
| `myip` | Show IP addresses |
| `ports` | Show open ports |
| `top` | Top processes by CPU |
| `killport 3000` | Kill process on port |
| `find-file *.js` | Find files recursively |
| `find-text "TODO"` | Search text in files |
| `extract file.zip` | Extract archives |
| `h` | Search command history |

## 🎨 Terminal Enhancements

### PowerShell Features:
- ✅ Colored prompt with git branch
- ✅ Auto-completion with predictions
- ✅ History search with arrow keys
- ✅ Syntax highlighting
- ✅ Custom functions

### CMD Features:
- ✅ All Unix-like aliases
- ✅ Colored prompt
- ✅ Auto-run on startup
- ✅ Doskey macros

## 🖥️ Windows Terminal Setup

### Profiles Available:
1. **🚀 PowerShell Enhanced** - Modern PowerShell with all features
2. **🖥️ CMD Enhanced** - Classic CMD with Unix aliases
3. **🌿 Git Bash** - Full Linux-like environment
4. **📦 Node.js** - Direct Node REPL access

### Keyboard Shortcuts:
| Keys | Action |
|------|--------|
| `Ctrl+T` | New tab |
| `Ctrl+W` | Close tab |
| `Ctrl+Tab` | Next tab |
| `Alt+Shift+-` | Split horizontal |
| `Alt+Shift+=` | Split vertical |
| `F11` | Fullscreen |
| `Ctrl+F` | Find |
| `Ctrl+C/V` | Copy/Paste |

## 🚀 Quick Start Options

### Option 1: Desktop Shortcuts
- **PowerShell Enhanced** - Full featured PowerShell
- **CMD Enhanced** - CMD with aliases
- **Terminal Launcher** - Choose your terminal

### Option 2: Manual Launch
```powershell
# PowerShell
pwsh -NoExit -File D:\Users\vilma\fly2any\powershell-profile.ps1

# CMD
cmd /k D:\Users\vilma\fly2any\cmd-aliases.bat

# Windows Terminal
wt
```

### Option 3: Set as Default
1. Right-click on `.ps1` files → Open with → PowerShell
2. Set Windows Terminal as default terminal in Windows 11:
   - Settings → Privacy & Security → For developers → Terminal → Windows Terminal

## 📝 Custom Configuration

### Add Your Own Aliases (PowerShell):
Edit `powershell-profile.ps1`:
```powershell
function mycommand { 
    # Your code here
}
Set-Alias mc mycommand
```

### Add Your Own Aliases (CMD):
Edit `cmd-aliases.bat`:
```batch
doskey myalias=your command $*
```

## 🔧 Troubleshooting

### PowerShell Scripts Not Running:
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

### CMD Aliases Not Loading:
Check registry:
```batch
reg query "HKEY_CURRENT_USER\Software\Microsoft\Command Processor" /v AutoRun
```

### Windows Terminal Not Found:
Install via:
```batch
winget install Microsoft.WindowsTerminal
```

## 💡 Pro Tips

1. **Use Tab Completion**: Press Tab to auto-complete commands and paths
2. **History Search**: Use ↑↓ arrows to search command history
3. **Multiple Terminals**: Use Windows Terminal tabs for different tasks
4. **Quick Edit**: Double-click to select word, triple-click for line
5. **Drag & Drop**: Drag files into terminal to paste path

## 🎯 Common Workflows

### Development Workflow:
```bash
dev           # Go to project
gs            # Check git status
ni            # Install dependencies
nrd           # Start dev server
code .        # Open in VS Code
```

### Git Workflow:
```bash
gs            # Status
ga .          # Add all
gc -m "msg"   # Commit
gp            # Push
```

### File Management:
```bash
ls -la        # List all files
mkdir project # Create directory
touch file.js # Create file
cat file.js   # View file
grep "text"   # Search in files
```

---
**Enjoy your enhanced terminal experience! 🎉**
# 📊 Project Diagrams

This folder contains visual diagrams documenting key processes and user flows for the project.

## Customer Experience Flowchart

**File:** [`customer-experience-flowchart.drawio`](./customer-experience-flowchart.drawio)

### Overview
This comprehensive flowchart maps the complete user journey from initial homepage visit through final book printing, covering all 14 steps of the customer experience process.

### What It Shows
- **User Actions** (Yellow boxes): All actions users take
- **System Responses** (Blue boxes): How the system responds to user actions
- **Parallel Functions** (Red boxes): Backend/AI processes that happen simultaneously
- **Decision Points** (Purple diamonds): Where users make choices
- **Process Flow**: Clear sequential progression from Step 1 through Step 14

### Key Process Areas
1. **Steps 1-3**: Landing, Sign-up, Email Verification
2. **Steps 4-6**: Chapter Creation Process (with repeat functionality) 
3. **Step 7**: Optional Chapter Deletion
4. **Steps 8-11**: Editing Submission and Review Process
5. **Steps 12-13**: Optional New Chapters After Initial Review
6. **Step 14**: Final Book Printing

## 🔧 How to Edit

### Option 1: Online (Recommended)
1. Go to [app.diagrams.net](https://app.diagrams.net) (formerly draw.io)
2. Click "Open Existing Diagram"
3. Choose "GitHub" and connect your account
4. Navigate to this repository and select the `.drawio` file
5. Make your changes
6. Save back to GitHub (creates automatic commit)

### Option 2: Desktop App
1. Download [draw.io desktop app](https://github.com/jgraph/drawio-desktop/releases)
2. Download the `.drawio` file from GitHub
3. Open in draw.io desktop
4. Make changes and save
5. Upload the modified file back to GitHub

### Option 3: VS Code Extension
1. Install the [Draw.io Integration extension](https://marketplace.visualstudio.com/items?itemName=hediet.vscode-drawio)
2. Open the `.drawio` file directly in VS Code
3. Edit in the integrated draw.io editor
4. Commit changes normally

## 📋 Editing Guidelines

### Before Making Changes
- [ ] Create a new branch for your changes
- [ ] Review the existing flow to understand the current process
- [ ] Consider impact on other team members

### When Editing
- [ ] **Maintain color coding**:
  - 🟡 Yellow: User Actions
  - 🔵 Blue: System Responses  
  - 🔴 Red: Parallel Functions
  - 🟣 Purple: Decision Points
- [ ] **Keep sequential numbering** (Step 1, Step 2, etc.)
- [ ] **Use consistent terminology** throughout
- [ ] **Test the logical flow** - ensure it makes sense end-to-end

### After Changes
- [ ] **Export updated images** (see below)
- [ ] **Update documentation** if process fundamentally changes
- [ ] **Create pull request** with clear description of changes
- [ ] **Tag relevant team members** for review

## 📸 Exporting Images

For easier viewing and presentations, export the flowchart as images:

### From draw.io:
1. **File → Export as → PNG** (for presentations/documentation)
   - Suggested settings: Zoom 100%, Border 10px, Transparent background
2. **File → Export as → SVG** (for web/scalable use)
   - Check "Include a copy of my diagram"

### Naming Convention:
- `customer-experience-flowchart.png`
- `customer-experience-flowchart.svg`

## 🤝 Collaboration Workflow

### For Major Changes
1. **Create Issue** describing proposed changes
2. **Create feature branch**: `feature/update-customer-flow`
3. **Make changes** using any of the editing methods above
4. **Export new images** if visual updates are significant
5. **Create Pull Request** with:
   - Clear description of changes
   - Screenshots of before/after (if applicable)
   - Rationale for changes
6. **Tag stakeholders** for review
7. **Merge after approval**

### For Minor Updates
1. **Create branch**: `fix/flowchart-typo`
2. **Make quick edits** via GitHub web interface or draw.io online
3. **Commit directly** with descriptive message
4. **Create small PR** or commit to main (team preference)

## 📚 Additional Resources

- [Draw.io Documentation](https://drawio-app.com/doc/)
- [Draw.io GitHub Integration Guide](https://drawio-app.com/blog/github-support/)
- [Flowchart Best Practices](https://drawio-app.com/blog/flowchart-best-practice/)

## 🔄 Version History

Track major changes to the flowchart:

| Date | Version | Changes | Author |
|------|---------|---------|--------|
| [Current] | 1.0 | Initial comprehensive 14-step customer journey flowchart | - |

---

**Questions?** Open an issue or ask in the team chat! 